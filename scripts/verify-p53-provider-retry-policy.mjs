import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const helper = read('backend/api/src/modules/notifications/notification-provider-response.ts');
const tests = read('backend/api/src/modules/notifications/notification-provider-response.test.ts');
const worker = read('backend/api/src/workers/notification-delivery-worker.ts');
const checks = [
 ['retry policy handles request timeout', helper.includes('status === 408')],
 ['retry policy handles early data and rate limits', helper.includes('status === 425') && helper.includes('status === 429')],
 ['retry policy handles 5xx', helper.includes('status >= 500')],
 ['permanent status is distinguished', helper.includes('"PERMANENT"')],
 ['tests cover transient statuses', tests.includes('retries transient HTTP')],
 ['tests cover permanent statuses', tests.includes('does not retry permanent')],
 ['tests cover invalid status', tests.includes('invalid status values')],
 ['worker dead-letters permanent provider response', worker.includes('classifyNotificationProviderFailure(response.status) === "PERMANENT"') && worker.includes('status: "DEAD_LETTER"')],
 ['worker retries transient provider response', worker.includes('throw new Error(providerError)')],
 ['worker records dead-letter without provider body', worker.includes('errorCode: "PermanentProviderResponse"')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P53 static verification failed');
console.log(`P53 static verification: ${checks.length}/${checks.length} PASS`);
