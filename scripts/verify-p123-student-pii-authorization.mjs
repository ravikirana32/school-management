import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const student = read('backend/api/src/modules/students/student.routes.ts');
const helper = read('backend/api/src/modules/students/teacher-student-access.ts');
const documents = read('backend/api/src/modules/documents/document.routes.ts');
const seed = read('backend/api/prisma/seed.ts');
const register = read('MASTER-OPEN-GAPS-REGISTER.md');
const checks = [
  ['student detail uses explicit select rather than scalar include', /student\.findFirst\(\{[\s\S]*?select:\{ id:true, admissionNumber:true/.test(student)],
  ['student PII fields are conditional on students.pii.read', /dateOfBirth:canReadPii[\s\S]*?notes:canReadPii/.test(student)],
  ['student enrollment fields are explicitly selected', /enrollments:\{ select:\{ id:true, academicYearId:true/.test(student)],
  ['guardian relation is only selected with PII permission', /guardians: canReadPii \? \{ select:/.test(student)],
  ['teacher role is explicitly detected', helper.includes('role: { key: "SCHOOL_TEACHER" }')],
  ['teacher must have active staff identity', helper.includes('status: "ACTIVE"')],
  ['teacher enrollment must be active', helper.includes('status: "ENROLLED"')],
  ['teacher assignment effective dates are enforced', helper.includes('startsOn: { lte: today }') && helper.includes('endsOn: { gte: today }')],
  ['teacher assignment matches academic year, grade and section', helper.includes('assignment.academicYearId === enrollment.academicYearId') && helper.includes('assignment.sectionName === (enrollment.sectionName || "")')],
  ['student detail invokes teacher ownership guard', student.includes('canTeacherAccessStudent(tx, s.userId, s.organizationId, s.schoolId, student.id)')],
  ['guardian details invoke teacher ownership guard', student.includes('!await canTeacherAccessStudent(tx, s.userId, s.organizationId, s.schoolId, student.id)')],
  ['student document upload invokes teacher ownership guard', documents.includes('canTeacherAccessStudent(tx,s.userId,s.organizationId,s.schoolId,student.id)')],
  ['student document completion invokes teacher ownership guard', documents.includes('canTeacherAccessStudent(tx,s.userId,s.organizationId,s.schoolId,(doc as any).studentId)')],
  ['student document download invokes teacher ownership guard', documents.includes('canTeacherAccessStudent(tx,s.userId,s.organizationId,s.schoolId,document.studentId)')],
  ['fee list requires explicit fees.read', /scope\(req,res,"fees\.read"\)/.test(read('backend/api/src/modules/parents/parent.routes.ts'))],
  ['built-in teacher role does not receive fees.read', /key:"SCHOOL_TEACHER",name:"Teacher",permissions:\[[^\]]*"fees\.read"/.test(seed) === false],
  ['P123 gaps recorded', ['P123-G001','P123-G002','P123-G003'].every(id => register.includes(id))],
  ['root/docs gap registers identical', register === read('docs/MASTER-OPEN-GAPS-REGISTER.md')],
  ['root/docs resolved histories identical', read('MASTER-RESOLVED-GAPS-HISTORY.md') === read('docs/MASTER-RESOLVED-GAPS-HISTORY.md')],
];
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); assert.ok(ok, name); }
console.log(`P123 verifier: ${checks.length}/${checks.length} checks passed`);
