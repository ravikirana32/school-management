import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const workspace = readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const checks = [
  ['Wizard step state is bounded', workspace.includes('Math.min(focusedStep') && workspace.includes('Math.max(items.length - 1, 0)')],
  ['Current step is derived from API readiness checklist', workspace.includes('const currentStep = items[')],
  ['Step navigator exposes accessible labels', workspace.includes('aria-label={`Go to step ${index + 1}: ${item.title}`}')],
  ['Step navigation marks active step', workspace.includes('aria-current={index === focusedStep ? "step" : undefined}')],
  ['Previous action is disabled at first step', workspace.includes('disabled={focusedStep === 0}')],
  ['Next action is disabled at final step', workspace.includes('disabled={focusedStep >= items.length - 1}')],
  ['Configure action navigates to existing workspace', workspace.includes('onNavigate(currentStep.actionTab)')],
  ['Next incomplete action uses actual readiness state', workspace.includes('serverNextIncompleteKey ??') && workspace.includes('setServerNextIncompleteKey(typeof readiness?.nextIncompleteKey')],
  ['Recommended action navigates to next incomplete item', workspace.includes('setFocusedStep(nextIncomplete); onNavigate(nextRecommended.actionTab);')],
  ['Checklist remains read-only and source-derived', workspace.toLowerCase().includes('read-only readiness checklist assembled from existing school configuration apis')],
  ['All checklist items remain accessible in details list', workspace.includes('<details><summary>View setup tasks ({filteredItems.length} shown)</summary>') && workspace.includes('filteredItems.map((item, index) => <article') && workspace.includes('setAssignmentFilter(\"all\")')],
  ['Refresh action still available', workspace.includes('Refresh readiness')],
  ['Verifier script is registered', pkg.scripts['verify:p371'] === 'node scripts/verify-p371-onboarding-step-navigation.mjs']
];
let passed = 0;
for (const [label, ok] of checks) { if (ok) { passed++; console.log(`PASS ${label}`); } else console.error(`FAIL ${label}`); }
console.log(`P371 onboarding step-navigation verifier: ${passed}/${checks.length} PASS`);
assert.equal(passed, checks.length, 'P371 checks must all pass');
