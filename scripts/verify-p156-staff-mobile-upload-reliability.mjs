import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('apps/staff-mobile/App.tsx','utf8');
const report=fs.readFileSync('docs/phases/P156-STAFF-MOBILE-UPLOAD-RELIABILITY.md','utf8');
const checks={progressEvents:app.includes('xhr.upload.onprogress'),retryRetainsPendingFile:app.includes('pendingUpload.current=pending')&&app.includes('upload(true)'),idempotencyKey:app.includes("'idempotency-key':file.idempotencyKey"),concurrentUploadGuard:app.includes('if(!refund||!note||uploading)return'),manualScanRefresh:app.includes('Refresh status')&&app.includes('onPress={load}'),mimeAllowList:app.includes("['application/pdf','image/jpeg','image/png']"),sizeLimit:app.includes('MAX_FILE_BYTES=10*1024*1024'),cleanOnlyDownload:app.includes("item.securityStatus!=='CLEAN'"),phaseReport:report.includes('Verification boundary'),gapRegisterParity:fs.readFileSync('MASTER-OPEN-GAPS-REGISTER.md','utf8')===fs.readFileSync('docs/MASTER-OPEN-GAPS-REGISTER.md','utf8')};
for(const [name,ok] of Object.entries(checks)) console.log(`${ok?'PASS':'FAIL'} ${name}`);
assert(Object.values(checks).every(Boolean),'P156 verification failed');
console.log(`P156 source checks: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length}`);
