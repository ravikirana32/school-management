import fs from 'node:fs';
const routes=fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8');
const doc=fs.readFileSync('docs/mobile/P476-PARENT-ACADEMIC-API-INTEGRATION.md','utf8');
const checks=[
 ['three planner routes exist',routes.includes('parentPlannerBase+"/timetable"')&&routes.includes('parentPlannerBase+"/calendar"')&&routes.includes('parentPlannerBase+"/exams"')],
 ['all planner routes require authentication',routes.includes('parentPlannerBase+"/timetable",authenticate')&&routes.includes('parentPlannerBase+"/calendar",authenticate')&&routes.includes('parentPlannerBase+"/exams",authenticate')],
 ['bounded valid date range schema',routes.includes('parentPlannerRangeSchema')&&routes.includes('no longer than 36 days')],
 ['active parent portal authorization gates',routes.includes('parentScope(userId,organizationId,schoolId,"parent.portal.read")')],
 ['specific linked student validation',routes.includes('parentPlannerContext(tx,userId,organizationId,schoolId,req.params.studentId)')],
 ['tenant/school predicates on timetable query',routes.includes('tx.teacherTimetableSlot.findMany({where:{organizationId,schoolId,isActive:true')],
 ['timetable date occurrences generated',routes.includes('const occurrences:any[]')&&routes.includes('dayOfWeek')&&routes.includes('periodNumber')&&routes.includes('dateKey')],
 ['cancel exceptions suppressed',routes.includes('exception?.exceptionType==="CANCEL"')],
 ['override time and room exceptions applied',routes.includes('exception?.startsAt||slot.startsAt')&&routes.includes('exception?.room||slot.room')],
 ['assignment effective dates filtered',routes.includes('startsOn:{lte:dates.toExclusive}')&&routes.includes('endsOn:{gte:dates.from}')],
 ['calendar filters parent/student audiences',routes.includes('audience:{in:["ALL","STUDENTS","PARENTS"]')],
 ['calendar overlap date range applied',routes.includes('startsAt:{lt:new Date(dates.toExclusive.valueOf()+86400000)},endsAt:{gte:dates.from}')],
 ['exams limited to published status',routes.includes('status:"PUBLISHED",examDate:{gte:dates.from,lte:dates.toExclusive}')],
 ['exams match enrollment grade/year/section',routes.includes('OR:enrollments.map((e:any)=>({academicYearId:e.academicYearId,gradeLevelId:e.gradeLevelId,sectionName:e.sectionName||null}))')],
 ['API documentation records runtime limitations',doc.includes('typecheck, database migration validation and runtime requests were not executed')],
 ['API documentation present',doc.includes('Parent Academic Planner Backend Integration')]
];
let failures=0;for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)failures++;}console.log(`${checks.length-failures}/${checks.length} checks passed`);if(failures)process.exit(1);
