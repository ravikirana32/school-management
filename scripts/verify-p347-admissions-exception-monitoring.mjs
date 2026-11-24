import fs from 'node:fs';
const route=fs.readFileSync('backend/api/src/modules/admissions/admission.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/AdmissionsWorkspace.tsx','utf8');
const checks=[
 ['Exceptions endpoint registered',route.includes('base+"/exceptions"')],
 ['School permission/tenant scope enforced',route.includes('scope(req,res,"admissions.read")')&&route.includes('organizationId:s.organizationId,schoolId:s.schoolId')],
 ['Unassigned reviewer signal emitted',route.includes('UNASSIGNED_REVIEWER')],
 ['SLA overdue signal emitted',route.includes('REVIEW_SLA_OVERDUE')],
 ['Expired offered admissions signal emitted',route.includes('OFFER_EXPIRED')],
 ['Expired active seat reservation signal emitted',route.includes('RESERVATION_EXPIRED')],
 ['Rejected/quarantined document signals included',route.includes('securityStatus:"QUARANTINED"')&&route.includes('status:"REJECTED"')],
 ['Admin workspace fetches exception feed',ui.includes('request("/exceptions")')],
 ['Exception monitor summary and table render',ui.includes('Admission exception monitor')&&ui.includes('exceptionFeed.exceptions.map')],
 ['Refresh action reloads admissions data',ui.includes('Refresh exceptions')&&ui.includes('onClick={()=>void load()}')]
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}
console.log(`P347 verifier: ${checks.length-fail}/${checks.length} PASS`);process.exit(fail?1:0);
