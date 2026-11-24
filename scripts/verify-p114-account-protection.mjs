import { readFileSync, existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
const root = process.cwd();
const auth = readFileSync(`${root}/backend/api/src/modules/auth/auth-rate-limit.ts`, 'utf8');
const routes = readFileSync(`${root}/backend/api/src/modules/auth/auth.routes.ts`, 'utf8');
const gaps = readFileSync(`${root}/MASTER-OPEN-GAPS-REGISTER.md`, 'utf8');
const mirror = readFileSync(`${root}/docs/MASTER-OPEN-GAPS-REGISTER.md`, 'utf8');
const checks = [
  ['fixed event allowlist', auth.includes('allowedAbuseEvents')],
  ['daily Redis hash counters', auth.includes('hincrby') && auth.includes('auth:abuse:daily:')],
  ['35-day retention', auth.includes('60 * 60 * 24 * 35')],
  ['no identity fields in metric values', !auth.includes('hset')],
  ['rate-limit telemetry', auth.includes('recordAuthAbuseEvent("rate_limited")')],
  ['login success telemetry', routes.includes('recordAuthAbuseEvent("login_succeeded")')],
  ['login failure telemetry', routes.includes('recordAuthAbuseEvent("login_failed")')],
  ['refresh reuse telemetry', routes.includes('recordAuthAbuseEvent("refresh_reuse")')],
  ['concurrent reuse telemetry', routes.includes('recordAuthAbuseEvent("refresh_concurrent_reuse")')],
  ['admin-only summary endpoint', routes.includes('/security/abuse-summary') && routes.includes('requirePlatformAdmin')],
  ['seven-day summary', routes.includes('readAuthAbuseSummary(7)')],
  ['gap register mirror', gaps === mirror],
  ['P114 gap entries', gaps.includes('P114-G001') && gaps.includes('P114-G002') && gaps.includes('P114-G003')],
  ['phase documentation', existsSync(`${root}/P114-STATUS.md`) && existsSync(`${root}/P114-DELIVERY-REPORT.md`)],
];
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, ok]) => ok).length, checks.length);
console.log(`P114 source verification: ${checks.length}/${checks.length} PASS`);
