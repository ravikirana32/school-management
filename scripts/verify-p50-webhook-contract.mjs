import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const signature = read('backend/api/src/modules/notifications/notification-webhook-signature.ts');
const signatureTest = read('backend/api/src/modules/notifications/notification-webhook-signature.test.ts');
const contract = read('backend/api/src/modules/notifications/notification-webhook-contract.ts');
const contractTest = read('backend/api/src/modules/notifications/notification-webhook-contract.test.ts');
const route = read('backend/api/src/modules/notifications/delivery-webhook.routes.ts');
const checks = [
 ['signature validates exact raw bytes', signature.includes('.update(rawBody)')],
 ['signature enforces 5-minute timestamp tolerance', signature.includes('Math.abs(nowSeconds - timestamp) > 300')],
 ['signature rejects duplicate header fields', signature.includes('Object.hasOwn(parts, key)')],
 ['signature rejects unknown/missing fields', signature.includes('Object.keys(parts).length !== 2')],
 ['signature uses timing-safe comparison', signature.includes('timingSafeEqual')],
 ['signature validates secret length', signature.includes('secret.length < 32')],
 ['signature tests include duplicate/unknown/non-decimal fields', signatureTest.includes('duplicate timestamp') && signatureTest.includes('unknown signature fields') && signatureTest.includes('non-decimal timestamp')],
 ['canonical event schema rejects unknown fields', contract.includes('}).strict()')],
 ['canonical event schema tests malformed payloads', contractTest.includes('unsupported event types') && contractTest.includes('timezone-aware') && contractTest.includes('unknown top-level')],
 ['all canonical event types map to internal states', contract.includes('DELIVERED') && contract.includes('BOUNCED') && contract.includes('COMPLAINED')],
 ['route uses extracted canonical schema and mapper', route.includes('notificationDeliveryEventSchema.safeParse') && route.includes('toNotificationDeliveryEventType')],
 ['raw body is required before event parsing', route.indexOf('!rawBody') < route.indexOf('notificationDeliveryEventSchema.safeParse')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P50 static verification failed');
console.log(`P50 static verification: ${checks.length}/${checks.length} PASS`);
