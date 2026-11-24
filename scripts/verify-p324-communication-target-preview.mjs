import fs from 'node:fs';
const source=fs.readFileSync('apps/school-admin/src/CommunicationWorkspace.tsx','utf8');
const checks=[
 ['academic year catalog uses session years',source.includes('years.map(y=>')],
 ['grade catalog fetched',source.includes('/curriculum/${encodeURIComponent(org)}/${encodeURIComponent(school)}/grades')],
 ['capacity records fetched for sections',source.includes('/admissions/capacities')],
 ['academic-year selection resets grade and section',source.includes('targetAcademicYearId:e.target.value,targetGradeLevelId:"",targetSectionName:""')],
 ['grade selection clears section',source.includes('targetGradeLevelId:e.target.value,targetSectionName:""')],
 ['section list filtered by academic year and grade',source.includes('c.academicYearId===draft.targetAcademicYearId&&c.gradeLevelId===draft.targetGradeLevelId')],
 ['target enrollment estimate derived from capacities',source.includes('Number(c.enrolledSeats||0)')],
 ['estimate explicitly distinguished from recipient count',source.includes('This is not an exact recipient count')],
 ['recipient eligibility checked at publish',source.includes('recipient accounts, guardian consent and notification preferences are checked by the API during publishing')],
 ['grade/section target requires academic year',source.includes('if(targeted&&!draft.targetAcademicYearId')],
 ['section targeting requires grade',source.includes('draft.targetSectionName&&!draft.targetGradeLevelId')],
 ['communication draft sends selected target fields',source.includes('targetAcademicYearId:draft.targetAcademicYearId||undefined,targetGradeLevelId:draft.targetGradeLevelId||undefined,targetSectionName:draft.targetSectionName||undefined')],
 ['existing publishing lifecycle retained',source.includes('/communications/${encodeURIComponent(id)}/publish')],
 ['existing opt-out and consent controls described',source.includes('Existing parent consent and notification preferences remain in place')||source.includes('notification preferences are checked by the API during publishing')],
 ['school-wide targeting preserved',source.includes('School-wide / all years')],
 ['announcement list renders catalog names',source.includes('grades.find(g=>g.id===row.targetGradeLevelId)?.name')]
];
let failed=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}console.log(`${checks.length-failed}/${checks.length} passed`);process.exit(failed?1:0);
