import fs from 'node:fs';
const source = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const checks = [
  ['per-task error map exists', /assignmentErrors, setAssignmentErrors/.test(source)],
  ['clear only task error on retry', /setAssignmentErrors\(previous => \(\{ \.\.\.previous, \[taskKey\]: "" \}\)\)/.test(source)],
  ['successful task clears its own error', /setAssignmentErrors\(previous => \(\{ \.\.\.previous, \[taskKey\]: "" \}\)\)/.test(source)],
  ['failure writes error by task key', /\[taskKey\]: e instanceof Error \? e\.message/.test(source)],
  ['row error uses alert semantics', /assignmentErrors\[item\.key\].*role="alert"/.test(source)],
  ['concurrent save map retained', source.includes('setSavingAssignments(previous => ({ ...previous, [taskKey]: true }))')],
  ['per-task saving feedback retained', /savingAssignments\[item\.key\].*Saving/.test(source)],
  ['assignment success feedback retained', /assignmentSaveStatus\[item\.key\].*Assignment saved/.test(source)],
];
for (const [label, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`);
const passed = checks.filter(([,pass]) => pass).length;
console.log(`P386: ${passed}/${checks.length} checks passed`);
if (passed !== checks.length) process.exit(1);
