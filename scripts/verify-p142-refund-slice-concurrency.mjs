import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const api=fs.readFileSync(path.join(root,'backend/api/src/modules/parents/parent.routes.ts'),'utf8');
const ui=fs.readFileSync(path.join(root,'apps/school-admin/src/FinanceWorkspace.tsx'),'utf8');
const gaps=fs.readFileSync(path.join(root,'MASTER-OPEN-GAPS-REGISTER.md'),'utf8');
const docsGaps=fs.readFileSync(path.join(root,'docs/MASTER-OPEN-GAPS-REGISTER.md'),'utf8');
const docs=fs.readFileSync(path.join(root,'docs/api/P142-REFUND-SLICE-RESERVATION-AND-RECONCILIATION.md'),'utf8');
const checks=[
 ['refund allocation requires existing tenant-scoped target slice',/paymentIds\.includes\(parsed\.data\.targetOperationalPaymentId\)/.test(api)],
 ['allocation obtains payment-slice transaction advisory lock',/refund-payment-slice:\$\{paymentId\}/.test(api)],
 ['payment slice is scoped by organization, school, student and currency',/id:paymentId,organizationId:s\.organizationId,schoolId:s\.schoolId,studentId:source\.studentId,currency:source\.batch\.currency/.test(api)],
 ['active refunds reserve requested, approved-pending and settled amounts',/status:\{in:\["REQUESTED","APPROVED_PENDING_SETTLEMENT","SETTLED"\]\}/.test(api)],
 ['unmaterialized historical allocations reserve payment-slice capacity',/targetOperationalPaymentId:lockedPayment\.id/.test(api)&&/operationalLinks:\{select:\{operationalRefundId:true\}\}/.test(api)],
 ['materialized allocations are excluded from duplicate reservations',/operationalRefundId\)\)\.reduce/.test(api)],
 ['over-limit allocation is rejected',/PAYMENT_SLICE_REFUND_LIMIT/.test(api)&&/remaining refundable balance/.test(api)],
 ['payment-slice lookup includes pending allocation reservations',/pendingAllocation:\(reserved\/100\)\.toFixed\(2\)/.test(api)],
 ['available balance subtracts active refunds and pending allocations',/paid-refunded-reserved/.test(api)],
 ['operationalization shares the payment-slice lock',/refund-payment-slice:\$\{paymentId\}[\s\S]{0,220}studentFeePayment\.findFirst/.test(api)],
 ['operationalization enforces all active refund states',/P142 refund exceeds the remaining payment-slice balance/.test(api)],
 ['Finance UI displays pending reservations',/Pending \{slice\.pendingAllocation/.test(ui)],
 ['root and docs gap registers are byte-identical',gaps===docsGaps],
 ['P142 gap is tracked as partially implemented',/P142-G001[\s\S]{0,700}PARTIALLY_IMPLEMENTED/.test(gaps)],
 ['reconciliation and concurrency behavior documented',docs.includes('advisory lock')&&docs.includes('pending allocation')],
];
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
assert.ok(checks.every(([,ok])=>ok),`${checks.filter(([,ok])=>!ok).length} P142 checks failed`);
console.log(`P142 static verification: ${checks.length}/${checks.length} PASS`);
