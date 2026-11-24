import { readFileSync, existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
const root = process.cwd();
const auth = readFileSync(`${root}/backend/api/src/modules/auth/auth-rate-limit.ts`, 'utf8');
const routes = readFileSync(`${root}/backend/api/src/modules/auth/auth.routes.ts`, 'utf8');
const gaps = readFileSync(`${root}/MASTER-OPEN-GAPS-REGISTER.md`, 'utf8');
const mirror = readFileSync(`${root}/docs/MASTER-OPEN-GAPS-REGISTER.md`, 'utf8');
const checks = [
  ['progressive cooldown middleware exported', auth.includes('loginProgressiveProtection')],
  ['account and source IP pair is hashed', auth.includes('digest(identity)') && auth.includes('auth:login:cooldown:')],
  ['15-minute failure window', auth.includes('redis.expire(key, 15 * 60)')],
  ['60-second and five-minute escalation', auth.includes('count >= 8 ? 5 * 60 : 60')],
  ['generic credential failure on cooldown', auth.includes('return res.status(401).json({ error: "Invalid credentials" })')],
  ['successful login clears failure state', routes.includes('clearLoginFailure(parsed.data.email, req.ip)')],
  ['failed login increments progressive state', routes.includes('recordLoginFailure(parsed.data.email, req.ip)')],
  ['threshold alert allowlist', auth.includes('alertThresholds') && auth.includes('allowedAbuseEvents')],
  ['Redis stream alert event', auth.includes('redis.xadd(ALERT_STREAM')],
  ['35-day alert retention', auth.includes('expire(ALERT_STREAM, DAY_SECONDS * 35)')],
  ['admin summary includes alert events', auth.includes('xrevrange(ALERT_STREAM') && routes.includes('requirePlatformAdmin')],
  ['login route uses progressive middleware', routes.includes('loginRateLimit, loginProgressiveProtection')],
  ['gap registers are identical', gaps === mirror],
  ['P115 gaps and phase docs exist', gaps.includes('P115-G001') && gaps.includes('P115-G002') && gaps.includes('P115-G003') && existsSync(`${root}/P115-STATUS.md`) && existsSync(`${root}/P115-DELIVERY-REPORT.md`)],
  ['resolved gap history retained', existsSync(`${root}/MASTER-RESOLVED-GAPS-HISTORY.md`) && existsSync(`${root}/docs/MASTER-RESOLVED-GAPS-HISTORY.md`)],
];
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, ok]) => ok).length, checks.length);
console.log(`P115 source verification: ${checks.length}/${checks.length} PASS`);
