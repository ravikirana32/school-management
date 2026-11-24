import { readFileSync } from 'node:fs';
const root=process.cwd();
const ui=readFileSync(`${root}/apps/school-admin/src/LibraryWorkspace.tsx`,'utf8');
const api=readFileSync(`${root}/backend/api/src/modules/library/library.routes.ts`,'utf8');
const checks=[
['Fine ledger UI section',ui.includes('Fine ledger, borrower balances & receipts')],
['Fine ledger refresh handler',ui.includes('loadFineLedger')],
['Borrower search control',ui.includes('Search borrower / fine / reference')],
['Borrower balances rendered',ui.includes('Borrower balances (')],
['Borrower balance selected display',ui.includes('Selected borrower outstanding')],
['Ledger entries rendered',ui.includes('Ledger entries (')],
['Adjustment amount input',ui.includes('Adjustment (+charge / -waiver)')],
['Mandatory adjustment reason UI',ui.includes('Mandatory adjustment reason')],
['Adjustment handler posts API',ui.includes("'/fine-ledger'") && ui.includes('adjustFine')],
['Adjustment sends borrower type',ui.includes('borrowerType:fineBorrowerType')],
['Settlement amount input',ui.includes('Settlement amount')],
['Settlement method options',ui.includes('CARD')&&ui.includes('ONLINE')&&ui.includes('CASH')],
['Optional payment reference',ui.includes('Payment reference (optional)')],
['Settlement disables over-balance amount',ui.includes('Number(fineSettlement)>selectedBalance')],
['Settlement handler',ui.includes('settleFine')],
['Receipt detail view',ui.includes('Library Fine Receipt / Ledger Detail')],
['Receipt entry ID shown',ui.includes('Receipt/Entry ID:')],
['Receipt amount displayed',ui.includes('Number(receiptEntry.amount).toFixed(2)')],
['Print receipt action',ui.includes('Print receipt')],
['Dedicated print document generated',ui.includes('window.open')&&ui.includes('window.onload=()=>window.print()')],
['Receipt content HTML escaping',ui.includes('const esc=(v:any)')],
['Close receipt view action',ui.includes('Close')&&ui.includes('setReceiptEntry(null)')],
['API accepts borrower category for adjustment',api.includes('borrowerType:z.enum(["STUDENT","STAFF"]).default("STUDENT")')],
['Adjustment ledger records submitted borrower category',api.includes('borrowerType:p.data.borrowerType,loanId:p.data.loanId,type:"ADJUSTMENT"')],
['API accepts borrower category for settlement',api.includes('method:z.enum(["CASH","CARD","ONLINE","OTHER"]).default("OTHER"),borrowerType:z.enum(["STUDENT","STAFF"]).default("STUDENT")')],
['Settlement ledger records borrower category',api.includes('borrowerType:p.data.borrowerType,type:"SETTLEMENT"')],
['Settlement guard preserved',api.includes('Settlement exceeds outstanding balance')],
['Tenant scoping preserved in fine ledger route',api.includes('organizationId:s.organizationId,schoolId:s.schoolId,borrowerId')],
];
let passed=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(ok)passed++;}
console.log(`${passed}/${checks.length} PASS`);if(passed!==checks.length)process.exit(1);
