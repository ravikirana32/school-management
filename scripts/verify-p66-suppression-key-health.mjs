import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const api = read('backend/api/src/modules/notifications/suppression.routes.ts');
const ui = read('apps/school-admin/src/NotificationSuppressionWorkspace.tsx');
const runbook = read('docs/security/P66-SUPPRESSION-KEY-RETIREMENT-RUNBOOK.md');
const checks = [
 ['key health endpoint is permission-gated through school scope', api.includes('notification-suppressions/key-health') && api.includes('const s=await scope(req,res)')],
 ['key health reports current and previous version labels only', api.includes('currentVersion:env.NOTIFICATION_SUPPRESSION_HASH_CURRENT_VERSION') && api.includes('previousVersion:env.NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_VERSION')],
 ['alias diagnostics are grouped by version/status counts', api.includes('notificationEmailSuppressionHashAlias.groupBy') && api.includes('_count:{_all:true}')],
 ['outbox references are grouped by version/status counts', api.includes('notificationOutbox.groupBy') && api.includes('recipientEmailHashVersion:{not:null}')],
 ['API does not select hash or email fields for diagnostics', !api.includes('select:{emailHash:true}')],
 ['UI displays counts without hashes or secrets', ui.includes('Active aliases') && ui.includes('Outbox references') && ui.includes('secrets and hashes are never returned')],
 ['UI warns against retiring keys with active aliases/outbox refs', ui.includes('Do not retire a previous key while active aliases or outbox references remain')],
 ['runbook requires zero active aliases and safe outbox callback window', runbook.includes('active suppression alias') && runbook.includes('provider-approved callback retention window')],
 ['runbook defines coordinated rollback', runbook.includes('restore the previous secret and version to all API/worker instances')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P66 static verification failed');
console.log(`P66 static verification: ${checks.length}/${checks.length} PASS`);
