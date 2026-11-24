import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const routes = readFileSync('backend/api/src/modules/auth/auth.routes.ts', 'utf8');
const limiter = readFileSync('backend/api/src/modules/auth/auth-rate-limit.ts', 'utf8');
const gaps = readFileSync('MASTER-OPEN-GAPS-REGISTER.md', 'utf8');
const checks = [
  ['login rate limit mounted', /post\("\/login",\s*loginRateLimit/.test(routes)],
  ['registration rate limit mounted', /post\("\/register",\s*registerRateLimit/.test(routes)],
  ['refresh rate limit mounted', /post\("\/refresh",\s*refreshRateLimit/.test(routes)],
  ['password forgot rate limit mounted', /post\("\/password\/forgot",\s*passwordForgotRateLimit/.test(routes)],
  ['password reset rate limit mounted', /post\("\/password\/reset",\s*passwordResetRateLimit/.test(routes)],
  ['Redis atomic increment and expiry', /redis\.call\('INCR'/.test(limiter) && /redis\.call\('PEXPIRE'/.test(limiter)],
  ['hashed identifiers', /createHash\("sha256"\)/.test(limiter)],
  ['account and IP dimensions', /login-account/.test(limiter) && /login-ip/.test(limiter)],
  ['password recovery account dimension', /password-forgot-account/.test(limiter)],
  ['Retry-After response', /Retry-After/.test(limiter)],
  ['fail closed on Redis errors', /status\(503\)/.test(limiter)],
  ['P113 gaps documented', /P113-G001/.test(gaps) && /P113-G002/.test(gaps)],
];
for (const [name, passed] of checks) { console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`); assert.ok(passed, name); }
console.log(`P113 source verification: ${checks.length}/${checks.length} PASS`);
