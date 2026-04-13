import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";

test("flow 2: opportunity -> convert to application -> add interview -> add action item", async ({
  page,
}) => {
  await loginAsE2E(page, { nextPath: "/app" });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  const title = `E2E Manual Opportunity ${Date.now()}`;

  const createRes = await page.request.post("/api/opportunities", {
    data: {
      title,
      companyName: "Intel Malaysia",
      opportunityType: "Internship",
      remoteMode: "OnSite",
      location: "Penang, Malaysia",
      sourceUrl: "",
      deadline: "",
      tags: ["e2e"],
    },
  });

  expect(createRes.ok()).toBeTruthy();
  const createdJson = (await createRes.json()) as {
    opportunity?: { id?: string };
  };

  const opportunityId = createdJson.opportunity?.id;
  expect(opportunityId).toBeTruthy();

  await page.goto(`/app/opportunities/${encodeURIComponent(opportunityId!)}`);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();

  await page.getByRole("button", { name: "Convert to Application" }).click();

  const convertDialog = page.getByRole("dialog", { name: "Convert to Application" });
  await expect(convertDialog).toBeVisible();
  await convertDialog.getByRole("button", { name: "Convert to Application" }).click();

  await page.waitForURL(/\/app\/applications\/[^/]+$/);

  const applicationUrl = page.url();
  const applicationId = applicationUrl.split("/").pop() || "";

  // Add interview
  await page.getByRole("button", { name: "Add Interview" }).click();
  const interviewDialog = page.getByRole("dialog", { name: "Add Interview" });
  await expect(interviewDialog).toBeVisible();

  const selectTriggers = interviewDialog.locator('[data-slot="select-trigger"]');
  await selectTriggers.first().click();
  await page.locator('[data-slot="select-item"]', { hasText: "Technical Interview" }).click();

  await interviewDialog.getByLabel("Date & Time").fill("2030-01-02T10:15");
  const interviewPost = page.waitForResponse((res) => {
    return (
      res.url().includes("/api/interviews") &&
      res.request().method() === "POST"
    );
  });
  await interviewDialog.getByRole("button", { name: "Add Interview" }).click();
  const interviewRes = await interviewPost;
  if (interviewRes.status() !== 201) {
    const body = await interviewRes.json().catch(() => null);
    throw new Error(
      `Interview create failed: status=${interviewRes.status()} body=${JSON.stringify(body)}`
    );
  }

  // Interview list updates via router.refresh(), but RSC caching can make it stale in tests.
  await page.reload();

  await expect(
    page.getByRole("main").getByText("Technical Interview", { exact: true })
  ).toBeVisible();

  // Add action item
  await page.getByRole("button", { name: "Add Action" }).click();
  const actionDialog = page.getByRole("dialog", { name: "New Action Item" });
  await expect(actionDialog).toBeVisible();

  await actionDialog.getByLabel("Title").fill("E2E action item");
  const actionPost = page.waitForResponse((res) => {
    return res.url().includes("/api/actions") && res.request().method() === "POST";
  });
  await actionDialog.getByRole("button", { name: "Create Action Item" }).click();
  const actionRes = await actionPost;
  if (actionRes.status() !== 201) {
    const body = await actionRes.json().catch(() => null);
    throw new Error(
      `Action create failed: status=${actionRes.status()} body=${JSON.stringify(body)}`
    );
  }
  await expect(actionDialog).toBeHidden();

  // Action list updates via router.refresh(), but RSC caching can make it stale in tests.
  await page.reload();
  await expect(page.getByText("E2E action item")).toBeVisible();

  // Best-effort cleanup: archive records so repeated runs do not pollute default lists.
  await page.request
    .patch(`/api/applications/${encodeURIComponent(applicationId)}`, {
      data: { action: "archive" },
    })
    .catch(() => null);

  await page.request
    .patch(`/api/opportunities/${encodeURIComponent(opportunityId!)}`, {
      data: { action: "archive" },
    })
    .catch(() => null);
});
