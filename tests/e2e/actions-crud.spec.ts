import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";
import { installPageErrorGuard } from "./helpers/assertions";

test("actions: create, edit status, delete", async ({ page }) => {
  const guard = installPageErrorGuard(page);

  await loginAsE2E(page, { nextPath: "/app/actions" });
  await expect(page.getByRole("heading", { name: "Actions" })).toBeVisible();
  guard.reset();

  const title = `E2E Action ${Date.now()}`;

  await page.getByRole("button", { name: "Add Action" }).click();
  const dialog = page.getByRole("dialog", { name: "New Action Item" });
  await expect(dialog).toBeVisible();

  await dialog.getByLabel("Title").fill(title);

  const triggers = dialog.locator('[data-slot="select-trigger"]');
  await triggers.nth(0).click();
  await page.locator('[data-slot="select-item"]', { hasText: "High" }).click();

  await triggers.nth(1).click();
  await page.locator('[data-slot="select-item"]', { hasText: "Open" }).click();

  await dialog.getByRole("button", { name: "Create Action Item" }).click();
  await expect(dialog).toBeHidden();

  const editButton = page.getByRole("button", { name: `Edit ${title}` });
  await expect(editButton).toBeVisible();
  const row = editButton.locator('xpath=ancestor::div[contains(@class,"items-start")][1]');
  await expect(row.getByText(title, { exact: true })).toBeVisible();

  await editButton.click();
  const editDialog = page.getByRole("dialog", { name: "Edit Action Item" });
  await expect(editDialog).toBeVisible();

  const editTriggers = editDialog.locator('[data-slot="select-trigger"]');
  await editTriggers.nth(1).click();
  await page.locator('[data-slot="select-item"]', { hasText: "Completed" }).click();

  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  await expect(editDialog).toBeHidden();

  await expect(row.locator('[data-slot="badge"]', { hasText: "Completed" }).first()).toBeVisible();

  await page.getByRole("button", { name: `Delete ${title}` }).click();
  await expect(editButton).toBeHidden();

  guard.assertNoPageErrors();
});
