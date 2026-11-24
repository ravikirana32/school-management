import fs from 'node:fs';
const file=new URL('./apps/school-admin/src/AttendanceWorkspace.tsx',import.meta.url);
const s=fs.readFileSync(file,'utf8');
const checks={
  'curriculum grade endpoint':s.includes('/grades') && s.includes('curriculum'),
  'admissions capacities endpoint':s.includes('admissions/capacities'),
  'grade catalog dropdown and manual fallback':s.includes('gradeOptions.map') && s.includes('Select grade') && s.includes('Catalog unavailable — enter grade ID'),
  'year/grade section filtering':s.includes('filteredSections=sectionOptions.filter'),
  'configured section selector':s.includes('filteredSections.length>0?<label>Section<select'),
  'manual section fallback':s.includes('manual if not configured'),
  'grade change resets section':s.includes('setGradeLevelId(e.target.value);setSectionName("")'),
  'catalog status displayed':s.includes('catalogMessage&&<p className="helper" role="status">')
};
let failed=0; for(const [name,pass] of Object.entries(checks)){console.log(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)failed++;}
console.log(`${Object.keys(checks).length-failed}/${Object.keys(checks).length} passed`);process.exitCode=failed?1:0;
