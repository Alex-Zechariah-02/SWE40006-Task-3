import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";

test("opportunities: API validation rejects missing required fields", async ({
  page,
}) => {
  await loginAsE2E(page, { nextPath: "/app" });

  const res = await page.request.post("/api/opportunities", {
    data: {
      title: "",
      companyName: "",
      opportunityType: "",
      remoteMode: "",
      tags: [],
    },
  });

  expect(res.status()).toBe(400);
  const json = (await res.json()) as { error?: { fields?: unknown } };
  expect(typeof json.error?.fields).toBe("object");
});

test("opportunities: create, edit stage, archive and restore", async ({ page }) => {
  await loginAsE2E(page, { nextPath: "/app/opportunities" });
  await expect(page.getByRole("heading", { name: "Opportunities" })).toBeVisible();

  const title = `E2E Opportunity ${Date.now()}`;
  await page.getByRole("button", { name: "New Opportunity" }).click();

  const dialog = page.getByRole("dialog", { name: "New Opportunity" });
  await expect(dialog).toBeVisible();

  await dialog.getByLabel("Title").fill(title);
  await dialog.getByLabel("Company").fill("E2E Company");

  const selectTriggers = dialog.locator('[data-slot="select-trigger"]');
  await selectTriggers.nth(0).click();
  await page.locator('[data-slot="select-item"]', { hasText: "Internship" }).click();

  await selectTriggers.nth(1).click();
  await page.locator('[data-slot="select-item"]', { hasText: "On-site" }).click();

  await dialog.getByRole("button", { name: "Create Opportunity" }).click();
  await expect(dialog).toBeHidden();

  await expect(page.getByRole("link", { name: title })).toBeVisible();
  await page.getByRole("link", { name: title }).click();

  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit Opportunity" });
  await expect(editDialog).toBeVisible();

  // Stage select is the 3rd trigger in the row.
  const editSelectTriggers = editDialog.locator('[data-slot="select-trigger"]');
  await editSelectTriggers.nth(2).click();
  await page.locator('[data-slot="select-item"]', { hasText: "Shortlisted" }).click();

  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  await expect(editDialog).toBeHidden();

  await expect(page.getByText("Shortlisted")).toBeVisible();

  await page.getByRole("button", { name: "Archive" }).click();
  const archiveDialog = page.getByRole("dialog", { name: "Archive Opportunity?" });
  await expect(archiveDialog).toBeVisible();
  await archiveDialog.getByRole("button", { name: "Archive" }).click();

  await expect(page.getByText("Archived")).toBeVisible();

  await page.getByRole("button", { name: "Unarchive" }).first().click();
  const unarchiveDialog = page.getByRole("dialog", { name: "Unarchive Opportunity?" });
  await expect(unarchiveDialog).toBeVisible();
  await unarchiveDialog.getByRole("button", { name: "Unarchive" }).click();

  await expect(page.getByText("Archived")).toBeHidden();
});
