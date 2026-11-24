import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const app=fs.readFileSync(path.join(root,'apps/student-mobile/App.tsx'),'utf8');
const helper=fs.readFileSync(path.join(root,'apps/student-mobile/src/networkResilience.ts'),'utf8');
const session=fs.readFileSync(path.join(root,'apps/student-mobile/src/auth/session.ts'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'apps/student-mobile/package.json'),'utf8'));
const rootPkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const checks=[
 ['Retry helper source exists',fs.existsSync(path.join(root,'apps/student-mobile/src/networkResilience.ts'))],
 ['GET retry helper exported',helper.includes('export async function fetchWithReadRetry')],
 ['Retries bounded to two by default',helper.includes('MAX_GET_RETRIES = 2')],
 ['Retry status list includes rate limit',helper.includes('429')],
 ['Retry status list includes gateway/server transients',helper.includes('502, 503, 504')],
 ['Retry delay is bounded',helper.includes('Math.min(250 * (2 ** attempt), 1000)')],
 ['Network TypeError retry guarded',helper.includes('error instanceof TypeError')],
 ['Retry helper returns final response',helper.includes('return response')],
 ['Offline marker helper exported',helper.includes('export function isOfflineSession')],
 ['Offline marker checks missing access token',helper.includes('!pair.accessToken')],
 ['App imports resilience helper',app.includes('fetchWithReadRetry, isOfflineSession')],
 ['Read methods use retry helper',app.includes('fetchWithReadRetry(run)')],
 ['Non-read methods are not retried',app.includes(':run(0)')],
 ['Transient restore avoids immediate discover',app.includes('if(isOfflineSession(pair)){setNotice')],
 ['Offline banner is visible',app.includes('Offline mode')],
 ['Offline banner warns data may be stale',app.includes('Previously loaded data may be stale')],
 ['Offline notice does not claim durable cache',app.includes('Sign-in state is retained, but live school data is unavailable until reconnect')],
 ['Offline banner has manual retry',app.includes('Retry connection')],
 ['Reconnect restores session and refreshes data with the newly restored token',app.includes('async function reconnect')&&app.includes('restoredRequest(\"/students/me/schools\")')&&app.includes('setSchools(rows)')&&app.includes('normalizeStudentSchoolList(await restoredRequest')],
 ['Reconnect busy state resets in finally',app.includes('finally{setBusy(false);}}')],
 ['P489 mobile verifier registered',pkg.scripts?.['verify:p489']==='node ../../scripts/verify-p489-student-mobile-resilience.mjs'],
 ['P489 root verifier registered',rootPkg.scripts?.['verify:p489']==='node scripts/verify-p489-student-mobile-resilience.mjs'],
 ['Session retains refresh token for transient outage',session.includes('Preserve the refresh token and return an offline-only marker')],
 ['Refresh token preserved on transient restore',session.includes('latestRefreshToken')&&session.includes('temporary')],
 ['Master gap register has P489 section',fs.readFileSync(path.join(root,'docs/MASTER-OPEN-GAPS-REGISTER.md'),'utf8').includes('## P489 — C2-06 Student Mobile Resilience')]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`P489 static verification: ${checks.length-failed}/${checks.length} passed`);if(failed)process.exitCode=1;
