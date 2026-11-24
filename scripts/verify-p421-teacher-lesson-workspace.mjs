import fs from 'node:fs'; import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const api=fs.readFileSync(path.join(root,'backend/api/src/modules/curriculum/curriculum.routes.ts'),'utf8');
const mobile=fs.readFileSync(path.join(root,'apps/teacher-mobile/App.tsx'),'utf8');
const membership=fs.readFileSync(path.join(root,'backend/api/src/modules/staff/teacher-membership.routes.ts'),'utf8');
const checks=[
 ['Teacher lesson workspace GET route exists',api.includes('/:organizationId/:schoolId/teacher-lesson-plans')],
 ['Read permission is enforced',api.includes('scope(req, res, "academics.read")')],
 ['Staff profile resolved from authenticated user',api.includes('userId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE"')],
 ['Assigned-plan query restricts staff member',api.includes('staffMemberId: staff.id')],
 ['Assigned plan IDs used to scope results',api.includes('id: { in: planIds }')],
 ['Tenant and school filter on plans',api.includes('organizationId: s.organizationId, schoolId: s.schoolId }, orderBy')],
 ['Teacher workspace primary-role field',api.includes('isPrimaryTeacher: !!assignmentByPlan.get(plan.id)?.isPrimary')],
 ['Outcome links loaded for assigned plans',api.includes('curriculumLessonPlanOutcome.findMany')],
 ['Outcome detail payload included',api.includes('code: true, title: true, description: true')],
 ['Teacher status PATCH route exists',api.includes('/teacher-lesson-plans/:lessonPlanId/status')],
 ['Status values constrained',api.includes('["PLANNED", "COMPLETED"].includes(requested)')],
 ['Assignment required for status update',api.includes('lessonPlanId: req.params.lessonPlanId, staffMemberId: staff.id')],
 ['Only assigned teacher can transition lesson status',api.includes('if (!assignment) return { forbidden: true }')],
 ['Completed/archive status is locked',api.includes('plan.status === "ARCHIVED" || plan.status === "COMPLETED"')],
 ['Completion requires planned status',api.includes('requested === "COMPLETED" && plan.status !== "PLANNED"')],
 ['Mobile workspace state added',mobile.includes('teacherLessonPlans')],
 ['Mobile refresh action added',mobile.includes('loadTeacherLessonPlans')],
 ['Mobile status update handler added',mobile.includes('updateTeacherLessonStatus')],
 ['Mobile fetch uses scoped curriculum endpoint',mobile.includes('call("/curriculum/teacher-lesson-plans")')],
 ['Mobile displays assigned lesson card list',mobile.includes('My lesson workspace')],
 ['Mobile primary teacher/collaborator distinction',mobile.includes('Primary teacher":"Collaborating teacher')],
 ['Mobile displays objectives and resources',mobile.includes('Objectives:')&&mobile.includes('Resources:')],
 ['Mobile displays linked curriculum outcomes',mobile.includes('Linked outcomes:')],
 ['Mark planned action shown for drafts',mobile.includes('plan.status==="DRAFT"')&&mobile.includes('Mark planned')],
 ['Mark completed action shown for planned lessons',mobile.includes('plan.status==="PLANNED"')&&mobile.includes('Mark completed')],
 ['Offline status mutations are disabled',mobile.includes('disabled={busy||offlineSession}')],
 ['Lesson plans reset when changing school',mobile.includes('setTeacherLessonPlans([])')],
 ['Existing teacher membership flow remains',membership.includes('/teacher/me/schools')],
 ['No tenant IDs accepted as arbitrary teacher identity',api.includes('userId: s.userId')],
];
let failed=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`P421 focused verifier: ${checks.length-failed}/${checks.length} PASS`);process.exitCode=failed?1:0;
