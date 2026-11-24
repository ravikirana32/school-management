import fs from 'node:fs';
const ui = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx','utf8');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const checks = [
 ['task rows show named prerequisite blockers', ui.includes('Blocked by: {item.prerequisites.filter(key => !items.find(candidate => candidate.key === key)?.complete).map(key => items.find(candidate => candidate.key === key)?.title ?? key).join(", ")}')],
 ['blocker detail is conditional on incomplete task', ui.includes('!item.complete && item.prerequisites.some(key => !items.find(candidate => candidate.key === key)?.complete)')],
 ['blocker detail uses accessible note semantics', ui.includes('className="helper" role="note">Blocked by:')],
 ['blockers derive from incomplete prerequisite states', ui.includes('item.prerequisites.filter(key => !items.find(candidate => candidate.key === key)?.complete)')],
 ['unknown prerequisite labels safely fall back to key', ui.includes('items.find(candidate => candidate.key === key)?.title ?? key')],
 ['existing assignment owner control retained', ui.includes('onboarding-owner-${item.key}')],
 ['task-level assignment save feedback retained', ui.includes('Assignment saved.')],
 ['P393 verifier registered', pkg.scripts?.['verify:p393'] === 'node scripts/verify-p393-f03-blocker-detail-display.mjs']
];
let failed=0;
for (const [label,pass] of checks) { console.log(`${pass?'PASS':'FAIL'} ${label}`); if(!pass) failed++; }
console.log(`${checks.length-failed}/${checks.length} PASS`);
if(failed) process.exit(1);
