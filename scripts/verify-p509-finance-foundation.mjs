import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const routePath = path.join(root, 'backend/api/src/modules/finance/finance-configuration.routes.ts');
const route = fs.readFileSync(routePath, 'utf8');
const app = fs.readFileSync(path.join(root, 'backend/api/src/app.ts'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'apps/school-admin/src/FinanceConfigurationWorkspace.tsx'), 'utf8');
const main = fs.readFileSync(path.join(root, 'apps/school-admin/src/main.tsx'), 'utf8');
const migrationPath = path.join(root, 'backend/api/prisma/migrations/20261123100000_c2_08_01_finance_configuration_foundation/migration.sql');
const migration = fs.readFileSync(migrationPath, 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const tests = [
  ['Finance config migration creates school-scoped table', () => assert.match(migration, /CREATE TABLE IF NOT EXISTS "SchoolFinanceConfiguration"/)],
  ['Finance config table has JSONB configuration payload', () => assert.match(migration, /"configuration" JSONB NOT NULL/)],
  ['Finance config table has version field', () => assert.match(migration, /"version" INTEGER NOT NULL DEFAULT 1/)],
  ['Finance config has school uniqueness', () => assert.match(migration, /UNIQUE \("schoolId"\)/)],
  ['Finance config enables and forces RLS', () => { assert.match(migration, /ENABLE ROW LEVEL SECURITY/); assert.match(migration, /FORCE ROW LEVEL SECURITY/); }],
  ['Finance config RLS scopes both organization and school', () => { assert.match(migration, /current_organization_id/); assert.match(migration, /current_school_id/); }],
  ['Finance config router requires authentication', () => assert.match(route, /financeConfigurationRouter\.use\(authenticate\)/)],
  ['Finance config router checks active school membership', () => assert.match(route, /hasActiveSchoolMembership/)],
  ['Finance config GET requires fees.read permission', () => assert.match(route, /allowed\(s, res, "fees\.read"\)/)],
  ['Finance config PUT requires fees.manage permission', () => assert.match(route, /allowed\(s, res, "fees\.manage"\)/)],
  ['Finance config validation constrains currency and category lists', () => { assert.match(route, /currency: z\.string\(\).*regex/); assert.match(route, /feeCategories: z\.array/); }],
  ['Finance config validation constrains payment methods and numbering prefixes', () => { assert.match(route, /paymentMethods: z\.array/); assert.match(route, /invoicePrefix: z\.string/); assert.match(route, /receiptPrefix: z\.string/); }],
  ['Finance config rejects duplicate codes', () => assert.match(route, /Duplicate \$\{key\} code/)],
  ['Finance config persistence uses atomic school upsert', () => assert.match(route, /ON CONFLICT \("schoolId"\) DO UPDATE/)],
  ['Finance config writes audit event', () => assert.match(route, /finance\.configuration\.updated/)],
  ['Finance config route mounted in API application', () => assert.match(app, /app\.use\("\/api\/v1\/finance", financeConfigurationRouter\)/)],
  ['Finance configuration UI calls persisted GET/PUT endpoint', () => { assert.match(ui, /\/configuration/); assert.match(ui, /call\("PUT", config\)/); }],
  ['Finance configuration UI supports default currency and invoice/receipt prefixes', () => { assert.match(ui, /Default currency/); assert.match(ui, /Invoice prefix/); assert.match(ui, /Receipt prefix/); }],
  ['Finance configuration UI supports editable fee categories', () => { assert.match(ui, /Fee categories/); assert.match(ui, /Add fee category/); assert.match(ui, /active: e\.target\.checked/); }],
  ['Finance configuration UI supports payment method enablement and additions', () => { assert.match(ui, /Payment methods/); assert.match(ui, /Add payment method/); assert.match(ui, /enabled: e\.target\.checked/); }],
  ['Finance configuration UI save requires fees.read and fees.manage', () => assert.match(ui, /disabled=\{busy\|\|!can\("fees\.manage"\)\|\|!can\("fees\.read"\)\}/)],
  ['Finance configuration UI mounted in School Admin accounting workspace', () => { assert.match(main, /FinanceConfigurationWorkspace/); assert.match(main, /tab === "accounting".*FinanceConfigurationWorkspace/); }],
  ['Root verifier script registered', () => assert.equal(packageJson.scripts['verify:p509'], 'node scripts/verify-p509-finance-foundation.mjs')]
];
let failed = 0;
for (const [name, test] of tests) {
  try { test(); console.log(`PASS ${name}`); }
  catch (error) { failed++; console.error(`FAIL ${name}: ${error.message}`); }
}
console.log(`P509 focused assertions: ${tests.length - failed}/${tests.length} PASS`);
if (failed) process.exitCode = 1;
