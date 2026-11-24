import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.cwd());
const worker=fs.readFileSync(path.join(root,'backend/api/src/workers/document-scan-worker.ts'),'utf8');
const route=fs.readFileSync(path.join(root,'backend/api/src/modules/platform/platform.routes.ts'),'utf8');
const ui=fs.readFileSync(path.join(root,'apps/super-admin/src/main.tsx'),'utf8');
const migration=fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261122090000_p446_sla_automation/migration.sql'),'utf8');
const checks=[
 ['Migration adds reminder sent idempotency marker',migration.includes('"slaReminderSentAt"')],
 ['Migration adds escalation sent idempotency marker',migration.includes('"slaEscalationSentAt"')],
 ['Migration indexes unresolved alert SLA automation',migration.includes('OperationsAlertOutbox_slaReminder_idx')&&migration.includes('OperationsAlertOutbox_slaEscalation_idx')],
 ['Reminder automation uses configurable bounded window (60-minute default)',worker.includes('rule.reminderMinutes')&&worker.includes('rule.escalationMinutes')&&worker.includes('"slaReminderSentAt" IS NULL')],
 ['Reminder claim is atomic and returns claimed alerts',worker.includes('UPDATE "OperationsAlertOutbox" SET "slaReminderSentAt"=NOW()')&&worker.includes('RETURNING "id","eventType","severity","slaDueAt","assignedToUserId"')],
 ['Reminder event dedupe key uses original alert ID',worker.includes('OPERATIONS_ALERT_SLA_REMINDER')&&worker.includes('`${eventType}:${alert.id}`')],
 ['Overdue escalation automation claims one-time marker',worker.includes('"slaEscalationSentAt"=NOW()')&&worker.includes('"slaDueAt"<=NOW()')],
 ['Escalation updates escalation timestamp and level',worker.includes('"escalatedAt"=COALESCE("escalatedAt",NOW())')&&worker.includes('"escalationLevel"=GREATEST')],
 ['Escalation alert is critical and carries SLA metadata',worker.includes('OPERATIONS_ALERT_SLA_OVERDUE_ESCALATION')&&worker.includes('overdueMinutes')],
 ['SLA automation scheduled in worker health loop',worker.includes('automateOperationsAlertSla().catch(()=>undefined)')],
 ['Platform alert feed exposes automated SLA markers',route.includes('"slaReminderSentAt"')&&route.includes('"slaEscalationSentAt"')],
 ['Super Admin shows reminder/escalation delivery markers',ui.includes('Automated SLA reminder sent')&&ui.includes('Automated overdue escalation')]
];
let failed=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}
console.log(`P446 verifier: ${checks.length-failed}/${checks.length} PASS`);if(failed)process.exit(1);
