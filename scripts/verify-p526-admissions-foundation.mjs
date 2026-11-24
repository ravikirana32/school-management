import fs from 'node:fs';
const api=fs.readFileSync('backend/api/src/modules/admissions/admission.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/AdmissionsWorkspace.tsx','utf8');
const checks=[
['foundation endpoint exists',api.includes('base+"/foundation"')],
['foundation requires admissions read permission',api.includes('scope(req,res,"admissions.read")')],
['academic years school scoped',api.includes('tx.academicYear.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId}')],
['grade levels school scoped',api.includes('tx.gradeLevel.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,isActive:true}')],
['eligibility count school scoped',api.includes('tx.admissionEligibilityRule.count({where:{organizationId:s.organizationId,schoolId:s.schoolId,enabled:true}')],
['application count school scoped',api.includes('tx.admissionApplication.count({where:{organizationId:s.organizationId,schoolId:s.schoolId}')],
['board support metadata',api.includes('["CBSE","ICSE","STATE","IB","IGCSE","OTHER"]')],
['workflow status metadata',api.includes('["DRAFT","SUBMITTED","UNDER_REVIEW","DOCUMENTS_PENDING","APPROVED","OFFERED","ACCEPTED","REJECTED","WITHDRAWN","CONVERTED"]')],
['setup readiness academic year',api.includes('academicYearsConfigured:academicYears.length>0')],
['setup readiness grade levels',api.includes('gradeLevelsConfigured:gradeLevels.length>0')],
['setup readiness eligibility rules',api.includes('eligibilityRulesConfigured:ruleCount>0')],
['API foundation data state added to UI',ui.includes('admissionFoundation')],
['UI requests foundation endpoint',ui.includes('request("/foundation")')],
['UI foundation setup overview rendered',ui.includes('Admissions foundation · P526')],
['UI readiness indicators rendered',ui.includes('setupReadiness')],
['UI board list rendered',ui.includes('supportedBoards')],
['UI workflow statuses rendered',ui.includes('applicationStatuses')],
['existing eligibility/capacity workflows retained',ui.includes('saveEligibility')&&ui.includes('saveCapacity')]
];
let passed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)passed++;}
console.log(`P526 ${passed}/${checks.length} assertions passed`);if(passed!==checks.length)process.exit(1);
