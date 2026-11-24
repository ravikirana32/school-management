import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const route = read('backend/api/src/modules/notifications/suppression.routes.ts');
const migration = read('backend/api/prisma/migrations/20261117230000_p46_email_suppression/migration.sql');
const checks = [
 ['release transition uses conditional updateMany', route.includes('notificationEmailSuppression.updateMany({where:{id:existing.id,organizationId:s.organizationId,schoolId:s.schoolId,status:"ACTIVE"}')],
 ['release audit only occurs after exactly one state transition', route.indexOf('if(updated.count!==1)return null;') < route.indexOf('action:"RELEASED"')],
 ['release transition is tenant and status scoped', route.includes('organizationId:s.organizationId,schoolId:s.schoolId,status:"ACTIVE"')],
 ['create writes suppression and audit in one tenant transaction', route.includes('withTenantContext(prisma,s,async tx=>{const currentAlias=') && route.indexOf('notificationEmailSuppression.create') < route.indexOf('action:"CREATED"') && route.includes('notificationEmailSuppressionHashAlias.createMany')],
 ['unique active suppression index protects concurrent create', migration.includes('CREATE UNIQUE INDEX "NotificationEmailSuppression_active_email_key"')],
 ['duplicate create catches unique race and re-reads', route.includes('code?:string}).code==="P2002"') && route.includes('notificationEmailSuppression.findFirst')],
 ['release requires reason before transaction', route.indexOf('min(8).max(500)') < route.indexOf('action:"RELEASED"')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P58 static verification failed');
console.log(`P58 static verification: ${checks.length}/${checks.length} PASS`);
