import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const route = read('backend/api/src/modules/notifications/delivery-webhook.routes.ts');
const tests = read('backend/api/src/modules/notifications/delivery-webhook.routes.test.ts');
const migration = read('backend/api/prisma/migrations/20261117220000_p45_notification_delivery_receipts/migration.sql');
const checks = [
 ['payload hash computed before duplicate lookup', route.indexOf('const payloadSha256 =') < route.indexOf('const existing = await tx.notificationDeliveryEvent.findUnique')],
 ['same event ID and same payload returns duplicate', route.includes('existing.payloadSha256 === payloadSha256 ? { duplicate: true as const }')],
 ['same event ID with different payload returns conflict', route.includes('EVENT_ID_CONFLICT') && route.includes(': { conflict: true as const }')],
 ['payload hash stored with event ledger row', route.includes('occurredAt: new Date(event.occurredAt), payloadSha256 }')],
 ['unique conflict re-reads persisted hash', route.includes('if (existing?.payloadSha256 === payloadSha256)')],
 ['unique conflict with different hash is not duplicate', route.includes('if (existing) return res.status(409)')],
 ['route tests cover same-payload replay', tests.includes('same payload')],
 ['route tests cover conflicting payload reuse', tests.includes('different payload')],
 ['route tests cover concurrent unique conflict', tests.includes('concurrent unique conflict')],
 ['database unique provider/event key remains present', migration.includes('UNIQUE("provider","providerEventId")')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P62 static verification failed');
console.log(`P62 static verification: ${checks.length}/${checks.length} PASS`);
