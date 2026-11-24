import fs from 'node:fs';
const root=process.cwd();
const checks=[
 ['Expense model exists',fs.readFileSync('backend/api/prisma/schema.prisma','utf8').includes('model SchoolExpense')],
 ['Tenant RLS migration',fs.readFileSync('backend/api/prisma/migrations/20261119200000_p278_school_expenses/migration.sql','utf8').includes('SchoolExpense_tenant_policy')],
 ['List API',fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8').includes("/finance/expenses',authenticate")],
 ['Create API',fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8').includes("finance.expense.created")],
 ['Submit transition',fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8').includes("finance.expense.submitted")],
 ['Independent approval',fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8').includes("accounting.expenses.approve")],
 ['Self-approval protection',fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8').includes('Expense creator cannot approve their own expense')],
 ['Rejection reason validation',fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8').includes('Rejection reason is required')],
 ['Finance UI',fs.readFileSync('apps/school-admin/src/FinanceWorkspace.tsx','utf8').includes('School expenses')],
 ['Role permissions seeded',fs.readFileSync('backend/api/prisma/seed.ts','utf8').includes('accounting.expenses.manage')],
 ['Status mirrors exist',fs.existsSync('P278-STATUS.md')]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}console.log(`${checks.length-failed}/${checks.length} checks passed`);if(failed)process.exit(1);
