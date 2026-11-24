import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const route=fs.readFileSync(path.join(root,'backend/api/src/modules/parents/parent.routes.ts'),'utf8');
const schema=fs.readFileSync(path.join(root,'backend/api/prisma/schema.prisma'),'utf8');
const migration=fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261118200000_p140_refund_payment_slice_targets/migration.sql'),'utf8');
const ui=fs.readFileSync(path.join(root,'apps/school-admin/src/FinanceWorkspace.tsx'),'utf8');
const gaps=fs.readFileSync(path.join(root,'MASTER-OPEN-GAPS-REGISTER.md'),'utf8');
const docsGaps=fs.readFileSync(path.join(root,'docs/MASTER-OPEN-GAPS-REGISTER.md'),'utf8');
const checks=[
 ['allocation schema stores selected operational payment ID',schema.includes('targetOperationalPaymentId String?')],
 ['payment model exposes reverse refund-allocation relation',schema.includes('refundTargetAllocations AccountingHistoricalAllocation[] @relation("HistoricalRefundTargetPayment")')],
 ['selected payment relation is tenant scoped',schema.includes('fields: [targetOperationalPaymentId, organizationId, schoolId], references: [id, organizationId, schoolId]')],
 ['migration adds payment-slice column and composite tenant FK',migration.includes('ADD COLUMN "targetOperationalPaymentId" TEXT')&&migration.includes('FOREIGN KEY ("targetOperationalPaymentId", "organizationId", "schoolId")')],
 ['allocation API accepts optional payment-slice ID',route.includes('targetOperationalPaymentId:z.string().min(1).optional()')],
 ['allocation API validates selected ID belongs to target historical payment',route.includes('if(!paymentIds.includes(parsed.data.targetOperationalPaymentId))')],
 ['ambiguous split-payment refund requires explicit selection',route.includes('TARGET_PAYMENT_SLICE_REQUIRED')],
 ['single-slice target is inferred and persisted',route.includes('const inferredPaymentId=')&&route.includes('targetOperationalPaymentId:inferredPaymentId')],
 ['refund operationalization uses selected slice ID',route.includes('let paymentId:string|undefined=target.allocation?.targetOperationalPaymentId')],
 ['refund ceiling remains enforced per operational payment',route.includes('P142 refund exceeds the remaining payment-slice balance')],
 ['dependency plan recognizes explicitly selected slice',route.includes('Boolean(a.targetOperationalPaymentId||a.targetRow.operationalLink?.operationalPaymentId')],
 ['Finance UI accepts selected slice ID',ui.includes('Payment slice<select')&&ui.includes('targetOperationalPaymentId:e.target.value')],
 ['Finance UI exposes existing payment slice IDs',ui.includes('Payment slice for {row.sourceReference}')],
 ['P138 gap updated and P140 gap recorded as partial',gaps.includes('| P138-G002 |')&&gaps.includes('| PARTIALLY_IMPLEMENTED |')&&gaps.includes('P140-G001')],
 ['root/docs gap registers are identical',gaps===docsGaps],
 ['P140 docs exist',fs.existsSync(path.join(root,'P140-STATUS.md'))&&fs.existsSync(path.join(root,'docs/api/P140-REFUND-PAYMENT-SLICE-TARGETING.md'))],
];
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);assert.ok(ok,name);}
console.log(`P140 static verification: ${checks.length}/${checks.length} PASS`);
