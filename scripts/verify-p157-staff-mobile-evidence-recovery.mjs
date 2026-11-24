import fs from 'node:fs';
import crypto from 'node:crypto';
const read=(p)=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const api=read('../backend/api/src/modules/parents/parent.routes.ts');
const schema=read('../backend/api/prisma/schema.prisma');
const migration=read('../backend/api/prisma/migrations/20261118210000_p157_refund_evidence_idempotency/migration.sql');
const mobile=read('../apps/staff-mobile/App.tsx');
const root=read('../MASTER-OPEN-GAPS-REGISTER.md');
const docs=read('../docs/MASTER-OPEN-GAPS-REGISTER.md');
const checks={
 'API SHA-256 request fingerprint':api.includes("createHash('sha256')"),
 'API advisory lock scoped by tenant and staff':api.includes('refund-evidence-upload:${idempotencyKey}'),
 'API idempotency replay lookup':api.includes('addedByUserId:s.userId,idempotencyKey'),
 'API conflicting replay returns 409':api.includes("status(409).json({error:'Idempotency key was already used"),
 'API safe replay regenerates presigned upload':api.includes('createUploadUrl(existing.referenceValue'),
 'Prisma idempotency columns and unique index':schema.includes('requestFingerprint String?')&&schema.includes('@@unique([organizationId,schoolId,addedByUserId,idempotencyKey])'),
 'Migration adds unique scoped index':migration.includes('RefundReconEvidence_idempotency_scope_key'),
 'Mobile persists pending metadata securely':mobile.includes('SecureStore.setItemAsync(PENDING_UPLOAD_KEY'),
 'Mobile retry reuses same idempotency key':mobile.includes("headers:{'idempotency-key':file.idempotencyKey}"),
 'Mobile completion retries after token refresh':mobile.includes('refreshSession(api,tokens!.refreshToken)'),
 'Root/docs gap registers synchronized':crypto.createHash('sha256').update(root).digest('hex')===crypto.createHash('sha256').update(docs).digest('hex'),
 'P157 gap remains visible':root.includes('P157-G001')
};
for(const [name,ok] of Object.entries(checks))console.log(`${ok?'PASS':'FAIL'} ${name}`);
console.log(`${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks passed`);
if(Object.values(checks).some(v=>!v))process.exitCode=1;
