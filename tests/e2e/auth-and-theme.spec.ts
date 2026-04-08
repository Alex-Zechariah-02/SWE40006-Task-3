import { test, expect } from "@playwright/test";
import { attemptLogin, E2E_EMAIL, E2E_PASSWORD, loginAsE2E, logout } from "./helpers/auth";

test("auth: invalid credentials show a friendly error", async ({ page }) => {
  await attemptLogin(page, {
    email: E2E_EMAIL,
    password: "wrong-password",
    nextPath: "/app",
  });

  await page.waitForURL(/\/login\?.*error=CredentialsSignin/);
  await expect(page.getByText("Invalid email or password.")).toBeVisible();
});

test("auth: unsafe next param is ignored (no open redirect)", async ({ page }) => {
  await page.goto("/login?next=https://example.com");
  await expect(page.getByLabel("Email")).toBeVisible();

  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByLabel("Password").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL(/\/app(\?|$)/);
  expect(page.url()).not.toContain("example.com");
});

test("auth: logout returns to login", async ({ page }) => {
  await loginAsE2E(page, { nextPath: "/app" });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await logout(page);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("theme: toggle persists across navigation", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Toggle theme" });
  await expect(toggle).toBeVisible();

  await toggle.click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.goto("/search");
  await expect(page.getByRole("heading", { name: "Search opportunities" })).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await toggle.click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});
