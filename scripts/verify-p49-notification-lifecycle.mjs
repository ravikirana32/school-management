import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const migration45 = read('backend/api/prisma/migrations/20261117220000_p45_notification_delivery_receipts/migration.sql');
const migration46 = read('backend/api/prisma/migrations/20261117230000_p46_email_suppression/migration.sql');
const migration48 = read('backend/api/prisma/migrations/20261117234000_p48_versioned_suppression_hash_rotation/migration.sql');
const webhook = read('backend/api/src/modules/notifications/delivery-webhook.routes.ts');
const worker = read('backend/api/src/workers/notification-delivery-worker.ts');
const suppression = read('backend/api/src/modules/notifications/suppression.routes.ts');
const helperTest = read('backend/api/src/modules/notifications/email-suppression.test.ts');
const checks = [
 ['P45 provider-event idempotency constraint', migration45.includes('UNIQUE("provider","providerEventId")')],
 ['P45 tenant-scoped event foreign key', migration45.includes('NotificationDeliveryEvent_outbox_fk')],
 ['P45 tenant RLS policy', migration45.includes('NotificationDeliveryEvent_tenant_policy')],
 ['P46 suppression RLS policy', migration46.includes("'NotificationEmailSuppression','NotificationEmailSuppressionAudit'") && migration46.includes('ENABLE ROW LEVEL SECURITY') && migration46.includes('FORCE ROW LEVEL SECURITY')],
 ['P46 audit history RLS policy', migration46.includes("'NotificationEmailSuppression','NotificationEmailSuppressionAudit'") && migration46.includes('WITH CHECK')],
 ['P46 active suppression uniqueness', migration46.includes('NotificationEmailSuppression_active_email_key')],
 ['P48 versioned hash migration', migration48.includes('ADD COLUMN "hashVersion"')],
 ['Webhook signature validation present', webhook.includes('verifyNotificationWebhookSignature')],
 ['Worker terminal state and pre-send suppression checks', worker.includes('suppressionHashes') && worker.includes('status: "ACTIVE"')],
 ['API audit event insert on create/release', suppression.includes('notificationEmailSuppressionAudit.create')],
 ['Key rollover regression cases included', helperTest.includes('legacy secret as current') && helperTest.includes('rejects duplicate current and previous versions')],
 ['P49 integration test plan exists', existsSync('docs/phases/P49-NOTIFICATION-LIFECYCLE-ACCEPTANCE.md')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P49 verification failed');
console.log(`P49 static verification: ${checks.length}/${checks.length} PASS`);
