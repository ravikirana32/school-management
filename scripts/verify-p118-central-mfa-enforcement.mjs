import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const middleware = read('backend/api/src/modules/auth/auth.middleware.ts');
const gaps = read('MASTER-OPEN-GAPS-REGISTER.md');
const checks = [
  ['Shared authenticate middleware invokes central MFA enforcement', middleware.includes('if (!await enforceRequiredMfa(req, res)) return;')],
  ['Platform administrator policy is mandatory', middleware.includes('Boolean(req.auth?.isPlatformAdmin)')],
  ['Additional configured role keys are evaluated server-side', middleware.includes('MFA_REQUIRED_ROLE_KEYS') && middleware.includes('userRoleAssignment.findFirst')],
  ['Verified active TOTP factor is required', middleware.includes('factorType: "TOTP"') && middleware.includes('verifiedAt: { not: null }')],
  ['MFA freshness is bounded to five minutes and rejects future timestamps', middleware.includes('ageMs >= 0 && ageMs <= 5 * 60 * 1000')],
  ['Identity bootstrap route is explicitly exempted', middleware.includes('"GET /me"')],
  ['MFA status and enrollment routes are explicitly exempted', middleware.includes('"GET /mfa/status"') && middleware.includes('"POST /mfa/totp/enroll"')],
  ['MFA verification route is explicitly exempted', middleware.includes('"POST /mfa/verify"')],
  ['Missing-factor response provides enrollment action', middleware.includes('MFA_ENROLLMENT_REQUIRED') && middleware.includes('/api/v1/auth/mfa/totp/enroll')],
  ['Stale-factor response provides challenge action', middleware.includes('MFA_CHALLENGE_REQUIRED') && middleware.includes('/api/v1/auth/mfa/verify')],
  ['Factor disable and session routes are not in bootstrap allowlist', !middleware.includes('"DELETE /mfa/totp"') && !middleware.includes('"GET /sessions"')],
  ['P117 server-side enforcement gap is moved to verification', gaps.includes('P117-G002') && gaps.includes('READY_FOR_VERIFICATION')],
  ['P118 gaps are registered', ['P118-G001','P118-G002','P118-G003'].every(id => gaps.includes(id))],
  ['Root/docs gap registers are byte-identical', read('MASTER-OPEN-GAPS-REGISTER.md') === read('docs/MASTER-OPEN-GAPS-REGISTER.md')],
];
let failed = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++; }
console.log(`${checks.length - failed}/${checks.length} checks passed`);
if (failed) process.exit(1);
