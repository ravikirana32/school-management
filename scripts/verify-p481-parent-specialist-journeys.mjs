import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const component=fs.readFileSync(path.join(root,'apps/parent-mobile/src/specialist/ParentSpecialistJourneys.tsx'),'utf8');
const app=fs.readFileSync(path.join(root,'apps/parent-mobile/App.tsx'),'utf8');
const gaps=fs.readFileSync(path.join(root,'docs/MASTER-OPEN-GAPS-REGISTER.md'),'utf8');
const checks=[
 ['Specialist component exists',component.length>0],
 ['Transport journey entry',component.includes('School Transport')],
 ['Library journey entry',component.includes('Library')],
 ['Hostel journey entry',component.includes('Hostel & Residence')],
 ['Transport scope described',component.includes('Assigned route')],
 ['Pickup/drop concepts',component.includes('Pickup/drop')],
 ['Library due-date concept',component.includes('due dates')],
 ['Hostel wellbeing concepts',component.includes('wellbeing')],
 ['Unavailable APIs honestly shown',component.includes('APIs are not yet available')],
 ['No fabricated data placeholders',!component.includes('Mock data')],
 ['Tabs have accessibility roles',component.includes('accessibilityRole="tab"')],
 ['Tab selection state exposed',component.includes('accessibilityState={{selected')],
 ['Active child name displayed',component.includes('studentName')],
 ['Active child id used as keyed context',component.includes('selected}:${studentId')],
 ['Component integrated into parent app',app.includes('<ParentSpecialistJourneys')],
 ['P481 gap section tracked',gaps.includes('## P481 — C2-05')],
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}
console.log(`${checks.length-fail}/${checks.length} checks passed`);if(fail)process.exit(1);
