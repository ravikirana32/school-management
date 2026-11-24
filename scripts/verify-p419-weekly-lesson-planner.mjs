import fs from 'node:fs'; import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const ui=fs.readFileSync(path.join(root,'apps/school-admin/src/CurriculumLessonPlanning.tsx'),'utf8');
const checks=[
 ['Weekly planner view exists',ui.includes('plannerView==="WEEK"')&&ui.includes('Week')],
 ['Calendar month view exists',ui.includes('plannerView==="MONTH"')&&ui.includes('Calendar')],
 ['List view toggle exists',ui.includes('plannerView==="LIST"')&&ui.includes('List')],
 ['Previous/next week navigation',ui.includes('addDays(d,-7)')&&ui.includes('addDays(d,7)')],
 ['Previous/next month navigation',ui.includes('d.getMonth()-1')&&ui.includes('d.getMonth()+1')],
 ['Today navigation control',ui.includes('setPlannerAnchor(new Date())')&&ui.includes('Today')],
 ['Week starts Monday',ui.includes('((x.getDay()+6)%7)')],
 ['Week has seven day columns',ui.includes('Array.from({length:7')&&ui.includes('gridTemplateColumns:"repeat(7')],
 ['Month grid has six weeks',ui.includes('Array.from({length:42')],
 ['Grade filter available',ui.includes('Filter planner grade')&&ui.includes('plannerGrade')],
 ['Subject filter available',ui.includes('Filter planner subject')&&ui.includes('plannerSubject')],
 ['Grade and subject filter applied to plan collection',ui.includes('(!plannerGrade||String(p.gradeLevelId)===plannerGrade)&&(!plannerSubject')],
 ['Scheduled plans separated from unscheduled',ui.includes('const unscheduled=filtered.filter(p=>!p.plannedDate')&&ui.includes('const scheduled=filtered.filter(p=>p.plannedDate')],
 ['Unscheduled drafts displayed',ui.includes('Unscheduled lesson drafts')],
 ['Week view matches selected dates',ui.includes('dateKey(day)')],
 ['Month view indicates adjacent month dates',ui.includes('day.getMonth()===plannerAnchor.getMonth()')],
 ['Duration displayed in cards',ui.includes('Duration not set')&&ui.includes('min')],
 ['Status shown in cards',ui.includes('String(p.status)')],
 ['Edit action preserved',ui.includes('onClick={()=>startEdit(p)}')],
 ['Planner filters are accessible',ui.includes('aria-label="Filter planner grade"')&&ui.includes('aria-label="Filter planner subject"')],
 ['Existing lesson form remains',ui.includes('Create lesson plan')&&ui.includes('Learning objectives')&&ui.includes('Teaching resources')],
 ['Planner UI remains inside lesson planning component',ui.includes('Planner')],
 ['Existing list table retained',ui.includes('<h5>Lesson plans</h5><table>')]
];
for(const [n,ok] of checks)console.log(`${ok?'PASS':'FAIL'} ${n}`);
console.log(`${checks.filter(x=>x[1]).length}/${checks.length} checks passed`);
if(checks.some(x=>!x[1]))process.exit(1);
