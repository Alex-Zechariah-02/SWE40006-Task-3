import { test, expect } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers/a11y";
import { loginAsE2E } from "./helpers/auth";

test("a11y: public search page has no high-signal axe violations", async ({
  page,
}) => {
  await page.goto("/search");
  await expect(page.getByRole("heading", { name: "Search opportunities" })).toBeVisible();
  await expectNoA11yViolations(page);
});

test("a11y: preview modal supports keyboard close and focus return", async ({
  page,
}) => {
  await page.goto("/search");

  const queryInput = page.getByRole("searchbox", { name: "Search opportunities" });
  await queryInput.fill("software engineer");
  await page.getByTestId("search-form").getByRole("button", { name: "Search" }).click();

  const results = page.getByTestId("search-results");
  await expect(results).toBeVisible();

  const firstViewButton = results
    .getByRole("button", { name: "View details" })
    .first();
  await firstViewButton.focus();
  await firstViewButton.click();

  const modal = page.getByTestId("preview-modal");
  await expect(modal).toBeVisible();
  await expectNoA11yViolations(page, { include: ["[data-testid='preview-modal']"] });

  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(firstViewButton).toBeFocused();
});

test("a11y: app dashboard has no high-signal axe violations", async ({ page }) => {
  await loginAsE2E(page, { nextPath: "/app" });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expectNoA11yViolations(page);
});
