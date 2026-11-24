import fs from 'node:fs';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const routes=fs.readFileSync('backend/api/src/modules/library/library.routes.ts','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261124240000_p555_library_fine_ledger_and_renewal_rules/migration.sql','utf8');
const checks=[
['fine ledger model',schema.includes('model LibraryFineLedgerEntry')],
['ledger tenant fields',/organizationId String[\s\S]*schoolId String/.test(schema.slice(schema.indexOf('model LibraryFineLedgerEntry'),schema.indexOf('model LibraryReservation')))],
['ledger amount decimal',schema.includes('amount Decimal @db.Decimal(10,2)')],
['ledger types documented',schema.includes('ACC RUED')||schema.includes('ACCRUED, ADJUSTMENT, SETTLEMENT')],
['renewal checks active hold',routes.includes('pendingHold=await tx.libraryReservation.findFirst')],
['renewal blocked on hold',routes.includes('Renewal blocked: another borrower is waiting for this title')],
['renewal limits preserved',routes.includes('Renewal limit reached')],
['overdue renew policy retained',routes.includes('Overdue loan cannot be renewed under current policy')],
['ledger list endpoint',routes.includes('/fine-ledger')],
['ledger balances aggregated',routes.includes('groupBy({by:[\"borrowerId\"]')],
['fine accrual recorded on return',routes.includes('type:\"ACCRUED\"')],
['adjustment endpoint',routes.includes('/adjust')],
['adjustment reason required',routes.includes('reason:z.string().trim().min(3)')],
['adjustment signed value',routes.includes('amount:z.number().finite().min(-100000)')],
['settlement endpoint',routes.includes('/settle')],
['settlement amount positive',routes.includes('amount:z.number().positive()')],
['settlement cannot exceed balance',routes.includes('Settlement exceeds outstanding balance')],
['settlement stores negative ledger amount',routes.includes('amount:-p.data.amount')],
['settlement reference persisted',schema.includes('paymentReference String?')],
['tenant scope applied to fine routes',routes.includes('scope(req,res,\"library.manage\")')],
['migration creates ledger table',migration.includes('CREATE TABLE `LibraryFineLedgerEntry`')],
['migration includes borrower index',migration.includes('borrowerId`,`createdAt')],
['migration includes loan/type index',migration.includes('loanId`,`type')],
];
let fail=0; for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+' '+name);if(!ok)fail++;} console.log(`${checks.length-fail}/${checks.length} PASS`);process.exit(fail?1:0);
