import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const policy = read('backend/api/src/modules/notifications/provider-suppression-policy.ts');
const tests = read('backend/api/src/modules/notifications/provider-suppression-policy.test.ts');
const route = read('backend/api/src/modules/notifications/delivery-webhook.routes.ts');
const routeTests = read('backend/api/src/modules/notifications/delivery-webhook.routes.test.ts');
const worker = read('backend/api/src/workers/notification-delivery-worker.ts');
const checks = [
 ['policy suppresses delayed event older than manual release', policy.includes('latestReleasedAt.getTime() >= eventOccurredAt.getTime()')],
 ['policy allows provider event newer than release', tests.includes('genuinely newer provider event after a manual release')],
 ['policy rejects invalid event time', policy.includes('Number.isFinite(eventOccurredAt.getTime())')],
 ['webhook reads latest matching suppression in tenant transaction', route.includes('notificationEmailSuppression.findFirst({ where: { organizationId: outbox.organizationId, schoolId: outbox.schoolId, emailHash: outbox.recipientEmailHash, hashVersion: outbox.recipientEmailHashVersion')],
 ['webhook gates insertion on release precedence', route.includes('if (shouldCreateProviderSuppression(')],
 ['audit is emitted only after successful insert', route.includes('if (inserted.length)') && route.includes('notificationEmailSuppressionAudit.create')],
 ['route test covers delayed event after manual release', routeTests.includes('release that postdates the provider event')],
 ['worker suppression check remains before provider send', worker.indexOf('if (suppression)') < worker.indexOf('const response = await fetch')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P64 static verification failed');
console.log(`P64 static verification: ${checks.length}/${checks.length} PASS`);
