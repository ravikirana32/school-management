import { Router } from "express";
import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext } from "../auth/tenant-context.js";
import { hasSchoolPermission } from "../auth/school-permissions.js";
import { hasSchoolAdminAccess } from "../organizations/organization.authorization.js";
import { hasActiveSchoolMembership } from "../schools/school-config.authorization.js";

export const attendanceRouter = Router();
attendanceRouter.use(authenticate);
const asyncRoute = (fn: (req:any,res:any)=>Promise<unknown>) => (req:any,res:any,next:any)=>Promise.resolve(fn(req,res)).catch(next);
const statusValues = ["PRESENT","ABSENT","LATE","HALF_DAY","EXCUSED","LEAVE"] as const;
const dateOnly = z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/).refine(v => {
  const d = new Date(`${v}T00:00:00.000Z`); return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0,10) === v;
}, "Invalid calendar date");
const sessionSchema = z.object({
  academicYearId:z.string().min(1), gradeLevelId:z.string().min(1),
  sectionName:z.string().trim().max(40).optional(), sessionDate:dateOnly
});
const markSchema = z.object({
  marks:z.array(z.object({
    studentId:z.string().min(1), status:z.enum(statusValues),
    arrivalTime:z.string().datetime().optional(), remarks:z.string().max(500).optional()
  })).min(1).max(200)
});
async function scope(req:any,res:any) {
  const organizationId=String(req.params.organizationId||""), schoolId=String(req.params.schoolId||""), userId=req.auth!.userId;
  if(!await hasActiveSchoolMembership(userId,organizationId,schoolId)){res.status(403).json({error:"Active school membership required"});return null;}
  return {organizationId,schoolId,userId};
}
async function entitled(organizationId:string,schoolId:string) {
  return withTenantContext(prisma,{organizationId,schoolId},async tx=>{
    const sub=await tx.organizationSubscription.findFirst({where:{organizationId,status:{in:["TRIALING","ACTIVE","PAST_DUE"]},currentPeriodEndsAt:{gt:new Date()}},orderBy:{createdAt:"desc"}});
    if(!sub)return false;
    const plan=await tx.subscriptionPlan.findUnique({where:{id:sub.planId}});
    return (plan?.entitlements as Record<string,unknown>|null)?.attendance===true;
  });
}
async function canManage(userId:string,org:string,school:string) {
  return hasSchoolAdminAccess(userId,org,school) || hasSchoolPermission(userId,org,school,"attendance.manage");
}
async function assignedToClass(userId:string,org:string,school:string,gradeLevelId:string,sectionName?:string,academicYearId?:string,atDate?:Date) {
  return withTenantContext(prisma,{organizationId:org,schoolId:school,userId},async tx=>{
    const staff=await tx.staffMember.findFirst({where:{organizationId:org,schoolId:school,userId,status:"ACTIVE"},select:{id:true}});
    if(!staff)return false;
    const assignment=await tx.teacherAssignment.findFirst({where:{
      organizationId:org,schoolId:school,staffMemberId:staff.id,gradeLevelId,isActive:true,
      ...(sectionName ? {sectionName} : {}),
      ...(academicYearId ? {academicYearId} : {}),
      OR:[{startsOn:null},{startsOn:{lte:atDate||new Date()}}],
      AND:[{OR:[{endsOn:null},{endsOn:{gte:atDate||new Date()}}]}]
    },select:{id:true}});
    return !!assignment;
  });
}
async function canMark(userId:string,org:string,school:string,gradeLevelId:string,sectionName?:string,academicYearId?:string,atDate?:Date) {
  if(!await entitled(org,school))return false;
  if(await canManage(userId,org,school))return true;
  if(!sectionName)return false;
  return (await hasSchoolPermission(userId,org,school,"attendance.mark")) &&
    (await assignedToClass(userId,org,school,gradeLevelId,sectionName,academicYearId,atDate));
}

