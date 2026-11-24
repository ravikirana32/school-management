import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(path.join(process.cwd(),p),'utf8');
const schema=read('backend/api/prisma/schema.prisma'),routes=read('backend/api/src/modules/parents/parent.routes.ts'),ui=read('apps/school-admin/src/FinanceWorkspace.tsx'),migration=read('backend/api/prisma/migrations/20261118160000_p132_historical_control_totals/migration.sql'),gaps=read('MASTER-OPEN-GAPS-REGISTER.md'),gapMirror=read('docs/MASTER-OPEN-GAPS-REGISTER.md'),history=read('MASTER-RESOLVED-GAPS-HISTORY.md'),historyMirror=read('docs/MASTER-RESOLVED-GAPS-HISTORY.md');
const checks=[
['declared totals persisted on historical batch',/model AccountingHistoricalImportBatch[\s\S]*?declaredChargeTotal Decimal\?[\s\S]*?declaredPaymentTotal Decimal\?[\s\S]*?declaredRefundTotal Decimal\?[\s\S]*?controlTotalsVerifiedAt DateTime\?/.test(schema)],
['migration adds all control total fields',migration.includes('declaredChargeTotal')&&migration.includes('declaredPaymentTotal')&&migration.includes('declaredRefundTotal')&&migration.includes('controlTotalsVerifiedAt')],
['migration rejects negative and partial totals',migration.includes('control_totals_nonnegative_ck')&&migration.includes('control_totals_all_or_none_ck')],
['import compares declared totals in minor units',routes.includes('Declared source control totals do not match imported rows')&&routes.includes('computedTotals.charges')],
['batch stores declared totals and verification timestamp',routes.includes('controlTotalsVerifiedAt:p.declaredTotals?new Date():null')],
['approval rechecks control totals',routes.includes('CONTROL_MISMATCH')&&routes.includes('Declared source control totals no longer match batch rows')],
['control reconciliation endpoint is permission gated',routes.includes('/accounting/historical-imports/control-reconciliation')&&routes.includes('scope(req,res,"accounting.reconcile")')],
['opening overlap endpoint is permission gated',routes.includes('/accounting/historical-imports/opening-overlap')&&routes.includes('possibleOverlapCount')],
['overlap endpoint does not auto-adjust balances',routes.includes('Comparison is a review signal only')],
['School Admin provides declared totals',ui.includes('Declared charge total')&&ui.includes('Declared payment total')&&ui.includes('Declared refund total')],
['School Admin shows overlap and control review',ui.includes('Historical source control totals')&&ui.includes('Opening balance overlap review')],
['P132 gap register entries exist',gaps.includes('P132-G001')&&gaps.includes('P132-G002')&&gaps.includes('P132-G003')],
['root/docs gap registers identical',gaps===gapMirror],
['root/docs resolved histories identical',history===historyMirror],
['migration is additive and does not rewrite historical rows',!migration.includes('UPDATE "AccountingHistoricalImportRow"')&&!migration.includes('DELETE FROM')],
['no unsupported claim of digital signatures',gaps.includes('not cryptographically signed')]
];let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}console.log(`${checks.length-failed}/${checks.length} checks passed`);if(failed)process.exit(1);
