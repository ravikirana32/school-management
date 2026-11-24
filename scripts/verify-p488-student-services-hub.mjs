import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const app=fs.readFileSync(path.join(root,'apps/student-mobile/App.tsx'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'apps/student-mobile/package.json'),'utf8'));
const rootPkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const hub=fs.readFileSync(path.join(root,'apps/student-mobile/src/StudentServicesHub.tsx'),'utf8');
const checks=[
 ['Student services hub source exists',fs.existsSync(path.join(root,'apps/student-mobile/src/StudentServicesHub.tsx'))],
 ['Hub exported as StudentServicesHub',hub.includes('export function StudentServicesHub')],
 ['Library service section is rendered',hub.includes('>Library</Text>')&&hub.includes('library.loans')&&hub.includes('library.reservations')],
 ['Transport service section is rendered',hub.includes('>Transport</Text>')&&hub.includes('transport.allocations')],
 ['Canteen service section is rendered',hub.includes('>Canteen</Text>')&&hub.includes('StudentCanteenScreen')===false],
 ['Library student-scoped API is called',hub.includes("root+'/library'")],
 ['Transport student-scoped API is called',hub.includes("root+'/transport'")],
 ['API root is scoped to authenticated student route',hub.includes('/api/v1/students/me/')],
 ['Bearer token is sent to service APIs',hub.includes('authorization:`Bearer ${token}`')],
 ['Offline cache is scoped by organization, school and student',hub.includes("writeStudentCache(organizationId,schoolId,studentId,'library'")&&hub.includes("writeStudentCache(organizationId,schoolId,studentId,'transport'")],
 ['Cached data is used as a fallback',hub.includes('Showing saved offline data')],
 ['Hub includes service descriptions',hub.includes('Your issued books and reservation status')&&hub.includes('Your active route and pickup/drop details')],
 ['Hub includes service details',hub.includes('Academic year:')&&hub.includes('Recent trip events')],
 ['Canteen section navigation is disclosed',hub.includes('Open the Canteen section below')],
 ['Hub integrated in App.tsx',app.includes('<StudentServicesHub api={api}')],
 ['Canteen existing screen remains integrated',app.includes('<StudentCanteenScreen')],
 ['P488 mobile verifier registered',pkg.scripts?.['verify:p488']==='node ../../scripts/verify-p488-student-services-hub.mjs'],
 ['P488 root verifier registered',rootPkg.scripts?.['verify:p488']==='node scripts/verify-p488-student-services-hub.mjs'],
 ['Master gap register has P488 section',fs.readFileSync(path.join(root,'docs/MASTER-OPEN-GAPS-REGISTER.md'),'utf8').includes('## P488 — C2-06 Student Services Hub')]
]
let failed=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`P488 static verification: ${checks.length-failed}/${checks.length} passed`);
if(failed)process.exitCode=1;
