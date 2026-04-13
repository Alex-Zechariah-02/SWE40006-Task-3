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

  const createResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes("/api/companies") &&
      res.request().method() === "POST" &&
      res.status() === 201
    );
  });
  await dialog.getByRole("button", { name: "Create Company" }).click();
  const createRes = await createResPromise;
  expect(createRes.ok()).toBeTruthy();
  await expect(dialog).toBeHidden();

  await page.reload();

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

  const archiveResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes("/api/companies/") &&
      res.request().method() === "PATCH"
    );
  });
  await archiveDialog.getByRole("button", { name: "Archive" }).click();
  const archiveRes = await archiveResPromise;
  expect(archiveRes.ok()).toBeTruthy();
  await page.reload();
  await expect(page.locator('[data-slot="badge"]', { hasText: "Archived" }).first()).toBeVisible();

  await page.getByRole("button", { name: "Unarchive" }).first().click();
  const unarchiveDialog = page.getByRole("dialog", { name: "Unarchive Company?" });
  await expect(unarchiveDialog).toBeVisible();

  const unarchiveResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes("/api/companies/") &&
      res.request().method() === "PATCH"
    );
  });
  await unarchiveDialog.getByRole("button", { name: "Unarchive" }).click();
  const unarchiveRes = await unarchiveResPromise;
  expect(unarchiveRes.ok()).toBeTruthy();
  await page.reload();
  await expect(page.locator('[data-slot="badge"]', { hasText: "Archived" })).toHaveCount(0);
});
