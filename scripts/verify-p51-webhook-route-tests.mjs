import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const routeTest = read('backend/api/src/modules/notifications/delivery-webhook.routes.test.ts');
const app = read('backend/api/src/app.ts');
const route = read('backend/api/src/modules/notifications/delivery-webhook.routes.ts');
const checks = [
 ['route tests cover missing configuration', routeTest.includes('configuration is missing')],
 ['route tests cover provider allowlist', routeTest.includes('outside the configured allowlist')],
 ['route tests reject invalid signature before database access', routeTest.includes('before database access')],
 ['route tests cover successful signed event persistence', routeTest.includes('persists a valid signed event')],
 ['route tests cover duplicate replay', routeTest.includes('already recorded event')],
 ['route tests cover missing outbox', routeTest.includes('missing or non-email outbox')],
 ['route tests cover out-of-order event', routeTest.includes('older events without overwriting newer')],
 ['app captures raw body in JSON verify hook', app.includes('verify: (req, _res, buffer)') && app.includes('rawBody?: Buffer')],
 ['JSON middleware is registered before webhook route', app.indexOf('app.use(express.json') < app.indexOf('app.use("/api/v1/webhooks/notifications", notificationDeliveryWebhookRouter)')],
 ['route verifies raw body before parsing canonical event', route.indexOf('verifyNotificationWebhookSignature(rawBody') < route.indexOf('notificationDeliveryEventSchema.safeParse')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P51 static verification failed');
console.log(`P51 static verification: ${checks.length}/${checks.length} PASS`);
