import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";

test("companies: create via modal, save notes, archive and restore", async ({
  page,
}) => {
  await loginAsE2E(page, { nextPath: "/app/companies" });
  await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();

  const companyName = `E2E Notes Co ${Date.now()}`;

  await page.getByRole("button", { name: "New Company" }).click();
  const dialog = page.getByRole("dialog", { name: "New Company" });
  await expect(dialog).toBeVisible();

  await dialog.getByLabel("Name").fill(companyName);
  await dialog.getByLabel("Industry").fill("Testing");
  await dialog.getByLabel("Location").fill("Kuala Lumpur");
  await dialog.getByRole("button", { name: "Create Company" }).click();
  await expect(dialog).toBeHidden();

  await expect(page.getByRole("link", { name: companyName })).toBeVisible();
  await page.getByRole("link", { name: companyName }).click();

  await expect(page.getByRole("heading", { level: 1, name: companyName })).toBeVisible();

  const notes = `E2E notes ${Date.now()}`;
  await page.getByPlaceholder("General notes...").fill(notes);

  const saveButton = page.getByRole("button", { name: "Save Notes" });
  await expect(saveButton).toBeVisible();
  await saveButton.click();

  // After save, router.refresh runs; confirm the textarea still contains the saved value.
  await expect(page.getByPlaceholder("General notes...")).toHaveValue(notes);

  await page.getByRole("button", { name: "Archive" }).click();
  const archiveDialog = page.getByRole("dialog", { name: "Archive Company?" });
  await expect(archiveDialog).toBeVisible();
  await archiveDialog.getByRole("button", { name: "Archive" }).click();
  await expect(page.getByText("Archived")).toBeVisible();

  await page.getByRole("button", { name: "Unarchive" }).first().click();
  const unarchiveDialog = page.getByRole("dialog", { name: "Unarchive Company?" });
  await expect(unarchiveDialog).toBeVisible();
  await unarchiveDialog.getByRole("button", { name: "Unarchive" }).click();
  await expect(page.getByText("Archived")).toBeHidden();
});