attendanceRouter.post("/:organizationId/:schoolId/attendance/sessions",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  const parsed=sessionSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:"Invalid session",details:parsed.error.flatten()});
  const d=parsed.data;
  if(!await canMark(s.userId,s.organizationId,s.schoolId,d.gradeLevelId,d.sectionName,d.academicYearId,new Date(`${d.sessionDate}T00:00:00.000Z`)))return res.status(403).json({error:"Attendance marking is limited to administrators or teachers assigned to this class"});
  if(!await entitled(s.organizationId,s.schoolId))return res.status(402).json({error:"Attendance is not included in the active subscription"});
  const result=await withTenantContext(prisma,s,async tx=>{
    const year=await tx.academicYear.findFirst({where:{id:d.academicYearId,organizationId:s.organizationId,schoolId:s.schoolId}});
    const grade=await tx.gradeLevel.findFirst({where:{id:d.gradeLevelId,organizationId:s.organizationId,schoolId:s.schoolId,isActive:true}});
    if(!year||!grade)throw Object.assign(new Error("Academic year or grade does not belong to this school"),{status:400});
    const date=new Date(`${d.sessionDate}T00:00:00.000Z`);
    if(date<year.startsOn||date>year.endsOn)throw Object.assign(new Error("Attendance date is outside the academic year"),{status:400});
    const session=await tx.attendanceSession.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,academicYearId:d.academicYearId,gradeLevelId:d.gradeLevelId,sectionName:d.sectionName,sessionDate:date,createdBy:s.userId,updatedBy:s.userId}});
    await tx.attendanceAuditEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,actorUserId:s.userId,eventType:"SESSION_CREATED",afterData:{sessionId:session.id,sessionDate:d.sessionDate,gradeLevelId:d.gradeLevelId,sectionName:d.sectionName}}});
    return session;
  });
  return res.status(201).json({data:result});
}));


function encodeAttendanceSyncCursor(value:{createdAt:Date;id:string}) {
  return Buffer.from(JSON.stringify({createdAt:value.createdAt.toISOString(),id:value.id}),"utf8").toString("base64url");
}
function decodeAttendanceSyncCursor(value:string) {
  try {
    const parsed=JSON.parse(Buffer.from(value,"base64url").toString("utf8"));
    const createdAt=new Date(parsed.createdAt);
    if(!Number.isFinite(createdAt.getTime())||typeof parsed.id!=="string")return null;
    return {createdAt,id:parsed.id};
  } catch { return null; }
}

attendanceRouter.get("/:organizationId/:schoolId/attendance/mobile-sync",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  if(!await entitled(s.organizationId,s.schoolId))return res.status(402).json({error:"Attendance is not included in the active subscription"});
  const canAdmin=await canManage(s.userId,s.organizationId,s.schoolId);
  if(!canAdmin&&!await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"attendance.mark"))return res.status(403).json({error:"Attendance sync permission required"});
  const cursorValue=typeof req.query.cursor==="string"?req.query.cursor:undefined;
  if(cursorValue&&cursorValue.length>512)return res.status(400).json({error:"Invalid attendance sync cursor"});
  const cursor=cursorValue?decodeAttendanceSyncCursor(cursorValue):null;
  if(cursorValue&&!cursor)return res.status(400).json({error:"Invalid attendance sync cursor"});
  const limit=Math.min(100,Math.max(1,Number(req.query.limit)||50));
  const page=await withTenantContext(prisma,s,async tx=>{
    const syncStartedAt=new Date();
    const events=await tx.attendanceAuditEvent.findMany({
      where:{organizationId:s.organizationId,schoolId:s.schoolId,...(cursor?{OR:[
        {createdAt:{gt:cursor.createdAt}},
        {createdAt:cursor.createdAt,id:{gt:cursor.id}}
      ]}:{})},
      orderBy:[{createdAt:"asc"},{id:"asc"}],take:limit+1
    });
    const hasMore=events.length>limit;
    const batch=events.slice(0,limit);
    const changes=[];
    for(const event of batch){
      let attendance:any=null,session:any=null;
      if(event.attendanceId){
        attendance=await tx.studentAttendance.findFirst({where:{id:event.attendanceId,organizationId:s.organizationId,schoolId:s.schoolId}});
        if(attendance)session=await tx.attendanceSession.findFirst({where:{id:attendance.sessionId,organizationId:s.organizationId,schoolId:s.schoolId}});
      }
      const sessionId=typeof (event.afterData as any)?.sessionId==="string"?(event.afterData as any).sessionId:null;
      if(!session&&sessionId)session=await tx.attendanceSession.findFirst({where:{id:sessionId,organizationId:s.organizationId,schoolId:s.schoolId}});
      if(!session)continue;
      if(!await canMark(s.userId,s.organizationId,s.schoolId,session.gradeLevelId,session.sectionName||undefined,session.academicYearId,session.sessionDate))continue;
      changes.push({event,session,attendance});
    }
    const last=batch[batch.length-1];
    return {changes,hasMore,nextCursor:last?encodeAttendanceSyncCursor(last):(cursorValue||encodeAttendanceSyncCursor({createdAt:syncStartedAt,id:""})),serverTime:syncStartedAt.toISOString()};
  });
  return res.json({data:{...page,scope:{organizationId:s.organizationId,schoolId:s.schoolId}}});
}));

