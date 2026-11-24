import fs from 'node:fs'; import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const schema=fs.readFileSync(path.join(root,'backend/api/prisma/schema.prisma'),'utf8');
const migration=fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261121190000_p420_lesson_plan_teacher_assignment/migration.sql'),'utf8');
const api=fs.readFileSync(path.join(root,'backend/api/src/modules/curriculum/curriculum.routes.ts'),'utf8');
const ui=fs.readFileSync(path.join(root,'apps/school-admin/src/CurriculumLessonPlanning.tsx'),'utf8');
const checks=[
 ['Teacher assignment model exists',schema.includes('model CurriculumLessonPlanTeacherAssignment')],
 ['Tenant and school scope fields exist',schema.includes('organizationId String')&&schema.includes('schoolId String')],
 ['Primary teacher flag exists',schema.includes('isPrimary Boolean @default(false)')],
 ['Assignment model unique per plan/staff',schema.includes('@@unique([schoolId, lessonPlanId, staffMemberId])')],
 ['Migration creates assignment table',migration.includes('CREATE TABLE "CurriculumLessonPlanTeacherAssignment"')],
 ['Composite tenant FK to lesson plan',migration.includes('lessonPlanId", "organizationId", "schoolId") REFERENCES "CurriculumLessonPlan"')],
 ['Composite tenant FK to staff',migration.includes('staffMemberId", "organizationId", "schoolId") REFERENCES "StaffMember"')],
 ['Forced row-level security enabled',migration.includes('ENABLE ROW LEVEL SECURITY')&&migration.includes('FORCE ROW LEVEL SECURITY')],
 ['Tenant RLS policy exists',migration.includes('CurriculumLessonPlanTeacherAssignment_tenant_policy')],
 ['RLS uses established tenant session keys',migration.includes('app.current_organization_id')&&migration.includes('app.current_school_id')],
 ['Teacher candidates endpoint',api.includes('/lesson-plan-teachers')&&api.includes('isTeachingRole: true')],
 ['Candidates restricted to active staff',api.includes('status: "ACTIVE"')],
 ['Assignments listing endpoint',api.includes('/lesson-plan-teacher-assignments')],
 ['Assignment update endpoint',api.includes('lesson-plans/:lessonPlanId/teachers')&&api.includes('curriculumLessonPlanTeacherAssignment.createMany')],
 ['Permission guard on assignment updates',api.includes('scope(req, res, "academics.manage")')],
 ['Subscription entitlement guard on assignments',api.includes('Curriculum configuration is not included in the active subscription')],
 ['Completed/archived plans locked',api.includes('["COMPLETED", "ARCHIVED"].includes(plan.status)')],
 ['Maximum 20 teachers validation',api.includes('staffIds.length > 20')],
 ['Primary teacher must be assigned',api.includes('!staffIds.includes(primaryStaffId)')],
 ['Cross-school/inactive teacher validation',api.includes('schoolId: s.schoolId, status: "ACTIVE"')&&api.includes('designationId: { in: designations.map')],
 ['Teacher candidate state exists',ui.includes('teacherCandidates')],
 ['Assignment state by plan',ui.includes('teacherAssignments')&&ui.includes('primaryTeachers')],
 ['Multi-select teacher assignment UI',ui.includes('select multiple')&&ui.includes('Teacher assignment')],
 ['Primary teacher selector UI',ui.includes('Primary teacher')],
 ['Assignment save action UI',ui.includes('Save teachers')&&ui.includes('method:"PUT"')],
 ['Existing P419 planner still present',ui.includes('plannerView==="WEEK"')&&ui.includes('plannerView==="MONTH"')&&ui.includes('plannerView==="LIST"')],
 ['Existing lesson edit UI retained',ui.includes('Edit lesson plan')&&ui.includes('Update lesson plan')],
];
for(const [name,ok] of checks)console.log(`${ok?'PASS':'FAIL'} ${name}`);
console.log(`${checks.filter(x=>x[1]).length}/${checks.length} checks passed`);
if(checks.some(x=>!x[1]))process.exit(1);
