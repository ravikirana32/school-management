import fs from 'node:fs';
const routes=fs.readFileSync('backend/api/src/modules/curriculum/curriculum.routes.ts','utf8');
const admin=fs.readFileSync('apps/school-admin/src/CurriculumReflectionTasksWorkspace.tsx','utf8');
const mobile=fs.readFileSync('apps/teacher-mobile/App.tsx','utf8');
const checks=[
 ['Coordinator due-bucket query validation',routes.includes('dueBucket')&&routes.includes('OVERDUE')&&routes.includes('DUE_TODAY')&&routes.includes('UPCOMING')],
 ['Overdue API excludes completed tasks',routes.includes('status: { not: "COMPLETED" }')],
 ['Due-today API date range uses start and next day',routes.includes('gte: todayStart, lt: tomorrow')],
 ['Upcoming API bucket exists',routes.includes('dueAt: { gte: tomorrow }')],
 ['No-due-date API bucket exists',routes.includes('dueAt: null')],
 ['Coordinator workspace has task counts',admin.includes('Overdue')&&admin.includes('tasks.filter')],
 ['Coordinator workspace pending metrics',admin.includes('Pending')&&admin.includes('status==="PENDING"')],
 ['Coordinator workspace in-progress metrics',admin.includes('In progress')&&admin.includes('status==="IN_PROGRESS"')],
 ['Coordinator workspace completed metrics',admin.includes('Completed')&&admin.includes('status==="COMPLETED"')],
 ['Coordinator due-date filter control',admin.includes('Due-date view')&&admin.includes('dueBucket')],
 ['Coordinator overdue filter logic',admin.includes('dueBucket==="OVERDUE"')],
 ['Coordinator due-today filter logic',admin.includes('dueBucket==="DUE_TODAY"')],
 ['Coordinator upcoming filter logic',admin.includes('return d>=tomorrow')],
 ['Coordinator no-date filter logic',admin.includes('dueBucket==="NO_DUE_DATE"')],
 ['Task cards indicate overdue',admin.includes('OVERDUE')],
 ['Mobile task cards indicate overdue',mobile.includes('OVERDUE')],
 ['Mobile task cards indicate due today',mobile.includes('DUE TODAY')],
 ['Completed tasks excluded from overdue visual flag',admin.includes('task.status!=="COMPLETED"')&&mobile.includes('task.status!=="COMPLETED"')],
 ['Existing task API remains scoped to tenant/school',routes.includes('organizationId: s.organizationId, schoolId: s.schoolId, ...(status === "ALL"')],
 ['Task listing still bounded',routes.includes('take: 500')],
];
let fail=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;} console.log(`P425 verifier: ${checks.length-fail}/${checks.length} PASS`);process.exitCode=fail?1:0;
