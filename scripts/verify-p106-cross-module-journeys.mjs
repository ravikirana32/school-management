import fs from "node:fs";
import assert from "node:assert/strict";
const read = p => fs.readFileSync(p,"utf8");
const api = read("backend/api/src/modules/journeys/journey.routes.ts");
const app = read("backend/api/src/app.ts");
const ui = read("apps/school-admin/src/JourneyReadinessWorkspace.tsx");
const main = read("apps/school-admin/src/main.tsx");
const gaps = read("MASTER-OPEN-GAPS-REGISTER.md");
for (const model of ["admissionApplication","studentEnrollment","attendanceSession","studentAttendance","studentReportCard","studentFeeCharge","studentFeePayment","staffMember","staffEmploymentHistory","teacherAssignment","guardian","parentInvitation","parentNotification"]) {
  assert.ok(api.includes(`tx.${model}.`), `Missing cross-module source ${model}`);
}
assert.ok(api.includes("hasActiveSchoolMembership"),"Membership check missing");
assert.ok(api.includes('hasSchoolPermission(userId, organizationId, schoolId, "reports.read")'),"Permission check missing");
assert.ok(api.includes("withTenantContext"),"Tenant context missing");
for (const key of ["admissionToEnrollment","attendanceToReportCard","feeToLedger","staffToPayroll","parentToMobile"]) assert.ok(api.includes(key),`${key} journey missing`);
assert.ok(api.includes("BLOCKED_MISSING_LEDGER_MODULE"),"Missing accounting blocker disclosure");
assert.ok(api.includes("BLOCKED_MISSING_PAYROLL_MODULE"),"Missing payroll blocker disclosure");
assert.ok(app.includes("journeyRouter"),"Journey router not mounted");
assert.ok(ui.includes("journeys/overview"),"UI does not call journey API");
assert.ok(main.includes("JourneyReadinessWorkspace"),"Journey workspace not mounted");
for (const id of ["P106-G001","P106-G002","P106-G003","P106-G004"]) assert.ok(gaps.includes(id),`${id} absent from gap register`);
assert.equal(read("MASTER-OPEN-GAPS-REGISTER.md"),read("docs/MASTER-OPEN-GAPS-REGISTER.md"),"Root and docs gap registers differ");
console.log("P106 source verifier: PASS (tenant API, 5 journeys, blockers, School Admin UI, gap register)");
