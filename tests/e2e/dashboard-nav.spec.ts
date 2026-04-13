import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";

test("dashboard: stat cards render and navigate", async ({ page }) => {
  await loginAsE2E(page, { nextPath: "/app" });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await expect(page.getByText("Active Applications", { exact: true })).toBeVisible();
  await expect(page.getByText("Upcoming Interviews", { exact: true })).toBeVisible();
  await expect(page.getByText("Deadlines Near", { exact: true })).toBeVisible();

  await page.getByText("Active Applications", { exact: true }).click();
  await page.waitForURL(/\/app\/applications\?/);
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();

  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.waitForURL(/\/app(\?|$)/);

  await page.getByText("Upcoming Interviews", { exact: true }).click();
  await page.waitForURL(/\/app\/applications\?/);
  expect(page.url()).toContain("stage=Interview");

  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.waitForURL(/\/app(\?|$)/);

  await page.getByText("Deadlines Near", { exact: true }).click();
  await page.waitForURL(/\/app\/opportunities\?/);
  expect(page.url()).toContain("deadlineWindow=near");
});
