import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const ui=fs.readFileSync(path.join(root,'apps/school-admin/src/FinanceWorkspace.tsx'),'utf8');
const api=fs.readFileSync(path.join(root,'backend/api/src/modules/parents/parent.routes.ts'),'utf8');
const checks={
  browser_upload_initiation:ui.includes('/evidence/upload'),
  browser_presigned_post:ui.includes('started.upload.fields')&&ui.includes("method:'POST',body:form"),
  browser_upload_completion:ui.includes('started.completionPath'),
  browser_download_only_clean:ui.includes("ev.securityStatus==='CLEAN'")&&ui.includes('/download'),
  browser_scan_state:ui.includes('Scan: {ev.securityStatus'),
  api_upload_route:api.includes("/evidence/upload'"),
  api_completion_quarantine:api.includes("securityStatus:'QUARANTINED'"),
  completion_path_uses_real_tenant:api.includes('`/api/v1/${s.organizationId}/${s.schoolId}/parents/fees/refunds/'),
  api_download_clean_only:api.includes("securityStatus:'CLEAN'"),
  register_mirror:fs.readFileSync(path.join(root,'MASTER-OPEN-GAPS-REGISTER.md'),'utf8')===fs.readFileSync(path.join(root,'docs/MASTER-OPEN-GAPS-REGISTER.md'),'utf8'),
  phase_doc:fs.existsSync(path.join(root,'docs/phases/P154-REFUND-EVIDENCE-WORKFLOWS.md'))
};
for(const [k,v] of Object.entries(checks)) console.log(`${v?'PASS':'FAIL'} ${k}`);
if(Object.values(checks).some(v=>!v)) process.exit(1);