attendanceRouter.get("/:organizationId/:schoolId/attendance/sessions",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  if(!await entitled(s.organizationId,s.schoolId))return res.status(402).json({error:"Attendance is not included in the active subscription"});
  const date=typeof req.query.date==="string"?req.query.date:undefined;
  if(date&&!dateOnly.safeParse(date).success)return res.status(400).json({error:"Invalid date"});
  const gradeLevelId=typeof req.query.gradeLevelId==="string"?req.query.gradeLevelId:undefined;
  const admin=await canManage(s.userId,s.organizationId,s.schoolId);
  const data=await withTenantContext(prisma,s,async tx=>{
    let assignmentFilters:any[]=[];
    if(!admin){
      if(!await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"attendance.mark"))return [];
      const staff=await tx.staffMember.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,userId:s.userId,status:"ACTIVE"},select:{id:true}});
      if(!staff)return [];
      const assignmentDate=date?new Date(`${date}T00:00:00.000Z`):new Date();
      const assignments=await tx.teacherAssignment.findMany({where:{
        organizationId:s.organizationId,schoolId:s.schoolId,staffMemberId:staff.id,isActive:true,
        ...(gradeLevelId?{gradeLevelId}:{}),
        OR:[{startsOn:null},{startsOn:{lte:assignmentDate}}],
        AND:[{OR:[{endsOn:null},{endsOn:{gte:assignmentDate}}]}]
      },select:{academicYearId:true,gradeLevelId:true,sectionName:true}});
      // Assignment validity is evaluated against TeacherAssignment dates above.
      // Only fields that exist on AttendanceSession are used in the session filter.
      assignmentFilters=assignments.map(a=>({
        academicYearId:a.academicYearId,gradeLevelId:a.gradeLevelId,sectionName:a.sectionName
      }));
      if(!assignmentFilters.length)return [];
    }
    return tx.attendanceSession.findMany({
      where:{organizationId:s.organizationId,schoolId:s.schoolId,...(date?{sessionDate:new Date(`${date}T00:00:00.000Z`)}:{}),...(gradeLevelId?{gradeLevelId}:{}),...(!admin?{OR:assignmentFilters}:{})},
      orderBy:[{sessionDate:"desc"},{createdAt:"desc"}],take:100
    });
  });
  return res.json({data});
}));

