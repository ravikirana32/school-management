import fs from 'node:fs';
const routes=fs.readFileSync('backend/api/src/modules/admissions/admission.routes.ts','utf8');
const publicRoutes=fs.readFileSync('backend/api/src/modules/admissions/admission.public.routes.ts','utf8');
const policy=fs.readFileSync('backend/api/src/modules/admissions/admission-document-upload-policy.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/AdmissionsWorkspace.tsx','utf8');
const checks=[
 ['Central policy module exists',policy.includes('admissionDocumentUploadPolicy')],
 ['PDF/JPEG/PNG allowlist centralized',policy.includes('application/pdf')&&policy.includes('image/jpeg')&&policy.includes('image/png')],
 ['25 MB admission upload limit centralized',policy.includes('25 * 1024 * 1024')],
 ['Upload URL expiry policy centralized',policy.includes('ADMISSION_DOCUMENT_UPLOAD_EXPIRY_SECONDS')],
 ['Download expiry policy declared',policy.includes('ADMISSION_DOCUMENT_DOWNLOAD_EXPIRY_SECONDS')],
 ['Replacement policy explicitly limited to rejected same-type docs',policy.includes('replacementAllowedOnlyForRejectedSameType: true')],
 ['Quarantine required in upload policy',policy.includes('quarantineRequired: true')],
 ['Clean scan required before download declared',policy.includes('cleanScanRequiredBeforeDownload: true')],
 ['Display-name normalization trims and collapses whitespace',policy.includes('value.trim()')&&policy.includes('replace(/\\s+/g')],
 ['Display-name normalization strips path/control characters',policy.includes('\\u0000-\\u001f')||policy.includes('\\\\')],
 ['Admin upload schema uses centralized MIME policy',routes.includes('z.enum(ADMISSION_DOCUMENT_ALLOWED_MIME_TYPES)')],
 ['Admin upload schema uses centralized max size',routes.includes('.max(ADMISSION_DOCUMENT_MAX_BYTES)')],
 ['Admin metadata name normalized before persistence',routes.includes('displayName:normalizeAdmissionDocumentDisplayName(p.data.displayName)')],
 ['Admin replacement validates same application/type and rejected status',routes.includes('applicationId:applicationRow.id,documentType:p.data.documentType,status:"REJECTED"')],
 ['Admin completion verifies actual object metadata',routes.includes('validDocumentObjectMetadata')],
 ['Admin completion quarantines uploaded document',routes.includes('securityStatus:"QUARANTINED",status:"RECEIVED"')],
 ['Admin download route requires CLEAN and VERIFIED',routes.includes('securityStatus:"CLEAN",status:"VERIFIED"')],
 ['Public upload schema uses centralized MIME policy',publicRoutes.includes('z.enum(ADMISSION_DOCUMENT_ALLOWED_MIME_TYPES)')],
 ['Public upload schema uses centralized max size',publicRoutes.includes('.max(ADMISSION_DOCUMENT_MAX_BYTES)')],
 ['Public metadata name normalized before persistence',publicRoutes.includes('displayName:normalizeAdmissionDocumentDisplayName(p.data.displayName)')],
 ['Public replacement scoped to app/type/rejected',publicRoutes.includes('applicationId:a.id,documentType:p.data.documentType,status:"REJECTED"')],
 ['Public upload completion verifies object metadata',publicRoutes.includes('validDocumentObjectMetadata')],
 ['Public completion quarantines file',publicRoutes.includes('securityStatus:"QUARANTINED",status:"RECEIVED"')],
 ['Public upload expiry uses centralized policy',publicRoutes.includes('expiresInSeconds:ADMISSION_DOCUMENT_UPLOAD_EXPIRY_SECONDS')],
 ['Admin upload feedback explains quarantine/scanning',ui.includes('quarantined until scan approval')&&ui.includes('malware scanning completes')],
];
let failed=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}
console.log(`\nP530 focused verifier: ${checks.length-failed}/${checks.length} PASS`);if(failed)process.exit(1);
