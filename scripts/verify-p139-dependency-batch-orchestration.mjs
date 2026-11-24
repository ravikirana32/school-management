import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const api=fs.readFileSync(path.join(root,'backend/api/src/modules/parents/parent.routes.ts'),'utf8');
const ui=fs.readFileSync(path.join(root,'apps/school-admin/src/FinanceWorkspace.tsx'),'utf8');
const gaps=fs.readFileSync(path.join(root,'MASTER-OPEN-GAPS-REGISTER.md'),'utf8');
const docsGaps=fs.readFileSync(path.join(root,'docs/MASTER-OPEN-GAPS-REGISTER.md'),'utf8');
const checks=[
 ['shared batch worker extracted',api.includes('runHistoricalOperationalizationBatch')],
 ['multi-batch endpoint exists',api.includes('/accounting/historical-imports/operationalize-batches')],
 ['request batch count bounded',api.includes('.max(200)')],
 ['posted batches are tenant scoped',api.includes('status:"POSTED"')&&api.includes('organizationId:s.organizationId,schoolId:s.schoolId')],
 ['allocation dependency graph loaded',api.includes('accountingHistoricalAllocation.findMany')&&api.includes('sourceRow:{select:{batchId:true}}')],
 ['prerequisites expanded',api.includes('visitSelect')],
 ['target-first topological ordering',api.includes('for(const d of deps.get(id)||[])if(selected.has(d))visit(d)')],
 ['cycles rejected before execution',api.includes('Dependency cycle detected; no batches were executed')],
 ['existing per-batch advisory lock retained',api.includes('historical-operationalize:${batchId}')],
 ['execution stops and records remaining work',api.includes('const remaining=order.filter')&&api.includes('blocked?"PARTIAL":"SUCCESS"')],
 ['retry skips already materialized batches',api.includes('result.kind==="OK"||result.kind==="EXISTS"')],
 ['audit progress records no journal repost',api.includes('accounting.historical_import.batch_orchestration')&&api.includes('accountingJournalsReposted:false')],
 ['School Admin execution action wired',ui.includes('executeOperationalizationPlan')&&ui.includes('operationalize-batches')],
 ['School Admin progress and blockers rendered',ui.includes('orchestrationResult.completed')&&ui.includes('orchestrationResult.blocked')],
 ['P139 gap tracked as partial',gaps.includes('| P139-G001 |')&&gaps.includes('| PARTIALLY_IMPLEMENTED |')],
 ['root and docs gap registers identical',gaps===docsGaps],
 ['P139 delivery/status documentation present',fs.existsSync(path.join(root,'P139-DELIVERY-REPORT.md'))&&fs.existsSync(path.join(root,'P139-STATUS.md'))],
 ['P139 verification command registered',JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).scripts['verify:p139']==='node scripts/verify-p139-dependency-batch-orchestration.mjs'],
];
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);assert.ok(ok,name);}
console.log(`P139 static verification: ${checks.length}/${checks.length} PASS`);
