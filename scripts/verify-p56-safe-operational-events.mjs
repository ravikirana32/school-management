import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const helper = read('backend/api/src/modules/notifications/notification-operational-event.ts');
const tests = read('backend/api/src/modules/notifications/notification-operational-event.test.ts');
const worker = read('backend/api/src/workers/notification-delivery-worker.ts');
const logger = read('backend/api/src/config/logger.ts');
const checks = [
 ['operational event allowlists event/status/outbox', helper.includes('input.event') && helper.includes('input.outboxId') && helper.includes('input.status')],
 ['reason codes are fixed allowlist', helper.includes('allowedReasons')],
 ['duration is bounded', helper.includes('3_600_000')],
 ['arbitrary properties are not spread', !helper.includes('...input')],
 ['tests prove email/hash omission', tests.includes('parent@example.com') && tests.includes('secret-hash')],
 ['tests cover invalid identifier/status bounds', tests.includes('bounds invalid identifiers')],
 ['worker emits structured delivery outcomes', worker.includes('notification.delivery.delivered') && worker.includes('notification.delivery.cancelled')],
 ['worker logs fixed dead-letter reason', worker.includes('notification.delivery.dead_lettered')],
 ['worker logs use allowlisted event builder', worker.includes('buildNotificationOperationalEvent')],
 ['logger has P55 sensitive-field redaction', logger.includes('LOG_REDACTION_PATHS')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P56 static verification failed');
console.log(`P56 static verification: ${checks.length}/${checks.length} PASS`);
