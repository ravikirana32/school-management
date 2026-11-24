import fs from 'node:fs';
const p='apps/school-admin/src/FinanceWorkspace.tsx'; const s=fs.readFileSync(p,'utf8');
const checks=[
 ['history state',s.includes('paymentHistoryChargeId')],
 ['permission gate',s.includes("can('fees.payments.read')&&<div className=\"button-row\">")],
 ['toggle label',s.includes('View payment history')],
 ['payment amount',s.includes('payment.amount')],
 ['payment reference',s.includes('payment.reference')],
 ['receipt print action',s.includes('Print receipt')],
 ['print helper',s.includes('function printSchoolFeeReceipt')],
 ['HTML escaping',s.includes('replace(/[&<>\\\"\']/g')]
];
for (const [label,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
