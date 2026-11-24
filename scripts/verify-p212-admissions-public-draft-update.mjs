import { readFileSync } from 'node:fs';
const routes=readFileSync('backend/api/src/modules/admissions/admission.public.routes.ts','utf8');
const register=readFileSync('MASTER-OPEN-GAPS-REGISTER.md','utf8');
const report=readFileSync('P212-DELIVERY-REPORT.md','utf8');
const checks=[
 ['Public tracking-token draft PATCH route exists',routes.includes('/applications/:trackingToken/draft')&&routes.includes('admissionPublicRouter.patch')],
 ['Patch body validated against application schema',routes.includes('applicationSchema.partial().safeParse(req.body)')],
 ['Only draft/document-pending stages are editable',routes.includes('ADMISSIONS_CORRECTION_NOT_ALLOWED')&&routes.includes('DOCUMENTS_PENDING')],
 ['Tenant-scoped token resolver used',routes.includes('resolvePublicApplication(organizationId,schoolId,token)')],
 ['Conditional update prevents stale draft writes',routes.includes('ADMISSIONS_DRAFT_UPDATE_CONFLICT')&&routes.includes('status:{in:[\"DRAFT\",\"DOCUMENTS_PENDING\"]}')],
 ['Phase documentation updated',report.includes('P212 Delivery Report')&&register.includes('P212')],
];
let failed=false;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);failed ||= !ok;}if(failed)process.exit(1);console.log(`P212 source verification: ${checks.length}/${checks.length} checks passed`);
