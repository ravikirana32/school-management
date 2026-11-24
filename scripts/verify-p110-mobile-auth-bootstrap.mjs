import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
function check(name, condition) { checks.push({ name, pass: Boolean(condition) }); }
for (const app of ['teacher', 'parent']) {
  const auth = read(`apps/${app}-mobile/src/auth/session.ts`);
  const ui = read(`apps/${app}-mobile/App.tsx`);
  check(`${app}: calls authenticated identity endpoint`, auth.includes('/auth/me'));
  check(`${app}: validates server-owned identity`, auth.includes('fetchAuthenticatedIdentity') && auth.includes('identity.email'));
  check(`${app}: validates after login and refresh`, (auth.match(/fetchAuthenticatedIdentity\(apiBaseUrl, pair.accessToken, pair.refreshToken\)/g) || []).length >= 2);
  check(`${app}: restore uses refresh validation`, auth.includes('return await refreshSession(apiBaseUrl, refreshToken)'));
  check(`${app}: app reads verified account email`, ui.includes('getStoredAccountEmail()'));
  check(`${app}: reconnect handles definitive auth failure`, ui.includes('status===401||status===403'));
}
const api = read('backend/api/src/modules/auth/auth.routes.ts');
check('API exposes authenticated /me identity contract', api.includes('authRouter.get("/me", authenticate') && api.includes('return res.json({\n    user,'));
const rootGaps = read('MASTER-OPEN-GAPS-REGISTER.md');
const docsGaps = read('docs/MASTER-OPEN-GAPS-REGISTER.md');
check('root and docs gap registers are identical', rootGaps === docsGaps);
check('P110 gaps are carried forward', ['P110-G001','P110-G002','P110-G003'].every(id => rootGaps.includes(id)));
check('phase documentation exists', ['P110-STATUS.md','P110-DELIVERY-REPORT.md','P110-TEST-REPORT.md','docs/api/P110-MOBILE-AUTHENTICATED-IDENTITY.md'].every(file => fs.existsSync(path.join(root,file))));
for (const item of checks) console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.name}`);
console.log(`\n${checks.filter(x=>x.pass).length}/${checks.length} checks passed`);
if (checks.some(x=>!x.pass)) process.exit(1);
