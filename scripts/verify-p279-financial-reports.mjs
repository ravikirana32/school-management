import fs from 'node:fs';
const route=fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/FinanceWorkspace.tsx','utf8');
const checks=[
 ['Date-range validation',route.includes('Invalid expense report date range')],
 ['Currency totals',route.includes('totals:toMoney(total)')],
 ['Category totals',route.includes('categoryTotals:nestedMoney(categoryTotals)')],
 ['Status totals',route.includes('statusTotals:nestedMoney(statusTotals)')],
 ['Monthly trends',route.includes('monthlyTotals:nestedMoney')],
 ['Approved overdue totals',route.includes('overdueApprovedTotals:toMoney(overdueTotals)')],
 ['Finance report UI',ui.includes('Expense summary report')],
 ['Report period from finance filters',ui.includes('call(`/finance/expense-report${query}`)')]
];let fail=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)fail++;}console.log(`${checks.length-fail}/${checks.length} checks passed`);if(fail)process.exit(1);
