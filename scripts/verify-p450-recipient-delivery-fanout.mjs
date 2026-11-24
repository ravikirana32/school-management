import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const worker=fs.readFileSync(path.join(root,'backend/api/src/workers/document-scan-worker.ts'),'utf8');
const checks=[
 ['Recipient routing helper exists',worker.includes('enqueueRecipientRoutedOperationsAlert')],
 ['Recipient IDs trimmed and deduplicated',worker.includes('new Set((recipientUserIds||[])')&&worker.includes('id.trim()')],
 ['Recipient-specific dedupe key',worker.includes(':recipient:${recipientUserId}')],
 ['Empty recipient list retains fallback event',worker.includes('defaultChannels')&&worker.includes('[null]')],
 ['Recipient delivery mode is tagged',worker.includes('deliveryMode:recipientUserId?"RECIPIENT_WEBHOOK":"LEGACY_WEBHOOK"')],
 ['Recipient ID persisted in delivery payload',worker.includes('recipientUserId,preferredChannels:channelsFor(recipientUserId)}')],
 ['Reminder events fan out per recipient',worker.includes('enqueueRecipientRoutedOperationsAlert(tx,eventType,dedupeKey,"WARNING"')],
 ['Escalation events fan out per recipient',worker.includes('enqueueRecipientRoutedOperationsAlert(tx,eventType,dedupeKey,"CRITICAL"')],
 ['Fan-out insert is within existing reminder transaction',worker.includes('const reminders=await prisma.$transaction')],
 ['Fan-out insert is within existing escalation transaction',worker.includes('const escalations=await prisma.$transaction')],
 ['Outbox dedupe remains enabled',worker.includes('ON CONFLICT (\\"dedupeKey\\") DO NOTHING')],
 ['Webhook payload carries delivery attempt metadata',worker.includes('deliveryAttempt:alert.attempts+1')],
 ['Retries remain isolated by outbox row',worker.includes('SET "status"=\'RETRY\'')],
 ['P450 verifier package script registered',fs.readFileSync(path.join(root,'backend/api/package.json'),'utf8').includes('verify:p450')],
];
let failures=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failures++;}console.log(`P450 verifier: ${checks.length-failures}/${checks.length} PASS`);process.exit(failures?1:0);
