import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd().endsWith('backend/api') ? path.resolve(process.cwd(), '../..') : process.cwd();
const middleware = fs.readFileSync(path.join(root, 'backend/api/src/modules/auth/auth.middleware.ts'), 'utf8');
const routes = fs.readFileSync(path.join(root, 'backend/api/src/modules/auth/auth.routes.ts'), 'utf8');
const limits = fs.readFileSync(path.join(root, 'backend/api/src/modules/auth/auth-rate-limit.ts'), 'utf8');
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'docs/phases/P460-mfa-auth-enforcement-policy-inventory.json'), 'utf8'));
const checks = [
 ['MFA middleware enforces policy before next()', middleware.includes('enforceRequiredMfa(req, res)') && middleware.includes('if (!await enforceRequiredMfa(req, res)) return;')],
 ['platform-admin policy source is mandatory', middleware.includes('Boolean(req.auth?.isPlatformAdmin)')],
 ['role-based MFA is configured by MFA_REQUIRED_ROLE_KEYS', middleware.includes('MFA_REQUIRED_ROLE_KEYS') && middleware.includes('userRoleAssignment.findFirst')],
 ['bootstrap routes are explicitly exempted', ['GET /me','GET /mfa/status','POST /mfa/totp/enroll','POST /mfa/verify'].every(r => middleware.includes(r))],
 ['MFA enrollment-required response is defined', middleware.includes('MFA_ENROLLMENT_REQUIRED')],
 ['challenge-required response and 300-second freshness exist', middleware.includes('MFA_CHALLENGE_REQUIRED') && middleware.includes('5 * 60 * 1000') && middleware.includes('freshnessSeconds: 300')],
 ['TOTP enrollment is two-step and pending factor persists', routes.includes('verifiedAt: null') && routes.includes('auth.mfa.enrollment_started')],
 ['TOTP challenge consumes replay-resistant step transactionally', routes.includes('lastTotpStep: { lt: totpStep }') && routes.includes('verificationCommitted')],
 ['recovery codes are hashed and one-time claimed', routes.includes('hashRecoveryCode(value)') && routes.includes('usedAt: null') && routes.includes('codeClaimed.count !== 1')],
 ['MFA challenge and enrollment rate limits are source-defined', limits.includes('mfa-challenge-ip') && limits.includes('mfa-challenge-user') && limits.includes('mfa-enroll-ip') && limits.includes('mfa-enroll-user')],
 ['MFA disable invalidates recovery codes and session freshness', routes.includes('mfaRecoveryCode.deleteMany') && routes.includes('mfaVerifiedAt: null')],
 ['inventory is explicitly static and runtime validation not performed', inventory.evidenceType === 'static-source-inventory' && inventory.runtimeValidation === 'NOT_PERFORMED' && inventory.observations.some(o => o.id === 'P460-O12')]
];
let passed=0; for (const [label,ok] of checks) { console.log(`${ok?'PASS':'FAIL'}: ${label}`); if(ok) passed++; }
console.log(`P460 verifier: ${passed}/${checks.length} passed`); if(passed!==checks.length) process.exit(1);
