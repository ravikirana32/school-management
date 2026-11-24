import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const sessionPath = path.join(root, 'apps/school-admin/src/SchoolAdminSession.tsx');
const source = fs.readFileSync(sessionPath, 'utf8');
const register = fs.readFileSync(path.join(root, 'MASTER-OPEN-GAPS-REGISTER.md'), 'utf8');
const mirror = fs.readFileSync(path.join(root, 'docs/MASTER-OPEN-GAPS-REGISTER.md'), 'utf8');
const checks = [
  ['auth/me endpoint used', source.includes('/api/v1/auth/me')],
  ['identity checked before memberships', source.indexOf('identityResponse') < source.indexOf('const membershipUrl')],
  ['identity failure blocks membership load', source.includes('!identityResponse.ok || !identityPayload.user?.id')],
  ['email comes from API identity', source.includes('setUserEmail(identityPayload.user.email || "")')],
  ['P109 gap entries present', register.includes('P109-G001') && register.includes('P109-G002')],
  ['root/docs gap registers identical', register === mirror],
];
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (checks.some(([, ok]) => !ok)) process.exitCode = 1;
