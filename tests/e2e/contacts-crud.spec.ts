import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";
import { createCompany } from "./helpers/api";

test("contacts: create and delete", async ({ page }) => {
  await loginAsE2E(page, { nextPath: "/app/contacts" });

  const stamp = Date.now();
  const companyName = `E2E Contact Co ${stamp}`;
  await createCompany(page.request, { name: companyName });

  // The company select options are server-rendered. Reload after creating the
  // company so the new option is available deterministically.
  await page.goto("/app/contacts");
  await expect(page.getByRole("heading", { name: "Contacts" })).toBeVisible();

  const contactName = `E2E Person ${Date.now()}`;
  await page.getByRole("button", { name: "New Contact" }).click();
  const dialog = page.getByRole("dialog", { name: "New Contact" });
  await expect(dialog).toBeVisible();

  await dialog.locator('[data-slot="select-trigger"]').click();
  await expect(page.locator('[data-slot="select-item"]', { hasText: companyName })).toBeVisible();
  await page.locator('[data-slot="select-item"]', { hasText: companyName }).click();

  await dialog.getByLabel("Name").fill(contactName);
  await dialog.getByLabel("Email").fill(`e2e-${Date.now()}@example.test`);
  await dialog.getByRole("button", { name: "Create Contact" }).click();
  await expect(dialog).toBeHidden();

  const deleteButton = page.getByRole("button", { name: `Delete ${contactName}` });
  await expect(deleteButton).toBeVisible();

  await deleteButton.click();
  const confirmDialog = page.getByRole("dialog", { name: "Delete contact?" });
  await expect(confirmDialog).toBeVisible();
  await confirmDialog.getByRole("button", { name: "Delete" }).click();
  await expect(confirmDialog).toBeHidden();

  await expect(deleteButton).toBeHidden();
});
