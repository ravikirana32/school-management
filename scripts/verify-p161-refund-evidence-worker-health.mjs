import fs from 'node:fs';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const worker=fs.readFileSync('backend/api/src/workers/document-scan-worker.ts','utf8');
const routes=fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/FinanceWorkspace.tsx','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261118240000_p161_refund_evidence_worker_health/migration.sql','utf8');
const root=fs.readFileSync('MASTER-OPEN-GAPS-REGISTER.md','utf8');
const docs=fs.readFileSync('docs/MASTER-OPEN-GAPS-REGISTER.md','utf8');
const checks=[
 ['retry timestamp in schema',schema.includes('cleanupNextRetryAt DateTime?')],
 ['retry index migration',migration.includes('cleanup_retry_idx')],
 ['durable worker heartbeat table',migration.includes('BackgroundWorkerHeartbeat')],
 ['heartbeat upsert',worker.includes('INSERT INTO "BackgroundWorkerHeartbeat"')],
 ['periodic worker liveness',worker.includes('healthTimer=setInterval')],
 ['capped exponential retry',worker.includes('6*60*60_000')&&worker.includes('Math.pow(2,Math.min(8,item.cleanupAttemptCount+1))')],
 ['due retry filtering',worker.includes('cleanupNextRetryAt:{lte:new Date()}')],
 ['dashboard health query',routes.includes('FROM "BackgroundWorkerHeartbeat"')],
 ['stale/degraded alert indicator',routes.includes('workerStale||worker?.status===\'DEGRADED\'')],
 ['admin health display',ui.includes('Document worker health')],
 ['gap register parity',root===docs],
 ['P161 gap documented',root.includes('P161-G001')]
];
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log(`P161 source verification: ${checks.length}/${checks.length} passed`);
