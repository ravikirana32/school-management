import fs from 'node:fs';
const source = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const checks = [
  ['per-task saving state', source.includes('savingAssignments, setSavingAssignments')],
  ['save sets task-specific busy state', source.includes('[taskKey]: true')],
  ['save clears task-specific busy state', source.includes('[taskKey]: false')],
  ['owner selector busy state is task-specific', source.includes('Boolean(savingAssignments[item.key])')],
  ['saving feedback is task-specific', source.includes('savingAssignments[item.key] && <small role="status">Saving…</small>')],
  ['saved feedback is task-specific', source.includes('assignmentSaveStatus[item.key] === "saved" && !savingAssignments[item.key]')],
  ['assignment feedback retained', source.includes('Assignment saved.') && source.includes('Unable to save task assignment.')],
  ['save request still uses task endpoint', source.includes('onboarding-assignments/${encodeURIComponent(taskKey)}')],
  ['save remains guarded by tenant/session', source.includes('if (!token || !org || !school) return;')],
  ['unassign supported', source.includes('assignedToUserId: assignedToUserId || null')],
];
let failures = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failures++; }
console.log(`${checks.length - failures}/${checks.length} checks passed`);
process.exit(failures ? 1 : 0);
