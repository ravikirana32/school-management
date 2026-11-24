import fs from 'node:fs';
const source = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const loadStart = source.slice(source.indexOf('const load = useCallback'), source.indexOf('const load = useCallback') + 900);
const checks = [
  ['assignment roster resets before tenant load', /setAssignmentMembers\(\[\]\)/.test(loadStart)],
  ['assignment map resets before tenant load', /setAssignmentMap\(\{\}\)/.test(loadStart)],
  ['assignment load error resets before tenant load', /setAssignmentError\(""\)/.test(loadStart)],
  ['task-specific errors reset before tenant load', /setAssignmentErrors\(\{\}\)/.test(loadStart)],
  ['task save feedback resets before tenant load', /setAssignmentSaveStatus\(\{\}\)/.test(loadStart)],
  ['pending save map resets before tenant load', /setSavingAssignments\(\{\}\)/.test(loadStart)],
  ['scope reset occurs after load begins', loadStart.indexOf('setLoading(true)') >= 0 && loadStart.indexOf('setAssignmentMembers([])') > loadStart.indexOf('setLoading(true)')],
  ['load continues with API base URL', /const base = api\.replace/.test(loadStart),]
];
for (const [label, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`);
const passed = checks.filter(([,pass]) => pass).length;
console.log(`P387: ${passed}/${checks.length} checks passed`);
if (passed !== checks.length) process.exit(1);