attendanceRouter.post("/:organizationId/:schoolId/attendance/sessions/:sessionId/open",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  const result=await withTenantContext(prisma,s,async tx=>{
    const session=await tx.attendanceSession.findFirst({where:{id:req.params.sessionId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!session)return null;
    if(!await canMark(s.userId,s.organizationId,s.schoolId,session.gradeLevelId,session.sectionName||undefined,session.academicYearId,session.sessionDate))throw Object.assign(new Error("Not assigned to this class"),{status:403});
    if(session.status!=="DRAFT")throw Object.assign(new Error("Only draft sessions can be opened"),{status:409});
    const now=new Date();
    const changed=await tx.attendanceSession.updateMany({where:{id:session.id,organizationId:s.organizationId,schoolId:s.schoolId,status:"DRAFT"},data:{status:"OPEN",openedAt:now,updatedBy:s.userId}});
    if(changed.count!==1)throw Object.assign(new Error("Session state changed concurrently; reload and retry"),{status:409});
    const updated=await tx.attendanceSession.findFirst({where:{id:session.id,organizationId:s.organizationId,schoolId:s.schoolId}});
    await tx.attendanceAuditEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,actorUserId:s.userId,eventType:"SESSION_OPENED",afterData:{sessionId:session.id}}});
    return updated;
  });
  if(!result)return res.status(404).json({error:"Session not found"});
  return res.json({data:result});
}));

attendanceRouter.post("/:organizationId/:schoolId/attendance/sessions/:sessionId/marks",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  const parsed=markSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:"Invalid attendance marks",details:parsed.error.flatten()});
  const studentIds=parsed.data.marks.map(m=>m.studentId);
  if(new Set(studentIds).size!==studentIds.length)return res.status(400).json({error:"Duplicate student IDs in the same batch"});
  const idempotencyKey=req.get("idempotency-key")||undefined;
  if(idempotencyKey&&(!/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)))return res.status(400).json({error:"Invalid idempotency key"});
  const payloadHash=createHash("sha256").update(JSON.stringify({sessionId:req.params.sessionId,marks:parsed.data.marks})).digest("hex");
  let result:any;
  try {
    result=await withTenantContext(prisma,s,async tx=>{
      if(idempotencyKey){
        const previous=await tx.mobileMutationReceipt.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,userId:s.userId,idempotencyKey}});
        if(previous){
          if(previous.payloadHash!==payloadHash)throw Object.assign(new Error("Idempotency key was already used with a different payload"),{status:409});
          return {items:previous.response as any[],replayed:true};
        }
      }
      const session=await tx.attendanceSession.findFirst({where:{id:req.params.sessionId,organizationId:s.organizationId,schoolId:s.schoolId}});
      if(!session)return {notFound:true as const};
      if(!await canMark(s.userId,s.organizationId,s.schoolId,session.gradeLevelId,session.sectionName||undefined,session.academicYearId,session.sessionDate))throw Object.assign(new Error("Not assigned to this class"),{status:403});
      if(session.status!=="OPEN")throw Object.assign(new Error("Attendance can only be marked while the session is open"),{status:409});
      const enrollments=await tx.studentEnrollment.findMany({where:{
        organizationId:s.organizationId,schoolId:s.schoolId,academicYearId:session.academicYearId,
        gradeLevelId:session.gradeLevelId,sectionName:session.sectionName,status:"ENROLLED",
        studentId:{in:studentIds}
      },select:{id:true,studentId:true}});
      const activeStudents=await tx.student.findMany({where:{
        organizationId:s.organizationId,schoolId:s.schoolId,status:"ACTIVE",id:{in:studentIds}
      },select:{id:true}});
      if(enrollments.length!==studentIds.length || activeStudents.length!==studentIds.length)throw Object.assign(new Error("Every student must have an active enrollment in this session's academic year, grade and section"),{status:400});
      const existing=await tx.studentAttendance.findMany({where:{sessionId:session.id,studentId:{in:studentIds}},select:{studentId:true}});
      if(existing.length)throw Object.assign(new Error("Attendance already exists for one or more students; use a correction request"),{status:409});
      const rows=[];
      for(const mark of parsed.data.marks){
        const enrollment=enrollments.find(e=>e.studentId===mark.studentId)!;
        const row=await tx.studentAttendance.create({data:{
          organizationId:s.organizationId,schoolId:s.schoolId,sessionId:session.id,studentId:mark.studentId,
          enrollmentId:enrollment.id,status:mark.status,arrivalTime:mark.arrivalTime?new Date(mark.arrivalTime):undefined,
          remarks:mark.remarks,markedBy:s.userId,source:await canManage(s.userId,s.organizationId,s.schoolId)?"ADMIN":"TEACHER"
        }});
        rows.push(row);
        await tx.attendanceAuditEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,attendanceId:row.id,studentId:row.studentId,actorUserId:s.userId,eventType:"ATTENDANCE_MARKED",afterData:{status:row.status,source:row.source}}});
      }
      if(idempotencyKey)await tx.mobileMutationReceipt.create({data:{
        organizationId:s.organizationId,schoolId:s.schoolId,userId:s.userId,idempotencyKey,payloadHash,
        response:JSON.parse(JSON.stringify(rows))
      }});
      return {items:rows,replayed:false};
    });
  } catch(error:any) {
    if(idempotencyKey&&error?.code==="P2002"){
      const previous=await withTenantContext(prisma,s,tx=>tx.mobileMutationReceipt.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,userId:s.userId,idempotencyKey}}));
      if(previous&&previous.payloadHash===payloadHash)result={items:previous.response as any[],replayed:true};
      else throw error;
    } else throw error;
  }
  if("notFound" in result)return res.status(404).json({error:"Session not found"});
  return res.status(result.replayed?200:201).json({data:result.items,replayed:!!result.replayed});
}));

