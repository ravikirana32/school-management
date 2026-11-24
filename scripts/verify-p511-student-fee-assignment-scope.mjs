import fs from 'node:fs';
import assert from 'node:assert/strict';
const api=fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/FeeStructuresWorkspace.tsx','utf8');
const checks=[
 ['Preview validates year and grade scope',/!academicYearId\|\|!gradeLevelId/.test(api)],
 ['Structure scope conflicts rejected in preview',/structure\.academicYearId&&structure\.academicYearId!==academicYearId/.test(api)&&/structure\.gradeLevelId&&structure\.gradeLevelId!==gradeLevelId/.test(api)],
 ['Catalog entities tenant scoped',/academicYear\.findFirst\(\{where:\{id:academicYearId,organizationId:s\.organizationId,schoolId:s\.schoolId/.test(api)&&/gradeLevel\.findFirst\(\{where:\{id:gradeLevelId,organizationId:s\.organizationId,schoolId:s\.schoolId/.test(api)],
 ['Enrollment query restricted to school/year/grade/enrolled status',/organizationId:s\.organizationId,schoolId:s\.schoolId,academicYearId,gradeLevelId,status:'ENROLLED'/.test(api)],
 ['Optional section scope applied consistently',/\.\.\.\(sectionName\?\{sectionName\}:\{\}\)/.test(api)&&/\.\.\.\(p\.data\.sectionName\?\{sectionName:p\.data\.sectionName\}:\{\}\)/.test(api)],
 ['Preview duplicate counts component-specific',/chargeCode:code/.test(api)&&/existingCharges/.test(api)&&/estimatedNewCharges/.test(api)],
 ['Preview mandatory and optional charge separation',/mandatoryTotal:components\.reduce/.test(api)&&/optionalTotal:optionalComponents\.reduce/.test(api)&&/estimatedCharges:charges/.test(api)],
 ['Preview safety limit surfaced',/take:5001/.test(api)&&/tooManyStudents/.test(api)&&/5,000 enrollment safety limit/.test(api)],
 ['Assignment has advisory lock for idempotent retry protection',/fee-assign:\$\{req\.params\.structureId\}:\$\{p\.data\.academicYearId\}:\$\{p\.data\.gradeLevelId\}/.test(api)&&/pg_advisory_xact_lock/.test(api)],
 ['Assignment duplicate-charge checks and skip reporting',/duplicateChargesSkipped/.test(api)&&/duplicates\+\+/.test(api)],
 ['Assignment creates draft charges and preserves category/currency',/status:'DRAFT',approvalStatus:'DRAFT'/.test(api)&&/category:String\(c\.categoryCode\|\|'OTHER'\)/.test(api)&&/currency:structure\.currency/.test(api)],
 ['Audit metadata records scope and assignment results',/action:'fee\.structure\.assigned'/.test(api)&&/createdCharges:created,duplicateChargesSkipped:duplicates/.test(api)],
 ['UI uses catalog-backed year and grade selectors',/session\.years\.map/.test(ui)&&/grades\.map/.test(ui)],
 ['UI section selector and scope preview',/sectionOptions\.map/.test(ui)&&/Preview scope:/.test(ui)],
 ['UI shows expected, existing and new charge breakdown',/<th>Expected<\/th><th>Existing<\/th><th>New<\/th>/.test(ui)&&/estimatedNewCharges/.test(ui)],
 ['Confirm assignment disabled when no new charges',/!assignmentPreview\.estimatedNewCharges/.test(ui)],
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`P511 focused verification: ${checks.length-failed}/${checks.length} PASS`);
if(failed)process.exit(1);
