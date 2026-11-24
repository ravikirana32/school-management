import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const api=fs.readFileSync(path.join(root,'backend/api/src/modules/parents/parent.routes.ts'),'utf8');
const ui=fs.readFileSync(path.join(root,'apps/school-admin/src/FinanceWorkspace.tsx'),'utf8');
const gaps=fs.readFileSync(path.join(root,'MASTER-OPEN-GAPS-REGISTER.md'),'utf8');
const gapsDocs=fs.readFileSync(path.join(root,'docs/MASTER-OPEN-GAPS-REGISTER.md'),'utf8');
const docs=fs.readFileSync(path.join(root,'docs/api/P141-SEARCHABLE-REFUND-PAYMENT-SLICES.md'),'utf8');
const checks=[
 ['tenant-scoped reconciliation permission',/refund-payment-slices\/\:targetRowId[\s\S]{0,250}scope\(req,res,"accounting\.reconcile"\)/.test(api)],
 ['historical row constrained by organization and school',/id:req\.params\.targetRowId,organizationId:s\.organizationId,schoolId:s\.schoolId/.test(api)],
 ['posted payment row requirement',/target\.sourceType!=="PAYMENT"\|\|target\.batch\.status!=="POSTED"/.test(api)],
 ['slice IDs sourced only from target operational links',/target\.operationalLink\?\.operationalPaymentId[\s\S]{0,120}target\.operationalAllocationLinks/.test(api)],
 ['operational payments tenant and student constrained',/organizationId:s\.organizationId,schoolId:s\.schoolId,studentId:target\.studentId/.test(api)],
 ['search by ID, reference and method',/id:\{contains:q,mode:"insensitive"\}[\s\S]{0,180}reference:\{contains:q,mode:"insensitive"\}[\s\S]{0,180}method:\{contains:q,mode:"insensitive"\}/.test(api)],
 ['active refund states match existing refund cap policy',/status:\{in:\["REQUESTED","APPROVED_PENDING_SETTLEMENT","SETTLED"\]\}/.test(api)],
 ['integer minor-unit balance calculation',/Math\.round\(Number\(p\.amount\)\*100\)[\s\S]{0,250}Math\.round\(Number\(r\.amount\)\*100\)/.test(api)],
 ['bounded search result set',/take:100/.test(api)],
 ['single-slice inference preserved for UI',/totalSliceCount:ids.length/.test(api)&&/result\?\.totalSliceCount===1/.test(ui)],
 ['UI uses searchable lookup endpoint',/refund-payment-slices\//.test(ui)&&/Find refundable slices/.test(ui)],
 ['UI shows paid, refunded and available balances',ui.includes('Paid {slice.amount}')&&ui.includes('Refunded {slice.refunded}')&&ui.includes('Available {slice.availableRefundable}')],
 ['UI prevents selection of fully refunded slices',/disabled=\{Number\(slice\.availableRefundable\)<=0\}/.test(ui)],
 ['gap register copies identical',gaps===gapsDocs],
 ['P141 gap tracked as partially implemented',/P141-G001[\s\S]{0,600}PARTIALLY_IMPLEMENTED/.test(gaps)],
 ['API behavior documented',docs.includes('REQUESTED, APPROVED_PENDING_SETTLEMENT, SETTLED')],
];
for (const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
assert.ok(checks.every(([,ok])=>ok),`${checks.filter(([,ok])=>!ok).length} P141 checks failed`);
console.log(`P141 static verification: ${checks.length}/${checks.length} PASS`);