attendanceRouter.post("/:organizationId/:schoolId/attendance/sessions/:sessionId/submit",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  const result=await withTenantContext(prisma,s,async tx=>{
    const session=await tx.attendanceSession.findFirst({where:{id:req.params.sessionId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!session)return null;
    if(!await canMark(s.userId,s.organizationId,s.schoolId,session.gradeLevelId,session.sectionName||undefined,session.academicYearId,session.sessionDate))throw Object.assign(new Error("Not assigned to this class"),{status:403});
    if(session.status!=="OPEN")throw Object.assign(new Error("Only open sessions can be submitted"),{status:409});
    const count=await tx.studentAttendance.count({where:{sessionId:session.id}});
    if(!count)throw Object.assign(new Error("Cannot submit an empty attendance session"),{status:400});
    const now=new Date();
    const changed=await tx.attendanceSession.updateMany({where:{id:session.id,organizationId:s.organizationId,schoolId:s.schoolId,status:"OPEN"},data:{status:"SUBMITTED",submittedAt:now,updatedBy:s.userId}});
    if(changed.count!==1)throw Object.assign(new Error("Session state changed concurrently; reload and retry"),{status:409});
    const updated=await tx.attendanceSession.findFirst({where:{id:session.id,organizationId:s.organizationId,schoolId:s.schoolId}});
    await tx.attendanceAuditEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,actorUserId:s.userId,eventType:"SESSION_SUBMITTED",afterData:{sessionId:session.id,markedCount:count}}});
    return updated;
  });
  if(!result)return res.status(404).json({error:"Session not found"});
  return res.json({data:result});
}));

attendanceRouter.post("/:organizationId/:schoolId/attendance/sessions/:sessionId/lock",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  if(!await entitled(s.organizationId,s.schoolId))return res.status(402).json({error:"Attendance is not included in the active subscription"});
  if(!await canManage(s.userId,s.organizationId,s.schoolId))return res.status(403).json({error:"Attendance management permission required"});
  const result=await withTenantContext(prisma,s,async tx=>{
    const session=await tx.attendanceSession.findFirst({where:{id:req.params.sessionId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!session)return null;
    if(session.status!=="SUBMITTED")throw Object.assign(new Error("Only submitted sessions can be locked"),{status:409});
    const now=new Date();
    const changed=await tx.attendanceSession.updateMany({where:{id:session.id,organizationId:s.organizationId,schoolId:s.schoolId,status:"SUBMITTED"},data:{status:"LOCKED",lockedAt:now,updatedBy:s.userId}});
    if(changed.count!==1)throw Object.assign(new Error("Session state changed concurrently; reload and retry"),{status:409});
    const updated=await tx.attendanceSession.findFirst({where:{id:session.id,organizationId:s.organizationId,schoolId:s.schoolId}});
    await tx.attendanceAuditEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,actorUserId:s.userId,eventType:"SESSION_LOCKED",afterData:{sessionId:session.id}}});
    return updated;
  });
  if(!result)return res.status(404).json({error:"Session not found"});
  return res.json({data:result});
}));



