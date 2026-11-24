import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const schemaPath = 'backend/api/prisma/schema.prisma';
const contextPath = 'backend/api/src/modules/auth/tenant-context.ts';
const contextTestPath = 'backend/api/src/modules/auth/tenant-context.p70.test.ts';
const catalogSqlPath = 'backend/api/prisma/tests/p575-tenant-rls-catalog-acceptance.sql';
for (const path of [schemaPath, contextPath, contextTestPath, catalogSqlPath]) {
  assert.ok(existsSync(path), `Required P575 artifact missing: ${path}`);
}

const schema = readFileSync(schemaPath, 'utf8');
const context = readFileSync(contextPath, 'utf8');
const contextTests = readFileSync(contextTestPath, 'utf8');
const catalogSql = readFileSync(catalogSqlPath, 'utf8');
const migrationsRoot = 'backend/api/prisma/migrations';
const migrationDirs = readdirSync(migrationsRoot, { withFileTypes: true }).filter(entry => entry.isDirectory());
const migrationFiles = migrationDirs.map(entry => join(migrationsRoot, entry.name, 'migration.sql')).filter(existsSync);
const migrationText = migrationFiles.map(path => readFileSync(path, 'utf8')).join('\n');

const models = [...schema.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)].map(match => {
  const name = match[1];
  const body = match[2];
  const table = body.match(/@@map\("([^"]+)"\)/)?.[1] ?? name;
  const organizationScoped = /^\s*organizationId\s+/m.test(body);
  const schoolScoped = /^\s*schoolId\s+/m.test(body);
  return { name, table, organizationScoped, schoolScoped, tenantScoped: organizationScoped || schoolScoped };
});
const tenantModels = models.filter(model => model.tenantScoped);
const tableRlsEvidence = tenantModels.map(model => {
  const escaped = model.table.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hasEnable = new RegExp(`ALTER\\s+TABLE\\s+"${escaped}"\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i').test(migrationText);
  const hasForce = new RegExp(`ALTER\\s+TABLE\\s+"${escaped}"\\s+FORCE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i').test(migrationText);
  const hasPolicy = new RegExp(`CREATE\\s+POLICY\\s+"[^"]+"\\s+ON\\s+"${escaped}"`, 'i').test(migrationText);
  return { ...model, hasExplicitEnable: hasEnable, hasExplicitForce: hasForce, hasExplicitPolicy: hasPolicy };
});

const requiredContextSettings = [
  'app.current_organization_id', 'app.current_school_id', 'app.current_user_id',
  'app.is_platform_admin', 'app.parent_delivery_worker', 'app.document_scan_worker',
  'app.notification_worker', 'app.report_card_verification',
];
for (const setting of requiredContextSettings) assert.ok(context.includes(setting), `Missing context selector reset: ${setting}`);
assert.ok(context.includes("set_config('app.is_platform_admin', 'false', true)"), 'Platform flag is not reset transaction-locally');
assert.ok(context.includes("set_config('app.parent_delivery_worker', 'false', true)"), 'Parent worker flag is not reset transaction-locally');
assert.ok(context.includes("set_config('app.document_scan_worker', 'false', true)"), 'Document worker flag is not reset transaction-locally');
assert.ok(context.includes("set_config('app.notification_worker', 'false', true)"), 'Notification worker flag is not reset transaction-locally');
assert.ok(context.includes("set_config('app.report_card_verification', 'false', true)"), 'Verification flag is not reset transaction-locally');
assert.ok(contextTests.includes('P575 transaction-local tenant context isolation'), 'Context isolation tests are missing');
assert.ok(contextTests.includes('expectAllPrivilegedFlagsReset'), 'Context tests do not assert privilege reset');
assert.ok(catalogSql.includes('relrowsecurity') && catalogSql.includes('relforcerowsecurity'), 'Catalog SQL must inspect enabled and forced RLS');
assert.ok(catalogSql.includes('pg_policies'), 'Catalog SQL must inspect policy catalog');
assert.ok(catalogSql.includes('rolsuper') && catalogSql.includes('rolbypassrls'), 'Catalog SQL must inspect application role posture');

const report = {
  phase: 'P575',
  evidenceLevel: 'static-source-only; no PostgreSQL execution claimed',
  prismaModelCount: models.length,
  tenantScopedModelCount: tenantModels.length,
  organizationScopedModelCount: tenantModels.filter(model => model.organizationScoped).length,
  schoolScopedModelCount: tenantModels.filter(model => model.schoolScoped).length,
  migrationDirectoryCount: migrationDirs.length,
  migrationSqlFileCount: migrationFiles.length,
  explicitRlsEvidence: {
    enable: tableRlsEvidence.filter(model => model.hasExplicitEnable).length,
    force: tableRlsEvidence.filter(model => model.hasExplicitForce).length,
    policy: tableRlsEvidence.filter(model => model.hasExplicitPolicy).length,
    note: 'Counts only direct table-name statements. Dynamic DO/FOREACH migrations and catalog runtime state require PostgreSQL execution; absence here is not conclusive proof of missing runtime RLS.'
  },
  modelsWithoutDirectEnableForcePolicyEvidence: tableRlsEvidence.filter(model => !model.hasExplicitEnable || !model.hasExplicitForce || !model.hasExplicitPolicy).map(model => model.name),
  contextReset: 'all identity and privilege selectors reset with transaction-local set_config before context is applied',
  runtimeAcceptance: 'NOT RUN — requires PostgreSQL and restricted application database role'
};
writeFileSync('P575-TENANT-STATIC-AUDIT.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  prismaModels: report.prismaModelCount,
  tenantScopedModels: report.tenantScopedModelCount,
  migrationDirectories: report.migrationDirectoryCount,
  migrationSqlFiles: report.migrationSqlFileCount,
  explicitRlsEnableEvidence: report.explicitRlsEvidence.enable,
  explicitRlsForceEvidence: report.explicitRlsEvidence.force,
  explicitRlsPolicyEvidence: report.explicitRlsEvidence.policy,
  contextSelectorsReset: requiredContextSettings.length,
  status: 'STATIC ASSERTIONS PASS; DATABASE ACCEPTANCE REQUIRED'
}, null, 2));
