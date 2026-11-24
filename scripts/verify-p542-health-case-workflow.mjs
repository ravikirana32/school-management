import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const schema=fs.readFileSync(path.join(root,'backend/api/prisma/schema.prisma'),'utf8');
const routes=fs.readFileSync(path.join(root,'backend/api/src/modules/health/health.routes.ts'),'utf8');
const migration=fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261123172000_p542_health_case_workflow/migration.sql'),'utf8');
const checks=[
 ['Health case model and follow-up model',/model StudentHealthCase\s*\{/.test(schema)&&/model StudentHealthCaseFollowUp\s*\{/.test(schema)],
 ['Student relation for cases',/healthCases StudentHealthCase\[\]/.test(schema)],
 ['Case tenant/school/student scope columns',/organizationId String\s+schoolId String\s+studentId String/.test(schema)],
 ['Case priority/status fields',/priority String @default\("NORMAL"\)/.test(schema)&&/status String @default\("OPEN"\)/.test(schema)],
 ['Create case API',routes.includes('/health/students/:studentId/cases')&&routes.includes('healthCaseCreateSchema')],
 ['Case list API with query filters',routes.includes('/health/cases')&&routes.includes('studentId ? { studentId }')&&routes.includes('status ? { status }')],
 ['Update API and guarded transitions',routes.includes('/health/cases/:caseId')&&routes.includes('Invalid health case status transition')],
 ['Assignee school membership validation',routes.includes('Assignee must be an active health-authorized staff member in this school')&&routes.includes('permitted(p.data.assignedToUserId, s.organizationId, s.schoolId, \"health.manage\")')],
 ['Follow-up history persistence',routes.includes('/health/cases/:caseId/follow-ups')&&routes.includes('studentHealthCaseFollowUp.create')],
 ['Health manage authorization and audit',routes.includes('health.case.create')&&routes.includes('health.case.update')&&routes.includes('health.case.followup')],
 ['Sensitive fields masked for limited readers',routes.includes('restricted: true')&&routes.includes('sensitiveRead(s.userId, s.organizationId, s.schoolId)')],
 ['Migration contains both tables',migration.includes('CREATE TABLE `StudentHealthCase`')&&migration.includes('CREATE TABLE `StudentHealthCaseFollowUp`')],
 ['Composite student and case scope foreign keys',migration.includes('StudentHealthCase_student_scope_fk')&&migration.includes('StudentHealthCaseFollowUp_case_scope_fk')],
 ['Indexes for triage/assignment/follow-up',migration.includes('StudentHealthCase_org_school_student_status_priority_idx')&&migration.includes('StudentHealthCase_org_school_assignee_status_idx')&&migration.includes('StudentHealthCase_org_school_followup_status_idx')]
];
let failed=0; for(const [n,p] of checks){console.log(`${p?'PASS':'FAIL'} ${n}`);if(!p)failed++;} console.log(`P542 focused checks: ${checks.length-failed}/${checks.length} PASS`); process.exit(failed?1:0);
