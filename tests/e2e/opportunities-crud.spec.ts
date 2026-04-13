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

  const createResPromise = page.waitForResponse((res) => {
    return res.url().includes("/api/opportunities") && res.request().method() === "POST";
  });
  await dialog.getByRole("button", { name: "Create Opportunity" }).click();
  const createRes = await createResPromise;
  if (createRes.status() !== 201) {
    const body = await createRes.json().catch(() => null);
    throw new Error(
      `Opportunity create failed: status=${createRes.status()} body=${JSON.stringify(body)}`
    );
  }
  await expect(dialog).toBeHidden();

  await page.reload();

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

  const stageUpdateResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes("/api/opportunities/") &&
      res.request().method() === "PATCH" &&
      res.ok()
    );
  });
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  await stageUpdateResPromise;
  await expect(editDialog).toBeHidden();

  await page.reload();

  await expect(page.getByText("Shortlisted")).toBeVisible();

  await page.getByRole("button", { name: "Archive" }).click();
  const archiveDialog = page.getByRole("dialog", { name: "Archive Opportunity?" });
  await expect(archiveDialog).toBeVisible();

  const archiveResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes("/api/opportunities/") &&
      res.request().method() === "PATCH"
    );
  });
  await archiveDialog.getByRole("button", { name: "Archive" }).click();

  const archiveRes = await archiveResPromise;
  expect(archiveRes.ok()).toBeTruthy();
  await page.reload();

  await expect(page.locator('[data-slot="badge"]', { hasText: "Archived" }).first()).toBeVisible();

  await page.getByRole("button", { name: "Unarchive" }).first().click();
  const unarchiveDialog = page.getByRole("dialog", { name: "Unarchive Opportunity?" });
  await expect(unarchiveDialog).toBeVisible();

  const unarchiveResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes("/api/opportunities/") &&
      res.request().method() === "PATCH"
    );
  });
  await unarchiveDialog.getByRole("button", { name: "Unarchive" }).click();

  const unarchiveRes = await unarchiveResPromise;
  expect(unarchiveRes.ok()).toBeTruthy();
  await page.reload();

  await expect(page.locator('[data-slot="badge"]', { hasText: "Archived" })).toHaveCount(0);
});
