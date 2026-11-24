import fs from 'node:fs';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');const routes=fs.readFileSync('backend/api/src/modules/curriculum/curriculum.routes.ts','utf8');const mobile=fs.readFileSync('apps/teacher-mobile/App.tsx','utf8');const admin=fs.readFileSync('apps/school-admin/src/CurriculumReflectionTasksWorkspace.tsx','utf8');const migration=fs.readFileSync('backend/api/prisma/migrations/20261121220000_p424_reflection_action_tasks/migration.sql','utf8');
const checks=[
 ['Task persistence model',schema.includes('model CurriculumLessonReflectionTask')],
 ['Reflection tenant composite key',schema.includes('@@unique([id, organizationId, schoolId])')],
 ['Task due date and priority',schema.includes('dueAt DateTime?')&&schema.includes('priority String @default("MEDIUM")')],
 ['Task status constraint in migration',migration.includes("CHECK (\"status\" IN ('PENDING','IN_PROGRESS','COMPLETED'))")],
 ['Task priority constraint in migration',migration.includes("CHECK (\"priority\" IN ('LOW','MEDIUM','HIGH'))")],
 ['Tenant RLS enabled and forced',migration.includes('ENABLE ROW LEVEL SECURITY')&&migration.includes('FORCE ROW LEVEL SECURITY')],
 ['Tenant policy with write check',migration.includes('WITH CHECK')&&migration.includes("current_setting('app.organization_id'")],
 ['Coordinator task list API',routes.includes('/lesson-reflection-tasks')&&routes.includes('academics.manage')],
 ['Coordinator task creation API',routes.includes('curriculumLessonReflectionTask.create')],
 ['Coordinator task update API',routes.includes('lesson-reflection-tasks/:taskId')&&routes.includes('curriculumLessonReflectionTask.update')],
 ['Teacher scoped task list API',routes.includes('/teacher-lesson-reflection-tasks')&&routes.includes('assignedToStaffMemberId: staff.id')],
 ['Teacher task update authorization',routes.includes('Only the assigned teacher can update this task')],
 ['Teacher app task view',mobile.includes('My reflection follow-up tasks')],
 ['Teacher task status buttons',mobile.includes('Start task')&&mobile.includes('Mark completed')],
 ['Teacher task loading API',mobile.includes('teacher-lesson-reflection-tasks')],
 ['Coordinator UI task creation',admin.includes('Create task')&&admin.includes('Source reflection')],
 ['Coordinator UI priority and due-date fields',admin.includes('Due date')&&admin.includes('Priority')],
 ['Coordinator task lifecycle filtering',admin.includes('Task status filter')&&admin.includes('IN_PROGRESS')],
 ['Task tied to reflection and lesson',schema.includes('reflectionId String')&&schema.includes('lessonPlanId String')],
 ['Task audit attribution',schema.includes('createdByUserId String')&&schema.includes('completedAt DateTime?')],
 ['Migration indexes for retrieval',migration.includes('assignedToStaffMemberId')&&migration.includes('dueAt')&&migration.includes('reflectionId')],
 ['No offline task mutations enabled',mobile.includes('disabled={busy||offlineSession}')],
 ['Task descriptions length bounded',schema.includes('description String? @db.VarChar(3000)')],
 ['Completion notes persist',schema.includes('completionNotes String? @db.VarChar(3000)')]
];let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}console.log(`P424 verifier: ${checks.length-fail}/${checks.length} PASS`);process.exitCode=fail?1:0;
