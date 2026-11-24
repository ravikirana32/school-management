import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const route = read('backend/api/src/modules/notifications/delivery-webhook.routes.ts');
const tests = read('backend/api/src/modules/notifications/delivery-webhook.routes.test.ts');
const app = read('backend/api/src/app.ts');
const checks = [
 ['webhook requires application/json', route.includes('!req.is("application/json")') && route.includes('status(415)')],
 ['webhook has explicit 64 KB payload cap', route.includes('rawBody.length > 64 * 1024') && route.includes('status(413)')],
 ['signature verification uses captured raw body', route.includes('verifyNotificationWebhookSignature(rawBody, signature, secret)')],
 ['raw-body capture occurs before webhook router', app.indexOf('app.use(express.json') < app.indexOf('app.use("/api/v1/webhooks/notifications", notificationDeliveryWebhookRouter)')],
 ['global JSON parser has a finite 1 MB cap', app.includes("limit: '1mb'")],
 ['route tests cover wrong media type', tests.includes('rejects non-JSON content types')],
 ['route tests cover >64 KB body', tests.includes('larger than 64 KB')],
 ['route tests cover raw-body signature', tests.includes('persists a valid signed event')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P60 static verification failed');
console.log(`P60 static verification: ${checks.length}/${checks.length} PASS`);
