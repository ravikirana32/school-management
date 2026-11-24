import fs from 'node:fs';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const routes=fs.readFileSync('backend/api/src/modules/library/library.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/LibraryWorkspace.tsx','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261124210000_p553_library_borrower_policies/migration.sql','utf8');
const checks=[
['Borrower policy model exists',schema.includes('model LibraryBorrowerPolicy {')],
['Policy school/tenant scope present',schema.includes('@@unique([organizationId, schoolId, borrowerType])')],
['Loan-day policy configured',schema.includes('loanDays Int @default(14)')],
['Maximum active-loan limit configured',schema.includes('maxActiveLoans Int @default(3)')],
['Renewal limit configured',schema.includes('maxRenewals Int @default(1)')],
['Renewal duration configured',schema.includes('renewalDays Int @default(7)')],
['Overdue fine policy configured',schema.includes('overdueFinePerDay Decimal @default(0)')],
['Overdue renewal policy configured',schema.includes('allowRenewOverdue Boolean @default(false)')],
['Loan renewal counter exists',schema.includes('renewalCount Int @default(0)')],
['Policy GET endpoint exists',routes.includes('base+"/borrower-policies"')],
['Policy update endpoint exists',routes.includes('base+"/borrower-policies/:borrowerType"')],
['Policy borrower category validated',routes.includes('["STUDENT","STAFF"].includes(borrowerType)')],
['Policy loan days bounded',routes.includes('loanDays:z.number().int().min(1).max(365)')],
['Policy active-loan cap bounded',routes.includes('maxActiveLoans:z.number().int().min(1).max(100)')],
['Policy renewals bounded',routes.includes('maxRenewals:z.number().int().min(0).max(20)')],
['Issue endpoint counts active loans',routes.includes('libraryLoan.count({where:{organizationId:s.organizationId,schoolId:s.schoolId,borrowerId:p.data.borrowerId,borrowerType:p.data.borrowerType,returnedAt:null}})')],
['Issue endpoint enforces active-loan limit',routes.includes('if(active>=maxActive)')],
['Issue due date defaults from policy',routes.includes('Date.now()+loanDays*86400000')],
['Explicit due date is capped to configured loan period',routes.includes('requestedDueAt>policyDueAt')],
['Return computes overdue fine from borrower policy',routes.includes('const autoFine=overdueDays*rate')],
['Fine override supported on return',routes.includes('p.data.fineAmount??(autoFine>0?autoFine:Number(loan.fineAmount))')],
['Renew endpoint exists',routes.includes('base+"/loans/:loanId/renew"')],
['Renewal cap enforced',routes.includes('loan.renewalCount>=maxRenewals')],
['Overdue renewals policy enforced',routes.includes('!allowOverdue&&loan.dueAt<new Date()')],
['Renewal increments counter',routes.includes('renewalCount:{increment:1}')],
['Migration adds renewal count',migration.includes('ADD COLUMN IF NOT EXISTS "renewalCount"')],
['Migration creates borrower policy table',migration.includes('CREATE TABLE IF NOT EXISTS "LibraryBorrowerPolicy"')],
['Migration unique index tenant/school/category',migration.includes('LibraryBorrowerPolicy_organizationId_schoolId_borrowerType_key')],
['Admin loads policies',ui.includes("request('/borrower-policies')")],
['Admin saves policy',ui.includes("method:'PUT'")],
['Admin policy editor includes loan days',ui.includes('Loan days')],
['Admin policy editor includes max active loans',ui.includes('Max active')],
['Admin policy editor includes renewals',ui.includes('Max renewals')],
['Admin policy editor includes overdue toggle',ui.includes('Renew overdue')],
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}console.log(`P553 focused verification: ${checks.length-fail}/${checks.length} PASS`);if(fail)process.exit(1);
