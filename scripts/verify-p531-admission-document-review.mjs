import fs from 'node:fs';
const policy=fs.readFileSync('backend/api/src/modules/admissions/admission-document-review-policy.ts','utf8');
const routes=fs.readFileSync('backend/api/src/modules/admissions/admission.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/AdmissionsWorkspace.tsx','utf8');
const checks=[
 ['review policy rejects non-RECEIVED state',policy.includes('input.current !== "RECEIVED"')],
 ['review policy requires clean scan',policy.includes('input.securityStatus !== "CLEAN"')],
 ['rejection requires correction notes',policy.includes('input.target === "REJECTED"')&&policy.includes('ADMISSION_DOCUMENT_REJECTION_REASON_REQUIRED')],
 ['policy returns structured errors',policy.includes('code: string; message: string')],
 ['conditional update guard includes current status',policy.includes('status: current')],
 ['conditional update guard includes clean scan state',policy.includes('securityStatus: "CLEAN"')],
 ['review route invokes policy',routes.includes('validateAdmissionDocumentReview({target:p.data.status,current:d.status,securityStatus:d.securityStatus,reviewNotes:p.data.reviewNotes})')],
 ['review route uses compare-and-set update',routes.includes('admissionApplicationDocument.updateMany({where:admissionDocumentReviewUpdateWhere(d.id,d.status)')],
 ['concurrent review returns stable conflict code',routes.includes('ADMISSION_DOCUMENT_REVIEW_CONFLICT')],
 ['reviewed row reload scoped to application tenant',routes.includes('applicationId:a.id,organizationId:s.organizationId,schoolId:s.schoolId')],
 ['rejection feedback notification retained',routes.includes('Document needs correction')&&routes.includes('Please review the document checklist and upload a replacement')],
 ['UI requires correction reason before reject',ui.includes('disabled={!docNote.trim()} onClick={()=>void reviewDocument(d,"REJECTED")}')],
 ['UI explains rejection reason expectation',ui.includes('required for rejection (explain what to correct)')],
 ['UI only offers actions for received clean documents',ui.includes('d.status==="RECEIVED"&&d.securityStatus==="CLEAN"')],
 ['replacement UI references rejected same-type document',ui.includes('detailDocs.filter(d=>d.documentType===docType&&d.status==="REJECTED")')]
];
let pass=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(ok)pass++;}
console.log(`RESULT ${pass}/${checks.length} PASS`);if(pass!==checks.length)process.exit(1);
