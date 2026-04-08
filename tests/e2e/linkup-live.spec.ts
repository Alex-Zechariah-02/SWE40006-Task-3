import { test, expect } from "@playwright/test";

test("linkup live: /api/search/opportunities returns real results when configured", async ({
  request,
}) => {
  test.skip(
    process.env.LINKUP_API_KEY?.trim() ? false : true,
    "LINKUP_API_KEY is not configured."
  );

  const res = await request.post("/api/search/opportunities", {
    data: { query: "software engineer" },
  });

  expect(res.ok()).toBeTruthy();
  const json = (await res.json()) as { results?: unknown };
  expect(Array.isArray(json.results)).toBeTruthy();

  const results = json.results as Array<Record<string, unknown>>;
  expect(results.length).toBeGreaterThan(0);

  const urls: string[] = [];
  for (const item of results) {
    const url = item.sourceUrl as string;
    urls.push(url);
    expect(url).not.toContain("careerdeck.example");
  }

  expect(new Set(urls).size).toBe(urls.length);
});

