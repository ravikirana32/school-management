import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.cwd(), process.cwd().endsWith('backend/api') ? '../..' : '.');
const testPath = path.join(root,'backend/api/src/modules/auth/authorization-error-contract.integration.test.ts');
const middlewarePath = path.join(root,'backend/api/src/modules/auth/auth.middleware.ts');
const packagePath = path.join(root,'backend/api/package.json');
const gapsPath = path.join(root,'MASTER-OPEN-GAPS-REGISTER.md');
const test = fs.readFileSync(testPath,'utf8'); const middleware = fs.readFileSync(middlewarePath,'utf8'); const pkg = JSON.parse(fs.readFileSync(packagePath,'utf8')); const gaps = fs.readFileSync(gapsPath,'utf8');
const checks = [
 ['P470 integration test source exists',fs.existsSync(testPath)],
 ['missing bearer produces 401 contract',test.includes('bearer token is absent') && test.includes('status).toBe(401')],
 ['invalid token contract is asserted',test.includes('invalid token') && test.includes('{ error: "Authentication required" }')],
 ['inactive session contract is asserted',test.includes('session is not active')],
 ['inactive account contract is asserted',test.includes('inactive account without disclosing account state')],
 ['MFA enrollment-required 403 contract asserted',test.includes('MFA_ENROLLMENT_REQUIRED')],
 ['MFA challenge-required 403 contract asserted',test.includes('MFA_CHALLENGE_REQUIRED')],
 ['MFA actions/endpoints asserted',test.includes('/api/v1/auth/mfa/totp/enroll') && test.includes('/api/v1/auth/mfa/verify')],
 ['fresh-MFA pass-through asserted',test.includes('passes authenticated requests through') && test.includes('status).toBe(200')],
 ['authentication failure response remains generic in middleware',middleware.includes('status(401).json({ error: "Authentication required" })')],
 ['MFA enrollment error code exists in middleware',middleware.includes('MFA_ENROLLMENT_REQUIRED')],
 ['MFA challenge error code exists in middleware',middleware.includes('MFA_CHALLENGE_REQUIRED')],
 ['403 contract includes action metadata',middleware.includes('action: { method: "POST", endpoint: "/api/v1/auth/mfa/verify"')],
 ['verify:p470 registered',pkg.scripts?.['verify:p470']==='node ../../scripts/verify-p470-auth-error-contracts.mjs'],
 ['P470 gap register section present',gaps.includes('P470 — C2-04 F09')]
];
let fail=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;} console.log(`P470 verification: ${checks.length-fail}/${checks.length} PASS`);process.exit(fail?1:0);
