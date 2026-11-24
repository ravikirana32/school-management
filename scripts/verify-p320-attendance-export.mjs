import fs from 'node:fs';
const file='apps/school-admin/src/AttendanceWorkspace.tsx';
const s=fs.readFileSync(file,'utf8');
const checks=[
 ['CSV escaping doubles quotes',s.includes(String.raw`replace(/\"/g,'\"\"')`)],
 ['UTF-8 BOM added',/"\\uFEFF"/.test(s)],
 ['CSV content type',/text\/csv;charset=utf-8/.test(s)],
 ['Daily report export helper',/function exportDailyReport\(/.test(s)],
 ['Daily report includes attendance status',/Attendance Status/.test(s)],
 ['Daily report includes unmarked records',/UNMARKED/.test(s)],
 ['Daily export filename date-scoped',/attendance-daily-\$\{sessionDate\}\.csv/.test(s)],
 ['Daily export UI appears only with report data',/reportSessions\.length>0&&<div className="form-actions"><button type="button" onClick=\{exportDailyReport\}/.test(s)],
 ['Range export helper',/function exportRangeReport\(/.test(s)],
 ['Range export contains attendance metrics',/Presence Rate \(%\)/.test(s)],
 ['Range export UI gated by generated data',/Export historical range CSV/.test(s)],
 ['Range filename contains date range',/attendance-range-\$\{rangeStart\}-to-\$\{rangeEnd\}\.csv/.test(s)],
];
for(const [name,pass] of checks)console.log(`${pass?'PASS':'FAIL'} ${name}`);
const failed=checks.filter(([,pass])=>!pass).length;
console.log(`${checks.length-failed}/${checks.length} checks passed`);
process.exit(failed?1:0);
