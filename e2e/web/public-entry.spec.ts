import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const apps = [
  ["super-admin", "E2E_SUPER_ADMIN_URL"],
  ["organization-admin", "E2E_ORGANIZATION_ADMIN_URL"],
  ["school-admin", "E2E_SCHOOL_ADMIN_URL"],
  ["public-portal", "E2E_PUBLIC_PORTAL_URL"],
] as const;

for (const [appName, envName] of apps) {
  const url = process.env[envName];
  test.describe(`${appName} public entry`, () => {
    test.skip(!url, `${envName} is not configured; provision a deployed test target`);
    test("loads a usable document and root application", async ({ page }) => {
      const response = await page.goto(url!, { waitUntil: "domcontentloaded" });
      expect(response).toBeTruthy();
      expect(response!.status()).toBeLessThan(500);
      await expect(page.locator("#root")).toBeVisible();
      const metadata = await page.evaluate(() => ({ title: document.title.trim(), lang: document.documentElement.lang.trim(), viewport: document.querySelector('meta[name="viewport"]')?.getAttribute("content") ?? "" }));
      expect(metadata.title).not.toBe("");
      expect(metadata.lang).not.toBe("");
      expect(metadata.viewport).toContain("width=device-width");
    });
    test("@a11y has no serious or critical automated accessibility violations", async ({ page }) => {
      await page.goto(url!, { waitUntil: "domcontentloaded" });
      await expect(page.locator("#root")).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const blocking = results.violations.filter((item) => item.impact === "critical" || item.impact === "serious");
      expect(blocking, JSON.stringify(blocking.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map((node) => node.target) })), null, 2)).toEqual([]);
    });
  });
}
