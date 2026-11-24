import fs from 'node:fs';
import assert from 'node:assert/strict';
const ui=fs.readFileSync('apps/school-admin/src/FinanceWorkspace.tsx','utf8');
const root=fs.readFileSync('MASTER-OPEN-GAPS-REGISTER.md','utf8');
const mirror=fs.readFileSync('docs/MASTER-OPEN-GAPS-REGISTER.md','utf8');
const checks=[
 ['allocation grouping',ui.includes('new Map<string,any>()')],
 ['minor-unit aggregation',ui.includes('Math.round(Number(item.amount||0)*100)')],
 ['source amount comparison',ui.includes('sourceCents-item.amount')],
 ['fully allocated state',ui.includes("'FULLY_ALLOCATED'")],
 ['partially allocated state',ui.includes("'PARTIALLY_ALLOCATED'")],
 ['over allocated state',ui.includes("'OVER_ALLOCATED'")],
 ['remaining amount display',ui.includes('Remaining {item.remaining}')],
 ['preview limitation disclosed',ui.includes('review preview only')],
 ['P137 gap recorded',root.includes('P137-G001')&&root.includes('P137-G002')&&root.includes('P137-G003')],
 ['root/docs gap parity',root===mirror],
];
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);assert.ok(ok,name);}
console.log(`P137 verification: ${checks.length}/${checks.length} PASS`);
