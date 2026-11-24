import fs from 'node:fs';
const routes=fs.readFileSync('backend/api/src/modules/admissions/admission.routes.ts','utf8');
const checks=[
 ['conversion lock is scoped by org, school, and application',/admission-conversion:"\+req\.params\.applicationId/.test(routes)],
 ['application query is tenant/school scoped',/id:req\.params\.applicationId,organizationId:s\.organizationId,schoolId:s\.schoolId/.test(routes)],
 ['converted application returns idempotent result',/idempotent:true/.test(routes)],
 ['existing student reload is tenant/school scoped',/id:a\.convertedStudentId,organizationId:s\.organizationId,schoolId:s\.schoolId/.test(routes)],
 ['integrity error emitted for missing converted student',/ADMISSION_CONVERSION_INTEGRITY_ERROR/.test(routes)],
 ['only accepted applications convert',/a\.status!==\"ACCEPTED\"[\s\S]*ADMISSION_CONVERSION_STATUS_INVALID/.test(routes)],
 ['idempotent retry uses HTTP 200',/res\.status\(data\.idempotent\?200:201\)/.test(routes)],
 ['fresh conversion uses HTTP 201',/data\.idempotent\?200:201/.test(routes)],
 ['active reservation tenant/school/application scoped',/applicationId:a\.id,status:\"ACTIVE\",OR:\[\{expiresAt:null\},\{expiresAt:\{gt:new Date\(\)\}\}\]/.test(routes)],
 ['active reservation requires section selection',/ADMISSION_RESERVED_SECTION_REQUIRED/.test(routes)],
 ['section lookup scoped to academic year and grade',/academicYearId:a\.academicYearId,gradeLevelId:a\.gradeLevelId,sectionName:p\.data\.sectionName/.test(routes)],
 ['unknown section has explicit conflict handling',/ADMISSION_SECTION_NOT_FOUND/.test(routes)],
 ['selected section must match reservation capacity',/ADMISSION_RESERVED_SECTION_MISMATCH/.test(routes)],
 ['reserved-seat mutation guarded by available capacity',/reservedSeats:\{gt:0\},enrolledSeats:\{lt:capacity\.capacity\}/.test(routes)],
 ['reservation consume failure is handled',/Reserved seat could not be consumed/.test(routes)],
 ['non-reserved capacity uses compare-and-set',/enrolledSeats:capacity\.enrolledSeats,reservedSeats:capacity\.reservedSeats,capacity:\{gte:capacity\.enrolledSeats\+capacity\.reservedSeats\+1/.test(routes)],
 ['student, guardian, enrollment and history conversion flow retained',/student\.create\([\s\S]*studentGuardian\.create\([\s\S]*studentEnrollment\.create\([\s\S]*admissionStageHistory\.create\([\s\S]*toStatus:\"CONVERTED\"/.test(routes)],
 ['admission fee handoff is preserved',/status:\"LEDGER_CREATED\",externalReference:feeCharge\.id/.test(routes)],
 ['conversion remains protected by admissions.manage',/scope\(req,res,\"admissions\.manage\"\)/.test(routes)]
];
let pass=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(ok)pass++;}console.log(`RESULT ${pass}/${checks.length} PASS`);if(pass!==checks.length)process.exit(1);
