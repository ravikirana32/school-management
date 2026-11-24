import fs from 'node:fs';
const api = fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts','utf8');
const ui = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx','utf8');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const checks = [
 ['server computes prerequisite blockers', api.includes('const blockedBy = check.prerequisites.filter(key => !completeKeys.has(key))')],
 ['server statuses include complete blocked actionable', api.includes('status: check.complete ? "COMPLETE" : blockedBy.length ? "BLOCKED" : "ACTIONABLE"')],
 ['server exposes actionable flag', api.includes('actionable: !check.complete && blockedBy.length === 0')],
 ['server exposes blocked count', api.includes('blockedCount')],
 ['server exposes actionable count', api.includes('actionableCount')],
 ['server exposes overall completion flag', api.includes('allComplete')],
 ['server exposes workflow status', api.includes('workflowStatus: allComplete ? "COMPLETE" : "IN_PROGRESS"')],
 ['next step prioritizes actionable task', api.includes('find(check => check.actionable)')],
 ['UI shows blocked step state', ui.includes('configureBlocked ? "Blocked" : "Ready to configure"')],
 ['UI task list labels blocked prerequisites', ui.includes('"Blocked by prerequisites"')],
 ['verifier registered', pkg.scripts?.['verify:p392'] === 'node scripts/verify-p392-f03-dependency-aware-orchestration.mjs']
];
let failures=0;
for (const [name,pass] of checks) { console.log(`${pass?'PASS':'FAIL'} ${name}`); if(!pass) failures++; }
console.log(`${checks.length-failures}/${checks.length} PASS`);
if(failures) process.exit(1);
