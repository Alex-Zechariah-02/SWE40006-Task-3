import { defineConfig, devices } from "@playwright/test";

function resolveBaseUrl(): string {
  const fromEnv = process.env.PLAYWRIGHT_BASE_URL?.trim();
  if (fromEnv) return fromEnv;
  return "http://127.0.0.1:3000";
}

const baseURL = resolveBaseUrl();
const baseUrlPort = (() => {
  try {
    const url = new URL(baseURL);
    if (url.port) return Number(url.port);
  } catch {
    // ignore
  }
  return 3000;
})();

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: (() => {
    const raw = process.env.PLAYWRIGHT_WORKERS?.trim();
    if (!raw) return 1;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  })(),
  timeout: 60_000,
  expect: {
    timeout: 10_000,
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
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },
  ],
  webServer: {
    command: `pnpm run e2e:server -- --port ${baseUrlPort}`,
    url: baseURL,
    reuseExistingServer: !!process.env.PLAYWRIGHT_REUSE_SERVER && !process.env.CI,
    env: {
      ...process.env,
      CAREERDECK_E2E: "1",
      AUTH_TRUST_HOST: "true",
      AUTH_URL: baseURL,
    },
    timeout: 120_000,
  },
});
