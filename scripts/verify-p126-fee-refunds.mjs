import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = process.cwd();
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const routes = read('backend/api/src/modules/parents/parent.routes.ts');
const schema = read('backend/api/prisma/schema.prisma');
const migration = read('backend/api/prisma/migrations/20261118100000_p126_fee_refunds/migration.sql');
const seed = read('backend/api/prisma/seed.ts');
const gaps = read('MASTER-OPEN-GAPS-REGISTER.md');
const checks = [
  ['refund request endpoint', routes.includes("/fees/payments/:paymentId/refunds")],
  ['refund history endpoint', routes.includes("/fees/payments/:paymentId/refunds',authenticate")],
  ['separate approval endpoint', routes.includes("/fees/refunds/:refundId/approve")],
  ['rejection endpoint', routes.includes("/fees/refunds/:refundId/reject")],
  ['settlement evidence endpoint', routes.includes("/fees/refunds/:refundId/settle")],
  ['request permission', routes.includes("scope(req,res,'fees.refunds.request')")],
  ['approval permission', routes.includes("scope(req,res,'fees.refunds.approve')")],
  ['settlement permission', routes.includes("scope(req,res,'fees.refunds.settle')")],
  ['self-approval denied', routes.includes('refund.requestedBy===s.userId')],
  ['idempotency key required', routes.includes('refund-idempotency:${idempotencyKey}')],
  ['idempotency key bound to same payment', routes.includes('existing.paymentId!==req.params.paymentId')],
  ['payment amount reservation', routes.includes("status:{in:['REQUESTED','APPROVED_PENDING_SETTLEMENT','SETTLED']}")],
  ['settlement serializes payment and charge balance updates', routes.includes('payment-refund:${refund.paymentId}') && routes.includes(':fee:${refund.chargeId}')],
  ['external settlement reference required', routes.includes('settlementReference:z.string()')],
  ['refund schema model', schema.includes('model StudentFeeRefund {')],
  ['append-only event model', schema.includes('model StudentFeeRefundEvent {')],
  ['tenant RLS migration', migration.includes('FORCE ROW LEVEL SECURITY') && migration.includes("ARRAY['StudentFeeRefund','StudentFeeRefundEvent']")],
  ['database append-only trigger', migration.includes('StudentFeeRefundEvent_append_only') && migration.includes('BEFORE UPDATE OR DELETE') && migration.includes('StudentFeeRefundEvent_no_truncate')],
  ['payment status supports refunds', migration.includes("'PARTIALLY_REFUNDED'")],
  ['seeded distinct permissions', ['fees.refunds.request','fees.refunds.approve','fees.refunds.settle'].every(x=>seed.includes(x))],
  ['P126 gaps recorded', ['P126-G001','P126-G002','P126-G003'].every(x=>gaps.includes(x))],
  ['gap register mirror', gaps===read('docs/MASTER-OPEN-GAPS-REGISTER.md')],
  ['resolved history mirror', read('MASTER-RESOLVED-GAPS-HISTORY.md')===read('docs/MASTER-RESOLVED-GAPS-HISTORY.md')],
];
for (const [name,ok] of checks) { console.log(`${ok?'PASS':'FAIL'} ${name}`); assert.ok(ok,name); }
console.log(`P126 static verifier: ${checks.length}/${checks.length} PASS`);
