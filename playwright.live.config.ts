import { defineConfig, devices } from "@playwright/test";

function resolveBaseUrl(): string {
  const fromEnv = process.env.PLAYWRIGHT_BASE_URL?.trim();
  if (fromEnv) return fromEnv;
  return "http://127.0.0.1:3001";
}

const baseURL = resolveBaseUrl();
const baseUrlPort = (() => {
  try {
    const url = new URL(baseURL);
    if (url.port) return Number(url.port);
  } catch {
    // ignore
  }
  return 3001;
})();

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: ["**/linkup-live.spec.ts"],
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: `pnpm run e2e:server -- --port ${baseUrlPort}`,
    url: baseURL,
    reuseExistingServer: !!process.env.PLAYWRIGHT_REUSE_SERVER && !process.env.CI,
    env: {
      ...process.env,
      CAREERDECK_E2E: "0",
      AUTH_TRUST_HOST: "true",
      AUTH_URL: baseURL,
    },
    timeout: 180_000,
  },
});
