import fs from 'node:fs';
const source = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const checks = [
  ['CSV export action is exposed', source.includes('Export readiness CSV') && source.includes('onClick={exportReadinessCsv}')],
  ['Export disabled while readiness is empty', source.includes('disabled={!items.length} onClick={exportReadinessCsv')],
  ['CSV header row includes step identity', source.includes('["Step", "Key", "Status", "Description", "Remediation", "Prerequisites", "Assigned owner"]')],
  ['Status included per row', source.includes('item.complete ? "Complete" : "Incomplete"')],
  ['Prerequisite titles included', source.includes('item.prerequisites.map(key => items.find(candidate => candidate.key === key)?.title || key)')],
  ['Owner assignment included', source.includes('assignmentMembers.find(member => member.id === assignmentMap[item.key])?.displayName || "Unassigned"')],
  ['CSV quoting escapes embedded quotes', source.includes('replaceAll("\\\"", "\\\"\\\"")')],
  ['UTF-8 BOM included for spreadsheet compatibility', source.includes('["\\uFEFF", csv]')],
  ['CSV MIME type set', source.includes('text/csv;charset=utf-8')],
  ['Date-stamped filename', source.includes('school-onboarding-readiness-${new Date().toISOString().slice(0, 10)}.csv')],
  ['Object URL cleanup performed', source.includes('URL.revokeObjectURL(url)')],
];
let failed = 0;
for (const [name, pass] of checks) { console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); if (!pass) failed++; }
console.log(`P382 verifier: ${checks.length - failed}/${checks.length} PASS`);
if (failed) process.exit(1);
