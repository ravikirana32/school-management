import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const helper = read('backend/api/src/modules/notifications/notification-outbox-lease.ts');
const tests = read('backend/api/src/modules/notifications/notification-outbox-lease.test.ts');
const worker = read('backend/api/src/workers/notification-delivery-worker.ts');
const checks = [
 ['terminal states are centralized', helper.includes('NOTIFICATION_OUTBOX_TERMINAL_STATES')],
 ['worker skips terminal records', worker.includes('isNotificationOutboxTerminal(record.status)')],
 ['claim where filter is centralized', worker.includes('buildNotificationOutboxClaimWhere(outboxId, now)')],
 ['only pending/retry or expired processing are claimable', helper.includes('status: { in: ["PENDING", "RETRY"] }') && helper.includes('leaseUntil: { lt: now }')],
 ['tests cover all terminal states', tests.includes('treats %s as terminal')],
 ['tests cover live/equal/expired leases', tests.includes('expired processing lease') && tests.includes('live or equal-time lease')],
 ['tests cover non-claimable terminal states', tests.includes('terminal or unsupported states')],
 ['claim uses atomic updateMany', worker.includes('tx.notificationOutbox.updateMany({')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P54 static verification failed');
console.log(`P54 static verification: ${checks.length}/${checks.length} PASS`);
