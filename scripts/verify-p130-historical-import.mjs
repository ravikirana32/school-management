import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const schema=read('backend/api/prisma/schema.prisma');
const migration=read('backend/api/prisma/migrations/20261118140000_p130_historical_fee_import/migration.sql');
const routes=read('backend/api/src/modules/parents/parent.routes.ts');
const ui=read('apps/school-admin/src/FinanceWorkspace.tsx');
const seed=read('backend/api/prisma/seed.ts');
const gap=read('MASTER-OPEN-GAPS-REGISTER.md');
const docs=read('docs/MASTER-OPEN-GAPS-REGISTER.md');
const checks=[
 ['batch and row Prisma models',schema.includes('model AccountingHistoricalImportBatch')&&schema.includes('model AccountingHistoricalImportRow')],
 ['student composite tenant relation',schema.includes('student Student @relation(fields: [studentId, organizationId, schoolId]')],
 ['source type and positive amount constraints',migration.includes('AccountingHistoricalImportRow_type_ck')&&migration.includes('"amount" > 0')],
 ['school-wide source reference uniqueness',schema.includes('@@unique([schoolId, sourceType, sourceReference])')&&migration.includes('UNIQUE (\"schoolId\",\"sourceType\",\"sourceReference\")')&&routes.includes('historical-import-source-references')&&routes.includes('DUPLICATE_SOURCE')],
 ['refund external settlement evidence constraint',migration.includes('externalSettlementReference')&&migration.includes("\"sourceType\" <> 'REFUND' OR NULLIF")],
 ['forced tenant RLS policies',migration.includes('ENABLE ROW LEVEL SECURITY')&&migration.includes('FORCE ROW LEVEL SECURITY')&&migration.includes('current_setting')],
 ['draft-only and approval transition triggers',migration.includes('guard_historical_import_row')&&migration.includes('guard_historical_import_batch')],
 ['database approval requires non-empty batch and preserves approval evidence',migration.includes('row_count=0')&&migration.includes('NEW.\"approvalNote\" IS DISTINCT FROM OLD.\"approvalNote\"')],
 ['create/list/approve/post APIs',routes.includes('/accounting/historical-imports')&&routes.includes('/approve')&&routes.includes('/post')],
 ['independent approval check',routes.includes('b.createdBy===s.userId')],
 ['transactional original-date journal posting',routes.includes('postingDate:r.originalTransactionDate')&&routes.includes('HISTORICAL_CHARGE')&&routes.includes('HISTORICAL_PAYMENT')&&routes.includes('HISTORICAL_REFUND')],
 ['refund evidence required in API',routes.includes('Historical refunds require external settlement evidence')],
 ['student/currency reconstruction endpoint',routes.includes('/accounting/historical-imports/reconciliation')&&routes.includes('netReceivable')],
 ['finance workspace import and approval actions',ui.includes('createHistoricalImport')&&ui.includes('approveHistoricalImport')&&ui.includes('postHistoricalImport')],
 ['finance approval permission catalogue and role',seed.includes('accounting.historical-import.approve')],
 ['P130 gaps retained in identical master registers',gap.includes('P130-G001')&&gap.includes('P130-G002')&&gap.includes('P130-G003')&&gap===docs],
 ['P130 documentation present',fs.existsSync(path.join(root,'P130-STATUS.md'))&&fs.existsSync(path.join(root,'P130-DELIVERY-REPORT.md'))&&fs.existsSync(path.join(root,'docs/api/P130-HISTORICAL-FEE-TRANSACTION-MIGRATION.md'))]
];
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
console.log(`P130 verifier: ${checks.filter(x=>x[1]).length}/${checks.length} PASS`);
if(checks.some(x=>!x[1])) process.exit(1);
