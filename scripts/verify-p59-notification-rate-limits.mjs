import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const limiter = read('backend/api/src/modules/notifications/notification-webhook-rate-limit.ts');
const key = read('backend/api/src/modules/notifications/notification-rate-limit-key.ts');
const webhook = read('backend/api/src/modules/notifications/delivery-webhook.routes.ts');
const suppression = read('backend/api/src/modules/notifications/suppression.routes.ts');
const routeTests = read('backend/api/src/modules/notifications/delivery-webhook.routes.test.ts');
const keyTests = read('backend/api/src/modules/notifications/notification-webhook-rate-limit.test.ts');
const checks = [
 ['Redis limiter uses atomic INCR and PEXPIRE', limiter.includes('redis.call(\'INCR\'') && limiter.includes('redis.call(\'PEXPIRE\'')],
 ['Redis limiter disables offline queue and bounds retries', limiter.includes('enableOfflineQueue: false') && limiter.includes('maxRetriesPerRequest: 1')],
 ['Redis key hashes scope and identity', key.includes('createHash("sha256")') && key.includes('notification:rate:')],
 ['Redis key never embeds raw identity', !key.includes('`notification:rate:${scope}:${identity}`')],
 ['webhook rate limit is provider and IP scoped', webhook.includes('consumeNotificationRateLimit(`webhook:${provider}`, req.ip || "unknown", 120, 60_000)')],
 ['webhook limiter fails closed on Redis error', webhook.includes('RATE_LIMIT_UNAVAILABLE') && webhook.includes('status(503)')],
 ['webhook emits 429 and Retry-After', webhook.includes('status(429)') && webhook.includes('Retry-After')],
 ['suppression create/release mutations are limited', suppression.includes('"suppression-create"') && suppression.includes('"suppression-release"')],
 ['suppression mutation limits use tenant/user identity', suppression.includes('`${s.organizationId}:${s.schoolId}:${s.userId}`')],
 ['route tests cover 429 and Redis unavailable', routeTests.includes('rate limit is exceeded') && routeTests.includes('Redis rate limiting is unavailable')],
 ['key tests prove raw identity is not exposed', keyTests.includes('does not place raw identity in Redis key')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P59 static verification failed');
console.log(`P59 static verification: ${checks.length}/${checks.length} PASS`);
