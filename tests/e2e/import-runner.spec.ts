import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";

test("import runner: missing pending import shows a recovery state", async ({
  page,
}) => {
  await loginAsE2E(page, { nextPath: "/app/opportunities/import" });
  await expect(page.getByText("Nothing to import")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to search" })).toBeVisible();
});

test("import runner: failed import shows error and can clear pending import", async ({
  page,
}) => {
  await loginAsE2E(page, { nextPath: "/app" });

  await page.route("**/api/opportunities/import", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "E2E import failure fixture." } }),
    });
  });

  await page.goto("/search");

  await page.evaluate(() => {
    const key = "careerdeck.pendingOpportunityImport.v1";
    const payload = {
      title: "Fixture role",
      companyName: "Fixture company",
      location: "Kuala Lumpur, Malaysia",
      remoteMode: "Hybrid",
      opportunityType: "Internship",
      sourceUrl: "https://example.com/job",
      sourceProvider: "Linkup",
      snippet: "fixture",
      postedDate: "2026-04-01",
      confidence: 0.9,
    };

    const envelope = { v: 1, savedAt: new Date().toISOString(), payload };
    sessionStorage.setItem(key, JSON.stringify(envelope));
  });

  await page.goto("/app/opportunities/import");
  await expect(page.getByText("Import failed")).toBeVisible();
  await expect(page.getByText("E2E import failure fixture.")).toBeVisible();

  await page.getByRole("button", { name: "Clear pending import" }).click();
  await page.waitForURL(/\/search(\?|$)/);
});
