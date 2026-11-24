import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const schema=read('backend/api/prisma/schema.prisma');
const routes=read('backend/api/src/modules/parents/parent.routes.ts');
const seed=read('backend/api/prisma/seed.ts');
const ui=read('apps/school-admin/src/FinanceWorkspace.tsx');
const migration=read('backend/api/prisma/migrations/20261118150000_p131_historical_operational_fee_linkage/migration.sql');
const gaps=read('MASTER-OPEN-GAPS-REGISTER.md');
const gapRows=gaps.split('\n').filter(line=>line.startsWith('| P')).map(line=>line.split('|').map(x=>x.trim()).filter(Boolean)).filter(cols=>cols.length>=4&&['OPEN','IN_PROGRESS','PARTIALLY_IMPLEMENTED','READY_FOR_VERIFICATION','BLOCKED_EXTERNAL','CLOSED'].includes(cols[2]));
const gapCounts=Object.fromEntries(['OPEN','IN_PROGRESS','PARTIALLY_IMPLEMENTED','READY_FOR_VERIFICATION','BLOCKED_EXTERNAL','CLOSED'].map(status=>[status,gapRows.filter(cols=>cols[2]===status).length]));
const checks=[
 ['historical payment charge source field',schema.includes('relatedChargeSourceReference String? @db.VarChar(120)')],
 ['historical refund payment source field',schema.includes('relatedPaymentSourceReference String? @db.VarChar(120)')],
 ['operational link model',schema.includes('model AccountingHistoricalOperationalLink')&&schema.includes('operationalCharge StudentFeeCharge')&&schema.includes('operationalPayment StudentFeePayment?')&&schema.includes('operationalRefund StudentFeeRefund?')],
 ['composite historical row relation',schema.includes('references: [id, organizationId, schoolId], onDelete: Restrict')],
 ['migration adds explicit source links',migration.includes('relatedChargeSourceReference')&&migration.includes('relatedPaymentSourceReference')],
 ['migration aligns StudentFeeCharge approvalStatus column',migration.includes('ADD COLUMN IF NOT EXISTS \"approvalStatus\"')&&migration.includes('StudentFeeCharge_approval_status_ck')],
 ['migration creates append-only link table',migration.includes('CREATE TABLE "AccountingHistoricalOperationalLink"')&&migration.includes('AccountingHistoricalOperationalLink_append_only')&&migration.includes('AccountingHistoricalOperationalLink_validate')&&migration.includes('validate_historical_operational_link')],
 ['migration forced RLS',migration.includes('FORCE ROW LEVEL SECURITY')],
 ['migration tenant composite foreign keys',migration.includes('AccountingHistoricalOperationalLink_charge_fk')&&migration.includes('AccountingHistoricalOperationalLink_payment_fk')&&migration.includes('AccountingHistoricalOperationalLink_refund_fk')],
 ['payment import requires charge source reference',routes.includes('Historical payments require relatedChargeSourceReference')],
 ['refund import requires payment source reference',routes.includes('Historical refunds require external settlement evidence and relatedPaymentSourceReference')],
 ['operationalization requires dedicated permission',routes.includes('scope(req,res,"accounting.historical-operationalize")')],
 ['operationalization only accepts posted batch',routes.includes('if(batch.status!=="POSTED")return {kind:"CONFLICT"')],
 ['payment allocation preflight',routes.includes('chargeTotals.set(target.row.id')&&routes.includes('OVERPAYMENT')&&routes.includes('DATE_ORDER')],
 ['refund allocation preflight',routes.includes('paymentTotals.set(target.row.id')&&routes.includes('REFUND_OVERPAYMENT')],
 ['duplicate charge/settlement reference preflight',routes.includes('chargeCodeKeys.has(key)')&&routes.includes('SETTLEMENT_REFERENCE')],
 ['operational charge creation',routes.includes('tx.studentFeeCharge.create')&&routes.includes('category:"HISTORICAL"')],
 ['operational payment creation',routes.includes('tx.studentFeePayment.create')],
 ['settled refund and event creation',routes.includes('tx.studentFeeRefund.create')&&routes.includes('tx.studentFeeRefundEvent.create')],
 ['historical journals are not reposted',routes.includes('accountingJournalsReposted:false')],
 ['operational linkage reconciliation API',routes.includes('/accounting/historical-imports/operational-reconciliation')],
 ['finance officer operationalization permission',seed.includes('accounting.historical-operationalize')],
 ['School Admin Finance operationalization action',ui.includes('operationalizeHistoricalImport')&&ui.includes('Create operational fee records')],
 ['P130-G002 updated and P131 gaps retained',gaps.includes('| P130-G002 |')&&gaps.includes('| P131-G001 |')&&gaps.includes('| P131-G003 |')],
 ['audited current cumulative gap rows and status totals',gapRows.length>=650&&Object.values(gapCounts).reduce((sum,count)=>sum+count,0)===gapRows.length&&gapCounts.OPEN>0&&gapCounts.PARTIALLY_IMPLEMENTED>0&&gapCounts.READY_FOR_VERIFICATION>0&&gapCounts.BLOCKED_EXTERNAL>0&&gapCounts.IN_PROGRESS>0],
 ['root/docs gap register parity',read('MASTER-OPEN-GAPS-REGISTER.md')===read('docs/MASTER-OPEN-GAPS-REGISTER.md')],
 ['resolved history parity',read('MASTER-RESOLVED-GAPS-HISTORY.md')===read('docs/MASTER-RESOLVED-GAPS-HISTORY.md')],
];
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);assert.ok(ok,name);}
console.log(`P131 static verifier: ${checks.length}/${checks.length} PASS`);
