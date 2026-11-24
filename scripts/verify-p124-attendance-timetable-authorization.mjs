import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const attendance = fs.readFileSync(path.join(root, 'backend/api/src/modules/attendance/attendance.routes.ts'), 'utf8');
const timetable = fs.readFileSync(path.join(root, 'backend/api/src/modules/staff/teacher-timetable.routes.ts'), 'utf8');
const gaps = fs.readFileSync(path.join(root, 'MASTER-OPEN-GAPS-REGISTER.md'), 'utf8');
const docsGaps = fs.readFileSync(path.join(root, 'docs/MASTER-OPEN-GAPS-REGISTER.md'), 'utf8');
const checks = [
  ['attendance router requires authentication', attendance.includes('attendanceRouter.use(authenticate)')],
  ['school scope requires active membership', attendance.includes('hasActiveSchoolMembership(userId,organizationId,schoolId)')],
  ['teacher assignment checks include active assignment', attendance.includes('staffMemberId:staff.id,gradeLevelId,isActive:true')],
  ['teacher assignment checks include effective start date', attendance.includes('startsOn:{lte:atDate||new Date()}')],
  ['teacher assignment checks include effective end date', attendance.includes('endsOn:{gte:atDate||new Date()}')],
  ['session list filters assignment validity before session query', attendance.includes('const assignmentDate=date?new Date(`${date}T00:00:00.000Z`):new Date();') && !attendance.includes('AND:[{OR:[{startsOn:null},{startsOn:{lte:date?')],
  ['session list OR filters contain only attendance-session dimensions', attendance.includes('assignmentFilters=assignments.map(a=>({\n        academicYearId:a.academicYearId,gradeLevelId:a.gradeLevelId,sectionName:a.sectionName\n      }))')],
  ['teacher roster requires exact session assignment', attendance.includes('attendance/teacher/sessions/:sessionId/roster') && attendance.includes('session.academicYearId,session.sessionDate)')],
  ['student attendance history requires teacher staff identity', attendance.includes('const staff=await tx.staffMember.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,userId:s.userId,status:"ACTIVE"}')],
  ['student attendance history checks active enrollment', attendance.includes('studentId:req.params.studentId,status:"ENROLLED"')],
  ['student attendance history filters to assigned session scopes', attendance.includes('sessionId:{in:sessions.map(session=>session.id)}')],
  ['correction request checks exact academic year and session date', attendance.includes('attendanceSession.academicYearId,attendanceSession.sessionDate)')],
  ['timetable router requires authentication', timetable.includes('teacherTimetableRouter.use(authenticate)')],
  ['teacher self timetable requires active staff profile', timetable.includes('status:"ACTIVE"},select:{id:true}')],
  ['teacher self timetable filters active assignments', timetable.includes('staffMemberId:staff.id,isActive:true')],
  ['teacher timetable filters effective slot dates', timetable.includes('effectiveFrom:{lte:date}') && timetable.includes('effectiveTo:{gte:date}')],
  ['timetable administration requires management permission', timetable.includes('hasSchoolPermission(userId,organizationId,schoolId,"academics.manage")')],
  ['P124 gaps are present', ['P124-G001','P124-G002','P124-G003'].every(id => gaps.includes(id))],
  ['root and docs gap registers are identical', gaps === docsGaps],
];
let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
console.log(`P124 verification: ${checks.length}/${checks.length} checks passed`);
