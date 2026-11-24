import fs from 'node:fs';
import assert from 'node:assert/strict';

const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });
const studentFile = 'apps/student-mobile/src/StudentAssessmentResults.tsx';
const backendFile = 'backend/api/src/modules/schools/school-config.authorization.integration.test.ts';
const student = fs.readFileSync(studentFile, 'utf8');
const backend = fs.readFileSync(backendFile, 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const register = fs.readFileSync('MASTER-OPEN-GAPS-REGISTER.md', 'utf8');
const mirrors = ['docs/MASTER-OPEN-GAPS-REGISTER.md', 'docs/phases/MASTER-OPEN-GAPS-REGISTER.md', 'docs/phases/P501/MASTER-OPEN-GAPS-REGISTER.md', 'docs/phases/P500/MASTER-OPEN-GAPS-REGISTER.md', 'docs/phases/P502/MASTER-OPEN-GAPS-REGISTER.md'];

check('Student assessment screen has exam and report tabs', student.includes("useState<'exams' | 'reports'>('exams')"));
check('Student assessment API URL trims trailing slashes with valid regex', student.includes("api.replace(/\\/+$/, '')"));
check('Student assessment exam conditional has grouped ternary', student.includes("tab === 'exams' ? (\n        exams.length ?"));
check('Student assessment report conditional has grouped ternary', student.includes("tab === 'reports' ? (\n        reports.length ?"));
check('Exam empty state retained', student.includes('No published exam results available.'));
check('Report-card empty state retained', student.includes('No published report cards available.'));
check('Refresh action retained', student.includes('Refresh {tab}'));
check('Assessment errors expose retry action', student.includes('Retry') && student.includes('void load()'));
check('School config authorization test mock callback closes correctly', backend.includes('auditLog: { create: mocks.auditCreate } }));'));
check('Authorization test verifies membership denied', backend.includes('Active school membership required'));
check('Authorization test verifies permission denied', backend.includes('school.settings.manage'));
check('Authorization test verifies tenant context scope', backend.includes('organizationId: "org-alpha", schoolId: "school-alpha", userId: "user-alpha"'));
check('P502 verifier is registered', pkg.scripts?.['verify:p502'] === 'node scripts/verify-p502-compilation-remediation.mjs');
check('P502 phase is recorded in master gap register', register.includes('## P502 — Compilation & Build Remediation'));
check('P502 open gaps recorded', register.includes('P502-G001 OPEN') && register.includes('P502-G004 OPEN'));
check('P502 register mirrors exist and match', mirrors.every((file) => fs.existsSync(file) && fs.readFileSync(file, 'utf8') === register));
check('P502 deliverables directory exists', fs.existsSync('docs/phases/P502/P502-DELIVERABLES-CHECKLIST.md'));

for (const item of checks) {
  console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
  assert.ok(item.pass, item.name);
}
console.log(`P502 focused assertions: ${checks.length}/${checks.length} PASS`);
