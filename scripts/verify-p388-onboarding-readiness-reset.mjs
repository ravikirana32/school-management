import fs from 'node:fs';
const source = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const checks = [
  ['load clears previous checklist state', /setItems\(\[\]\);\s*setLastUpdated\(null\);\s*setServerNextIncompleteKey\(null\);/.test(source)],
  ['missing session scope exits safely', /if \(!token \|\| !org \|\| !school\) \{ setLoading\(false\); setError\(""\); return; \}/.test(source)],
  ['readiness checklist is cleared before API requests', source.indexOf('setItems([]);') < source.indexOf('const readiness = await read("/readiness")')],
  ['loading state remains enabled for scoped refresh', /setLoading\(true\); setError\(""\);/.test(source)],
  ['readiness update still stamps refreshed time', /setLastUpdated\(new Date\(\)\)/.test(source)],
  ['failure path displays alert', /catch \(e\) \{\s*setError\(e instanceof Error/.test(source)],
  ['refresh button is disabled during refresh', /disabled=\{loading\} onClick=\{\(\) => void load\(\)\}/.test(source)],
  ["checklist empty/loading fallback is present", /!items\.length && !error && <p className="helper">Loading onboarding readiness…<\/p>/.test(source)],
];
let passed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (ok) passed++; }
console.log(`P388: ${passed}/${checks.length} checks passed`);
if (passed !== checks.length) process.exit(1);
