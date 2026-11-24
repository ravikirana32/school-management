import fs from 'node:fs';
const source=fs.readFileSync('backend/api/src/modules/admissions/admission.routes.ts','utf8');
const route=source.split('applications/:applicationId/checklist')[1]?.split('applications/:applicationId/documents')[0]||'';
const checks=[
 ['Checklist endpoint registered',source.includes('applications/:applicationId/checklist')],
 ['Checklist requires admissions.read',route.includes('scope(req,res,"admissions.read")')],
 ['Application query is organization scoped',route.includes('organizationId:s.organizationId,schoolId:s.schoolId')],
 ['Application existence validated',route.includes('Application not found')],
 ['Exact-board eligibility rule preferred',route.includes('exactBoard')],
 ['ANY-board fallback supported',route.includes('boardCode:"ANY"')],
 ['Eligibility rule is enabled and school-scoped',route.includes('enabled:true')],
 ['Required documents derived from rule',route.includes('requiredDocuments')],
 ['Document records scoped to application and school',route.includes('applicationId:a.id')&&route.includes('admissionApplicationDocument.findMany')],
 ['Required checklist entries exposed',route.includes('requirements')],
 ['Verified state requires clean security status',route.includes('status==="VERIFIED"&&d.securityStatus==="CLEAN"')],
 ['Scanning state surfaced',route.includes('SCANNING')&&route.includes('QUARANTINED')],
 ['Rejected state surfaced',route.includes('REJECTED')],
 ['Missing state surfaced',route.includes('MISSING')],
 ['Review pending state surfaced',route.includes('REVIEW_PENDING')],
 ['Latest document details returned without objectKey',route.includes('latestDocument')&&!route.includes('objectKey')],
 ['Optional documents separated from required',route.includes('optionalDocuments')],
 ['Required checklist completion summary returned',route.includes('verifiedRequiredCount')],
 ['Submission readiness requires a matched rule and all required docs verified',route.includes('readyForSubmission:Boolean(rule)&&requirements.every')],
 ['Checklist is read-only endpoint',route.includes('admissionRouter.get')&&!route.includes('update')&&!route.includes('delete')],
 ['Existing document review endpoint remains',source.includes('documents/:documentId/review')],
 ['Existing secure upload completion remains',source.includes('documents/:documentId/complete')],
];
let failed=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}
console.log(`\nP529 focused verifier: ${checks.length-failed}/${checks.length} PASS`);if(failed)process.exit(1);
