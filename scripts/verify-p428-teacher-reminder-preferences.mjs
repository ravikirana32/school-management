import fs from 'node:fs';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261121240000_p428_teacher_task_reminder_preferences/migration.sql','utf8');
const routes=fs.readFileSync('backend/api/src/modules/curriculum/curriculum.routes.ts','utf8');
const worker=fs.readFileSync('backend/api/src/workers/teacher-task-notification-scheduler.ts','utf8');
const mobile=fs.readFileSync('apps/teacher-mobile/App.tsx','utf8');
const checks=[
 ['school policy model defined',schema.includes('model TeacherTaskReminderPolicy')],
 ['policy due-soon default enabled',schema.includes('dueSoonEnabled Boolean @default(true)')],
 ['policy overdue default enabled',schema.includes('overdueEnabled Boolean @default(true)')],
 ['policy recurrence interval persisted',schema.includes('overdueFrequencyHours Int @default(24)')],
 ['migration creates school policy table',migration.includes('CREATE TABLE "TeacherTaskReminderPolicy"')],
 ['policy has tenant RLS',migration.includes('TeacherTaskReminderPolicy_tenant_policy')],
 ['policy frequency bounded',migration.includes('CHECK ("overdueFrequencyHours" >= 12 AND "overdueFrequencyHours" <= 168')],
 ['teacher preferences GET scoped to own user',routes.includes('teacher-task-reminder-preferences')&&routes.includes('userId: s.userId')],
 ['teacher preference updates use upsert',routes.includes('notificationPreference.upsert')],
 ['teacher preferences validate booleans',routes.includes('At least one preference boolean is required')],
 ['coordinator defaults require academics.manage',routes.includes('lesson-reflection-task-reminder-defaults')&&routes.includes('scope(req, res, "academics.manage")')],
 ['coordinator frequency range validation',routes.includes('overdueFrequencyHours < 12 || overdueFrequencyHours > 168')],
 ['scheduler honors school due-soon switch',worker.includes('dueSoonEnabled = policy?.dueSoonEnabled ?? true')],
 ['scheduler honors school overdue switch',worker.includes('overdueEnabled = policy?.overdueEnabled ?? true')],
 ['scheduler resolves staff user for overrides',worker.includes('staffMember.findFirst')&&worker.includes('userId: staffUser.userId!')],
 ['scheduler reads per-user category preference',worker.includes('notificationPreference.findUnique')&&worker.includes('TEACHER_TASK_DUE_SOON')],
 ['scheduler excludes disabled category',worker.includes('preference?.enabled === false')],
 ['overdue cadence uses configurable frequency',worker.includes('overdueFrequencyHours * 60 * 60 * 1000')],
 ['mobile renders preference controls',mobile.includes('Follow-up reminder preferences')&&mobile.includes('Due-soon:')&&mobile.includes('Overdue:')],
 ['mobile saves preferences through API',mobile.includes('teacher-task-reminder-preferences')&&mobile.includes('PATCH')],
 ['mobile prevents offline preference changes',mobile.includes('if(offlineSession)return;')],
];
let failures=0;for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)failures++;}console.log(`${checks.length-failures}/${checks.length} passed`);process.exit(failures?1:0);
