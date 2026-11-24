import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const routes = fs.readFileSync(path.join(root,'backend/api/src/modules/admissions/admission.routes.ts'),'utf8');
const helper = fs.readFileSync(path.join(root,'backend/api/src/modules/admissions/admission-staff-notifications.ts'),'utf8');
const checks = [
 ['helper imported into admissions routes', routes.includes('notifyAdmissionStaffEvent')],
 ['reviewer assignment emits staff notification', routes.includes('reviewer-assigned:')],
 ['application status transitions emit staff notification', routes.includes('eventKey:`status:')],
 ['notification batch idempotency uses event key', helper.includes('const batchId = `admission-event:${input.eventKey}`')],
 ['recipients require admissions.manage role permission', helper.includes('permission: { key: "admissions.manage" }')],
 ['recipients filtered to active school membership', helper.includes('status: "ACTIVE"')],
 ['inactive users excluded', helper.includes('isActive: true')],
 ['tenant/school IDs carried to outbox records', helper.includes('organizationId: input.organizationId, schoolId: input.schoolId')],
 ['in-app channel delivery records', helper.includes('channel: "IN_APP", status: "DELIVERED"')],
 ['duplicate delivery suppressed', helper.includes('skipDuplicates: true')],
 ['payload carries application ID', helper.includes('applicationId: input.applicationId')],
 ['batch title/category and creator are explicit', helper.includes('category: "ADMISSION_APPLICATION"') && helper.includes('createdBy: "ADMISSIONS_SYSTEM"')],
];
let failures=0;
for (const [label,pass] of checks) { console.log(`${pass?'PASS':'FAIL'} ${label}`); if(!pass) failures++; }
console.log(`P345 static checks: ${checks.length-failures}/${checks.length} PASS`);
process.exit(failures?1:0);
