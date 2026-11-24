import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checks = [];
function check(name, condition, detail = '') {
  checks.push({ name, passed: Boolean(condition), detail });
}
function read(relative) {
  try { return fs.readFileSync(path.join(root, relative), 'utf8'); }
  catch { return ''; }
}
function exists(relative) { return fs.existsSync(path.join(root, relative)); }

const pkg = JSON.parse(read('package.json'));
const config = read('e2e/playwright.config.ts');
const webSpec = read('e2e/web/public-entry.spec.ts');
const mobile = read('e2e/mobile/README.md');
const acceptance = read('docs/testing/P577-BROWSER-MOBILE-ACCESSIBILITY-ACCEPTANCE.md');
const expectedApps = ['super-admin', 'organization-admin', 'school-admin', 'public-portal'];

const webHtml = ['super-admin', 'organization-admin', 'school-admin', 'public-portal'].map((app) => ({
  app, html: read(`apps/${app}/index.html`),
}));
const mobileApps = [
  ['parent-mobile', 'school-parent'], ['teacher-mobile', 'school-teacher'],
  ['student-mobile', 'school-student'], ['driver-mobile', 'school-transport-driver'],
  ['staff-mobile', 'school-staff'],
];
const expectedEnv = ['E2E_SUPER_ADMIN_URL', 'E2E_ORGANIZATION_ADMIN_URL', 'E2E_SCHOOL_ADMIN_URL', 'E2E_PUBLIC_PORTAL_URL'];

check('Playwright pinned dev dependency', pkg.devDependencies?.['@playwright/test'] === '1.56.1');
check('axe Playwright pinned dev dependency', pkg.devDependencies?.['@axe-core/playwright'] === '4.10.2');
check('web E2E script declared', pkg.scripts?.['test:e2e:web'] === 'playwright test --config=e2e/playwright.config.ts');
check('accessibility E2E script declared', pkg.scripts?.['test:e2e:a11y'] === 'playwright test --config=e2e/playwright.config.ts --grep @a11y');
check('P577 verifier script declared', pkg.scripts?.['verify:p577'] === 'node scripts/verify-p577-e2e-accessibility-foundation.mjs');
check('Playwright config exists', Boolean(config));
check('desktop Chromium project configured', config.includes('Desktop Chrome'));
check('mobile Chromium viewport project configured', config.includes('chromium-mobile') && config.includes('width: 390'));
check('trace retained on failure', config.includes('retain-on-failure'));
check('screenshots retained on failure', config.includes('only-on-failure'));
check('four web app targets in spec', expectedApps.every((app) => webSpec.includes(`"${app}"`)));
check('four web target environment variables in spec', expectedEnv.every((env) => webSpec.includes(env)));
check('missing targets explicitly skipped', webSpec.includes('test.skip(!url'));
check('root app visibility asserted', webSpec.includes('locator("#root")'));
check('document title/lang/viewport asserted', ['document.title', 'document.documentElement.lang', 'meta[name="viewport"]'].every((s) => webSpec.includes(s)));
check('axe WCAG 2.2 AA tags included', webSpec.includes('wcag22aa'));
check('serious and critical axe violations fail', webSpec.includes('impact === "critical"') && webSpec.includes('impact === "serious"'));
check('five mobile apps included', ['Parent', 'Teacher', 'Student', 'Driver', 'Staff'].every((s) => mobile.includes(s)));
check('mobile offline and reconnect journeys documented', mobile.includes('offline') && mobile.includes('retry'));
check('permission denial paths documented', mobile.includes('permission denial'));
check('manual keyboard and screen-reader review documented', acceptance.includes('Keyboard-only') && acceptance.includes('Screen-reader'));
check('Kannada localization review documented', acceptance.includes('Kannada'));
check('WCAG 2.2 AA acceptance scope documented', acceptance.includes('WCAG 2.0/2.1/2.2 A/AA'));
check('synthetic test data and secret hygiene documented', acceptance.includes('synthetic PII') && acceptance.includes('No production credentials'));
check('entry gates and non-acceptance caveat documented', acceptance.includes('Entry gates') && acceptance.includes('No browser, mobile, offline or manual accessibility pass is claimed'));


for (const { app, html } of webHtml) {
  check(`${app} document language`, /<html[^>]+lang=["'][^"']+["']/i.test(html));
  check(`${app} responsive viewport`, /name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i.test(html));
  check(`${app} document title`, /<title>[^<]+<\/title>/i.test(html));
}
for (const [app, scheme] of mobileApps) {
  const appConfig = read(`apps/${app}/app.json`);
  const appSource = read(`apps/${app}/App.tsx`);
  check(`${app} app config scheme`, appConfig.includes(`"scheme":"${scheme}"`) || appConfig.includes(`"scheme": "${scheme}"`));
  check(`${app} root application source present`, appSource.length > 100);
}
const driverSource = read('apps/driver-mobile/App.tsx');
check('driver actions expose button accessibility roles', (driverSource.match(/accessibilityRole="button"/g) || []).length >= 5);
check('driver form controls expose accessible names', (driverSource.match(/accessibilityLabel=/g) || []).length >= 5);
check('driver section headings expose header role', driverSource.includes('accessibilityRole="header"'));
check('driver trip attendance actions are scoped inside trip iteration', /r\.trips\.map\(t=>[\s\S]*?loadAttendance\(t\.id\)/.test(driverSource));

const failed = checks.filter((item) => !item.passed);
for (const item of checks) console.log(`${item.passed ? 'PASS' : 'FAIL'} ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
console.log(`\nP577 foundation: ${checks.length - failed.length}/${checks.length} PASS; ${failed.length} FAIL`);
if (failed.length) process.exitCode = 1;
