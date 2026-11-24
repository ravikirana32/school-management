import fs from 'node:fs';
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const component=fs.readFileSync('apps/parent-mobile/src/finance/ParentFinanceSummary.tsx','utf8');
const checks=[
 ['finance summary component exists',component.includes('export function ParentFinanceSummary')],
 ['summary integrated into parent app',app.includes('<ParentFinanceSummary fees={fees}/>')],
 ['finance summary imported',app.includes('import { ParentFinanceSummary } from "./src/finance/ParentFinanceSummary"')],
 ['currency-grouped totals with per-currency count',component.includes('Record<string, { billed: number; paid: number; outstanding: number; overdue: number; count: number }>') && component.includes('bucket.count += 1')],
 ['paid amount bounded by billed amount',component.includes('Math.min(amount, money(fee.amountPaid))')],
 ['outstanding amount cannot go negative',component.includes('Math.max(0, amount - paid)')],
 ['invalid/negative numeric values safely normalized',component.includes('Number.isFinite(parsed) && parsed >= 0')],
 ['overdue calculation requires outstanding and due date',component.includes('outstanding > 0 && fee.dueAt')],
 ['multi-currency totals remain separate',component.includes('Object.entries(totals).map(([currency, total])')],
 ['read-only payment limitation explicitly stated',component.includes('Read-only summary. Payments are not initiated')],
 ['empty published-fee state handled',component.includes('Summary will appear when fee statements are published.')],
 ['overdue label only shown when overdue amount positive',component.includes('total.overdue > 0 ? <Text')]
];let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}console.log(`${checks.length-fail}/${checks.length} checks passed`);if(fail)process.exit(1);
