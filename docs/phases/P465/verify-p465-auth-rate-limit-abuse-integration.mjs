import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd().endsWith('backend/api') ? path.resolve(process.cwd(), '../..') : process.cwd();
const source = fs.readFileSync(path.join(root, 'backend/api/src/modules/auth/auth-rate-limit.ts'), 'utf8');
const test = fs.readFileSync(path.join(root, 'backend/api/src/modules/auth/auth-rate-limit.integration.test.ts'), 'utf8');
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'docs/phases/P465-auth-rate-limit-abuse-integration-inventory.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'backend/api/package.json'), 'utf8'));
const checks = [
 ['login IP limiter policy present', source.includes('scope: "login-ip", limit: 30, windowMs: 15 * minute')],
 ['login account limiter policy present', source.includes('scope: "login-account", limit: 10, windowMs: 15 * minute')],
 ['refresh IP limiter policy present', source.includes('scope: "refresh-ip", limit: 90, windowMs: 15 * minute')],
 ['registration limiter policy present', source.includes('scope: "register-ip", limit: 8, windowMs: 60 * minute')],
 ['forgot-password dual-scope policy present', source.includes('scope: "password-forgot-ip", limit: 5') && source.includes('scope: "password-forgot-account", limit: 3')],
 ['reset limiter policy present', source.includes('scope: "password-reset-ip", limit: 10, windowMs: 60 * minute')],
 ['MFA challenge dual-scope policy present', source.includes('scope: "mfa-challenge-ip", limit: 30') && source.includes('scope: "mfa-challenge-user", limit: 10')],
 ['MFA enrollment dual-scope policy present', source.includes('scope: "mfa-enroll-ip", limit: 10') && source.includes('scope: "mfa-enroll-user", limit: 3')],
 ['429 response includes Retry-After', source.includes('res.setHeader("Retry-After"') && source.includes('res.status(429)')],
 ['limiter fails closed with 503', source.includes('res.status(503).json({ error: "Authentication service temporarily unavailable" })')],
 ['integration test covers under-limit requests', test.includes('allows requests up to the configured limit')],
 ['integration test covers 429 and Retry-After', test.includes('returns 429 and Retry-After')],
 ['integration test covers Redis outage', test.includes('fails closed with 503 when Redis is unavailable')],
 ['integration test checks identity privacy', test.includes('does not expose limiter identity values')],
 ['inventory documents all 11 policies', inventory.policy.length === 11],
 ['phase verifier script registered', pkg.scripts?.['verify:p465'] === 'node ../../scripts/verify-p465-auth-rate-limit-abuse-integration.mjs'],
];
let pass=0; for (const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(ok)pass++;}
console.log(`P465 source verifier: ${pass}/${checks.length}`); if(pass!==checks.length)process.exit(1);
