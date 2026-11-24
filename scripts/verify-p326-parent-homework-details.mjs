import fs from 'node:fs';
const source=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const checks=[
 ['Parent homework model includes submission metadata',/type Homework=.*submission\?:\{status\?:string\|null;submittedAt\?:string\|null;score\?:number\|string\|null;maxScore\?:number\|string\|null;teacherFeedback\?:string\|null/s.test(source)],
 ['Homework detail view is child-scoped',/activeChild&&<View style=\{styles\.card\}><Text style=\{styles\.section\}>Homework & assignments/.test(source)],
 ['Due-date status displays overdue',/overdue\?"OVERDUE":"Upcoming \/ due"/.test(source)],
 ['Submission status visible',/Submission: \{submission\.status\|\|"Not submitted"\}/.test(source)],
 ['Submission timestamp visible',/Submitted: \{new Date\(submission\.submittedAt\)\.toLocaleString\(\)\}/.test(source)],
 ['Score and max score visible',/Score: \{submission\.score\}\{submission\.maxScore/.test(source)],
 ['Teacher feedback visible',/Teacher feedback: \{submission\.teacherFeedback\}/.test(source)],
 ['Attachment names and scan states surfaced without unsafe direct link', source.includes("Submission attachments") && source.includes("file.displayName") && source.includes("file.securityStatus") && source.includes('status==="CLEAN"') && source.includes("disabled={offlineSession||openingHomeworkAttachment[file.id]}")],
 ['No-description fallback provided',/No description provided\./.test(source)],
 ['No due date fallback provided',/No due date set/.test(source)],
];
for(const [name,pass] of checks) console.log(`${pass?'PASS':'FAIL'} ${name}`);
if(checks.some(x=>!x[1])) process.exit(1);
console.log(`Result: ${checks.filter(x=>x[1]).length}/${checks.length} PASS`);
