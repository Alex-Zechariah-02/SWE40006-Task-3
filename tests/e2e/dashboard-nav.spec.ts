import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";

test("dashboard: stat cards render and navigate", async ({ page }) => {
  await loginAsE2E(page, { nextPath: "/app" });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await expect(page.getByText("Active Applications")).toBeVisible();
  await expect(page.getByText("Upcoming Interviews")).toBeVisible();
  await expect(page.getByText("Follow-ups Due")).toBeVisible();
  await expect(page.getByText("Deadlines Near")).toBeVisible();
  await expect(page.getByText("Saved Opportunities")).toBeVisible();

  await page.getByText("Active Applications").click();
  await page.waitForURL(/\/app\/applications\?/);
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();

  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.waitForURL(/\/app(\?|$)/);

  await page.getByText("Deadlines Near").click();
  await page.waitForURL(/\/app\/opportunities\?/);
  expect(page.url()).toContain("deadlineWindow=near");

  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.waitForURL(/\/app(\?|$)/);

  await page.getByText("Follow-ups Due").click();
  await page.waitForURL(/\/app\/actions\?/);
  expect(page.url()).toContain("dueWindow=overdue");
});
