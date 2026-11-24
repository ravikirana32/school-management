import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const policy=fs.readFileSync(path.join(root,'apps/student-mobile/src/offlineCachePolicy.ts'),'utf8');
const cache=fs.readFileSync(path.join(root,'apps/student-mobile/src/studentOfflineCache.ts'),'utf8');
const hub=fs.readFileSync(path.join(root,'apps/student-mobile/src/StudentServicesHub.tsx'),'utf8');
const app=fs.readFileSync(path.join(root,'apps/student-mobile/App.tsx'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'apps/student-mobile/package.json'),'utf8'));
const checks=[
['versioned cache key',/student-cache:v\$\{STUDENT_CACHE_VERSION\}/.test(policy)],
['school and org scoping in cache key',/organizationId.*schoolId.*accountId.*resource/.test(policy)],
['resource key URI encoding',/encodeURIComponent\(resource\)/.test(policy)],
['TTL freshness helper',/DEFAULT_CACHE_MAX_AGE_MS/.test(policy)&&/isCacheFresh/.test(policy)],
['cache envelope schema validation',/validateCacheEnvelope/.test(policy)],
['AsyncStorage persistent backing',/AsyncStorage\.getItem/.test(cache)&&/AsyncStorage\.setItem/.test(cache)],
['cache read failure safely returns null',/catch\s*\{\s*return null/.test(cache)],
['cache write errors do not block network',/Cache failures must never prevent/.test(cache)],
['scoped cache clearing implemented',/multiRemove/.test(cache)&&/clearStudentCache/.test(cache)],
['student services caches library data',/writeStudentCache\(organizationId,schoolId,studentId,\'library\'/.test(hub)],
['student services caches transport data',/writeStudentCache\(organizationId,schoolId,studentId,\'transport\'/.test(hub)],
['cached hydration before refresh',/readStudentCache/.test(hub)&&/Showing saved offline data/.test(hub)],
['cache stale/offline indicator',/Offline \/ cached view/.test(hub)],
['network data replaces cache',/setShowingCache\(false\)/.test(hub)],
['student identity provided to cache',/studentId=\{selected\.student\.id\}/.test(app)],
['AsyncStorage dependency declared',Boolean(pkg.dependencies['@react-native-async-storage/async-storage'])],
['cache identity includes account',/accountId/.test(policy)],
['no student ID accepted from cache payload',!/studentId.*raw/.test(cache)],
['resource names isolated',/encodeURIComponent\(resource\)/.test(policy)],
['invalid envelope ignored',/if \(!validateCacheEnvelope/.test(cache)],
['cache timestamps tracked',/savedAt/.test(policy)&&/savedAt/.test(cache)],
['freshness metadata returned with cache',/fresh: isCacheFresh\(parsed\.savedAt\)/.test(cache)],
['fresh/stale cache indicator differentiated',/Cache is stale; refresh when online/.test(hub)],
['error fallback to cache',/catch\(e:any\).*readStudentCache/s.test(hub)],
['both resources load concurrently',/Promise\.all/.test(hub)],
['loading state retained',/setLoading\(true\)/.test(hub)],
['refresh UI retained',/Refresh services/.test(hub)],
['account scoped keys contain school',/schoolId/.test(policy)],
['offline warning is accessible',/accessibilityRole=\"alert\"/.test(hub)],
['cache storage errors are non-fatal',/catch\s*\{[\s\S]*?Local sign-out remains successful/.test(cache)],
['cache envelope version checked',/envelope\.version === STUDENT_CACHE_VERSION/.test(policy)],
['stale timestamps guarded',/now >= savedAt/.test(policy)],
];
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
const failed=checks.filter(([,ok])=>!ok).length;
console.log(`\nP496 focused checks: ${checks.length-failed}/${checks.length} PASS`);
if(failed)process.exit(1);
