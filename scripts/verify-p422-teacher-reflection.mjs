import fs from 'node:fs'; import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const schema=fs.readFileSync(path.join(root,'backend/api/prisma/schema.prisma'),'utf8');
const migration=fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261121200000_p422_teacher_lesson_reflections/migration.sql'),'utf8');
const api=fs.readFileSync(path.join(root,'backend/api/src/modules/curriculum/curriculum.routes.ts'),'utf8');
const mobile=fs.readFileSync(path.join(root,'apps/teacher-mobile/App.tsx'),'utf8');
const checks=[
 ['Reflection model is defined',schema.includes('model CurriculumLessonPlanReflection')],
 ['Reflection model has teaching notes field',schema.includes('teachingNotes String? @db.VarChar(5000)')],
 ['Reflection model has challenges field',schema.includes('challenges String? @db.VarChar(3000)')],
 ['Reflection model has follow-up field',schema.includes('followUpActions String? @db.VarChar(3000)')],
 ['Reflection stores actual duration',schema.includes('actualDurationMinutes Int?')],
 ['Reflection stores timestamp',schema.includes('reflectedAt DateTime @default(now())')],
 ['Reflection uniqueness is per school/plan/teacher',schema.includes('@@unique([schoolId, lessonPlanId, staffMemberId])')],
 ['Migration creates reflection table',migration.includes('CREATE TABLE "CurriculumLessonPlanReflection"')],
 ['Migration has tenant composite plan FK',migration.includes('FOREIGN KEY ("lessonPlanId", "organizationId", "schoolId")')],
 ['Migration has staff composite FK',migration.includes('FOREIGN KEY ("staffMemberId", "organizationId", "schoolId")')],
 ['Migration duration constraint is bounded',migration.includes('BETWEEN 1 AND 600')],
 ['Migration enforces RLS',migration.includes('ENABLE ROW LEVEL SECURITY')&&migration.includes('FORCE ROW LEVEL SECURITY')],
 ['Tenant RLS policy checks org and school',migration.includes('current_setting(\'app.current_organization_id\',true)')&&migration.includes('current_setting(\'app.current_school_id\',true)')],
 ['Teacher workspace GET returns latest reflection and history',api.includes('curriculumLessonPlanReflection.findMany')&&api.includes('reflectionHistory: reflectionHistoryByPlan.get(plan.id) || []')],
 ['Reflection PUT route appends a history record',api.includes('/:lessonPlanId/reflection')&&api.includes('curriculumLessonPlanReflection.create')],
 ['Reflection endpoint requires active staff profile',api.includes('staffMissing: true')&&api.includes('Active staff profile required')],
 ['Reflection endpoint requires assignment',api.includes('Only assigned teachers can save reflections')],
 ['Reflection only available after lesson completion',api.includes('plan.status !== "COMPLETED"')&&api.includes('Reflection is available after the lesson is marked completed')],
 ['Teaching notes max length validation',api.includes('field === "teachingNotes" ? 5000 : 3000')],
 ['Duration API validates range',api.includes('duration < 1 || duration > 600')],
 ['Mobile save reflection action exists',mobile.includes('saveTeacherLessonReflection(plan)')],
 ['Mobile teaching notes editor exists',mobile.includes('Teaching notes / what worked')],
 ['Mobile challenges editor exists',mobile.includes('Challenges encountered')],
 ['Mobile follow-up editor exists',mobile.includes('Follow-up actions')],
 ['Mobile actual duration input exists',mobile.includes('Actual duration in minutes (optional)')],
 ['Mobile reflects saved timestamp',mobile.includes('plan.reflection.reflectedAt')],
 ['Mobile reflection fields are visible only on completed lessons',mobile.includes('plan.status==="COMPLETED"')],
 ['Offline reflection writes are disabled',mobile.includes('disabled={busy||offlineSession}')],
 ['Reflection history ordering uses existing model fields',api.includes('orderBy: [{ reflectedAt: \"desc\" }, { updatedAt: \"desc\" }]')],
 ['P421 teacher assignment guard remains in API',api.includes('curriculumLessonPlanTeacherAssignment.findFirst')],
];
let failed=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}console.log(`P422 focused verifier: ${checks.length-failed}/${checks.length} PASS`);process.exitCode=failed?1:0;
