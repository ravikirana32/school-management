import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = (path) => fs.readFileSync(path, 'utf8');
const routes = read('backend/api/src/modules/parents/parent.routes.ts');
const seed = read('backend/api/prisma/seed.ts');
const ui = read('apps/school-admin/src/FinanceWorkspace.tsx');
const main = read('apps/school-admin/src/main.tsx');
const gaps = read('MASTER-OPEN-GAPS-REGISTER.md');
const docsGaps = read('docs/MASTER-OPEN-GAPS-REGISTER.md');
const history = read('MASTER-RESOLVED-GAPS-HISTORY.md');
const docsHistory = read('docs/MASTER-RESOLVED-GAPS-HISTORY.md');
const checks = [
  ['general ledger endpoint exists', routes.includes('/accounting/general-ledger')],
  ['general ledger is tenant scoped', routes.includes('organizationId:s.organizationId,schoolId:s.schoolId,...(accountId?{accountId}:{})')],
  ['general ledger validates account ownership', routes.includes('Accounting account not found')],
  ['general ledger calculates opening balances', routes.includes('openingBalances=Object.fromEntries(opening.map')],
  ['trial balance supports date filters', routes.includes('const entryWhere={organizationId:s.organizationId,schoolId:s.schoolId')],
  ['date range is validated', routes.includes('accountingDateRange(req,res)')],
  ['fee reconciliation endpoint exists', routes.includes('/accounting/fee-reconciliation')],
  ['fee reconciliation has separate permission', routes.includes('scope(req,res,"accounting.reconcile")')],
  ['daily summary includes settled refunds', routes.includes('status:"SETTLED",settledAt')],
  ['daily summary is bounded', routes.includes('spanDays>366') && routes.includes('take:10001')],
  ['clearing reconciliation distinguishes bank statement', routes.includes('not bank statement reconciliation')],
  ['journal reversal endpoint exists', routes.includes('/accounting/journals/:journalId/reverse')],
  ['journal reversal has distinct permission', routes.includes('scope(req,res,"accounting.reverse")')],
  ['journal reversal is append-only and idempotent', routes.includes('sourceType:"REVERSAL",sourceId:original.id') && routes.includes('if(existing)return {kind:"EXISTS"')],
  ['journal reversal rejects reversing a reversal', routes.includes('original.sourceType==="REVERSAL"||original.status!=="POSTED"')],
  ['new accounting permissions seeded', seed.includes('["accounting.reconcile","accounting","reconcile"]') && seed.includes('["accounting.reverse","accounting","reverse"]')],
  ['Finance Officer receives reconciliation and historical-import approval but not reversal permission', /key:"SCHOOL_FINANCE"[^\n]*permissions:\[[^\]]*accounting\.reconcile[^\]]*accounting\.historical-import\.approve[^\]]*\]/.test(seed) && !/key:"SCHOOL_FINANCE"[^\n]*accounting\.reverse/.test(seed)],
  ['School Admin accounting workspace mounted', main.includes('Accounting & finance') && main.includes('<FinanceWorkspace />')],
  ['Finance workspace calls reports', ui.includes('/accounting/general-ledger') && ui.includes('/accounting/daily-summary') && ui.includes('/accounting/clearing-reconciliation')],
  ['Finance workspace exposes fee reconciliation', ui.includes('/accounting/fee-reconciliation')],
  ['Root and docs gap registers match', gaps === docsGaps],
  ['Root and docs resolved histories match', history === docsHistory],
  ['P128 gaps recorded', gaps.includes('P128-G001') && gaps.includes('P128-G002') && gaps.includes('P128-G003')],
];
for (const [name, passed] of checks) { assert.ok(passed, name); process.stdout.write(`PASS ${name}\n`); }
process.stdout.write(`P128 source verifier: ${checks.length}/${checks.length} PASS\n`);
