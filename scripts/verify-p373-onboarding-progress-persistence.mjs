import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const workspace = readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const checks = [
  ['Progress persistence key is scoped by org and school', workspace.includes('school-onboarding-step:v1:${org}:${school}')],
  ['Progress storage key is versioned', workspace.includes('school-onboarding-step:v1:')],
  ['Saved step is restored from local storage', workspace.includes('window.localStorage.getItem(progressKey)')],
  ['Restored progress accepts only non-negative integer indexes', workspace.includes('Number.isInteger(parsed) && parsed >= 0')],
  ['Progress restore is keyed to selected tenant context', workspace.includes('setRestoredProgressKey(progressKey)') && workspace.includes('[progressKey])')],
  ['Save is skipped until matching context has been restored', workspace.includes('restoredProgressKey !== progressKey')],
  ['Step index writes to local storage', workspace.includes('window.localStorage.setItem(progressKey, String(focusedStep))')],
  ['Storage errors do not crash wizard', workspace.includes('Storage may be unavailable; the wizard remains usable in memory.') && workspace.includes('Storage may be unavailable; progress remains in memory.')],
  ['Wizard continues to clamp progress when checklist length changes', workspace.includes('focusedStep >= items.length) setFocusedStep(items.length - 1)')],
  ['Stored value is only wizard position, not completion flags', !workspace.includes('localStorage.setItem(progressKey, JSON.stringify(items)')],
  ['Wizard completion still derives from API readiness', workspace.includes('const completeCount = useMemo(() => items.filter(item => item.complete).length')],
  ['P373 verifier is registered in package scripts', pkg.scripts['verify:p373'] === 'node scripts/verify-p373-onboarding-progress-persistence.mjs']
];
let passed = 0;
for (const [label, ok] of checks) { if (ok) { passed++; console.log(`PASS ${label}`); } else console.error(`FAIL ${label}`); }
console.log(`P373 onboarding progress persistence verifier: ${passed}/${checks.length} PASS`);
assert.equal(passed, checks.length, 'P373 checks must all pass');
