import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const contract = read('backend/api/src/modules/notifications/notification-webhook-contract.ts');
const tests = read('backend/api/src/modules/notifications/notification-webhook-contract.test.ts');
const route = read('backend/api/src/modules/notifications/delivery-webhook.routes.ts');
const schema = read('backend/api/prisma/schema.prisma');
const migration = 'backend/api/prisma/migrations/20261117235500_p61_notification_event_contract_version/migration.sql';
const checks = [
 ['canonical contract defaults missing version to v1', contract.includes('z.literal("v1").default("v1")')],
 ['unsupported contract versions rejected', tests.includes('rejects unsupported contract versions') && tests.includes('"v2"')],
 ['legacy canonical event payload remains compatible', tests.includes('defaults contract version to v1')],
 ['route persists parsed contract version', route.includes('contractVersion: event.contractVersion')],
 ['Prisma model persists contract version', schema.includes('contractVersion String @default("v1") @db.VarChar(20)')],
 ['additive migration defaults historical rows to v1', existsSync(migration) && read(migration).includes("DEFAULT 'v1'")],
 ['existing provider/event uniqueness retained', read('backend/api/prisma/schema.prisma').includes('@@unique([provider, providerEventId])')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P61 static verification failed');
console.log(`P61 static verification: ${checks.length}/${checks.length} PASS`);
