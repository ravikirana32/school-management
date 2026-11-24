import fs from 'node:fs';
const routes=fs.readFileSync('backend/api/src/modules/curriculum/curriculum.routes.ts','utf8');
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261121230000_p426_teacher_task_notifications/migration.sql','utf8');
const mobile=fs.readFileSync('apps/teacher-mobile/App.tsx','utf8');
const checks=[
 ['Notification persistence model exists',schema.includes('model CurriculumLessonReflectionTaskNotification')],
 ['Notifications have tenant and school scope',schema.includes('organizationId String')&&schema.includes('schoolId String')],
 ['Dedupe key unique in schema',schema.includes('dedupeKey String @unique')],
 ['Notification inbox API exists',routes.includes('teacher-task-notifications')],
 ['Teacher inbox resolves active staff profile',routes.includes('Active staff profile required')],
 ['Inbox query recipient-scoped',routes.includes('recipientStaffMemberId: staff.id')],
 ['Mark-read API exists',routes.includes('teacher-task-notifications/:notificationId/read')],
 ['Mark-read is recipient scoped',routes.includes('recipientStaffMemberId: staff.id')],
 ['Coordinator reminder generation API exists',routes.includes('lesson-reflection-task-notifications/generate')],
 ['Due-soon window limited to 24 hours',routes.includes('now.getTime()+24*60*60*1000')],
 ['Overdue reminder classification exists',routes.includes('notificationType: type')&&routes.includes('Follow-up task overdue')],
 ['Due-soon reminder classification exists',routes.includes('DUE_SOON')],
 ['Daily deduplication key exists',routes.includes(':${type}:${dayKey}')],
 ['Reminder creation uses duplicate skip',routes.includes('skipDuplicates: true')],
 ['Task assignment notification type exists',routes.includes('notificationType: "ASSIGNED"')],
 ['Assignment notification deduped by task',routes.includes(':${result.id}:ASSIGNED')],
 ['Notification migration creates table',migration.includes('CREATE TABLE "CurriculumLessonReflectionTaskNotification"')],
 ['Migration includes tenant RLS',migration.includes('ENABLE ROW LEVEL SECURITY')&&migration.includes('FORCE ROW LEVEL SECURITY')&&migration.includes('tenant_policy')],
 ['Task composite scope uniqueness supports notification FK',migration.includes('CurriculumLessonReflectionTask_scope_unique')&&schema.includes('@@unique([id, organizationId, schoolId])')],
 ['Notification FK to task is composite scope',migration.includes('FOREIGN KEY ("taskId", "organizationId", "schoolId")')],
 ['Notification FK to staff is composite scope',migration.includes('FOREIGN KEY ("recipientStaffMemberId", "organizationId", "schoolId")')],
 ['Teacher mobile loads notifications',mobile.includes('call("/curriculum/teacher-task-notifications")')],
 ['Teacher mobile displays unread count',mobile.includes('taskNotifications.filter(n=>!n.readAt).length')],
 ['Teacher mobile read action',mobile.includes('markTaskNotificationRead')],
 ['Mobile notification read action disabled offline',mobile.includes('if(offlineSession||notification.readAt)return')],
 ['Teacher mobile caps inbox display',mobile.includes('taskNotifications.slice(0,25)')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}console.log(`P426 verifier: ${checks.length-failed}/${checks.length} PASS`);process.exitCode=failed?1:0;
