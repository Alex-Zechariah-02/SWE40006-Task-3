import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const DEMO_EMAIL = "demo@careerdeck.test";
export const DEMO_PASSWORD = "Demo123!";

export const E2E_EMAIL = "e2e@careerdeck.test";
export const E2E_PASSWORD = "E2E123!";

function escapeForRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function login(page: Page, params: { email: string; password: string; nextPath?: string }) {
  const nextPath = params.nextPath ?? "/app";

  // Avoid coupling every spec to Auth.js redirect semantics. Log in once, then
  // navigate to the desired route explicitly (redirect behavior has its own tests).
  await page.goto("/login?next=/app");
  await expect(page.getByLabel("Email")).toBeVisible();

  await page.getByLabel("Email").fill(params.email);
  await page.getByLabel("Password").fill(params.password);

  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/app(\?|$)/);
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();

  if (nextPath !== "/app") {
    await page.goto(nextPath);
  }

  await page.waitForURL(new RegExp(escapeForRegExp(nextPath)));
}

export async function loginAsDemo(page: Page, opts?: { nextPath?: string }) {
  const nextPath = opts?.nextPath ?? "/app";

  await login(page, { email: DEMO_EMAIL, password: DEMO_PASSWORD, nextPath });
}

export async function loginAsE2E(page: Page, opts?: { nextPath?: string }) {
  const nextPath = opts?.nextPath ?? "/app";
  await login(page, { email: E2E_EMAIL, password: E2E_PASSWORD, nextPath });
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(/\/login(\?|$)/);
}

export async function attemptLogin(page: Page, params: { email: string; password: string; nextPath?: string }) {
  const nextPath = params.nextPath ?? "/app";

  await page.goto(`/login?next=${nextPath}`);
  await expect(page.getByLabel("Email")).toBeVisible();

  await page.getByLabel("Email").fill(params.email);
  await page.getByLabel("Password").fill(params.password);

  await page.getByRole("button", { name: "Sign in" }).click();
}
