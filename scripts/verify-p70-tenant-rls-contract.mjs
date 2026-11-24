import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const context = readFileSync('backend/api/src/modules/auth/tenant-context.ts', 'utf8');
const tests = readFileSync('backend/api/src/modules/auth/tenant-context.p70.test.ts', 'utf8');
const sql = readFileSync('backend/api/prisma/tests/p70-tenant-rls-catalog-acceptance.sql', 'utf8');
for (const helper of ['withTenantContext', 'withIdentityContext', 'withPlatformContext', 'withParentWorkerContext', 'withDocumentWorkerContext', 'withNotificationWorkerContext', 'withReportCardVerificationContext']) {
  assert.ok(context.includes(`function ${helper}`), `Missing context helper ${helper}`);
  assert.ok(tests.includes(helper), `Missing P70 test coverage for ${helper}`);
}
assert.ok(context.includes("set_config('app.current_organization_id'"));
assert.ok(context.includes("set_config('app.is_platform_admin', 'false', true)"));
assert.ok(sql.includes('relrowsecurity') && sql.includes('relforcerowsecurity') && sql.includes('pg_policies'));
assert.ok(sql.includes('rolsuper') && sql.includes('rolbypassrls'));
assert.ok(existsSync('backend/api/prisma/tests/p04-rls-verification.sql'));
console.log('P70 tenant/RLS contract static verification: 10/10 PASS; database execution remains required.');
