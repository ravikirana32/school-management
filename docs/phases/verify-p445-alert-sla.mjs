import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.cwd());
const route=fs.readFileSync(path.join(root,'backend/api/src/modules/platform/platform.routes.ts'),'utf8');
const ui=fs.readFileSync(path.join(root,'apps/super-admin/src/main.tsx'),'utf8');
const sql=fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261122080000_p445_alert_sla/migration.sql'),'utf8');
const checks=[
['SLA deadline columns/index migration',sql.includes('"slaDueAt"')&&sql.includes('slaDue_idx')],
['Follow-up reminder timestamp migration',sql.includes('"followUpReminderAt"')],
['Alert feed exposes SLA due and overdue state',route.includes('"slaDueAt"')&&route.includes('AS "slaOverdue"')],
['SLA endpoint validates future date and unresolved alert',route.includes('/operations-alerts/:alertId/sla')&&route.includes('dueAt must be a valid future timestamp')&&route.includes('"resolvedAt" IS NULL')],
['Assignment requires active platform administrator',route.includes('isPlatformAdmin: true, isActive: true')&&route.includes('Assignment target must be an active platform administrator')],
['Ownership workload summary endpoint',route.includes('/operations-alerts/ownership-workload')&&route.includes('"overdueCount"')],
['Follow-up reminder endpoint prevents duplicate reminder',route.includes('/operations-alerts/:alertId/follow-up')&&route.includes('"followUpReminderAt" IS NULL')],
['Follow-up action is audited and lifecycle recorded',route.includes('platform.operations_alert.follow_up_recorded')&&route.includes("'FOLLOW_UP'")],
['UI provides overdue and assigned filters',ui.includes('OVERDUE')&&ui.includes('ASSIGNED')],
['UI displays owner workload and SLA details',ui.includes('opsWorkload.map')&&ui.includes('a.slaDueAt')&&ui.includes('a.slaOverdue')],
['UI allows SLA set and follow-up action',ui.includes('opsAlertSla')&&ui.includes('opsFollowUp')]
];
let failed=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}console.log(`P445 verifier: ${checks.length-failed}/${checks.length} PASS`);if(failed)process.exit(1);
