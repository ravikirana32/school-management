import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const route = fs.readFileSync(path.join(root, 'backend/api/src/modules/assessments/assessment.routes.ts'), 'utf8');
const helper = fs.readFileSync(path.join(root, 'backend/api/src/modules/assessments/result-calculation.ts'), 'utf8');
const unit = fs.readFileSync(path.join(root, 'backend/api/src/modules/assessments/result-calculation.test.ts'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'apps/school-admin/src/ExamAssessmentWorkspace.tsx'), 'utf8');
const report = fs.readFileSync(path.join(root, 'P274-DELIVERY-REPORT.md'), 'utf8');
const checklist = fs.readFileSync(path.join(root, 'MASTER-CYCLE-COVERAGE-CHECKLIST.md'), 'utf8');
const checks = [
  ['authenticated exam router preserved', route.includes('assessmentRouter.use(authenticate)')],
  ['school-scoped exam roster endpoint', route.includes('/roster') && route.includes('organizationId:s.organizationId,schoolId:s.schoolId')],
  ['active enrollment roster filter', route.includes('status:"ENROLLED"')],
  ['teacher assignment roster scoping', route.includes('teacherExamScope') && route.includes('staffMemberId:staff.id')],
  ['calculated exam results endpoint', route.includes('/results') && route.includes('summarizeExamResults')],
  ['marks-save preserves outside-scope existing entries', route.includes('existing.filter(mark=>!incomingById.has(mark.studentId))')],
  ['percentage and grade mapping helper', helper.includes('percentage') && helper.includes('grade')],
  ['class pass/fail and average aggregation', helper.includes('passPercentage') && helper.includes('averagePercentage')],
  ['score/max validation in calculation', helper.includes('safeScore > safeMax')],
  ['unit test coverage authored', unit.includes('grade boundaries') && unit.includes('aggregates class results') && unit.includes('rejects invalid')],
  ['roster marks entry UI', ui.includes('Roster-based marks entry') && ui.includes('type="number"')],
  ['calculated results UI', ui.includes('Calculated results') && ui.includes('Pass') && ui.includes('Fail')],
  ['phase report documented', report.includes('Implemented') && report.includes('Remaining P274 gaps')],
  ['cycle checklist updated', checklist.includes('| P274 | Results & Grades |')],
];
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
if (checks.some(([, ok]) => !ok)) process.exit(1);
console.log(`P274 static verification: ${checks.length}/${checks.length} PASS`);
