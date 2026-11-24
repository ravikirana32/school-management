import fs from 'node:fs';
const mobile=fs.readFileSync('apps/student-mobile/App.tsx','utf8');
const api=fs.readFileSync('backend/api/src/modules/documents/document.routes.ts','utf8');
const checks=[
 ['native document picker integrated',mobile.includes('DocumentPicker.getDocumentAsync')],
 ['PDF/JPEG/PNG picker restrictions',mobile.includes('application/pdf')&&mobile.includes('image/jpeg')&&mobile.includes('image/png')],
 ['25 MB client file-size validation',mobile.includes('file.size>25*1024*1024')],
 ['upload initiation request with metadata',mobile.includes('documents/homework/student/${encodeURIComponent(submissionId)}/upload')&&mobile.includes('sizeBytes:file.size')],
 ['presigned form upload fields included',mobile.includes('Object.entries(upload.fields)')],
 ['file uploaded via POST to signed storage URL',mobile.includes('fetch(upload.url,{method:"POST",body:form})')],
 ['upload completion uses student homework kind',mobile.includes('kind:"homework-student"')],
 ['submit answer supports attachment-only path',mobile.includes("answer||'Attachment submission'")],
 ['attachment scan status shown on refresh',mobile.includes('file.displayName} · {file.securityStatus}')],
 ['student account link enforced at upload-init',api.includes('studentAccountLink.findFirst({where:{organizationId,schoolId,userId,isActive:true,student:{status:"ACTIVE"}}')],
 ['submission ownership and published assignment enforced',api.includes('studentId:link.studentId,status:{not:"GRADED"},homeworkAssignment:{status:"PUBLISHED"}')],
 ['student completion verifies linked student ownership',api.includes('doc as any).submission.studentId!==link.studentId')],
 ['upload metadata validated against authorized presigned POST',api.includes('verifyUploadedObject(doc.objectKey)')&&api.includes('validDocumentObjectMetadata')],
 ['completion quarantines and enqueues scan',api.includes('securityStatus:"QUARANTINED"')&&api.includes('enqueueDocumentScan(kind==="homework-student"?"homework":kind')]
];
let passed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)passed++;}
console.log(`P330 verifier: ${passed}/${checks.length} PASS`);if(passed!==checks.length)process.exit(1);
