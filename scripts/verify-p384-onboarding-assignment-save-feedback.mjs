import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'apps/school-admin/src/OnboardingWorkspace.tsx'), 'utf8');
const checks = [
  ['assignment save state exists', source.includes('assignmentSaveStatus')],
  ['saving state is cleared before request', source.includes('setAssignmentSaveStatus(previous => ({ ...previous, [taskKey]: "" }))')],
  ['successful save announces status', source.includes('[taskKey]: "saved"')],
  ['success state follows successful response', source.includes('if (!response.ok) throw new Error') && source.indexOf('setAssignmentSaveStatus(previous => ({ ...previous, [taskKey]: "saved" }))') > source.indexOf('if (!response.ok) throw new Error')],
  ['failure clears success feedback', source.includes('catch (e) { setAssignmentSaveStatus(previous => ({ ...previous, [taskKey]: "" }))')],
  ['saving feedback uses live status semantics', source.includes('<small role="status">Saving…</small>')],
  ['saved feedback uses live status semantics', source.includes('<small role="status">Assignment saved.</small>')],
  ['success is hidden while request is active', source.includes('assignmentSaveStatus[item.key] === "saved" && !savingAssignments[item.key]')],
  ['assignment feedback is task scoped', source.includes('[taskKey]: "saved"')],
  ['error feedback still surfaced per task', source.includes('assignmentErrors[item.key]') && source.includes('setAssignmentErrors(previous => ({ ...previous, [taskKey]: e instanceof Error ? e.message : \"Unable to save task assignment.\" }))')],
];
let failures = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failures++; }
console.log(`${checks.length - failures}/${checks.length} passed`);
if (failures) process.exit(1);
