import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";
import {
  createCompany,
  createContact,
  createManualOpportunity,
  convertOpportunityToApplication,
  deleteOfferDetail,
  deleteRejectionDetail,
} from "./helpers/api";

test("applications: duplicate conversion returns 409 + existingApplicationId", async ({
  page,
}) => {
  await loginAsE2E(page, { nextPath: "/app" });

  const title = `E2E Convert ${Date.now()}`;
  const oppId = await createManualOpportunity(page.request, {
    title,
    companyName: "E2E Convert Co",
    opportunityType: "Internship",
    remoteMode: "OnSite",
    location: "Penang, Malaysia",
    tags: ["e2e"],
  });

  const first = await convertOpportunityToApplication(page.request, {
    opportunityId: oppId,
    priority: "Medium",
    tags: ["e2e"],
  });
  expect(first.status).toBe(201);

  const second = await convertOpportunityToApplication(page.request, {
    opportunityId: oppId,
    priority: "Medium",
    tags: ["e2e"],
  });
  expect(second.status).toBe(409);
});

test("applications: contact link/unlink and offer/rejection guardrails", async ({
  page,
}) => {
  await loginAsE2E(page, { nextPath: "/app" });

  const stamp = Date.now();
  const companyName = `E2E App Co ${stamp}`;
  const companyId = await createCompany(page.request, { name: companyName });

  const contactName = `E2E Contact ${stamp}`;
  await createContact(page.request, {
    companyId,
    name: contactName,
    email: `e2e-${stamp}@example.test`,
    title: "Recruiter",
  });

  const oppId = await createManualOpportunity(page.request, {
    title: `E2E App Opp ${stamp}`,
    companyName,
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
  const appId = converted.applicationId;

  await page.goto(`/app/applications/${encodeURIComponent(appId)}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Link contact
  const linkButton = page.getByRole("button", { name: "Link Contact" });
  await expect(linkButton).toBeEnabled();
  await linkButton.click();

  const linkDialog = page.getByRole("dialog", { name: "Link contact" });
  await expect(linkDialog).toBeVisible();
  await linkDialog.locator('[data-slot="select-trigger"]').click();
  await page
    .locator('[data-slot="select-item"]', { hasText: contactName })
    .click();
  await linkDialog.getByRole("button", { name: "Link contact" }).click();
  await expect(linkDialog).toBeHidden();
  await expect(page.getByText(contactName)).toBeVisible();

  // Unlink contact
  await page.getByRole("button", { name: "Unlink contact" }).click();
  await expect(page.getByText("No contacts linked.")).toBeVisible();

  // Offer guardrail: add offer detail then block stage change away from Offer.
  await page.getByRole("button", { name: "Edit" }).first().click();
  const editDialog = page.getByRole("dialog", { name: "Edit Application" });
  await expect(editDialog).toBeVisible();
  const editTriggers = editDialog.locator('[data-slot="select-trigger"]');
  await editTriggers.nth(0).click();
  await page.locator('[data-slot="select-item"]', { hasText: "Offer" }).click();
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  await expect(editDialog).toBeHidden();

  await expect(page.getByText("OFFER DETAIL", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add", exact: true }).click();

  const offerDialog = page.getByRole("dialog", { name: "Add Offer Detail" });
  await expect(offerDialog).toBeVisible();
  await offerDialog.getByLabel("Decision status").fill("Pending");
  await offerDialog.getByRole("button", { name: "Save" }).click();
  await expect(offerDialog).toBeHidden();

  await page.getByRole("button", { name: "Edit" }).first().click();
  await expect(editDialog).toBeVisible();
  await editTriggers.nth(0).click();
  await page.locator('[data-slot="select-item"]', { hasText: "Applied" }).click();
  const offerBlockResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes(`/api/applications/${encodeURIComponent(appId)}`) &&
      res.request().method() === "PATCH"
    );
  });
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  const offerBlockRes = await offerBlockResPromise;
  expect(offerBlockRes.status()).toBe(409);
  const offerBlockJson = (await offerBlockRes.json().catch(() => null)) as unknown;
  expect(JSON.stringify(offerBlockJson)).toContain(
    "Stage change blocked. Remove offer detail before changing away from Offer."
  );

  await deleteOfferDetail(page.request, appId);
  await page.reload();
  await expect(page.getByText("Add offer details to record dates, compensation notes, and your decision.")).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).first().click();
  await expect(editDialog).toBeVisible();
  await editTriggers.nth(0).click();
  await page.locator('[data-slot="select-item"]', { hasText: "Applied" }).click();
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  await expect(editDialog).toBeHidden();
  await expect(page.locator('[data-slot="badge"]', { hasText: "Applied" }).first()).toBeVisible();

  // Rejection guardrail: add rejection detail then block stage change away from Rejected.
  await page.getByRole("button", { name: "Edit" }).first().click();
  await expect(editDialog).toBeVisible();
  await editTriggers.nth(0).click();
  await page.locator('[data-slot="select-item"]', { hasText: "Rejected" }).click();
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  await expect(editDialog).toBeHidden();

  await expect(page.getByText("REJECTION DETAIL", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add", exact: true }).click();
  const rejectionDialog = page.getByRole("dialog", { name: "Add Rejection Detail" });
  await expect(rejectionDialog).toBeVisible();
  await rejectionDialog.getByLabel("Rejected at stage").fill("Interview");
  await rejectionDialog.getByRole("button", { name: "Save" }).click();
  await expect(rejectionDialog).toBeHidden();

  await page.getByRole("button", { name: "Edit" }).first().click();
  await expect(editDialog).toBeVisible();
  await editTriggers.nth(0).click();
  await page.locator('[data-slot="select-item"]', { hasText: "Assessment" }).click();
  const rejectionBlockResPromise = page.waitForResponse((res) => {
    return (
      res.url().includes(`/api/applications/${encodeURIComponent(appId)}`) &&
      res.request().method() === "PATCH"
    );
  });
  await editDialog.getByRole("button", { name: "Save Changes" }).click();
  const rejectionBlockRes = await rejectionBlockResPromise;
  expect(rejectionBlockRes.status()).toBe(409);
  const rejectionBlockJson = (await rejectionBlockRes.json().catch(() => null)) as unknown;
  expect(JSON.stringify(rejectionBlockJson)).toContain(
    "Stage change blocked. Remove rejection detail before changing away from Rejected."
  );

  await deleteRejectionDetail(page.request, appId);
  await page.reload();
  await expect(page.getByText("Add rejection details to record what stage you reached and any notes.")).toBeVisible();
});
