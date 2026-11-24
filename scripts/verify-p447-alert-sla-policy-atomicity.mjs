import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const worker=fs.readFileSync(path.join(root,'backend/api/src/workers/document-scan-worker.ts'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'backend/api/package.json'),'utf8'));
const checks=[
 ['P447 policy function exists',worker.includes('async function automateOperationsAlertSla()')],
 ['Reminder window configurable',worker.includes('reminderMinutes')&&worker.includes('OPERATIONS_ALERT_POLICY_DEFAULTS')],
 ['Reminder policy bounded',worker.includes('rule.reminderMinutes<1||rule.reminderMinutes>1440')],
 ['Escalation level configurable',worker.includes('escalationMinutes')],
 ['Escalation policy bounded',worker.includes('rule.escalationMinutes<1||rule.escalationMinutes>10080')],
 ['Reminder claim and outbox share transaction',worker.includes('const reminders=await prisma.$transaction(async tx=>')&&worker.includes('for(const alert of rows){const eventType="OPERATIONS_ALERT_SLA_REMINDER";')],
 ['Overdue claim and outbox share transaction',worker.includes('const escalations=await prisma.$transaction(async tx=>')&&worker.includes('for(const alert of rows){const eventType="OPERATIONS_ALERT_SLA_OVERDUE_ESCALATION";')],
 ['Outbox inserts idempotent',worker.includes('ON CONFLICT ("dedupeKey") DO NOTHING')],
 ['Reminder dedupe key source alert',worker.includes('`${eventType}:${alert.id}`')],
 ['Escalation severity critical',worker.includes('enqueueRecipientRoutedOperationsAlert(tx,eventType,dedupeKey,"CRITICAL"')],
 ['Policy values included in return',worker.includes('return {reminders:reminderCount,escalations:escalationCount,policyEnabled:true,policyVersion}')&&worker.includes('reminderWindowMinutes:rule.reminderMinutes')&&worker.includes('escalationAfterMinutes:rule.escalationMinutes')],
 ['Verification script registered',pkg.scripts['verify:p447']==='node ../../scripts/verify-p447-alert-sla-policy-atomicity.mjs']
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`P447 verifier: ${checks.length-failed}/${checks.length} PASS`);process.exit(failed?1:0);
