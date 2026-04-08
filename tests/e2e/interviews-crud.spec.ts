import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";
import {
  archiveApplication,
  archiveOpportunity,
  convertOpportunityToApplication,
  createManualOpportunity,
} from "./helpers/api";

test("interviews: create, edit, delete", async ({ page }) => {
  await loginAsE2E(page, { nextPath: "/app" });

  const stamp = Date.now();
  const oppId = await createManualOpportunity(page.request, {
    title: `E2E Interview Opp ${stamp}`,
    companyName: `E2E Interview Co ${stamp}`,
    opportunityType: "Internship",
    remoteMode: "Hybrid",
    location: "Kuala Lumpur, Malaysia",
    tags: ["e2e"],
  });

  const converted = await convertOpportunityToApplication(page.request, {
    opportunityId: oppId,
    priority: "Medium",
    tags: ["e2e"],
  });
  if (converted.status === 409) {
    throw new Error("Unexpected 409 converting a fresh opportunity.");
  }
  const applicationId = converted.applicationId;

  await page.goto(`/app/applications/${encodeURIComponent(applicationId)}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Create interview (UI)
  await page.getByRole("button", { name: "Add Interview" }).click();
  const createDialog = page.getByRole("dialog", { name: "Add Interview" });
  await expect(createDialog).toBeVisible();

  const createSelects = createDialog.locator('[data-slot="select-trigger"]');
  await createSelects.nth(0).click();
  await page
    .locator('[data-slot="select-item"]', { hasText: "Technical Interview" })
    .click();

  await createDialog.getByLabel("Date & Time").fill("2030-01-02T10:15");
  await createDialog
    .getByLabel("Location or Link")
    .fill("https://example.com/e2e-interview");
  await createDialog.getByLabel("Notes").fill("E2E interview notes");

  const createResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes("/api/interviews") &&
      res.request().method() === "POST"
    );
  });
  await createDialog.getByRole("button", { name: "Add Interview" }).click();
  const createRes = await createResPromise;
  expect(createRes.status()).toBe(201);

  await expect(createDialog).toBeHidden();
  await expect(
    page.getByRole("main").getByText("Technical Interview", { exact: true })
  ).toBeVisible();
  await expect(page.getByRole("main").getByText("E2E interview notes")).toBeVisible();

  // Edit interview (UI)
  await page.getByRole("button", { name: "Edit interview" }).first().click();
  const editDialog = page.getByRole("dialog", { name: "Edit Interview" });
  await expect(editDialog).toBeVisible();

  const editSelects = editDialog.locator('[data-slot="select-trigger"]');
  await editSelects.nth(1).click();
  await page
    .locator('[data-slot="select-item"]', { hasText: "Completed" })
    .click();
  await editDialog.getByLabel("Notes").fill("E2E interview notes (updated)");

  const patchResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes("/api/interviews/") &&
      res.request().method() === "PATCH"
    );
  });
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  const patchRes = await patchResPromise;
  expect(patchRes.ok()).toBeTruthy();

  await expect(editDialog).toBeHidden();
  await expect(
    page.getByRole("main").getByText("Completed", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByText("E2E interview notes (updated)")
  ).toBeVisible();

  // Delete interview (UI)
  const deleteResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes("/api/interviews/") &&
      res.request().method() === "DELETE"
    );
  });
  await page.getByRole("button", { name: "Delete interview" }).first().click();
  const deleteRes = await deleteResPromise;
  expect(deleteRes.ok()).toBeTruthy();

  await expect(page.getByText("No interviews yet")).toBeVisible();

  // Best-effort cleanup: archive records so repeated runs do not pollute default lists.
  await archiveApplication(page.request, applicationId).catch(() => null);
  await archiveOpportunity(page.request, oppId).catch(() => null);
});
