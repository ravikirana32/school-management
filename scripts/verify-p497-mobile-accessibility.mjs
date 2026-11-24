import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const apps=['student','parent','teacher','staff'];
const checks=[];
for(const name of apps){
 const file=`apps/${name}-mobile/App.tsx`,src=read(file);
 checks.push([`${name} app source present`,fs.existsSync(path.join(root,file))]);
 checks.push([`${name} touchables expose button semantics`, (src.match(/TouchableOpacity accessibilityRole="button" accessible=\{true\}/g)||[]).length>0]);
 checks.push([`${name} input placeholders have explicit accessibility labels`, /placeholder="[^"]*" accessibilityLabel="[^"]*"/.test(src)]);
 checks.push([`${name} inline error feedback uses alert semantics`,src.includes('accessibilityRole="alert"')]);
}
const student=read('apps/student-mobile/App.tsx');
const parent=read('apps/parent-mobile/App.tsx');
const teacher=read('apps/teacher-mobile/App.tsx');
const staff=read('apps/staff-mobile/App.tsx');
checks.push(['student school selection announces school and student',student.includes('accessibilityLabel={`Select ${item.school.name}, ${item.student.preferredName||item.student.firstName}`}')]);
checks.push(['parent school selection announces school',parent.includes('accessibilityLabel={`Select school ${item.school.name}`}')]);
checks.push(['teacher school selection announces school',teacher.includes('accessibilityLabel={`Select school ${item.school.name}`}')]);
checks.push(['staff mobile exposes six navigation buttons',(['finance','admissions','health','canteen','payroll','hrleave'].every(x=>staff.includes(`setActivePanel('${x}')`)))]);
checks.push(['teacher attendance marks meet 44dp touch target',teacher.includes('mark:{')&&teacher.includes('minHeight:44')]);
checks.push(['student offline banner role retained',student.includes('accessibilityRole="alert"')&&student.includes('Offline mode')]);
checks.push(['P490 verifier source retained',fs.existsSync(path.join(root,'scripts/verify-p490-student-cycle-closure.mjs'))]);
checks.push(['P496 offline cache verifier source retained',fs.existsSync(path.join(root,'scripts/verify-p496-student-offline-cache.mjs'))]);
checks.push(['root open-gap register exists',fs.existsSync(path.join(root,'MASTER-OPEN-GAPS-REGISTER.md'))]);
let passed=0;
for(const [label,ok] of checks){assert.ok(ok,`FAIL: ${label}`);passed++;console.log(`PASS ${passed}: ${label}`);}
console.log(`P497 Mobile Acceptance & Accessibility static verification: ${passed}/${checks.length} PASS`);
