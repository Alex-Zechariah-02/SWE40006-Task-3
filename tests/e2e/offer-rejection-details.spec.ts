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
  await expect(page.getByText("OFFER DETAIL", { exact: true })).toBeVisible();

  const offerSection = page
    .locator("div.pt-6")
    .filter({ has: page.getByText("OFFER DETAIL", { exact: true }) })
    .first();

  // Add offer detail
  await offerSection.getByRole("button", { name: "Add", exact: true }).click();
  const offerDialog = page.getByRole("dialog", { name: "Add Offer Detail" });
  await expect(offerDialog).toBeVisible();
  await offerDialog.getByLabel("Decision status").fill("Pending");
  await offerDialog.getByLabel("Notes").fill("E2E offer notes");
  await offerDialog.getByRole("button", { name: "Save" }).click();
  await expect(offerDialog).toBeHidden();

  await expect(offerSection.getByText("Pending", { exact: true })).toBeVisible();
  await expect(offerSection.getByText("E2E offer notes")).toBeVisible();

  // Edit offer detail
  await offerSection
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  const offerEditDialog = page.getByRole("dialog", { name: "Edit Offer Detail" });
  await expect(offerEditDialog).toBeVisible();
  await offerEditDialog.getByLabel("Decision status").fill("Accepted");
  await offerEditDialog.getByLabel("Compensation").fill("E2E comp note");
  await offerEditDialog.getByRole("button", { name: "Save" }).click();
  await expect(offerEditDialog).toBeHidden();

  await expect(offerSection.getByText("Accepted", { exact: true })).toBeVisible();
  await expect(offerSection.getByText("E2E comp note")).toBeVisible();

  // Remove offer detail (uses confirm())
  page.once("dialog", (d) => d.accept());
  await offerSection.getByRole("button", { name: "Remove" }).click();
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
  await expect(page.getByText("REJECTION DETAIL", { exact: true })).toBeVisible();

  const rejectionSection = page
    .locator("div.pt-6")
    .filter({ has: page.getByText("REJECTION DETAIL", { exact: true }) })
    .first();

  await rejectionSection.getByRole("button", { name: "Add", exact: true }).click();
  const rejectionDialog = page.getByRole("dialog", { name: "Add Rejection Detail" });
  await expect(rejectionDialog).toBeVisible();
  await rejectionDialog.getByLabel("Rejected at stage").fill("Interview");
  await rejectionDialog.getByLabel("Notes").fill("E2E rejection notes");
  await rejectionDialog.getByRole("button", { name: "Save" }).click();
  await expect(rejectionDialog).toBeHidden();

  await expect(rejectionSection.getByText("Interview", { exact: true })).toBeVisible();
  await expect(rejectionSection.getByText("E2E rejection notes")).toBeVisible();

  await rejectionSection.getByRole("button", { name: "Edit" }).click();
  const rejectionEditDialog = page.getByRole("dialog", { name: "Edit Rejection Detail" });
  await expect(rejectionEditDialog).toBeVisible();
  await rejectionEditDialog.getByLabel("Notes").fill("E2E rejection notes (updated)");
  await rejectionEditDialog.getByRole("button", { name: "Save" }).click();
  await expect(rejectionEditDialog).toBeHidden();

  await expect(rejectionSection.getByText("E2E rejection notes (updated)")).toBeVisible();

  page.once("dialog", (d) => d.accept());
  await rejectionSection.getByRole("button", { name: "Remove" }).click();
  await expect(
    page.getByText("Add rejection details to record what stage you reached and any notes.")
  ).toBeVisible();

  // Best-effort cleanup
  await archiveApplication(page.request, applicationId).catch(() => null);
  await archiveOpportunity(page.request, oppId).catch(() => null);
});
