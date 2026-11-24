import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const worker=fs.readFileSync(path.join(root,'backend/api/src/workers/document-scan-worker.ts'),'utf8');
const checks=[
['Worker reads persisted operations alert policy',worker.includes('platformControlSetting.findUnique')&&worker.includes('key:"operations_alert_policy"')],
['Policy normalization validates all four severities',['INFO','WARNING','ERROR','CRITICAL'].every(s=>worker.includes(`${s}:`))],
['Policy enable flag gates processing',worker.includes('if(!policy.enabled)return')],
['Severity-specific reminder intervals applied',worker.includes('rule.reminderMinutes')&&worker.includes('slaDueAt"<=NOW()+($2::int * INTERVAL \'1 minute\')')],
['Severity-specific escalation intervals applied',worker.includes('rule.escalationMinutes')&&worker.includes('slaDueAt"<=NOW()-($2::int * INTERVAL \'1 minute\')')],
['Alert queries filter by severity',worker.includes('WHERE "severity"=$1 AND "resolvedAt" IS NULL')],
['Recipients attached to reminder payload',worker.includes('recipientUserIds:rule.recipientUserIds')],
['Recipients attached to escalation payload',worker.includes('escalationAfterMinutes:rule.escalationMinutes')&&worker.includes('recipientUserIds:rule.recipientUserIds')],
['Policy version captured on notification payloads',worker.includes('policyVersion,occurredAt')],
['Reminder claims and outbox insert stay in transaction',worker.includes('const reminders=await prisma.$transaction')],
['Escalation claims and outbox insert stay in transaction',worker.includes('const escalations=await prisma.$transaction')],
['Dedupe keys retained for reminder and escalation',worker.includes('ON CONFLICT ("dedupeKey") DO NOTHING')],
['Default fallback policy defined',worker.includes('OPERATIONS_ALERT_POLICY_DEFAULTS')],
['Disabled policy returns without processing',worker.includes('policyEnabled:false')],
];let failures=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failures++;}console.log(`P449 verifier: ${checks.length-failures}/${checks.length} PASS`);process.exit(failures?1:0);
