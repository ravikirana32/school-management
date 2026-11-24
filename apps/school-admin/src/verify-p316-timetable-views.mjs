import fs from 'node:fs';
const src=fs.readFileSync(new URL('./TimetableWorkspace.tsx',import.meta.url),'utf8');
const checks=[
 ['view-mode selector',src.includes('value={viewMode}') && src.includes('value="class"') && src.includes('value="teacher"')],
 ['teacher filtering',src.includes('filterTeacher') && src.includes('s.teacherAssignmentId===filterTeacher')],
 ['grade filtering',src.includes('filterGrade') && src.includes('gradeLevelId===filterGrade')],
 ['section filtering',src.includes('filterSection') && src.includes('sectionName===filterSection')],
 ['weekday filtering',src.includes('filterDay') && src.includes('s.dayOfWeek===filterDay')],
 ['reset filters',src.includes('Reset filters') && src.includes('setFilterTeacher("")')],
 ['filtered slots counter',src.includes('{filteredSlots.length} of {slots.length} slots shown.')],
 ['teacher/class labels',src.includes('Teacher: {teacherLabel(s.teacherAssignmentId)}') && src.includes('Class:')],
 ['read-only overview keeps edit/deactivate',src.includes('onClick={()=>editSlot(s)}') && src.includes('onClick={()=>void deactivateSlot(s.id)}')]
];
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
if(checks.some(x=>!x[1])) process.exit(1);