attendanceRouter.get("/:organizationId/:schoolId/attendance/teacher/sessions/:sessionId/roster",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  if(!await entitled(s.organizationId,s.schoolId))return res.status(402).json({error:"Attendance is not included in the active subscription"});
  if(!await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"attendance.mark"))return res.status(403).json({error:"Teacher attendance permission required"});
  const data=await withTenantContext(prisma,s,async tx=>{
    const session=await tx.attendanceSession.findFirst({where:{id:req.params.sessionId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!session)return null;
    if(!await canMark(s.userId,s.organizationId,s.schoolId,session.gradeLevelId,session.sectionName||undefined,session.academicYearId,session.sessionDate))
      throw Object.assign(new Error("Not assigned to this class for the selected academic year/date"),{status:403});
    const enrollments=await tx.studentEnrollment.findMany({
      where:{organizationId:s.organizationId,schoolId:s.schoolId,academicYearId:session.academicYearId,
        gradeLevelId:session.gradeLevelId,sectionName:session.sectionName,status:"ENROLLED"},
      select:{id:true,studentId:true,rollNumber:true},orderBy:{rollNumber:"asc"},take:500
    });
    const ids=enrollments.map(e=>e.studentId);
    const students=ids.length?await tx.student.findMany({
      where:{organizationId:s.organizationId,schoolId:s.schoolId,id:{in:ids},status:"ACTIVE"},
      select:{id:true,admissionNumber:true,firstName:true,middleName:true,lastName:true,preferredName:true}
    }):[];
    const marks=ids.length?await tx.studentAttendance.findMany({
      where:{organizationId:s.organizationId,schoolId:s.schoolId,sessionId:session.id,studentId:{in:ids}},
      select:{id:true,studentId:true,status:true,remarks:true,arrivalTime:true}
    }):[];
    const studentById=new Map(students.map(st=>[st.id,st]));
    const markByStudent=new Map(marks.map(m=>[m.studentId,m]));
    return {session,items:enrollments.filter(e=>studentById.has(e.studentId)).map(e=>({
      enrollmentId:e.id,rollNumber:e.rollNumber,student:studentById.get(e.studentId),attendance:markByStudent.get(e.studentId)||null
    }))};
  });
  if(!data)return res.status(404).json({error:"Attendance session not found"});
  return res.json({data});
}));

attendanceRouter.get("/:organizationId/:schoolId/attendance/sessions/:sessionId/roster",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  if(!await entitled(s.organizationId,s.schoolId))return res.status(402).json({error:"Attendance is not included in the active subscription"});
  if(!await canManage(s.userId,s.organizationId,s.schoolId))return res.status(403).json({error:"School administrator attendance access required"});
  const data=await withTenantContext(prisma,s,async tx=>{
    const session=await tx.attendanceSession.findFirst({where:{id:req.params.sessionId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!session)return null;
    const enrollments=await tx.studentEnrollment.findMany({
      where:{organizationId:s.organizationId,schoolId:s.schoolId,academicYearId:session.academicYearId,
        gradeLevelId:session.gradeLevelId,sectionName:session.sectionName,status:"ENROLLED"},
      select:{id:true,studentId:true,rollNumber:true},orderBy:{rollNumber:"asc"},take:500
    });
    const ids=enrollments.map(e=>e.studentId);
    const students=ids.length?await tx.student.findMany({
      where:{organizationId:s.organizationId,schoolId:s.schoolId,id:{in:ids},status:"ACTIVE"},
      select:{id:true,admissionNumber:true,firstName:true,middleName:true,lastName:true,preferredName:true}
    }):[];
    const marks=ids.length?await tx.studentAttendance.findMany({
      where:{organizationId:s.organizationId,schoolId:s.schoolId,sessionId:session.id,studentId:{in:ids}},
      select:{id:true,studentId:true,status:true,remarks:true,arrivalTime:true}
    }):[];
    const studentById=new Map(students.map(st=>[st.id,st]));
    const markByStudent=new Map(marks.map(m=>[m.studentId,m]));
    return {session,items:enrollments.filter(e=>studentById.has(e.studentId)).map(e=>({
      enrollmentId:e.id,rollNumber:e.rollNumber,student:studentById.get(e.studentId),attendance:markByStudent.get(e.studentId)||null
    }))};
  });
  if(!data)return res.status(404).json({error:"Attendance session not found"});
  return res.json({data});
}));

