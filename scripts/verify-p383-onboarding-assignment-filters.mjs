import fs from 'node:fs';
const source = fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx', 'utf8');
const checks = [
  ['filter mode is stateful and restricted to known modes', source.includes('useState<"all" | "mine" | "unassigned">')],
  ['current school member is resolved from signed-in email', source.includes('member.email.toLowerCase() === userEmail.toLowerCase()')],
  ['filtering uses assignment owner mapping', source.includes('const owner = assignmentMap[item.key] || ""')],
  ['mine filter requires a resolved member id', source.includes('Boolean(currentMemberId && owner === currentMemberId)')],
  ['unassigned filter identifies ownerless tasks', source.includes('if (assignmentFilter === "unassigned") return !owner')],
  ['filtering is memoized on relevant state', source.includes('[items, assignmentMap, assignmentFilter, currentMemberId]')],
  ['all tasks filter control is present', source.includes('setAssignmentFilter("all")')],
  ['assigned-to-me control is disabled if member mapping unavailable', source.includes('disabled={!currentMemberId}')],
  ['unassigned filter control is present', source.includes('setAssignmentFilter("unassigned")')],
  ['filtered task list is rendered', source.includes('filteredItems.map((item, index) => <article')],
  ['task numbering preserves original checklist positions', source.includes('items.findIndex(candidate => candidate.key === item.key) + 1')],
];
let failed = 0;
for (const [name, pass] of checks) { console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); if (!pass) failed++; }
console.log(`P383 verifier: ${checks.length - failed}/${checks.length} PASS`);
if (failed) process.exit(1);
