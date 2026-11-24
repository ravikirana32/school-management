import fs from 'node:fs';
const worker=fs.readFileSync('backend/api/src/workers/document-scan-worker.ts','utf8');
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261118220000_p159_refund_evidence_expiry_index/migration.sql','utf8');
const root=fs.readFileSync('MASTER-OPEN-GAPS-REGISTER.md','utf8');
const docs=fs.readFileSync('docs/MASTER-OPEN-GAPS-REGISTER.md','utf8');
const checks=[
 ['24-hour expiry cutoff',worker.includes('24 * 60 * 60 * 1000')],
 ['bounded cleanup batch',worker.includes('take:100')],
 ['five-minute scheduled sweep',worker.includes('5*60_000')],
 ['startup cleanup sweep',worker.includes('void runExpiryWithHealth().catch(()=>undefined)')&&worker.includes('expiryTimer')],
 ['advisory lock race protection',worker.includes('refund-evidence-expiry:${item.id}')],
 ['storage deletion before state transition',worker.indexOf('await deleteObject(current.referenceValue)')<worker.indexOf('data:{securityStatus:"REJECTED",cleanupLastErrorAt:null')],
 ['retry after failed deletion',worker.includes('cleanupNextRetryAt')&&worker.includes('cleanupAttemptCount:{increment:1}')],
 ['only pending storage-key records selected',worker.includes('securityStatus:"PENDING_UPLOAD",referenceType:"STORAGE_KEY"')],
 ['schema index',schema.includes('@@index([securityStatus,referenceType,createdAt])')],
 ['migration index',migration.includes('CREATE INDEX IF NOT EXISTS')],
 ['root/docs gap register parity',root===docs],
 ['P159 gap documented',root.includes('P159-G001')],
];
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
