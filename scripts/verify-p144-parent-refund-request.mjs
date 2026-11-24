import fs from 'node:fs';
const api=fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8');
const mobile=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const checks=[
 ['P144 parent request route',api.includes("portal/children/:studentId/fees/payments/:paymentId/refunds")],
 ['parent permission/consent scope',api.includes("parentScope(userId,organizationId,schoolId,'parent.fees.read')")],
 ['guardian-student link validation',api.includes('parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId)')],
 ['payment ownership validation',api.includes('studentId:req.params.studentId,status:{in:[\'RECORDED\',\'PARTIALLY_REFUNDED\']}')],
 ['idempotency header',api.includes("req.get('idempotency-key')")],
 ['refund capacity aggregation',api.includes('studentFeeRefund.aggregate')],
 ['transaction lock',api.includes('parent-refund:${key}')],
 ['audit event',api.includes('student.fee.refund.parent_requested')],
 ['mobile request control',mobile.includes('Request refund')],
 ['mobile request form',mobile.includes('Submit refund request')],
 ['offline block',mobile.includes('disabled={busy||offlineSession}')],
 ['timeline refresh',mobile.includes('await loadParentDetails(activeChild)')],
 ['root/docs gap register parity',fs.readFileSync('MASTER-OPEN-GAPS-REGISTER.md','utf8')===fs.readFileSync('docs/MASTER-OPEN-GAPS-REGISTER.md','utf8')],
];
for(const [name,pass] of checks) console.log(`${pass?'PASS':'FAIL'} ${name}`);
if(checks.some(([,p])=>!p))process.exitCode=1;
