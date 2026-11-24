import fs from 'node:fs';
const api=fs.readFileSync('backend/api/src/modules/admissions/admission.public.routes.ts','utf8');
const portal=fs.readFileSync('apps/public-portal/src/main.tsx','utf8');
const checks=[
 ['intake metadata versioned',api.includes('version:"1.0"')],
 ['application field metadata declared',api.includes('application:{fields:')],
 ['enquiry field metadata declared',api.includes('enquiry:{fields:')],
 ['application academic year required metadata',api.includes('key:"academicYearId",label:"Academic year ID",type:"text",required:true')],
 ['application grade required metadata',api.includes('key:"gradeLevelId",label:"Grade level ID",type:"text",required:true')],
 ['applicant first name required metadata',api.includes('key:"childFirstName",label:"Child first name",type:"text",required:true')],
 ['guardian name required metadata',api.includes('key:"guardianName",label:"Guardian name",type:"text",required:true')],
 ['guardian phone required metadata with min length',api.includes('key:"guardianPhone",label:"Guardian phone",type:"tel",required:true,minLength:7,maxLength:20')],
 ['optional email metadata',api.includes('key:"guardianEmail",label:"Guardian email",type:"email",required:false')],
 ['enquiry notes max length metadata',api.includes('key:"notes",label:"Message",type:"textarea",required:false,maxLength:1000')],
 ['intake endpoint exposed',api.includes('publicBase+"/intake-form"')],
 ['intake endpoint validates school context',api.includes('if(!await schoolContext(organizationId,schoolId))return res.status(404).json({error:"School not found"})')],
 ['endpoint returns contract data',api.includes('return res.json({data:intakeFormMetadata})')],
 ['portal metadata state present',portal.includes('const [intakeMeta,setIntakeMeta]=useState<any>(null)')],
 ['portal fetch uses school-scoped intake endpoint',portal.includes('/admissions/intake-form')&&portal.includes('},[organizationId,schoolId]);')],
 ['portal enquiry displays required/optional metadata',portal.includes('intakeMeta?.enquiry?.fields')&&portal.includes('required fields')],
 ['portal application displays required/optional metadata',portal.includes('intakeMeta?.application?.fields')&&portal.includes('Optional fields')],
 ['existing application schema remains present',api.includes('const applicationSchema=z.object({academicYearId:z.string().min(1)')],
 ['existing public application create route retained',api.includes('admissionPublicRouter.post(publicBase+"/applications"')],
 ['existing draft update route retained',api.includes('admissionPublicRouter.patch(publicBase+"/applications/:trackingToken/draft"')],
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)pass++;}
console.log(`\nP527 verifier: ${pass}/${checks.length} PASS`);process.exit(pass===checks.length?0:1);
