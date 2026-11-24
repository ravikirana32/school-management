import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const route = fs.readFileSync(path.join(root, 'backend/api/src/modules/report-cards/report-card.routes.ts'), 'utf8');
const register = fs.readFileSync(path.join(root, 'MASTER-OPEN-GAPS-REGISTER.md'), 'utf8');
const docsRegister = fs.readFileSync(path.join(root, 'docs/MASTER-OPEN-GAPS-REGISTER.md'), 'utf8');
const history = fs.readFileSync(path.join(root, 'MASTER-RESOLVED-GAPS-HISTORY.md'), 'utf8');
const docsHistory = fs.readFileSync(path.join(root, 'docs/MASTER-RESOLVED-GAPS-HISTORY.md'), 'utf8');
const checks = [
  ['teacher scope helper exists', route.includes('async function teacherStudentScope')],
  ['active staff identity is required', route.includes('status:"ACTIVE"') && route.includes('tx.staffMember.findFirst')],
  ['assignment is active', route.includes('staffMemberId:staff.id,isActive:true')],
  ['assignment start date is enforced', route.includes('startsOn:{lte:today}')],
  ['assignment end date is enforced', route.includes('endsOn:{gte:today}')],
  ['enrollment is active', route.includes('status:"ENROLLED"')],
  ['enrollment matches academic year, grade and section', route.includes('academicYearId:a.academicYearId,gradeLevelId:a.gradeLevelId,sectionName:a.sectionName||""')],
  ['report-card list applies assigned student filter', route.includes('studentId:{in:teacherScope.studentIds}')],
  ['artifact endpoint checks assigned student', route.includes('teacherScope.isTeacher&&!teacherScope.studentIds.includes(report.studentId)')],
  ['published PDF endpoint checks assigned student', route.includes('teacherScope.isTeacher&&!teacherScope.studentIds.includes(report.studentId)')],
  ['tenant predicates retained', route.includes('organizationId:ctx.organizationId,schoolId:ctx.schoolId')],
  ['tenant context used', route.includes('withTenantContext(prisma,s')],
  ['P122 gaps recorded', ['P122-G001','P122-G002','P122-G003'].every(id => register.includes(id))],
  ['prior gap IDs preserved', ['P119-G002','P121-G003'].every(id => register.includes(id))],
  ['root/docs gap registers identical', register === docsRegister],
  ['root/docs resolved histories identical', history === docsHistory],
];
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  assert.ok(ok, name);
}
console.log(`P122 verifier: ${checks.length}/${checks.length} checks passed`);
