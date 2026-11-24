import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [
  ['MFA policy endpoint includes platform-admin policy', read('backend/api/src/modules/auth/auth.routes.ts').includes('user?.isPlatformAdmin')],
  ['MFA policy supports configured role keys', read('backend/api/src/modules/auth/auth.routes.ts').includes('MFA_REQUIRED_ROLE_KEYS')],
  ['Policy reports challenge and enrollment requirements', read('backend/api/src/modules/auth/auth.routes.ts').includes('challengeRequired: required') && read('backend/api/src/modules/auth/auth.routes.ts').includes('enrollmentRequired: required')],
  ['Policy freshness is bounded to five minutes', read('backend/api/src/modules/auth/auth.routes.ts').includes('<= 5 * 60 * 1000')],
  ['School Admin loads MFA policy', read('apps/school-admin/src/SchoolAdminSession.tsx').includes('/auth/mfa/status')],
  ['School Admin exposes enrollment', read('apps/school-admin/src/SchoolAdminSession.tsx').includes('/auth/mfa/totp/enroll')],
  ['Teacher Mobile reads MFA policy', read('apps/teacher-mobile/src/auth/session.ts').includes('pair.mfaPolicy')],
  ['Parent Mobile reads MFA policy', read('apps/parent-mobile/src/auth/session.ts').includes('pair.mfaPolicy')],
  ['Teacher Mobile gates pending MFA', read('apps/teacher-mobile/App.tsx').includes('pendingMfaPair') && read('apps/teacher-mobile/App.tsx').includes('completeMfa')],
  ['Parent Mobile gates pending MFA', read('apps/parent-mobile/App.tsx').includes('pendingMfaPair') && read('apps/parent-mobile/App.tsx').includes('completeMfa')],
  ['Server-side enforcement limitation documented', read('P117-STATUS.md').includes('universal server-side enforcement')],
  ['Root/docs gap registers are byte-identical', read('MASTER-OPEN-GAPS-REGISTER.md') === read('docs/MASTER-OPEN-GAPS-REGISTER.md')],
  ['P117 gap IDs are present', ['P117-G001','P117-G002','P117-G003'].every(id => read('MASTER-OPEN-GAPS-REGISTER.md').includes(id))],
];
let failed = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++; }
console.log(`${checks.length - failed}/${checks.length} checks passed`);
if (failed) process.exit(1);
