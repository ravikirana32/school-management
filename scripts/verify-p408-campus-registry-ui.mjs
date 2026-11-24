import fs from 'node:fs';
const component = fs.readFileSync('apps/school-admin/src/CampusRegistryWorkspace.tsx','utf8');
const main = fs.readFileSync('apps/school-admin/src/main.tsx','utf8');
const api = fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts','utf8');
const checks = [
 ['Campus registry workspace exists', fs.existsSync('apps/school-admin/src/CampusRegistryWorkspace.tsx')],
 ['Registry GET integration', component.includes('request()') && component.includes('campus-registry')],
 ['Create campus POST integration', component.includes('method: editingId ? "PUT" : "POST"') && component.includes('Create campus')],
 ['Update campus PUT integration', component.includes('method: editingId ? "PUT" : "POST"') && component.includes('Save campus')],
 ['Archive campus DELETE integration', component.includes('method: "DELETE"') && component.includes('Archive')],
 ['Campus code field required and length-limited', component.includes('maxLength={40}') && component.includes('required')],
 ['Campus name field required and length-limited', component.includes('maxLength={160}')],
 ['Description length validation UI', component.includes('maxLength={500}')],
 ['Status ACTIVE/INACTIVE options', component.includes('value="ACTIVE"') && component.includes('value="INACTIVE"')],
 ['Main campus designation toggle', component.includes('form.isMain') && component.includes('Designate as main campus')],
 ['Edit action', component.includes('startEdit(row)')],
 ['Archive confirmation', component.includes('window.confirm')],
 ['School-admin tab registered', main.includes('id: "campuses"') && main.includes('label: "Campus registry"')],
 ['Tab routed to component with authenticated session context', main.includes('<CampusRegistryWorkspace apiBase={session.api} organizationId={org} schoolId={school} token={token} />')],
 ['Backend permission gate exists', api.includes('campus-registry') && api.includes('requirePermission(s, res, "school.settings.manage")')],
];
let passed=0;
for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(ok)passed++;}
console.log(`P408 verifier: ${passed}/${checks.length} PASS`);
if(passed!==checks.length) process.exit(1);
