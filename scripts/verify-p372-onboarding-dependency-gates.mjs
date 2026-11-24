import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const workspace = readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const checks = [
  ['Checklist entries declare prerequisite keys', workspace.includes('prerequisites: string[]') && workspace.includes('const prerequisites = (key: string, fallback: string[])')],
  ['Academic year requires school profile', workspace.includes('prerequisites("academic-year", ["profile"])')],
  ['Terms require active academic year', workspace.includes('prerequisites("terms", ["academic-year"])')],
  ['Default calendar requires profile and academic year', workspace.includes('prerequisites("calendar", ["profile", "academic-year"])')],
  ['Working days require school profile', workspace.includes('prerequisites("working-days", ["profile"])')],
  ['Attendance policy requires profile and academic year', workspace.includes('prerequisites("attendance-policy", ["profile", "academic-year"])')],
  ['Grading policy requires profile, academic year and grade levels', workspace.includes('prerequisites("grading-policy", ["profile", "academic-year", "grade-levels"])')],
  ['Board profile prerequisite requires school profile', workspace.includes('prerequisites("board-profile", ["profile"])')],
  ['Grade levels require board profile', workspace.includes('prerequisites("grade-levels", ["board-profile"])')],
  ['Rooms require profile and grade levels', workspace.includes('prerequisites("rooms", ["profile", "grade-levels"])')],
  ['Fee structures require active year and grade levels', workspace.includes('prerequisites("fee-structures", ["academic-year", "grade-levels"])')],
  ['Current step prerequisite state is computed from readiness', workspace.includes('const unmetPrerequisites = currentStep ? currentStep.prerequisites.filter(key => !items.find(item => item.key === key)?.complete) : [];')],
  ['Configure action is blocked while prerequisites are unmet', workspace.includes('disabled={configureBlocked}')],
  ['Blocked state has accessible explanatory note', workspace.includes('onboarding-prerequisite-note') && workspace.includes('Complete prerequisites first:')],
  ['All-steps Configure buttons enforce prerequisite gate', workspace.includes('disabled={item.prerequisites.some(key => !items.find(candidate => candidate.key === key)?.complete)}')],
  ['Wizard navigation itself remains available for review', workspace.includes('onClick={() => setFocusedStep(index)}')],
  ['No navigation action mutates completion state', !workspace.includes('setItems(old => old.map(item => item.key === currentStep.key ? { ...item, complete: true')],
  ['P372 verifier is registered in package scripts', pkg.scripts['verify:p372'] === 'node scripts/verify-p372-onboarding-dependency-gates.mjs']
];
let passed = 0;
for (const [label, ok] of checks) { if (ok) { passed++; console.log(`PASS ${label}`); } else console.error(`FAIL ${label}`); }
console.log(`P372 onboarding dependency-gate verifier: ${passed}/${checks.length} PASS`);
assert.equal(passed, checks.length, 'P372 checks must all pass');
