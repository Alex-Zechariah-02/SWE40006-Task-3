import { test, expect } from "@playwright/test";

test("api smoke: /api/search/opportunities returns a normalized, deduped response", async ({
  request,
}) => {
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
    expect(typeof item.title).toBe("string");
    expect(typeof item.companyName).toBe("string");
    expect(typeof item.location).toBe("string");
    expect(typeof item.sourceUrl).toBe("string");
    expect(typeof item.sourceProvider).toBe("string");
    expect(typeof item.snippet).toBe("string");

    const url = item.sourceUrl as string;
    urls.push(url);
    expect(url.includes("#")).toBeFalsy();
    expect(url.toLowerCase().includes("utm_")).toBeFalsy();
  }

  expect(new Set(urls).size).toBe(urls.length);
});

test("api smoke: /api/search/opportunities rejects short queries with validation error", async ({
  request,
}) => {
  const res = await request.post("/api/search/opportunities", {
    data: { query: "hi" },
  });

  expect(res.status()).toBe(400);
  const json = (await res.json()) as { error?: { message?: unknown } };
  expect(typeof json.error?.message).toBe("string");
});

