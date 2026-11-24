import fs from 'node:fs';
const route=fs.readFileSync('backend/api/src/modules/students/student.routes.ts','utf8');
const app=fs.readFileSync('apps/student-mobile/App.tsx','utf8');
const checks=[
 ['student account link required',route.includes('studentAccountLink.findFirst')&&route.includes('userId,isActive:true')],
 ['assignment must be published',route.includes("status:'PUBLISHED'" )],
 ['assignment bound to linked student',route.includes('studentId:link.studentId')],
 ['tenant scope retained',route.includes('withTenantContext(prisma,{organizationId,schoolId,userId}')],
 ['answer required and max length',route.includes('answerText:z.string().trim().min(1).max(10000)')],
 ['graded submissions blocked',route.includes("existing?.status==='GRADED'" )],
 ['resubmission supported',route.includes("status:'RESUBMITTED'" )],
 ['student app answer input',app.includes('Write your answer here (up to 10,000 characters)')],
 ['submit action calls API',app.includes('/homework/${encodeURIComponent(item.id)}/submission')&&app.includes('method:\'POST\'')],
 ['refresh after submit',app.includes('setHomework(rows||[])')&&app.includes('Homework answer submitted.')]
];
for(const [name,ok] of checks)console.log(`${ok?'PASS':'FAIL'} ${name}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`${checks.length}/${checks.length} passed`);
