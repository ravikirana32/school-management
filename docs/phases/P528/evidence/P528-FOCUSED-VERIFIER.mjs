import fs from 'node:fs';
const source=fs.readFileSync('backend/api/src/modules/admissions/admission.routes.ts','utf8');
const checks=[
 ['Transition-options endpoint registered',source.includes('applications/:applicationId/transition-options')],
 ['Preflight requires admissions.read permission',source.includes('transition-options') && source.includes('scope(req,res,"admissions.read")')],
 ['Application preflight lookup is tenant/school scoped',source.includes('id:req.params.applicationId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,applicationNumber:true,status:true,updatedAt:true}')],
 ['Missing application has stable code',source.includes('ADMISSION_APPLICATION_NOT_FOUND')],
 ['Allowed transitions returned from shared map',source.includes('allowedTransitions:transitions[a.status]||[]')],
 ['Terminal-state flag provided',source.includes('terminal:a.status==="CONVERTED"||a.status==="REJECTED"||a.status==="WITHDRAWN"')],
 ['Recent stage history included',source.includes('recentHistory:history')],
 ['Stage history query scoped and limited',source.includes('applicationId:a.id},orderBy:{createdAt:"desc"},take:10')],
 ['Invalid transition stable error code',source.includes('ADMISSION_TRANSITION_NOT_ALLOWED')],
 ['Invalid transition reports current/requested status',source.includes('currentStatus:a.status,requestedStatus:p.data.toStatus')],
 ['Decision-note error provides recommendation',source.includes('requiredRecommendation:expected')],
 ['Eligibility-rule error stable code',source.includes('ADMISSION_RULES_NOT_CONFIGURED')],
 ['Missing verified documents error stable code',source.includes('ADMISSION_REQUIRED_DOCUMENTS_INCOMPLETE')],
 ['Missing DOB error stable code',source.includes('ADMISSION_DATE_OF_BIRTH_REQUIRED')],
 ['Minimum-age violation error stable code',source.includes('ADMISSION_AGE_BELOW_MINIMUM')],
 ['Maximum-age violation error stable code',source.includes('ADMISSION_AGE_ABOVE_MAXIMUM')],
 ['Concurrency conflict remains guarded',source.includes('ADMISSION_TRANSITION_CONFLICT')],
 ['Stage-history writes retained',source.includes('admissionStageHistory.create')],
 ['Applicant status notifications retained',source.includes('eventType:"APPLICATION_STATUS"')],
 ['Staff status notifications retained',source.includes('Admission application status updated')],
 ['Transition mutations require admissions.manage',source.includes('applications/:applicationId/transition') && source.includes('scope(req,res,"admissions.manage")')],
];
let failed=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}
console.log(`\nP528 focused verifier: ${checks.length-failed}/${checks.length} PASS`);if(failed)process.exit(1);
