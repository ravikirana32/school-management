import fs from 'node:fs';
const routes=fs.readFileSync('backend/api/src/modules/students/student.routes.ts','utf8');
const hub=fs.readFileSync('apps/student-mobile/src/StudentServicesHub.tsx','utf8');
const app=fs.readFileSync('apps/student-mobile/App.tsx','utf8');
const checks=[
 ['P495 library student API route',routes.includes("/students/me/:organizationId/:schoolId/library")],
 ['P495 transport student API route',routes.includes("/students/me/:organizationId/:schoolId/transport")],
 ['Library endpoint requires linked student context',routes.includes("linkedStudentContext(userId,organizationId,schoolId);if(!student)return res.status(403).json({error:'Active student account link required'}")],
 ['Transport endpoint requires linked student context',routes.includes("linkedStudentContext(userId,organizationId,schoolId);if(!student)return res.status(403).json({error:'Active student account link required'}")],
 ['Library loans query scoped by tenant and student',routes.includes("borrowerId:student.id,borrowerType:'STUDENT'" )],
 ['Library reservation query scoped by tenant and student',routes.includes("borrowerId:student.id,borrowerType:'STUDENT'" )],
 ['Transport allocation scoped by linked student',routes.includes("studentId:student.id,status:'ACTIVE'" )],
 ['Transport trip events filtered by student ID',routes.includes("events:{where:{studentId:student.id}" )],
 ['Transport route includes ordered stops',routes.includes("stops:{orderBy:{sequence:'asc'}}" )],
 ['Library response returns loans and reservations',routes.includes("return {loans:loans.map")&&routes.includes("reservations:reservations.map")],
 ['Transport response returns allocation and trip events',routes.includes("allocations:allocations.map")&&routes.includes("recentStudentEvents")],
 ['Student services calls Library API',hub.includes("root+'/library'")],
 ['Student services calls Transport API',hub.includes("root+'/transport'")],
 ['Hub validates array response contract',hub.includes("Array.isArray(l.loans)")&&hub.includes("Array.isArray(t.allocations)")],
 ['Hub provides loading state',hub.includes("ActivityIndicator")],
 ['Hub provides error state',hub.includes("Unable to load student services")],
 ['Hub refresh action',hub.includes("Refresh services")],
 ['Hub shows loan overdue indicator',hub.includes("Overdue")],
 ['Hub shows reservation information',hub.includes("Reservations:")||hub.includes("reservations.length")],
 ['Hub displays route stops',hub.includes("a.route?.stops?.map")],
 ['Hub displays recent trip events',hub.includes("recentStudentEvents")],
 ['App passes API base URL',app.includes("StudentServicesHub api={api}")],
 ['App passes organization context',app.includes("organizationId={selected.organization.id}")],
 ['App passes school context',app.includes("schoolId={selected.school.id}")],
 ['App passes access token',app.includes("token={tokenPair.accessToken}")],
 ['UI uses student service details rather than old placeholder copy',!hub.includes("NOT_CONNECTED")],
 ['Library endpoint does not accept client student ID route param',!routes.includes("/students/me/:organizationId/:schoolId/:studentId/library")],
 ['Transport endpoint does not accept client student ID route param',!routes.includes("/students/me/:organizationId/:schoolId/:studentId/transport")],
 ['Tenant context wraps service queries',routes.includes("withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>")],
 ['Endpoint authorization uses authenticated user context',routes.includes("userId=req.auth!.userId")],
 ['P495 gap register root updated',fs.existsSync('MASTER-OPEN-GAPS-REGISTER.md')&&fs.readFileSync('MASTER-OPEN-GAPS-REGISTER.md','utf8').includes('P495 — Student Services Integration')],
];
for(const [name,pass] of checks) console.log(`${pass?'PASS':'FAIL'} ${name}`);
console.log(`RESULT ${checks.filter(x=>x[1]).length}/${checks.length}`);
if(checks.some(x=>!x[1]))process.exit(1);
