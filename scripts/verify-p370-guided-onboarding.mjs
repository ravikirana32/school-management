import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const workspace = readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const main = readFileSync('apps/school-admin/src/main.tsx', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const checks = [
  ['Onboarding workspace uses authenticated school session', workspace.includes('useSchoolAdminSession')],
  ['Readiness is scoped to selected organization and school', workspace.includes('encodeURIComponent(org)') && workspace.includes('encodeURIComponent(school)')],
  ['Profile readiness is included in consolidated server checklist', workspace.includes('isComplete("profile")')],
  ['Academic year readiness is included in consolidated server checklist', workspace.includes('isComplete("academic-year")')],
  ['Term readiness is included in consolidated server checklist', workspace.includes('isComplete("terms")')],
  ['Calendar readiness is included in consolidated server checklist', workspace.includes('isComplete("calendar")')],
  ['Working-day readiness is included in consolidated server checklist', workspace.includes('isComplete("working-days")')],
  ['Attendance and grading policies are checklist items', workspace.includes('attendance-policy') && workspace.includes('grading-policy')],
  ['Checklist exposes configure/review navigation actions', workspace.includes('onNavigate(item.actionTab)')],
  ['Refresh control is guarded while loading', workspace.includes('disabled={loading} onClick={() => void load()}')],
  ['Onboarding tab requires school settings permission', main.includes('{ id: "onboarding", label: "Guided onboarding", permission: "school.settings.manage" }')],
  ['Onboarding tab mounts its workspace', main.includes('<OnboardingWorkspace onNavigate={next => setTab(next as Tab)} />')],
  ['Verifier is exposed by package script', pkg.scripts['verify:p370'] === 'node scripts/verify-p370-guided-onboarding.mjs']
];
let passed = 0;
for (const [label, ok] of checks) { if (ok) { passed++; console.log(`PASS ${label}`); } else console.error(`FAIL ${label}`); }
console.log(`P370 guided onboarding verifier: ${passed}/${checks.length} PASS`);
assert.equal(passed, checks.length, 'P370 verifier checks must all pass');
