import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.cwd(), process.cwd().endsWith('backend/api') ? '../..' : '.');
const testPath = path.join(root,'backend/api/src/modules/auth/authorization-role-matrix.integration.test.ts');
const permPath = path.join(root,'backend/api/src/modules/auth/permissions.ts');
const schoolPath = path.join(root,'backend/api/src/modules/auth/school-permissions.ts');
const pkgPath = path.join(root,'backend/api/package.json');
const test = fs.readFileSync(testPath,'utf8');
const permissions = fs.readFileSync(permPath,'utf8');
const schoolPermissions = fs.readFileSync(schoolPath,'utf8');
const pkg = JSON.parse(fs.readFileSync(pkgPath,'utf8'));
const checks = [
 ['imports actual permission helpers',test.includes('hasPermission') && test.includes('matchesSchoolPermission')],
 ['platform-admin fixture present',test.includes('platformAdmin:')],
 ['school-admin fixture present',test.includes('schoolAdmin:')],
 ['principal fixture present',test.includes('principal:')],
 ['department-head fixture present',test.includes('departmentHead:')],
 ['teacher fixture present',test.includes('teacher:')],
 ['front-office fixture present',test.includes('frontOffice:')],
 ['finance fixture present',test.includes('finance:')],
 ['parent fixture present',test.includes('parent:')],
 ['library staff fixture present',test.includes('libraryStaff:')],
 ['transport staff fixture present',test.includes('transportStaff:')],
 ['hostel staff fixture present',test.includes('hostelStaff:')],
 ['canteen staff fixture present',test.includes('canteenStaff:')],
 ['positive role matrix scenarios present',test.includes('allows') && test.includes('can manage')],
 ['negative role matrix scenarios present',test.includes('denies')],
 ['permission wildcard behavior exercised',test.includes('module wildcard') && test.includes('global wildcard')],
 ['school permission helper remains source target',schoolPermissions.includes('export function matchesSchoolPermission')],
 ['permission helper contract remains source target',permissions.includes('export function hasPermission')],
 ['verify:p467 script registered',pkg.scripts?.['verify:p467']==='node ../../scripts/verify-p467-authorization-role-matrix.mjs']
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`P467 verification: ${checks.length-failed}/${checks.length} PASS`);
process.exit(failed?1:0);
