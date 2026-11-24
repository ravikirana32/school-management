import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.cwd(), process.cwd().endsWith('backend/api') ? '../..' : '.');
const testFile = path.join(root, 'backend/api/src/modules/auth/authorization-boundary.integration.test.ts');
const permissionsFile = path.join(root, 'backend/api/src/modules/auth/permissions.ts');
const pkgFile = path.join(root, 'backend/api/package.json');
const test = fs.readFileSync(testFile, 'utf8');
const permissions = fs.readFileSync(permissionsFile, 'utf8');
const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
const checks = [
  ['test imports actual authorization helpers', test.includes('import { hasPermission, assertScope')],
  ['exact allow case present', test.includes('allows an exact permission')],
  ['permission-deny case present', test.includes('denies a permission absent from the role')],
  ['module wildcard allow case present', test.includes('allows module wildcard permissions')],
  ['cross-module wildcard denial present', test.includes('does not let module wildcards cross modules')],
  ['global wildcard case present', test.includes('allows global wildcard permissions')],
  ['platform-admin permission case present', test.includes('platform administrators regardless of explicit permissions')],
  ['matching scope case present', test.includes('matching organization and school scopes')],
  ['cross-organization denial present', test.includes('cross-organization access')],
  ['cross-school denial present', test.includes('cross-school access')],
  ['missing school context case present', test.includes('requires a school context')],
  ['platform scope bypass case present', test.includes('bypass scope comparisons')],
  ['school admin fixture case present', test.includes('school admin permission bounded')],
  ['production helper source remains unchanged contract', permissions.includes('export function hasPermission') && permissions.includes('export function assertScope')],
  ['verify:p466 script registered', pkg.scripts?.['verify:p466'] === 'node ../../scripts/verify-p466-authorization-boundary-test-foundation.mjs']
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++; }
console.log(`P466 verification: ${checks.length - failed}/${checks.length} PASS`);
process.exit(failed ? 1 : 0);