attendanceRouter.get("/:organizationId/:schoolId/attendance/students/:studentId/records",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  if(!await entitled(s.organizationId,s.schoolId))return res.status(402).json({error:"Attendance is not included in the active subscription"});
  const admin=await canManage(s.userId,s.organizationId,s.schoolId);
  const readable=admin||await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"attendance.read");
  if(!readable)return res.status(403).json({error:"Attendance read permission required"});
  const data=await withTenantContext(prisma,s,async tx=>{
    if(admin){
      return tx.studentAttendance.findMany({
        where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:req.params.studentId},
        orderBy:{markedAt:"desc"},take:365
      });
    }
    // A non-admin reader must be an active teacher assigned to the student's
    // currently enrolled class. Never let a school-wide attendance.read grant
    // expose every student's attendance history.
    const staff=await tx.staffMember.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,userId:s.userId,status:"ACTIVE"},select:{id:true}});
    if(!staff)return [];
    const enrollments=await tx.studentEnrollment.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:req.params.studentId,status:"ENROLLED"},select:{academicYearId:true,gradeLevelId:true,sectionName:true}});
    if(!enrollments.length)return [];
    const assignmentScopes:any[]=[];
    const now=new Date();
    for(const enrollment of enrollments){
      const assignment=await tx.teacherAssignment.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,staffMemberId:staff.id,academicYearId:enrollment.academicYearId,gradeLevelId:enrollment.gradeLevelId,sectionName:enrollment.sectionName,isActive:true,OR:[{startsOn:null},{startsOn:{lte:now}}],AND:[{OR:[{endsOn:null},{endsOn:{gte:now}}]}]},select:{id:true}});
      if(assignment)assignmentScopes.push(enrollment);
    }
    if(!assignmentScopes.length)return [];
    const sessions=await tx.attendanceSession.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,OR:assignmentScopes},select:{id:true}});
    if(!sessions.length)return [];
    return tx.studentAttendance.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:req.params.studentId,sessionId:{in:sessions.map(session=>session.id)}},orderBy:{markedAt:"desc"},take:365});
  });
  return res.json({data});
}));

attendanceRouter.post("/:organizationId/:schoolId/attendance/:attendanceId/correction-requests",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  const parsed=z.object({reason:z.string().trim().min(10).max(1000),requestedStatus:z.enum(statusValues)}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:"Invalid correction request",details:parsed.error.flatten()});
  const result=await withTenantContext(prisma,s,async tx=>{
    const attendance=await tx.studentAttendance.findFirst({where:{id:req.params.attendanceId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!attendance)return null;
    const attendanceSession=await tx.attendanceSession.findFirst({where:{id:attendance.sessionId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!attendanceSession)return null;
    if(!await canMark(s.userId,s.organizationId,s.schoolId,attendanceSession.gradeLevelId,attendanceSession.sectionName||undefined,attendanceSession.academicYearId,attendanceSession.sessionDate))throw Object.assign(new Error("Only assigned teachers or administrators can request a correction"),{status:403});
    if(attendanceSession.status==="DRAFT"||attendanceSession.status==="OPEN")throw Object.assign(new Error("Use the open session workflow to correct unsubmitted attendance"),{status:409});
    const pending=await tx.attendanceCorrectionRequest.findFirst({where:{attendanceId:attendance.id,status:"PENDING"}});
    if(pending)throw Object.assign(new Error("A pending correction already exists"),{status:409});
    const request=await tx.attendanceCorrectionRequest.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,attendanceId:attendance.id,studentId:attendance.studentId,requestedBy:s.userId,reason:parsed.data.reason,requestedStatus:parsed.data.requestedStatus}});
    await tx.attendanceAuditEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,attendanceId:attendance.id,studentId:attendance.studentId,actorUserId:s.userId,eventType:"CORRECTION_REQUESTED",afterData:{requestId:request.id,requestedStatus:request.requestedStatus}}});
    return request;
  });
  if(!result)return res.status(404).json({error:"Attendance record not found"});
  return res.status(201).json({data:result});
}));

