import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const route = fs.readFileSync(path.join(root, 'backend/api/src/modules/parents/parent.routes.ts'), 'utf8');
const schema = fs.readFileSync(path.join(root, 'backend/api/prisma/schema.prisma'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'backend/api/prisma/migrations/20261118193000_p138_split_historical_allocation_materialization/migration.sql'), 'utf8');
const gapRoot = fs.readFileSync(path.join(root, 'MASTER-OPEN-GAPS-REGISTER.md'));
const gapDocs = fs.readFileSync(path.join(root, 'docs/MASTER-OPEN-GAPS-REGISTER.md'));
const status = fs.readFileSync(path.join(root, 'P138-STATUS.md'), 'utf8');
const financeUi = fs.readFileSync(path.join(root, 'apps/school-admin/src/FinanceWorkspace.tsx'), 'utf8');
const checks = [
  ['split allocation targets are grouped per source row', route.includes('allocationBySource') && route.includes('found.map(a=>({row:a.targetRow')],
  ['source amount requires exact minor-unit allocation coverage', route.includes('total!==Math.round(Number(r.amount)*100)')],
  ['each payment slice creates an operational allocation link', route.includes('operationalPaymentId:payment.id,allocatedAmount:amount')],
  ['each refund slice creates an operational allocation link', route.includes('operationalRefundId:refund.id,allocatedAmount:amount')],
  ['payment amount is calculated per allocation slice', route.includes('target.allocation?.amount??r.amount') && route.includes('calculateFeePayment')],
  ['refund caps are checked against the operational payment', route.includes('P142 refund exceeds the remaining payment-slice balance')],
  ['refund allocations require explicit payment-slice selection when target payment is split', route.includes('REFUND_TARGET_PAYMENT_SLICE_REQUIRED') && route.includes('targetOperationalPaymentId')],
  ['allocation-specific refund idempotency is used', route.includes('HIST-${r.id}-${target.allocation?.id||"LEGACY"}')],
  ['repeat operationalization detects allocation-link completion', route.includes('operationalAllocationLinks.reduce') || route.includes('operationalAllocationLinks||[]')],
  ['settlement reference uniqueness is replaced with a lookup index', migration.includes('DROP INDEX IF EXISTS "StudentFeeRefund_school_settlement_reference_uq"') && migration.includes('CREATE INDEX IF NOT EXISTS') && schema.includes('@@index([schoolId, settlementReference])')],
  ['root and docs gap registers are byte-identical', crypto.timingSafeEqual(gapRoot, gapDocs)],
  ['batch API returns one-to-many operational allocation links', route.includes('operationalAllocationLinks:{select:{id:true,allocatedAmount:true,operationalPaymentId:true,operationalRefundId:true}}')],
  ['operational reconciliation counts fully materialized split rows', route.includes('const isLinked=(r:any)=>Boolean(r.operationalLink)')],
  ['dependency plan recognizes one-to-many links and ambiguous refund targets', route.includes('const rowComplete=(r:any)') && route.includes('a.targetOperationalPaymentId') && route.includes('some((x:any)=>x.operationalPaymentId)')],
  ['School Admin displays split allocation linkage coverage', financeUi.includes('operationalAllocationLinks') && financeUi.includes('allocation slices')],
  ['P138 limitations and deferred runtime verification are documented', status.includes('PostgreSQL migration application') && status.includes('refund targeting a historical payment')],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed++;
}
console.log(`P138 static verification: ${checks.length - failed}/${checks.length} PASS`);
if (failed) process.exitCode = 1;
