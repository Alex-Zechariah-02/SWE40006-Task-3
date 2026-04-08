import { test, expect } from "@playwright/test";

test("search: shows a recovery UI when the API fails and can retry", async ({
  page,
}) => {
  let callCount = 0;

  await page.route("**/api/search/opportunities", async (route) => {
    callCount += 1;
    if (callCount === 1) {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "Search failed. Please try again." } }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/search");
  const queryInput = page.getByRole("searchbox", { name: "Search opportunities" });
  await queryInput.fill("software engineer");
  await page.getByTestId("search-form").getByRole("button", { name: "Search" }).click();

  await expect(page.getByTestId("search-error")).toBeVisible();
  await expect(page.getByText("Search unavailable")).toBeVisible();

  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByTestId("search-results")).toBeVisible();
});
