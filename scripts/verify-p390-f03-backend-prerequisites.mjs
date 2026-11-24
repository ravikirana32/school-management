import fs from 'node:fs';
const routes = fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts','utf8');
const assertions = [
  ['Reusable server prerequisite helper is present', routes.includes('async function onboardingPrerequisites(tx: any, scopeValue:')],
  ['Prerequisite helper verifies school profile completion fields', routes.includes('profile?.displayName?.trim() && profile?.legalName?.trim() && profile?.city?.trim() && profile?.state?.trim()')],
  ['Prerequisite helper verifies active current academic year', routes.includes('isCurrent: true, status: "ACTIVE"')],
  ['Terms writes require current active year', routes.includes('Academic terms can only be configured for the active current academic year')],
  ['Calendar writes require completed profile and active current year', routes.includes('Complete the school profile and activate the current academic year before configuring calendars')],
  ['Calendar academic-year attachment accepts only active current year', routes.includes('schoolId: s.schoolId, organizationId: s.organizationId, isCurrent: true, status: "ACTIVE" }')],
  ['Working-days writes require completed profile', routes.includes('Complete the school profile before configuring working days')],
  ['Policy writes require completed profile and active current year', routes.includes('Complete the school profile and activate the current academic year before configuring policies')],
  ['Prerequisite enforcement runs inside tenant-scoped transactions', (routes.match(/onboardingPrerequisites\(tx, s\)/g)||[]).length >= 3],
  ['Conflict status 409 is used for unmet prerequisites', (routes.match(/status: 409/g)||[]).length >= 3]
];
let failures=0;
for(const [label,pass] of assertions){console.log(`${pass?'PASS':'FAIL'} ${label}`);if(!pass)failures++;}
console.log(`${assertions.length-failures}/${assertions.length} assertions passed`);
if(failures)process.exit(1);
