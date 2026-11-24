import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const component=fs.readFileSync(path.join(root,'apps/parent-mobile/src/academics/ParentAcademicPlanner.tsx'),'utf8');
const app=fs.readFileSync(path.join(root,'apps/parent-mobile/App.tsx'),'utf8');
const docs=fs.readFileSync(path.join(root,'docs/mobile/P475-PARENT-ACADEMIC-PLANNER.md'),'utf8');
const checks=[
 ['Planner component file present',fs.existsSync(path.join(root,'apps/parent-mobile/src/academics/ParentAcademicPlanner.tsx'))],
 ['App imports planner',app.includes('ParentAcademicPlanner')],
 ['App renders planner with active child context',app.includes('studentId={activeChild.id}')&&app.includes('request={request}')],
 ['Timetable route is child-scoped',component.includes('portal/children/')&&component.includes('${studentId}')&&component.includes('/timetable?from=')],
 ['Calendar route is child-scoped',component.includes('/calendar?from=')],
 ['Exams route is child-scoped',component.includes('/exams?from=')],
 ['Day and week controls exist',component.includes('setMode("day")')&&component.includes('setMode("week")')],
 ['Previous/next and today navigation exist',component.includes('shift(-1)')&&component.includes('shift(1)')&&component.includes('setDate(new Date())')],
 ['Planner has refresh and loading state',component.includes('void load()')&&component.includes('ActivityIndicator')],
 ['Distinct academic sections and empty states exist',component.includes('"Timetable"')&&component.includes('"School calendar"')&&component.includes('"Exams"')&&component.includes('No timetable slots')],
 ['Offline and error states exist',component.includes('if(offline)')&&component.includes('accessibilityRole="alert"')],
 ['Contract and backend unverified disclaimer documented',docs.includes('backend implementation not verified')&&docs.includes('not verified in P475')]
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}console.log(`P475 verifier: ${checks.length-fail}/${checks.length} passed`);process.exitCode=fail?1:0;
