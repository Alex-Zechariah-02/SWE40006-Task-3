import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";

const PRIVATE_ROUTES = [
  "/app",
  "/app/opportunities",
  "/app/applications",
  "/app/companies",
  "/app/contacts",
  "/app/actions",
];

test("routes: public pages render", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your career pipeline, organized." })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Search opportunities" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Sign in to start tracking" })).toHaveCount(0);

  const landingMetrics = await page.evaluate(() => {
    const root = document.documentElement;
    return {
      scrollHeight: root.scrollHeight,
      clientHeight: root.clientHeight,
    };
  });

  expect(landingMetrics.scrollHeight).toBeLessThanOrEqual(landingMetrics.clientHeight + 1);

  await page.goto("/search");
  await expect(
    page.getByRole("heading", { name: "Search opportunities" })
  ).toBeVisible();

  await page.goto("/login");
  await expect(page.getByText("Enter your credentials to access your workspace.")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("routes: authenticated users visiting landing redirect to app", async ({
  page,
}) => {
  await loginAsE2E(page, { nextPath: "/app" });

  await page.goto("/");
  await page.waitForURL(/\/app(\?|$)/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("routes: private pages redirect to login when signed out", async ({
  page,
}) => {
  for (const route of PRIVATE_ROUTES) {
    await page.goto(route);
    await page.waitForURL(/\/login\?next=/);
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  }
});

