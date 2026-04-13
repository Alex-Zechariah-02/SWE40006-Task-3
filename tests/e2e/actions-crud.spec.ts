import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";
import { installPageErrorGuard } from "./helpers/assertions";

test("actions: create, edit status, delete", async ({ page, browserName }) => {
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

  const createResPromise = page.waitForResponse((res) => {
    return res.url().includes("/api/actions") && res.request().method() === "POST";
  });
  await dialog.getByRole("button", { name: "Create Action Item" }).click();
  const createRes = await createResPromise;
  expect(createRes.status()).toBe(201);
  await expect(dialog).toBeHidden();

  // The list updates via router.refresh(), but RSC caching can make it stale in tests.
  // Force a reload so the server re-renders with the newly-created row.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Actions" })).toBeVisible();
  await expect(page.getByText(title, { exact: true })).toBeVisible();

  const editButton = page.getByRole("button", { name: `Edit ${title}` });
  const row = editButton.locator(
    'xpath=ancestor::div[contains(@class,"items-start")][1]'
  );
  await expect(editButton).toBeVisible();
  await expect(row).toBeVisible();

  await editButton.click();
  const editDialog = page.getByRole("dialog", { name: "Edit Action Item" });
  await expect(editDialog).toBeVisible();

  const editTriggers = editDialog.locator('[data-slot="select-trigger"]');
  await editTriggers.nth(1).click();
  await page.locator('[data-slot="select-item"]', { hasText: "Completed" }).click();

  const patchResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes("/api/actions/") &&
      res.request().method() === "PATCH" &&
      res.ok()
    );
  });
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  await patchResPromise;
  await expect(editDialog).toBeHidden();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Actions" })).toBeVisible();
  await expect(
    page
      .getByRole("button", { name: `Edit ${title}` })
      .locator('xpath=ancestor::div[contains(@class,"items-start")][1]')
      .locator('[data-slot="badge"]', { hasText: "Completed" })
      .first()
  ).toBeVisible();

  const deleteResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes("/api/actions/") &&
      res.request().method() === "DELETE" &&
      res.ok()
    );
  });
  await page.getByRole("button", { name: `Delete ${title}` }).click();
  await deleteResPromise;

  // The list updates via router.refresh(), but RSC caching can be stale in tests.
  // Reloading after delete is reliable in Chromium/Firefox, but can trigger WebKit pageerror noise.
  if (browserName !== "webkit") {
    await page.reload({ waitUntil: "domcontentloaded" });
  }

  await expect(page.getByRole("heading", { name: "Actions" })).toBeVisible();
  await expect(page.getByRole("button", { name: `Edit ${title}` })).toBeHidden();

  guard.assertNoPageErrors();
});
