import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const worker = read('backend/api/src/workers/notification-delivery-worker.ts');
const route = read('backend/api/src/modules/notifications/delivery-webhook.routes.ts');
const schema = read('backend/api/prisma/schema.prisma');
const migration = 'backend/api/prisma/migrations/20261117235600_p63_notification_recipient_hash/migration.sql';
const tests = read('backend/api/src/modules/notifications/delivery-webhook.routes.test.ts');
const checks = [
 ['outbox stores recipient HMAC and key version', schema.includes('recipientEmailHash String? @db.VarChar(64)') && schema.includes('recipientEmailHashVersion String? @db.VarChar(20)')],
 ['migration adds nullable hash fields without plaintext', read(migration).includes('recipientEmailHash') && !read(migration).includes('recipientEmail String')],
 ['worker computes current-key recipient hash', worker.includes('const currentRecipientHash = suppressionHashes[0]')],
 ['worker persists hash before provider fetch', worker.indexOf('recipientEmailHash: currentRecipientHash.emailHash') < worker.indexOf('const response = await fetch')],
 ['worker records hash only under active lease', worker.includes('status: "PROCESSING", leaseOwner') && worker.includes('hashRecorded.count !== 1')],
 ['webhook preflight resolves outbox hash under worker read context', route.includes('recipientEmailHash: true, recipientEmailHashVersion: true')],
 ['webhook switches to tenant context for event/suppression transaction', route.includes('withTenantContext(prisma, { organizationId: outbox.organizationId, schoolId: outbox.schoolId }')],
 ['bounce and complaint map to suppression reasons', route.includes('eventType === "BOUNCED" ? "BOUNCE" : "COMPLAINT"')],
 ['suppression insert is idempotent on active partial unique key', route.includes('ON CONFLICT ("organizationId", "schoolId", "emailHash") WHERE "status" = \'ACTIVE\' DO NOTHING')],
 ['audit event is inserted only for newly created suppression', route.includes('if (inserted.length)') && route.includes('notificationEmailSuppressionAudit.create')],
 ['route tests cover bounce suppression and legacy no-hash row', tests.includes('creates a school-local suppression from a bounce') && tests.includes('creates a school-local complaint suppression') && tests.includes('historical outbox has no recipient hash')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P63 static verification failed');
console.log(`P63 static verification: ${checks.length}/${checks.length} PASS`);
