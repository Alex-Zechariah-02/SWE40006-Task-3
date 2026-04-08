import { test, expect } from "@playwright/test";

test("search: does not call the API until the user submits", async ({ page }) => {
  let callCount = 0;

  await page.route("**/api/search/opportunities", async (route) => {
    callCount += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results: [
          {
            title: "Fixture role",
            companyName: "Fixture company",
            location: "Kuala Lumpur, Malaysia",
            remoteMode: "Hybrid",
            opportunityType: "Internship",
            sourceUrl: "https://example.com/job",
            sourceProvider: "Linkup",
            snippet: "Fixture result used to validate submit-only behavior.",
            postedDate: "2026-04-01",
            confidence: 0.9,
          },
        ],
      }),
    });
  });

  await page.goto("/search");

  const queryInput = page.getByRole("searchbox", { name: "Search opportunities" });
  await queryInput.fill("software engineer");

  // With submit-only search, typing should not fire the API call.
  await page.waitForTimeout(800);
  expect(callCount).toBe(0);

  await page.getByTestId("search-form").getByRole("button", { name: "Search" }).click();
  await expect(page.getByTestId("search-results")).toBeVisible();
  expect(callCount).toBe(1);
});

