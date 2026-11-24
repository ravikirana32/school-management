import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const paths = read('backend/api/src/config/log-redaction.ts');
const logger = read('backend/api/src/config/logger.ts');
const pathTests = read('backend/api/src/config/log-redaction.test.ts');
const safeError = read('backend/api/src/modules/notifications/notification-safe-error.ts');
const safeErrorTests = read('backend/api/src/modules/notifications/notification-safe-error.test.ts');
const worker = read('backend/api/src/workers/notification-delivery-worker.ts');
const checks = [
 ['authorization and cookie headers redacted', paths.includes('req.headers.authorization') && paths.includes('req.headers.cookie')],
 ['webhook signature header redacted', paths.includes('x-school-email-signature')],
 ['email and HMAC fields redacted', paths.includes('"email"') && paths.includes('"emailHash"')],
 ['verification codes and raw bodies redacted', paths.includes('"verificationCode"') && paths.includes('"rawBody"')],
 ['notification payload redacted', paths.includes('req.body.payload')],
 ['logger consumes shared redaction list', logger.includes('redact: [...LOG_REDACTION_PATHS]')],
 ['redaction path tests cover sensitive values', pathTests.includes('redacts authorization') && pathTests.includes('redacts email')],
 ['safe error helper avoids arbitrary messages', safeError.includes('Notification provider transport failure')],
 ['safe error tests assert PII/token omission', safeErrorTests.includes('parent@example.com') && safeErrorTests.includes('private-token')],
 ['worker persists safe summaries, not raw errors', worker.includes('safeNotificationFailureSummary(error)') && !worker.includes('error.message.slice')],
 ['dead-letter payload uses fixed error code', worker.includes('errorCode: "NotificationDeliveryFailed"')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P55 static verification failed');
console.log(`P55 static verification: ${checks.length}/${checks.length} PASS`);
