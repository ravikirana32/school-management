import fs from 'node:fs';
const app=fs.readFileSync(new URL('../apps/teacher-mobile/App.tsx',import.meta.url),'utf8');
const checks=[
 ['Review status filter type exists',app.includes('type HomeworkReviewFilter="ALL"|"SUBMITTED"|"RESUBMITTED"|"GRADED"')],
 ['Review filter state is controlled',app.includes('homeworkReviewFilter,setHomeworkReviewFilter')],
 ['Submission rows are filtered by selected status',app.includes('homeworkSubmissions.filter(row=>homeworkReviewFilter')],
 ['All-status count included',app.includes('ALL:homeworkSubmissions.length')],
 ['Submitted count included',app.includes('SUBMITTED:homeworkSubmissions.filter')],
 ['Resubmitted count included',app.includes('RESUBMITTED:homeworkSubmissions.filter')],
 ['Graded count included',app.includes('GRADED:homeworkSubmissions.filter')],
 ['Status filter controls render',app.includes('homeworkReviewFilter===filter&&styles.markSelected')],
 ['Empty filtered state is present',app.includes('No submissions in this status.')],
 ['Submission answer remains available in review',app.includes('{row.answerText}')],
];
let failed=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;} console.log(`${checks.length-failed}/${checks.length} PASS`); if(failed)process.exit(1);
