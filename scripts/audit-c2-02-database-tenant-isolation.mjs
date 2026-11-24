import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const schemaPath = 'backend/api/prisma/schema.prisma';
assert.ok(existsSync(schemaPath), 'Prisma schema is missing');
const schema = readFileSync(schemaPath, 'utf8');
const migrationRoot = 'backend/api/prisma/migrations';
const migrations = readdirSync(migrationRoot, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name).sort();
const models = [...schema.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)].map(m => ({ name: m[1], body: m[2] }));
const tenantFields = ['organizationId', 'schoolId'];
const scoped = models.filter(m => tenantFields.some(f => new RegExp(`^\\s*${f}\\s+`, 'm').test(m.body)));
const missingTenantField = scoped.filter(m => !tenantFields.some(f => new RegExp(`^\\s*${f}\\s+`, 'm').test(m.body)));
const unindexedScope = scoped.filter(m => !tenantFields.some(f => new RegExp(`@@(index|unique)\\s*\\(\\s*\\[([^\\]]*?)${f}([^\\]]*?)\\]`, 'm').test(m.body) || new RegExp(`^\\s*${f}\\s+[^\\n]*@unique`, 'm').test(m.body)));
const contextPath = 'backend/api/src/modules/auth/tenant-context.ts';
assert.ok(existsSync(contextPath), 'Tenant context helper is missing');
const context = readFileSync(contextPath, 'utf8');
const requiredHelpers = ['withTenantContext', 'withIdentityContext', 'withPlatformContext', 'withParentWorkerContext', 'withDocumentWorkerContext', 'withNotificationWorkerContext'];
const missingHelpers = requiredHelpers.filter(h => !context.includes(`function ${h}`));
const rlsEvidence = migrations.filter(name => /rls|tenant|security/i.test(name));
const sqlFiles = readdirSync('backend/api/prisma/tests').filter(n => n.endsWith('.sql'));
const report = {
  prismaModels: models.length,
  modelsWithTenantScopeFields: scoped.length,
  scopedModelsWithoutScopeIndexOrUnique: unindexedScope.map(m => m.name),
  missingTenantContextHelpers: missingHelpers,
  migrationDirectories: migrations.length,
  migrationDirectoriesWithRlsTenantSecurityNames: rlsEvidence.length,
  sqlAcceptanceFiles: sqlFiles.length,
  note: 'Static inventory only. Prisma/PostgreSQL execution, data-dependent scope audit, RLS catalog assertions and cross-tenant negative tests require an installed dependency environment and database.'
};
console.log(JSON.stringify(report, null, 2));
assert.equal(missingHelpers.length, 0, 'Required tenant context helpers missing');
