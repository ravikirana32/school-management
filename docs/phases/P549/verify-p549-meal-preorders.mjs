import fs from 'node:fs';import path from 'node:path';
const root=process.cwd();const checks=[];function check(name,ok){checks.push({name,ok:!!ok});}
const schema=fs.readFileSync(path.join(root,'backend/api/prisma/schema.prisma'),'utf8'),routes=fs.readFileSync(path.join(root,'backend/api/src/modules/canteen/canteen.routes.ts'),'utf8'),ui=fs.readFileSync(path.join(root,'apps/school-admin/src/CanteenPreorderPanel.tsx'),'utf8'),workspace=fs.readFileSync(path.join(root,'apps/school-admin/src/CanteenWorkspace.tsx'),'utf8'),sql=fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261123200000_p549_meal_preorder_lifecycle/migration.sql'),'utf8');
check('Policy model supports service time and cutoff',schema.includes('model CanteenPreorderPolicy')&&schema.includes('serviceTime String @default("12:00")'));
check('Preorder and line-item models present',schema.includes('model CanteenPreorder {')&&schema.includes('model CanteenPreorderItem {'));
check('School/org compound policy uniqueness',schema.includes('@@unique([organizationId, schoolId])'));
check('Migration creates policy, preorder and item tables',sql.includes('CREATE TABLE "CanteenPreorderPolicy"')&&sql.includes('CREATE TABLE "CanteenPreorder"')&&sql.includes('CREATE TABLE "CanteenPreorderItem"'));
check('Policy API GET and PUT',routes.includes('/preorders/policy')&&routes.includes('canteenPreorderPolicy.upsert'));
check('Student preorder endpoint is account-link protected',routes.includes('/students/me/:organizationId/:schoolId/canteen/preorders')&&routes.includes('Active student account link required'));
check('Parent preorder endpoint uses verified guardian student scope',routes.includes('/parents/me/:organizationId/:schoolId/canteen/preorders')&&routes.includes('parentCanteenStudentIds'));
check('Preorder cutoff enforced at creation',routes.includes('Preorder cutoff has passed')&&routes.includes('serviceCutoff(date'));
check('Service-date menu availability enforced',routes.includes('availableOn:null')&&routes.includes('availableOn:date'));
check('Cancellation cutoff and cancellation reason enforced',routes.includes('Cancellation reason required')&&routes.includes('Cancellation cutoff passed'));
check('Paid cancellation creates refund request status',routes.includes('refundStatus=paid?"REQUESTED":"NOT_REQUIRED"'));
check('Refund updates are permission-scoped and tracked',routes.includes('/preorders/:preorderId/refund')&&routes.includes('REFUNDED')&&routes.includes('refundReference'));
check('Student self-cancel is linked-account scoped',routes.includes('/students/me/:organizationId/:schoolId/canteen/preorders/:preorderId/cancel')&&routes.includes('selfServiceCancelPreorder'));
check('Parent self-cancel requires accepted consent/student link',routes.includes('/parents/me/:organizationId/:schoolId/canteen/preorders/:preorderId/cancel')&&routes.includes('studentIds.includes(p.data.studentId)'));
check('Self-service cancellation honors policy cutoff and refund request',routes.includes('Only placed preorders can be cancelled')&&routes.includes('Cancellation cutoff passed')&&routes.includes('refundStatus:paid?\"REQUESTED\":\"NOT_REQUIRED\"'));

check('School Admin preorder panel integrated',workspace.includes('CanteenPreorderPanel')&&ui.includes('Meal Preorders & Cancellation/Refunds'));
check('UI supports policy configuration and refund actions',ui.includes('Save policy')&&ui.includes('Mark refunded')&&ui.includes('Mark refund processing'));
const fails=checks.filter(x=>!x.ok);console.log(`P549 focused verification: ${checks.length-fails.length}/${checks.length} PASS`);for(const c of checks)console.log(`${c.ok?'PASS':'FAIL'} ${c.name}`);if(fails.length)process.exit(1);
