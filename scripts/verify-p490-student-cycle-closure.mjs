import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('apps/student-mobile/App.tsx');
const apiRoutes=read('backend/api/src/modules/students/student.routes.ts');
const summary=read('apps/student-mobile/src/StudentDailySummary.tsx');
const planner=read('apps/student-mobile/src/StudentAcademicPlanner.tsx');
const assessment=read('apps/student-mobile/src/StudentAssessmentResults.tsx');
const communication=read('apps/student-mobile/src/StudentCommunicationCenter.tsx');
const services=read('apps/student-mobile/src/StudentServicesHub.tsx');
const resilience=read('apps/student-mobile/src/networkResilience.ts');
const homework=read('apps/student-mobile/src/studentHomeworkLifecycle.ts');
const pkg=JSON.parse(read('package.json'));
const mobilePkg=JSON.parse(read('apps/student-mobile/package.json'));
const checks=[
 ['student portal app source present',fs.existsSync(path.join(root,'apps/student-mobile/App.tsx'))],
 ['daily summary component mounted',app.includes('<StudentDailySummary homework={homework} announcements={announcements}/>')&&summary.includes('export function StudentDailySummary')],
 ['academic planner component mounted',app.includes('<StudentAcademicPlanner')&&planner.includes('export function StudentAcademicPlanner')],
 ['planner contains timetable journey',planner.includes('timetable')],
 ['planner contains attendance journey',planner.includes('attendance')],
 ['planner contains calendar journey',planner.includes('calendar')],
 ['student assessments component mounted',app.includes('<StudentAssessmentResults')&&assessment.includes('export function StudentAssessmentResults')],
 ['exams/results/report cards are surfaced',assessment.includes('exams')&&assessment.includes('reports')&&assessment.includes('Report cards')],
 ['homework lifecycle helper present',homework.includes('export function classifyHomework')],
 ['answer length cap retained',homework.includes('STUDENT_HOMEWORK_ANSWER_MAX_LENGTH')],
 ['student homework submission API call exists',app.includes('/homework/${encodeURIComponent(item.id)}/submission')],
 ['attachment upload workflow exists',app.includes('uploadHomeworkAttachment')&&app.includes('documents/homework/student')],
 ['communication center mounted',app.includes('<StudentCommunicationCenter')&&communication.includes('export function StudentCommunicationCenter')],
 ['read/unread communications filters retained',communication.includes('unread')&&communication.includes('read')],
 ['communication mark-read callback wired',app.includes('onMarkRead={id=>markRead(id)')],
 ['student services hub mounted',app.includes('<StudentServicesHub')&&services.includes('export function StudentServicesHub')],
 ['library student-scoped API is connected and rendered',services.includes("root+'/library'")&&services.includes('library.loans')&&services.includes('library.reservations')],
 ['transport student-scoped API is connected and rendered',services.includes("root+'/transport'")&&services.includes('transport.allocations')&&services.includes('recentStudentEvents')],
 ['canteen experience mounted',app.includes('<StudentCanteenScreen')],
 ['student scoped timetable route exists',apiRoutes.includes('/timetable')],
 ['student scoped attendance route exists',apiRoutes.includes('/attendance')],
 ['student scoped calendar route exists',apiRoutes.includes('/calendar')],
 ['student scoped exam route exists',apiRoutes.includes('/exams')],
 ['API request uses bearer token',app.includes('authorization:`Bearer ${access}`')],
 ['bounded GET retry helper present',resilience.includes('MAX_GET_RETRIES = 2')&&resilience.includes('fetchWithReadRetry')],
 ['read retries are applied to GET/HEAD only',app.includes('method==="GET"||method==="HEAD"?fetchWithReadRetry(run):run(0)')],
 ['offline session detection present',resilience.includes('export function isOfflineSession')],
 ['offline banner and reconnect action present',app.includes('Offline mode')&&app.includes('Retry connection')&&app.includes('async function reconnect')],
 ['no durable offline cache claim in source',!app.includes('offline mutation queue')],
 ['P483-P489 verifier registrations exist',Array.from({length:7},(_,i)=>`verify:p${483+i}`).every(k=>pkg.scripts?.[k]&&mobilePkg.scripts?.[k])],
 ['P490 verifier registered in root and student app',pkg.scripts?.['verify:p490']&&mobilePkg.scripts?.['verify:p490']],
 ['root open gap register exists',fs.existsSync(path.join(root,'MASTER-OPEN-GAPS-REGISTER.md'))],
 ['docs open gap register exists',fs.existsSync(path.join(root,'docs/MASTER-OPEN-GAPS-REGISTER.md'))],
 ['phases open gap register mirror exists',fs.existsSync(path.join(root,'docs/phases/MASTER-OPEN-GAPS-REGISTER.md'))],
 ['root/docs/phases open registers synchronized',read('MASTER-OPEN-GAPS-REGISTER.md')===read('docs/MASTER-OPEN-GAPS-REGISTER.md')&&read('MASTER-OPEN-GAPS-REGISTER.md')===read('docs/phases/MASTER-OPEN-GAPS-REGISTER.md')],
 ['root/docs/phases active registers synchronized',read('MASTER-ACTIVE-GAPS-REGISTER.md')===read('docs/MASTER-ACTIVE-GAPS-REGISTER.md')&&read('MASTER-ACTIVE-GAPS-REGISTER.md')===read('docs/phases/MASTER-ACTIVE-GAPS-REGISTER.md')],
 ['P490 open gap entry exists in all mirrors', ['MASTER-OPEN-GAPS-REGISTER.md','docs/MASTER-OPEN-GAPS-REGISTER.md','docs/phases/MASTER-OPEN-GAPS-REGISTER.md'].every(p=>read(p).includes('## P490'))],
 ['P490 active gap entry exists in all mirrors', ['MASTER-ACTIVE-GAPS-REGISTER.md','docs/MASTER-ACTIVE-GAPS-REGISTER.md','docs/phases/MASTER-ACTIVE-GAPS-REGISTER.md'].every(p=>read(p).includes('## P490'))],
 ['cycle closure report is present',fs.existsSync(path.join(root,'P490-DELIVERY-REPORT.md'))],
 ['closure preserves runtime gaps as open',read('P490-STATUS.md').includes('Runtime acceptance: NOT VERIFIED')&&read('MASTER-OPEN-GAPS-REGISTER.md').includes('P490-G001 OPEN')],
 ['cycle contains exactly the planned P483-P490 sequence',read('P490-DELIVERY-REPORT.md').includes('P483–P490')],
];
let passed=0;
for(const [name,condition] of checks){assert.ok(condition,`FAIL: ${name}`);passed++;console.log(`PASS ${passed}: ${name}`)}
console.log(`P490 Student Mobile cycle closure verification: ${passed}/${checks.length} PASS`);
