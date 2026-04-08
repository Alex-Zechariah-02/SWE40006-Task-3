import { test, expect } from "@playwright/test";
import { E2E_EMAIL, E2E_PASSWORD } from "./helpers/auth";

test("flow 1: public search -> preview -> save -> login -> import -> appears in Saved Opportunities", async ({
  page,
}) => {
  await page.goto("/search");
  await expect(
    page.getByRole("heading", { name: "Search opportunities" })
  ).toBeVisible();

  const queryInput = page.getByRole("searchbox", { name: "Search opportunities" });
  await queryInput.fill("software engineer");
  await page.getByTestId("search-form").getByRole("button", { name: "Search" }).click();

  const results = page.getByTestId("search-results");
  await expect(results).toBeVisible();

  const firstViewButton = results.getByRole("button", { name: "View details" }).first();
  await firstViewButton.focus();
  await firstViewButton.click();

  const modal = page.getByTestId("preview-modal");
  await expect(modal).toBeVisible();

  // Accessibility: Escape closes and focus returns to the opener.
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(firstViewButton).toBeFocused();

  await firstViewButton.click();
  await expect(modal).toBeVisible();

  // Save while logged out should redirect to login with the import next-path.
  await page.getByRole("button", { name: "Save opportunity" }).click();
  await page.waitForURL(/\/login\?/);

  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByLabel("Password").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Import runner redirects from `/app/opportunities/import` to the created opportunity detail.
  // Make sure we don't accidentally proceed while still on the import runner page.
  await page.waitForURL(/\/app\/opportunities\/(?!import$)[^/]+$/);

  const opportunityId = page.url().split("/").pop();
  expect(opportunityId).toBeTruthy();

  const importedTitle = await page.getByRole("heading", { level: 1 }).innerText();
  expect(importedTitle.trim().length).toBeGreaterThan(0);

  await page.goto("/app/opportunities");
  await expect(page.getByRole("heading", { name: "Opportunities" })).toBeVisible();

  const importedLink = page.locator(`a[href="/app/opportunities/${opportunityId}"]`);
  await expect(importedLink).toBeVisible();
  await expect(importedLink).toContainText(importedTitle.trim());
});
