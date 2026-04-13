import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";
import {
  archiveApplication,
  archiveOpportunity,
  convertOpportunityToApplication,
  createManualOpportunity,
  patchApplication,
} from "./helpers/api";

test("applications: offer and rejection details can be added, edited, and removed", async ({
  page,
}) => {
  await loginAsE2E(page, { nextPath: "/app" });

  const stamp = Date.now();
  const oppId = await createManualOpportunity(page.request, {
    title: `E2E Offer/Rejection Opp ${stamp}`,
    companyName: `E2E Offer/Rejection Co ${stamp}`,
    opportunityType: "Internship",
    remoteMode: "OnSite",
    location: "Penang, Malaysia",
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

  // Set stage to Offer so the offer section renders.
  const offerPatch = await patchApplication(page.request, applicationId, {
    currentStage: "Offer",
  });
  expect(offerPatch.res.ok()).toBeTruthy();

  await page.goto(`/app/applications/${encodeURIComponent(applicationId)}`);
  await expect(page.getByText("Offer Detail", { exact: true })).toBeVisible();

  const offerSection = page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText("Offer Detail", { exact: true }) })
    .first();

  // Add offer detail
  await offerSection.getByRole("button", { name: "Add", exact: true }).click();
  const offerDialog = page.getByRole("dialog", { name: "Add Offer Detail" });
  await expect(offerDialog).toBeVisible();
  await offerDialog.getByLabel("Decision status").fill("Pending");
  await offerDialog.getByLabel("Notes").fill("E2E offer notes");

  const offerCreateResPromise = page.waitForResponse((res) => {
    return (
      res
        .url()
        .includes(
          `/api/applications/${encodeURIComponent(applicationId)}/offer`
        ) &&
      res.request().method() === "POST" &&
      res.status() === 201
    );
  });
  await offerDialog.getByRole("button", { name: "Save" }).click();
  await offerCreateResPromise;
  await expect(offerDialog).toBeHidden();

  await page.reload();
  const offerSectionAfterAdd = page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText("Offer Detail", { exact: true }) })
    .first();

  await expect(
    offerSectionAfterAdd.getByText("Pending", { exact: true })
  ).toBeVisible();
  await expect(offerSectionAfterAdd.getByText("E2E offer notes")).toBeVisible();

  // Edit offer detail
  await offerSectionAfterAdd
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  const offerEditDialog = page.getByRole("dialog", { name: "Edit Offer Detail" });
  await expect(offerEditDialog).toBeVisible();
  await offerEditDialog.getByLabel("Decision status").fill("Accepted");
  await offerEditDialog.getByLabel("Compensation").fill("E2E comp note");

  const offerUpdateResPromise = page.waitForResponse((res) => {
    return (
      res
        .url()
        .includes(
          `/api/applications/${encodeURIComponent(applicationId)}/offer`
        ) &&
      res.request().method() === "PATCH" &&
      res.ok()
    );
  });
  await offerEditDialog.getByRole("button", { name: "Save" }).click();
  await offerUpdateResPromise;
  await expect(offerEditDialog).toBeHidden();

  await page.reload();
  const offerSectionAfterEdit = page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText("Offer Detail", { exact: true }) })
    .first();
  await expect(
    offerSectionAfterEdit.getByText("Accepted", { exact: true })
  ).toBeVisible();
  await expect(offerSectionAfterEdit.getByText("E2E comp note")).toBeVisible();

  // Remove offer detail (uses confirm())
  const removeOfferResPromise = page.waitForResponse((res) => {
    return (
      res
        .url()
        .includes(`/api/applications/${encodeURIComponent(applicationId)}/offer`) &&
      res.request().method() === "DELETE"
    );
  });
  page.once("dialog", (d) => d.accept());
  await offerSectionAfterEdit.getByRole("button", { name: "Remove" }).click();
  const removeOfferRes = await removeOfferResPromise;
  expect(removeOfferRes.ok()).toBeTruthy();

  await page.reload();
  const offerSectionAfter = page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText("Offer Detail", { exact: true }) })
    .first();
  await expect(offerSectionAfter.getByRole("button", { name: "Add", exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "Add offer details to record dates, compensation notes, and your decision."
    )
  ).toBeVisible();

  // Move to Rejected stage and add rejection detail.
  const rejectionPatch = await patchApplication(page.request, applicationId, {
    currentStage: "Rejected",
  });
  expect(rejectionPatch.res.ok()).toBeTruthy();

  await page.reload();
  await expect(page.getByText("Rejection Detail", { exact: true })).toBeVisible();

  const rejectionSection = page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText("Rejection Detail", { exact: true }) })
    .first();

  await rejectionSection.getByRole("button", { name: "Add", exact: true }).click();
  const rejectionDialog = page.getByRole("dialog", { name: "Add Rejection Detail" });
  await expect(rejectionDialog).toBeVisible();
  await rejectionDialog.getByLabel("Rejected at stage").fill("Interview");
  await rejectionDialog.getByLabel("Notes").fill("E2E rejection notes");

  const rejectionCreateResPromise = page.waitForResponse((res) => {
    return (
      res
        .url()
        .includes(
          `/api/applications/${encodeURIComponent(applicationId)}/rejection`
        ) &&
      res.request().method() === "POST" &&
      res.status() === 201
    );
  });
  await rejectionDialog.getByRole("button", { name: "Save" }).click();
  await rejectionCreateResPromise;
  await expect(rejectionDialog).toBeHidden();

  await page.reload();
  const rejectionSectionAfterAdd = page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText("Rejection Detail", { exact: true }) })
    .first();

  await expect(
    rejectionSectionAfterAdd.getByText("Interview", { exact: true })
  ).toBeVisible();
  await expect(rejectionSectionAfterAdd.getByText("E2E rejection notes")).toBeVisible();

  await rejectionSectionAfterAdd.getByRole("button", { name: "Edit" }).click();
  const rejectionEditDialog = page.getByRole("dialog", { name: "Edit Rejection Detail" });
  await expect(rejectionEditDialog).toBeVisible();
  await rejectionEditDialog.getByLabel("Notes").fill("E2E rejection notes (updated)");

  const rejectionUpdateResPromise = page.waitForResponse((res) => {
    return (
      res
        .url()
        .includes(
          `/api/applications/${encodeURIComponent(applicationId)}/rejection`
        ) &&
      res.request().method() === "PATCH" &&
      res.ok()
    );
  });
  await rejectionEditDialog.getByRole("button", { name: "Save" }).click();
  await rejectionUpdateResPromise;
  await expect(rejectionEditDialog).toBeHidden();

  await page.reload();
  const rejectionSectionAfterEdit = page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText("Rejection Detail", { exact: true }) })
    .first();
  await expect(
    rejectionSectionAfterEdit.getByText("E2E rejection notes (updated)")
  ).toBeVisible();

  const removeRejectionResPromise = page.waitForResponse((res) => {
    return (
      res
        .url()
        .includes(
          `/api/applications/${encodeURIComponent(applicationId)}/rejection`
        ) &&
      res.request().method() === "DELETE"
    );
  });
  page.once("dialog", (d) => d.accept());
  await rejectionSectionAfterEdit.getByRole("button", { name: "Remove" }).click();
  const removeRejectionRes = await removeRejectionResPromise;
  expect(removeRejectionRes.ok()).toBeTruthy();

  // The card should revert to its empty state, but RSC caching can be stale in tests.
  await page.reload({ waitUntil: "domcontentloaded" });
  const rejectionSectionAfterRemove = page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText("Rejection Detail", { exact: true }) })
    .first();
  await expect(
    rejectionSectionAfterRemove.getByRole("button", { name: "Add", exact: true })
  ).toBeVisible();
  await expect(
    rejectionSectionAfterRemove.getByText(
      "Add rejection details to record what stage you reached and any notes."
    )
  ).toBeVisible();

  // Best-effort cleanup
  await archiveApplication(page.request, applicationId).catch(() => null);
  await archiveOpportunity(page.request, oppId).catch(() => null);
});