attendanceRouter.get("/:organizationId/:schoolId/attendance/correction-requests",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  if(!await entitled(s.organizationId,s.schoolId))return res.status(402).json({error:"Attendance is not included in the active subscription"});
  if(!await canManage(s.userId,s.organizationId,s.schoolId))return res.status(403).json({error:"Attendance correction review permission required"});
  const status=typeof req.query.status==="string"?req.query.status:"PENDING";
  const data=await withTenantContext(prisma,s,tx=>tx.attendanceCorrectionRequest.findMany({
    where:{organizationId:s.organizationId,schoolId:s.schoolId,status:status as any},
    orderBy:{createdAt:"asc"},take:100
  }));
  return res.json({data});
}));

attendanceRouter.post("/:organizationId/:schoolId/attendance/correction-requests/:requestId/review",asyncRoute(async(req,res)=>{
  const s=await scope(req,res);if(!s)return;
  if(!await entitled(s.organizationId,s.schoolId))return res.status(402).json({error:"Attendance is not included in the active subscription"});
  if(!await canManage(s.userId,s.organizationId,s.schoolId))return res.status(403).json({error:"Attendance correction review permission required"});
  const parsed=z.object({decision:z.enum(["APPROVED","REJECTED"]),reviewNotes:z.string().max(1000).optional()}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:"Invalid review decision"});
  const result=await withTenantContext(prisma,s,async tx=>{
    const request=await tx.attendanceCorrectionRequest.findFirst({where:{id:req.params.requestId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!request)return null;
    if(request.status!=="PENDING")throw Object.assign(new Error("Correction request has already been reviewed"),{status:409});
    const now=new Date();
    const claimed=await tx.attendanceCorrectionRequest.updateMany({
      where:{id:request.id,organizationId:s.organizationId,schoolId:s.schoolId,status:"PENDING"},
      data:{status:parsed.data.decision,reviewedBy:s.userId,reviewedAt:now,reviewNotes:parsed.data.reviewNotes}
    });
    if(claimed.count!==1)throw Object.assign(new Error("Correction request was already reviewed by another administrator"),{status:409});
    const reviewed=await tx.attendanceCorrectionRequest.findFirst({where:{id:request.id,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(parsed.data.decision==="APPROVED"){
      const before=await tx.studentAttendance.findFirst({where:{id:request.attendanceId,organizationId:s.organizationId,schoolId:s.schoolId}});
      if(!before)throw Object.assign(new Error("Attendance record no longer exists"),{status:409});
      const after=await tx.studentAttendance.update({where:{id:before.id},data:{status:request.requestedStatus,correctedBy:s.userId,correctedAt:now}});
      await tx.attendanceAuditEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,attendanceId:after.id,studentId:after.studentId,actorUserId:s.userId,eventType:"ATTENDANCE_CORRECTED",beforeData:{status:before.status},afterData:{status:after.status,requestId:request.id}}});
    }
    await tx.attendanceAuditEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,attendanceId:request.attendanceId,studentId:request.studentId,actorUserId:s.userId,eventType:`CORRECTION_${parsed.data.decision}`,afterData:{requestId:request.id,reviewNotes:parsed.data.reviewNotes}}});
    return reviewed;
  });
  if(!result)return res.status(404).json({error:"Correction request not found"});
  return res.json({data:result});
}));
