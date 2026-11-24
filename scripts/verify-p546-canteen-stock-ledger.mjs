import fs from 'node:fs';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const routes=fs.readFileSync('backend/api/src/modules/canteen/canteen.routes.ts','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261123190000_p546_canteen_stock_ledger/migration.sql','utf8');
const ui=fs.readFileSync('apps/school-admin/src/CanteenWorkspace.tsx','utf8');
const checks=[
['stock ledger model',schema.includes('model CanteenStockLedger {')],
['ledger composite stock scope relation',schema.includes('stockItem CanteenStockItem @relation(fields: [stockItemId, organizationId, schoolId]')],
['stock ingredient linkage',schema.includes('ingredientId String?')&&schema.includes('ingredient CanteenIngredient? @relation')],
['ledger nonzero movement invariant',migration.includes('quantityDelta" <> 0')],
['ledger nonnegative balance invariant',migration.includes('balanceAfter" >= 0')],
['stock receipt endpoint',routes.includes('/stock/:stockId/receipts')&&routes.includes('movementType:"RECEIPT"')],
['stock adjustment endpoint with reason',routes.includes('/stock/:stockId/adjustments')&&routes.includes('reason:z.string().trim().min(1)')],
['prevent negative stock adjustment',routes.includes('Adjustment would result in negative stock')],
['concurrency-safe adjustment update',routes.includes('quantity:item.quantity')&&routes.includes('Stock changed concurrently; refresh and retry')],
['recipe production consumption endpoint',routes.includes('/recipes/:recipeId/consume')],
['recipe yield scaling calculation',routes.includes('Number(ri.quantity)*p.data.productionQuantity/yieldQty')],
['linked ingredient stock lookup',routes.includes('ingredientId:{in:needs.map(n=>n.ingredientId)}')],
['consumption unit validation',routes.includes('Unit mismatch for ${need.name}')],
['insufficient stock guard',routes.includes('Insufficient stock for ${need.name}')],
['atomic decrement guard',routes.includes('quantity:{gte:need.quantity}')&&routes.includes('decrement:need.quantity')],
['consumption ledger entries',routes.includes('movementType:"CONSUMPTION"')&&routes.includes('quantityDelta:-need.quantity')],
['opening stock ledger',routes.includes('movementType:"OPENING"')],
['ledger list API',routes.includes('/stock/ledger')&&routes.includes('canteenStockLedger.findMany')],
['balance reconciliation API',routes.includes('/stock/reconciliation')&&routes.includes('groupBy({by:[\"stockItemId\"]')&&routes.includes('reconciled:Math.abs(current-ledger)<0.0005')],
['admin receipt/adjustment/production controls',ui.includes('Record receipt')&&ui.includes('Apply adjustment')&&ui.includes('Consume ingredients')],
['admin stock ledger rendering',ui.includes('Recent stock ledger')&&ui.includes('ledger.slice(0,50).map')],
['admin reconciliation display',ui.includes('Stock reconciliation')&&ui.includes('reconciliation.discrepancyCount')],
['migration ledger table and indexes',migration.includes('CREATE TABLE "CanteenStockLedger"')&&migration.includes('CanteenStockLedger_org_school_stock_created_idx')],
];
let pass=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)pass++;}console.log(`RESULT ${pass}/${checks.length}`);if(pass!==checks.length)process.exit(1);
