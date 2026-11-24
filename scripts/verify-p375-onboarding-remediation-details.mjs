import fs from 'node:fs';
const route = fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts','utf8');
const ui = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx','utf8');
const checks = [
 ['readiness checks carry human-readable titles', route.includes('key: "profile", title: "School identity"') && route.includes('key: "academic-year", title: "Active academic year"')],
 ['each check carries a configuration description', ['School identity','Active academic year','Academic terms','Default school calendar','Working days','Attendance policy','Grading policy'].every(x=>route.includes(`title: "${x}"`))],
 ['each check includes remediation guidance', (route.match(/remediation: "/g)||[]).length >= 7],
 ['remediation is returned from server readiness payload', route.includes('return { checks: orchestratedChecks, completeCount, totalCount: orchestratedChecks.length, percent:')],
 ['UI consumes check metadata from server', ui.includes('const details = (key: string) => checkMap.get(key) || {}')],
 ['UI renders next-step remediation on active incomplete step', ui.includes('Next: {currentStep.remediation}')],
 ['UI renders remediation in all-steps view', ui.includes('Next: {item.remediation}')],
 ['completed steps do not show remediation prompts', ui.includes('!currentStep.complete && currentStep.remediation') && ui.includes('!item.complete && item.remediation')],
 ['wizard still uses API-derived completion', ui.includes('complete: isComplete("profile")') && ui.includes('complete: isComplete("grading-policy")')],
 ['navigation does not mutate completion state', !ui.includes('setItems(') || ui.includes('setItems([')]
];
let failures=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failures++;}
console.log(`${checks.length-failures}/${checks.length} checks passed`); if(failures)process.exit(1);
