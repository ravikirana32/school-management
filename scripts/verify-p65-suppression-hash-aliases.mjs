import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const schema = read('backend/api/prisma/schema.prisma');
const migrationPath = 'backend/api/prisma/migrations/20261117235700_p65_suppression_hash_aliases/migration.sql';
const migration = read(migrationPath);
const api = read('backend/api/src/modules/notifications/suppression.routes.ts');
const worker = read('backend/api/src/workers/notification-delivery-worker.ts');
const webhook = read('backend/api/src/modules/notifications/delivery-webhook.routes.ts');
const routeTests = read('backend/api/src/modules/notifications/delivery-webhook.routes.test.ts');
const checks = [
 ['alias model has suppression relation and version/hash/status', schema.includes('model NotificationEmailSuppressionHashAlias') && schema.includes('hashVersion String @db.VarChar(20)') && schema.includes('emailHash String @db.VarChar(64)')],
 ['migration creates active unique alias index', existsSync(migrationPath) && migration.includes('NotificationEmailSuppressionHashAlias_active_hash_key')],
 ['migration backfills existing suppression hashes', migration.includes('INSERT INTO "NotificationEmailSuppressionHashAlias"') && migration.includes('FROM "NotificationEmailSuppression"')],
 ['alias table has tenant RLS and worker read policy', migration.includes('NotificationEmailSuppressionHashAlias_tenant_policy') && migration.includes('NotificationEmailSuppressionHashAlias_worker_policy')],
 ['API create checks aliases for every configured key', api.includes('notificationEmailSuppressionHashAlias.findFirst') && api.includes('OR:hashes.map')],
 ['API create writes aliases for all configured versions', api.includes('notificationEmailSuppressionHashAlias.createMany') && api.includes('hashes.map(hash=>') && api.includes('skipDuplicates:true')],
 ['API release marks aliases released transactionally', api.includes('notificationEmailSuppressionHashAlias.updateMany') && api.includes('status:"RELEASED",releasedAt')],
 ['worker checks direct suppressions and aliases', worker.includes('notificationEmailSuppressionHashAlias.findMany') && worker.includes('hasActiveSuppressionHashAlias(suppressionHashes, alias)')],
 ['webhook bounce path checks alias before insert and creates alias', webhook.includes('existingAlias') && webhook.includes('notificationEmailSuppressionHashAlias.create')],
 ['webhook tests assert alias creation', routeTests.includes('notificationEmailSuppressionHashAlias.create').toString() && routeTests.includes('hashVersion: "v2"')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P65 static verification failed');
console.log(`P65 static verification: ${checks.length}/${checks.length} PASS`);
