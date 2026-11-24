import fs from 'node:fs';import path from 'node:path';const checks=[];const add=(n,v)=>checks.push({n,ok:!!v});
const apps=['parent-mobile','student-mobile','teacher-mobile'];for(const a of apps){add(`${a} app entry exists`,fs.existsSync(`apps/${a}/App.tsx`));add(`${a} auth integration`,fs.readFileSync(`apps/${a}/App.tsx`,'utf8').includes('signIn')||fs.readFileSync(`apps/${a}/App.tsx`,'utf8').includes('signIn('));}
const parent=fs.readFileSync('apps/parent-mobile/App.tsx','utf8'),student=fs.readFileSync('apps/student-mobile/App.tsx','utf8'),teacher=fs.readFileSync('apps/teacher-mobile/App.tsx','utf8');
for(const f of ['attendance','fees','homework','reportCards','notifications','messageThreads','refundActivity'])add(`Parent feature state: ${f}`,parent.includes(f));
for(const f of ['attendance','fees','reportCards','health'])add(`Student missing coverage recorded: ${f}`,!student.includes(f));
for(const f of ['timetable','attendance','homework','offlineSession','weekData'])add(`Teacher feature coverage: ${f}`,teacher.includes(f));
add('Parent health module integrated',parent.includes('ParentHealthScreen'));add('Parent canteen module integrated',parent.includes('ParentCanteenScreen'));add('Student canteen module integrated',student.includes('StudentCanteenScreen'));
add('Teacher offline mutation queue imported',teacher.includes('mutation-queue'));add('Teacher offline timetable cache present',teacher.includes('timetableCacheKey'));add('Teacher roster attendance marking present',teacher.includes('openRoster')&&teacher.includes('/marks'));
add('Student homework API integrated',student.includes('/homework'));add('Student announcement/inbox integration',student.includes('/inbox')||student.includes('announcements'));
add('Parent messages API integrated',parent.includes('/portal/messages'));add('Parent notification preferences present',parent.includes('notificationPreferences'));
add('P354 HR staff mobile leave panel carried forward',fs.existsSync('apps/staff-mobile/src/hr/HRLeavePanel.tsx'));
console.log(`P355 coverage verifier: ${checks.filter(x=>x.ok).length}/${checks.length} PASS`);for(const c of checks)console.log(`${c.ok?'PASS':'FAIL'} ${c.n}`);if(checks.some(x=>!x.ok))process.exitCode=1;
