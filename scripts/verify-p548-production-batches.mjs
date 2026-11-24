import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const schema=fs.readFileSync(path.join(root,'backend/api/prisma/schema.prisma'),'utf8');
const routes=fs.readFileSync(path.join(root,'backend/api/src/modules/canteen/canteen.routes.ts'),'utf8');
const ui=fs.readFileSync(path.join(root,'apps/school-admin/src/CanteenProductionPanel.tsx'),'utf8');
const workspace=fs.readFileSync(path.join(root,'apps/school-admin/src/CanteenWorkspace.tsx'),'utf8');
const sql=fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261123210000_p548_canteen_production_batches/migration.sql'),'utf8');
const checks=[
['Production batch model',schema.includes('model CanteenProductionBatch {')],
['Wastage model',schema.includes('model CanteenProductionWastage {')],
['Recipe-to-production relation',schema.includes('productionBatches CanteenProductionBatch[]')],
['Tenant composite production recipe relation',schema.includes('references: [id, organizationId, schoolId], onDelete: Restrict')],
['Batch list endpoint',routes.includes('base+"/production/batches"')],
['Tenant-scoped recipe validation on planning',routes.includes('Active recipe not found')],
['Plan quantity validation',routes.includes('plannedQuantity:z.number().positive()')],
['Start endpoint only accepts PLANNED batch',routes.includes('Only planned batches can be started')],
['Production consumes recipe-scaled ingredients',routes.includes('Number(ri.quantity)*qty/yieldQty')],
['Consumption records batch reference in ledger',routes.includes('referenceType:"PRODUCTION_BATCH",referenceId:batch.id')],
['Stock unit validation',routes.includes('Unit mismatch for ${need.name}')],
['Concurrency guarded stock decrement',routes.includes('quantity:{gte:need.quantity}')&&routes.includes('Stock changed or insufficient')],
['Wastage requires quantity and reason',routes.includes('Wastage quantity and reason are required')],
['Wastage cannot exceed produced quantity',routes.includes('Wastage exceeds produced quantity')],
['Wastage restricted to active batch',routes.includes('Wastage can only be recorded while production is in progress')],
['Served plus wastage bounded by produced',routes.includes('Served plus wastage cannot exceed produced quantity')],
['Batch completion status and timestamp',routes.includes('status:"COMPLETED",completedAt:new Date()')],
['Production panel exists and wired',workspace.includes('CanteenProductionPanel')],
['Production planning UI',ui.includes('Create production plan')],
['Start production UI',ui.includes('Start production & consume stock')],
['Wastage reason UI',ui.includes('Wastage reason')],
['Serve quantity UI',ui.includes('Served quantity')],
['Batch statuses rendered',ui.includes('b.status')],
['Migration production batch table',sql.includes('CREATE TABLE `CanteenProductionBatch`')],
['Migration wastage table',sql.includes('CREATE TABLE `CanteenProductionWastage`')],
['Migration tenant-scope foreign keys',sql.includes('recipe_scope_fkey')&&sql.includes('batch_scope_fkey')],
['Migration planning and status indexes',sql.includes('status`,`plannedFor')],
['Migration wastage lookup index',sql.includes('batchId`,`createdAt')]
];let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}console.log(`\n${checks.length-failed}/${checks.length} checks passed`);process.exit(failed?1:0);
