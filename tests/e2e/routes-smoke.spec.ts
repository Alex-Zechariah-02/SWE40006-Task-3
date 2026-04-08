import { test, expect } from "@playwright/test";

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

  await page.goto("/search");
  await expect(
    page.getByRole("heading", { name: "Search opportunities" })
  ).toBeVisible();

  await page.goto("/login");
  await expect(page.getByText("Enter your credentials to access your workspace.")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
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

