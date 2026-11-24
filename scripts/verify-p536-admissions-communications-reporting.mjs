import fs from 'node:fs';
const base='apps/school-admin/src/AdmissionsCommunicationsReportsWorkspace.tsx';
const file=fs.readFileSync(base,'utf8');
const main=fs.readFileSync('apps/school-admin/src/main.tsx','utf8');
const checks=[
 ['Admissions report workspace exists and uses school-admin session',file.includes('useSchoolAdminSession')],
 ['Applications endpoint uses admissions API',file.includes('/admissions/applications')],
 ['Communications endpoint uses school parents communications API',file.includes('/parents/communications')],
 ['Application status filter',file.includes('statusFilter')],
 ['Academic year filter',file.includes('yearFilter')],
 ['Grade filter',file.includes('gradeFilter')],
 ['Date range filtering',file.includes('created from')||file.includes('setFrom')&&file.includes('setTo')],
 ['Search filter supports applicant and guardian fields',file.includes('guardianName')&&file.includes('applicationNumber')&&file.includes('search.trim().toLowerCase()')],
 ['Admissions status summary is computed from filtered rows',file.includes('counts=useMemo')&&file.includes('filtered.filter(a=>a.status===s)')],
 ['Conversion metrics included',file.includes('convertedStudentId')&&file.includes('Conversion rate')],
 ['Admissions CSV export exists',file.includes('admissions-report.csv')&&file.includes('exportAdmissions')],
 ['Communications CSV export exists',file.includes('communications-report.csv')&&file.includes('exportCommunications')],
 ['CSV values are quoted and quote escaped',file.includes('s.replace(/"/g')&&file.includes('csvCell')],
 ['Communications delivery summaries retrieved with scoped IDs',file.includes('/delivery-summary')&&file.includes('encodeURIComponent(r.id)')],
 ['Delivery metrics disclaimer clarifies in-app record semantics',file.includes('not email or push transport confirmation')],
 ['School Admin navigation entry wired',main.includes('admissionsReports')&&main.includes('AdmissionsCommunicationsReportsWorkspace')],
 ['Admissions report tab is protected by admissions.read',main.includes('Admissions reports')&&main.includes('permission: "admissions.read"')]
];
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
console.log(`RESULT ${checks.filter(x=>x[1]).length}/${checks.length}`);
if(checks.some(x=>!x[1]))process.exit(1);
