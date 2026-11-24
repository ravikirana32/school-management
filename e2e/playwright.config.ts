import { defineConfig, devices } from "@playwright/test";

/** Public entry smoke tests only. Authenticated journeys require a provisioned test tenant. */
export default defineConfig({
  testDir: "./web", fullyParallel: true, forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["line"], ["html", { outputFolder: "playwright-report", open: "never" }]] : "list",
  outputDir: "test-results", timeout: 30_000, expect: { timeout: 7_500 },
  use: { baseURL: process.env.E2E_BASE_URL, trace: "retain-on-failure", screenshot: "only-on-failure", video: "retain-on-failure", actionTimeout: 10_000 },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "chromium-mobile", use: { browserName: "chromium", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
