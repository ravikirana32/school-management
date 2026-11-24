import { readFileSync } from 'node:fs';
const routes = readFileSync('backend/api/src/modules/admissions/admission.routes.ts','utf8');
const register = readFileSync('MASTER-OPEN-GAPS-REGISTER.md','utf8');
const report = readFileSync('P211-DELIVERY-REPORT.md','utf8');
const checks = [
 ['Enquiry conversion accepts optional boardCode', /enquiries\/\:enquiryId\/convert/.test(routes) && /boardCode:z\.string\(\)\.trim\(\)\.max\(30\)\.optional\(\)/.test(routes)],
 ['Board code persisted during enquiry conversion', /boardCode:p\.data\.boardCode/.test(routes)],
 ['Transitions use compare-and-set status update', /admissionApplication\.updateMany\(\{where:\{id:a\.id,organizationId:s\.organizationId,schoolId:s\.schoolId,status:a\.status\}/.test(routes)],
 ['Concurrent transition conflict is explicit', routes.includes('ADMISSION_TRANSITION_CONFLICT') && routes.includes('Application status changed concurrently; refresh and retry')],
 ['Phase report and gaps updated', report.includes('P211 Delivery Report') && register.includes('## P211+ — Admissions dependency register')],
];
let failed=false;
for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'} ${name}`);failed ||= !pass;}
if(failed)process.exit(1);
console.log(`P211 source verification: ${checks.length}/${checks.length} checks passed`);
