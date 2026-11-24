import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
const check = (name, ok) => checks.push({ name, pass: Boolean(ok) });
for (const app of ['teacher', 'parent']) {
  const auth = read(`apps/${app}-mobile/src/auth/session.ts`);
  check(`${app}: refresh locks are scoped by API and token`, auth.includes('new Map<string, Promise<TokenPair>>()') && auth.includes('refreshLockKey(apiBaseUrl, tokenForLock)'));
  check(`${app}: stale account refresh cannot overwrite active token`, auth.includes('stillCurrent !== latestRefreshToken'));
  check(`${app}: identity write is guarded by expected refresh token`, auth.includes('expectedRefreshToken') && auth.includes('active account changed during identity validation'));
  check(`${app}: server account ID is persisted and cleared`, auth.includes('ACCOUNT_ID_KEY') && auth.includes('getStoredAccountId'));
}
const queue = read('apps/teacher-mobile/src/offline/mutation-queue.ts');
check('teacher offline mutations remain scoped to account and school', queue.includes('accountScope(email)') && queue.includes('record.organizationId !== organizationId || record.schoolId !== schoolId'));
const cache = read('apps/parent-mobile/src/offline/parent-cache.ts');
check('parent cache remains account-scoped and supports account purge', cache.includes('userScope(email)') && cache.includes('clearParentCache(email'));
const rootGaps = read('MASTER-OPEN-GAPS-REGISTER.md');
const docsGaps = read('docs/MASTER-OPEN-GAPS-REGISTER.md');
check('root and docs gap registers are identical', rootGaps === docsGaps);
check('P111 gaps carried forward', ['P111-G001','P111-G002','P111-G003'].every(id => rootGaps.includes(id)));
check('P111 docs present', ['P111-STATUS.md','P111-DELIVERY-REPORT.md','P111-TEST-REPORT.md','docs/api/P111-SESSION-ISOLATION.md'].every(file => fs.existsSync(path.join(root,file))));
for (const item of checks) console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.name}`);
console.log(`\n${checks.filter(x=>x.pass).length}/${checks.length} checks passed`);
if (checks.some(x=>!x.pass)) process.exit(1);
