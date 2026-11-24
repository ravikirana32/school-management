import fs from 'node:fs';
const worker = fs.readFileSync('backend/api/src/workers/teacher-task-notification-scheduler.ts', 'utf8');
const pkg = JSON.parse(fs.readFileSync('backend/api/package.json', 'utf8'));
const schema = fs.readFileSync('backend/api/prisma/schema.prisma', 'utf8');
const compose = fs.readFileSync('docker-compose.prod.yml', 'utf8');
const checks = [
  ['scheduler worker file exists', worker.length > 1000],
  ['periodic scheduling uses 15-minute cadence', worker.includes('15 * 60 * 1000')],
  ['task scan is tenant and school scoped', worker.includes('organizationId: school.organizationId, schoolId: school.id')],
  ['completed tasks excluded', worker.includes('status: { not: "COMPLETED" }')],
  ['due-soon window is 24 hours', worker.includes('DUE_SOON_HOURS = 24')],
  ['overdue and due-soon classification', worker.includes('"OVERDUE"') && worker.includes('"DUE_SOON"')],
  ['local date dedupe uses school timezone', worker.includes('localDayKey(now, school.timezone')],
  ['invalid timezone safely falls back to ISO date', worker.includes('date.toISOString().slice(0, 10)')],
  ['notification dedupe key is date/cadence scoped', worker.includes(':${type}:${dedupeWindow}') && worker.includes('const dedupeWindow = overdue ? overdueSlotKey : dayKey')],
  ['database duplicate insertion safely ignored', worker.includes('skipDuplicates: true')],
  ['scheduler logs cycle metrics', worker.includes('teacher_task_notification_scheduler.cycle')],
  ['scheduler logs failures', worker.includes('teacher_task_notification_scheduler.failed')],
  ['worker graceful shutdown handles signals', worker.includes('SIGINT') && worker.includes('SIGTERM')],
  ['worker entry is registered in package scripts', pkg.scripts['worker:teacher-task-notifications'] === 'tsx src/workers/teacher-task-notification-scheduler.ts'],
  ['focused verifier is registered', pkg.scripts['verify:p427'] === 'node ../../scripts/verify-p427-automated-task-notifications.mjs'],
  ['notification model exists', schema.includes('model CurriculumLessonReflectionTaskNotification')],
  ['production worker service wired', compose.includes('worker-teacher-task-notifications') && compose.includes('dist/workers/teacher-task-notification-scheduler.js')],
  ['worker depends on successful migrations', compose.includes('worker-teacher-task-notifications') && compose.includes('condition: service_completed_successfully')],
];
let failed = 0;
for (const [name, pass] of checks) { console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); if (!pass) failed++; }
console.log(`${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
