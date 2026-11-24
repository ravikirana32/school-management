import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext, withIdentityContext, withPlatformContext } from "../auth/tenant-context.js";
import { hasSchoolPermission } from "../auth/school-permissions.js";
import { hasActiveSchoolMembership } from "../schools/school-config.authorization.js";
import { createStudentSchema, enrollmentSchema, enrollmentStatusChangeSchema, pickupContactSchema, studentDocumentSchema } from "./student.schemas.js";
import { normalizeGuardianEmail, normalizeGuardianPhone } from "./guardian-identity.js";
import { canTeacherAccessStudent } from "./teacher-student-access.js";
import { canTransitionStudent, isStudentExitStatus, canTransitionEnrollment, isEnrollmentExitStatus, type StudentLifecycleStatus, type StudentEnrollmentStatus } from "./student-lifecycle.js";
import { createInlinePreviewUrl } from "../documents/document-storage.js";

export const studentRouter = Router();
studentRouter.use(authenticate);
function asyncRoute(fn: (req: any, res: any) => Promise<unknown>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res)).catch(next);
}
async function scope(req: any, res: any, permission = "students.read") {
  const organizationId = String(req.params.organizationId || "");
  const schoolId = String(req.params.schoolId || "");
  const userId = req.auth!.userId;
  if (!await hasActiveSchoolMembership(userId, organizationId, schoolId)) {
    res.status(403).json({ error: "Active school membership required" }); return null;
  }
  if (!await hasSchoolPermission(userId, organizationId, schoolId, permission)) {
    res.status(403).json({ error: `Missing required permission: ${permission}` }); return null;
  }
  return { organizationId, schoolId, userId };
}
async function studentEntitlement(organizationId: string, schoolId: string) {
  return withTenantContext(prisma, { organizationId, schoolId }, async tx => {
    const sub = await tx.organizationSubscription.findFirst({
      where: { organizationId, status: { in: ["TRIALING","ACTIVE","PAST_DUE"] }, currentPeriodEndsAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" }
    });
    if (!sub) return false;
    const plan = await tx.subscriptionPlan.findUnique({ where: { id: sub.planId } });
    return (plan?.entitlements as Record<string, unknown> | null)?.students === true;
  });
}
const isDateOnly = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const date = (v?: string) => v ? new Date(`${v}T00:00:00.000Z`) : undefined;

// P284: linked student-account discovery. Link administration remains school scoped.
studentRouter.get('/students/me/schools',asyncRoute(async(req,res)=>{const userId=req.auth!.userId;const links=await withPlatformContext(prisma,tx=>tx.studentAccountLink.findMany({where:{userId,isActive:true,student:{status:'ACTIVE'}},include:{student:true},orderBy:{createdAt:'asc'}}));const schools=[];for(const link of links){const row=await withTenantContext(prisma,{organizationId:link.organizationId,schoolId:link.schoolId,userId},async tx=>{const [school,organization]=await Promise.all([tx.school.findFirst({where:{id:link.schoolId,organizationId:link.organizationId,isActive:true},select:{id:true,name:true,code:true,timezone:true}}),tx.organization.findFirst({where:{id:link.organizationId,isActive:true},select:{id:true,name:true,slug:true}})]);if(!school||!organization)return null;return {organization,school,student:{id:link.studentId,admissionNumber:link.student.admissionNumber,firstName:link.student.firstName,lastName:link.student.lastName,preferredName:link.student.preferredName}};});if(row)schools.push(row);}return res.json({data:schools});}));
studentRouter.post('/:organizationId/:schoolId/students/:studentId/link-account',asyncRoute(async(req,res)=>{const s=await scope(req,res,'students.update');if(!s)return;const parsed=z.object({userId:z.string().min(1).optional(),email:z.string().trim().email().optional()}).refine(d=>Boolean(d.userId||d.email)).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Verified user ID or email is required'});const identity=parsed.data.userId?await withIdentityContext(prisma,parsed.data.userId,tx=>tx.user.findFirst({where:{id:parsed.data.userId,isActive:true,emailVerifiedAt:{not:null}},select:{id:true,email:true}})):await withPlatformContext(prisma,tx=>tx.user.findFirst({where:{email:parsed.data.email!.trim().toLowerCase(),isActive:true,emailVerifiedAt:{not:null}},select:{id:true,email:true}}));if(!identity)return res.status(404).json({error:'Active user with verified email not found'});const result=await withTenantContext(prisma,s,async tx=>{const student=await tx.student.findFirst({where:{id:req.params.studentId,organizationId:s.organizationId,schoolId:s.schoolId,status:'ACTIVE'},select:{id:true,email:true}});if(!student)return {kind:'STUDENT_NOT_FOUND' as const};if(!student.email||student.email.trim().toLowerCase()!==identity.email.trim().toLowerCase())return {kind:'EMAIL_MISMATCH' as const};const existing=await tx.studentAccountLink.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:student.id}});if(existing&&existing.isActive&&existing.userId!==identity.id)return {kind:'LINK_CONFLICT' as const};const otherLink=await tx.studentAccountLink.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,userId:identity.id,isActive:true,studentId:{not:student.id}}});if(otherLink)return {kind:'USER_LINK_CONFLICT' as const};const linked=existing?await tx.studentAccountLink.update({where:{id:existing.id},data:{userId:identity.id,isActive:true,linkedBy:s.userId}}):await tx.studentAccountLink.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:student.id,userId:identity.id,linkedBy:s.userId}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.account.linked',resourceType:'StudentAccountLink',resourceId:linked.id,outcome:'SUCCESS',metadata:{studentId:student.id,targetUserId:identity.id}}});return {kind:'LINKED' as const,link:linked};});if(result.kind==='STUDENT_NOT_FOUND')return res.status(404).json({error:'Active student not found'});if(result.kind==='EMAIL_MISMATCH')return res.status(409).json({error:'Student email must match the target account verified email'});if(result.kind==='LINK_CONFLICT')return res.status(409).json({error:'Student is already linked to a different account'});if(result.kind==='USER_LINK_CONFLICT')return res.status(409).json({error:'User is already linked to another student in this school'});return res.status(201).json({data:result.link});}));
studentRouter.delete('/:organizationId/:schoolId/students/:studentId/link-account',asyncRoute(async(req,res)=>{const s=await scope(req,res,'students.update');if(!s)return;const result=await withTenantContext(prisma,s,async tx=>{const link=await tx.studentAccountLink.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:req.params.studentId,isActive:true}});if(!link)return null;const updated=await tx.studentAccountLink.update({where:{id:link.id},data:{isActive:false}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.account.unlinked',resourceType:'StudentAccountLink',resourceId:link.id,outcome:'SUCCESS',metadata:{studentId:link.studentId,targetUserId:link.userId}}});return updated;});if(!result)return res.status(404).json({error:'Student account link not found'});return res.json({data:{id:result.id,isActive:false}});}));
studentRouter.get('/students/me/:organizationId/:schoolId/profile',asyncRoute(async(req,res)=>{const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const link=await withPlatformContext(prisma,tx=>tx.studentAccountLink.findFirst({where:{organizationId,schoolId,userId,isActive:true},select:{studentId:true}}));if(!link)return res.status(403).json({error:'Active student account link required'});const profile=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const school=await tx.school.findFirst({where:{id:schoolId,organizationId,isActive:true},select:{id:true}});if(!school)return null;return tx.student.findFirst({where:{id:link.studentId,organizationId,schoolId,status:'ACTIVE'},select:{id:true,admissionNumber:true,firstName:true,middleName:true,lastName:true,preferredName:true,status:true,enrollments:{where:{status:'ENROLLED'},select:{academicYearId:true,gradeLevelId:true,sectionName:true,rollNumber:true}}}});});if(!profile)return res.status(404).json({error:'Student profile not found'});return res.json({data:profile});}));
// P535: student-owned notification preferences, scoped through an active student account link.
studentRouter.get('/students/me/:organizationId/:schoolId/notification-preferences',asyncRoute(async(req,res)=>{const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const link=await withPlatformContext(prisma,tx=>tx.studentAccountLink.findFirst({where:{organizationId,schoolId,userId,isActive:true},select:{studentId:true}}));if(!link)return res.status(403).json({error:'Active student account link required'});const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const school=await tx.school.findFirst({where:{id:schoolId,organizationId,isActive:true},select:{id:true}});if(!school)return null;return tx.notificationPreference.findMany({where:{organizationId,schoolId,userId,category:{in:['GENERAL','REPORT_CARD','HOMEWORK','FEES','ATTENDANCE','ADMISSIONS']}},orderBy:[{category:'asc'},{channel:'asc'}]});});if(data===null)return res.status(404).json({error:'School not found'});return res.json({data});}));
studentRouter.put('/students/me/:organizationId/:schoolId/notification-preferences',asyncRoute(async(req,res)=>{const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const parsed=z.object({category:z.enum(['GENERAL','REPORT_CARD','HOMEWORK','FEES','ATTENDANCE','ADMISSIONS']),channel:z.literal('IN_APP'),enabled:z.boolean()}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid notification preference'});const link=await withPlatformContext(prisma,tx=>tx.studentAccountLink.findFirst({where:{organizationId,schoolId,userId,isActive:true},select:{studentId:true}}));if(!link)return res.status(403).json({error:'Active student account link required'});const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const school=await tx.school.findFirst({where:{id:schoolId,organizationId,isActive:true},select:{id:true}});if(!school)return null;return tx.notificationPreference.upsert({where:{organizationId_schoolId_userId_category_channel:{organizationId,schoolId,userId,category:parsed.data.category,channel:'IN_APP'}},create:{organizationId,schoolId,userId,...parsed.data},update:{enabled:parsed.data.enabled}});});if(!data)return res.status(404).json({error:'School not found'});return res.json({data});}));

studentRouter.get('/students/me/:organizationId/:schoolId/inbox',asyncRoute(async(req,res)=>{const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const link=await withPlatformContext(prisma,tx=>tx.studentAccountLink.findFirst({where:{organizationId,schoolId,userId,isActive:true},select:{studentId:true}}));if(!link)return res.status(403).json({error:'Active student account link required'});const rows=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const school=await tx.school.findFirst({where:{id:schoolId,organizationId,isActive:true},select:{id:true}});if(!school)return [];return tx.notificationOutbox.findMany({where:{organizationId,schoolId,recipientUserId:userId,channel:'IN_APP',category:'GENERAL'},orderBy:{createdAt:'desc'},take:50});});return res.json({data:rows});}));
// P484 — Student-scoped academic planner read APIs (attendance, calendar, timetable).
const plannerRange = z.object({ from:z.string().regex(/^\d{4}-\d{2}-\d{2}$/), to:z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).refine(v=>{const a=new Date(`${v.from}T00:00:00.000Z`),b=new Date(`${v.to}T23:59:59.999Z`);return Number.isFinite(a.getTime())&&Number.isFinite(b.getTime())&&b>=a&&b.getTime()-a.getTime()<=366*24*60*60*1000;},{message:"Date range must be valid and no longer than 366 days"});
async function linkedStudentContext(userId:string,organizationId:string,schoolId:string){
 const link=await withPlatformContext(prisma,tx=>tx.studentAccountLink.findFirst({where:{organizationId,schoolId,userId,isActive:true,student:{status:"ACTIVE"}},select:{studentId:true}}));
 if(!link)return null;
 return withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const student=await tx.student.findFirst({where:{id:link.studentId,organizationId,schoolId,status:"ACTIVE"},select:{id:true,enrollments:{where:{status:"ENROLLED"},select:{academicYearId:true,gradeLevelId:true,sectionName:true,rollNumber:true}}}});
  const school=await tx.school.findFirst({where:{id:schoolId,organizationId,isActive:true},select:{id:true}});
  return student&&school?student:null;
 });
}
studentRouter.get('/students/me/:organizationId/:schoolId/attendance',asyncRoute(async(req,res)=>{
 const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const parsed=plannerRange.safeParse(req.query);if(!parsed.success)return res.status(400).json({error:"Invalid attendance date range",details:parsed.error.flatten()});
 const student=await linkedStudentContext(userId,organizationId,schoolId);if(!student)return res.status(403).json({error:"Active student account link required"});
 const from=new Date(`${parsed.data.from}T00:00:00.000Z`),to=new Date(`${parsed.data.to}T23:59:59.999Z`);
 const records=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const enrollmentFilters=student.enrollments.map(e=>({academicYearId:e.academicYearId,gradeLevelId:e.gradeLevelId,sectionName:e.sectionName}));
  if(!enrollmentFilters.length)return [];
  const sessions=await tx.attendanceSession.findMany({
   where:{organizationId,schoolId,sessionDate:{gte:from,lte:to},OR:enrollmentFilters},
   select:{id:true,sessionDate:true},orderBy:{sessionDate:"desc"},take:366
  });
  if(!sessions.length)return [];
  const marks=await tx.studentAttendance.findMany({
   where:{organizationId,schoolId,studentId:student.id,sessionId:{in:sessions.map(session=>session.id)}},
   select:{id:true,status:true,remarks:true,markedAt:true,sessionId:true},take:366
  });
  return marks.map(mark=>({...mark,sessionDate:sessions.find(session=>session.id===mark.sessionId)?.sessionDate}))
   .filter(row=>row.sessionDate).sort((a,b)=>b.sessionDate!.getTime()-a.sessionDate!.getTime());
 });
 return res.json({data:records.map(r=>({id:r.id,status:r.status,remarks:r.remarks,markedAt:r.markedAt,sessionDate:r.sessionDate!.toISOString().slice(0,10)}))});
}));
studentRouter.get('/students/me/:organizationId/:schoolId/calendar',asyncRoute(async(req,res)=>{
 const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const parsed=plannerRange.safeParse(req.query);if(!parsed.success)return res.status(400).json({error:"Invalid calendar date range",details:parsed.error.flatten()});
 const student=await linkedStudentContext(userId,organizationId,schoolId);if(!student)return res.status(403).json({error:"Active student account link required"});
 const from=new Date(`${parsed.data.from}T00:00:00.000Z`),to=new Date(`${parsed.data.to}T23:59:59.999Z`);
 const events=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const calendars=await tx.schoolCalendar.findMany({where:{organizationId,schoolId,isDefault:true},select:{id:true}});if(!calendars.length)return [];return tx.calendarEvent.findMany({where:{organizationId,schoolId,calendarId:{in:calendars.map(c=>c.id)},audience:{in:["ALL","STUDENTS"]},startsAt:{lte:to},endsAt:{gte:from}},select:{id:true,title:true,description:true,eventType:true,startsAt:true,endsAt:true,isAllDay:true,location:true},orderBy:{startsAt:"asc"},take:250});});
 return res.json({data:events});
}));
studentRouter.get('/students/me/:organizationId/:schoolId/timetable',asyncRoute(async(req,res)=>{
 const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const dateValue=String(req.query.date||"");if(!isDateOnly(dateValue))return res.status(400).json({error:"Valid date query is required"});
 const student=await linkedStudentContext(userId,organizationId,schoolId);if(!student)return res.status(403).json({error:"Active student account link required"});const dayOfWeek=new Date(`${dateValue}T00:00:00.000Z`).getUTCDay();
 const slots=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const enrollment=student.enrollments.find(e=>e.gradeLevelId&&e.sectionName);if(!enrollment)return [];const assignments=await tx.teacherAssignment.findMany({where:{organizationId,schoolId,academicYearId:enrollment.academicYearId,gradeLevelId:enrollment.gradeLevelId,sectionName:enrollment.sectionName!,isActive:true},select:{id:true}});if(!assignments.length)return [];return tx.teacherTimetableSlot.findMany({where:{organizationId,schoolId,academicYearId:enrollment.academicYearId,teacherAssignmentId:{in:assignments.map(a=>a.id)},dayOfWeek,isActive:true,OR:[{effectiveFrom:null},{effectiveFrom:{lte:new Date(`${dateValue}T00:00:00.000Z`)}}],AND:[{OR:[{effectiveTo:null},{effectiveTo:{gte:new Date(`${dateValue}T00:00:00.000Z`)}}]}]},select:{id:true,dayOfWeek:true,periodNumber:true,startsAt:true,endsAt:true,subjectName:true,room:true},orderBy:[{periodNumber:"asc"},{startsAt:"asc"}]});});
 return res.json({data:slots});
}));

// P485 — student-scoped published exam results and published report cards.
studentRouter.get('/students/me/:organizationId/:schoolId/exams',asyncRoute(async(req,res)=>{
 const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const student=await linkedStudentContext(userId,organizationId,schoolId);if(!student)return res.status(403).json({error:'Active student account link required'});
 const exams=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const scopes=student.enrollments.map((e:any)=>({academicYearId:e.academicYearId,gradeLevelId:e.gradeLevelId,sectionName:e.sectionName}));if(!scopes.length)return [];const rows=await tx.schoolAssessmentExam.findMany({where:{organizationId,schoolId,status:'PUBLISHED',OR:scopes},select:{id:true,academicYearId:true,gradeLevelId:true,sectionName:true,examName:true,subjectName:true,examDate:true,maxMarks:true,passMarks:true,marks:true},orderBy:[{examDate:'desc'},{subjectName:'asc'}],take:200});return rows.map((exam:any)=>{const marks=Array.isArray(exam.marks)?exam.marks:[];const own=marks.find((m:any)=>m.studentId===student.id);const score=own&&typeof own.score==='number'?own.score:null;const maxMarks=Number(exam.maxMarks);return {id:exam.id,examName:exam.examName,subjectName:exam.subjectName,examDate:exam.examDate,maxMarks,passMarks:Number(exam.passMarks||0),score,remarks:own?.remarks||null,percentage:score!==null&&maxMarks>0?score/maxMarks*100:null,status:exam.status};});});return res.json({data:exams});
}));
studentRouter.get('/students/me/:organizationId/:schoolId/report-cards',asyncRoute(async(req,res)=>{
 const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const student=await linkedStudentContext(userId,organizationId,schoolId);if(!student)return res.status(403).json({error:'Active student account link required'});const yearIds=[...new Set(student.enrollments.map((e:any)=>e.academicYearId))];const data=await withTenantContext(prisma,{organizationId,schoolId,userId},tx=>tx.studentReportCard.findMany({where:{organizationId,schoolId,studentId:student.id,status:'PUBLISHED',approvalStatus:'APPROVED',publishedAt:{not:null},...(yearIds.length?{academicYearId:{in:yearIds}}:{academicYearId:{in:[]}})},select:{id:true,academicYearId:true,termLabel:true,resultSummary:true,teacherRemarks:true,principalRemarks:true,publishedAt:true},orderBy:{publishedAt:'desc'},take:50}));return res.json({data});
}));

// P325: linked student-only published homework visibility.
// P327 — linked student can submit or resubmit answer text to their own published homework.
studentRouter.post('/students/me/:organizationId/:schoolId/homework/:assignmentId/submission',asyncRoute(async(req,res)=>{const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const parsed=z.object({answerText:z.string().trim().min(1).max(10000)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Answer text is required (maximum 10000 characters)'});const link=await withPlatformContext(prisma,tx=>tx.studentAccountLink.findFirst({where:{organizationId,schoolId,userId,isActive:true,student:{status:'ACTIVE'}},select:{studentId:true}}));if(!link)return res.status(403).json({error:'Active student account link required'});const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const school=await tx.school.findFirst({where:{id:schoolId,organizationId,isActive:true},select:{id:true}});if(!school)return {kind:'SCHOOL_NOT_FOUND' as const};const assignment=await tx.homeworkAssignment.findFirst({where:{id:req.params.assignmentId,organizationId,schoolId,studentId:link.studentId,status:'PUBLISHED'},select:{id:true}});if(!assignment)return {kind:'ASSIGNMENT_NOT_FOUND' as const};const existing=await tx.homeworkSubmission.findFirst({where:{organizationId,schoolId,studentId:link.studentId,homeworkAssignmentId:assignment.id}});if(existing?.status==='GRADED')return {kind:'GRADED' as const};const row=existing?await tx.homeworkSubmission.update({where:{id:existing.id},data:{answerText:parsed.data.answerText,submittedByUserId:userId,status:'RESUBMITTED',submittedAt:new Date(),gradedByUserId:null,score:null,maxScore:null,teacherFeedback:null,gradedAt:null}}):await tx.homeworkSubmission.create({data:{organizationId,schoolId,homeworkAssignmentId:assignment.id,studentId:link.studentId,submittedByUserId:userId,answerText:parsed.data.answerText,status:'SUBMITTED'}});return {kind:'OK' as const,row};});if(result.kind==='SCHOOL_NOT_FOUND')return res.status(404).json({error:'School not found'});if(result.kind==='ASSIGNMENT_NOT_FOUND')return res.status(404).json({error:'Published homework not found for this student'});if(result.kind==='GRADED')return res.status(409).json({error:'Graded submission cannot be changed'});return res.status(201).json({data:result.row});}));
studentRouter.get('/students/me/:organizationId/:schoolId/homework',asyncRoute(async(req,res)=>{const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const link=await withPlatformContext(prisma,tx=>tx.studentAccountLink.findFirst({where:{organizationId,schoolId,userId,isActive:true,student:{status:'ACTIVE'}},select:{studentId:true}}));if(!link)return res.status(403).json({error:'Active student account link required'});const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const school=await tx.school.findFirst({where:{id:schoolId,organizationId,isActive:true},select:{id:true}});if(!school)return null;const assignments=await tx.homeworkAssignment.findMany({where:{organizationId,schoolId,studentId:link.studentId,status:'PUBLISHED'},select:{id:true,title:true,subjectName:true,description:true,dueAt:true,attachmentMetadata:true,publishedAt:true},orderBy:[{dueAt:'asc'},{publishedAt:'desc'}],take:100});const submissions=assignments.length?await tx.homeworkSubmission.findMany({where:{organizationId,schoolId,studentId:link.studentId,homeworkAssignmentId:{in:assignments.map(a=>a.id)}},select:{id:true,homeworkAssignmentId:true,status:true,answerText:true,submittedAt:true,score:true,maxScore:true,teacherFeedback:true,gradedAt:true,attachments:{select:{id:true,displayName:true,securityStatus:true,createdAt:true}}}}):[];return assignments.map(a=>({...a,submission:submissions.find(x=>x.homeworkAssignmentId===a.id)||null}));});if(data===null)return res.status(404).json({error:'School not found'});return res.json({data});}));
studentRouter.post('/students/me/:organizationId/:schoolId/inbox/:notificationId/read',asyncRoute(async(req,res)=>{const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const link=await withPlatformContext(prisma,tx=>tx.studentAccountLink.findFirst({where:{organizationId,schoolId,userId,isActive:true},select:{studentId:true}}));if(!link)return res.status(403).json({error:'Active student account link required'});const row=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const notification=await tx.notificationOutbox.findFirst({where:{id:req.params.notificationId,organizationId,schoolId,recipientUserId:userId,channel:'IN_APP',category:'GENERAL'}});if(!notification)return null;if(notification.readAt)return notification;return tx.notificationOutbox.update({where:{id:notification.id},data:{readAt:new Date()}});});if(!row)return res.status(404).json({error:'Notification not found'});return res.json({data:row});}));
studentRouter.get("/:organizationId/:schoolId/students", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0,80) : "";
  const exactAdmissionNumber = typeof req.query.admissionNumber === "string" ? req.query.admissionNumber.trim().slice(0,40) : "";
  const allowedStatuses = ["APPLICANT","ACTIVE","INACTIVE","TRANSFERRED","GRADUATED","WITHDRAWN","ARCHIVED"];
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  if (status && !allowedStatuses.includes(status)) return res.status(400).json({ error: "Invalid student status filter" });
  const page = Math.max(1, Math.min(10000, Number(req.query.page) || 1));
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 25));
  const data = await withTenantContext(prisma, s, async tx => {
    const where: any = { organizationId: s.organizationId, schoolId: s.schoolId };
    if (status) where.status = status;
    if (exactAdmissionNumber) where.admissionNumber = { equals: exactAdmissionNumber, mode: "insensitive" };
    if (search) where.OR = [
      { admissionNumber: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } }
    ];
    const [items,total] = await Promise.all([
      tx.student.findMany({ where, select: { id:true, admissionNumber:true, firstName:true, middleName:true, lastName:true, preferredName:true, status:true, admissionDate:true, leavingDate:true, createdAt:true, updatedAt:true }, orderBy: [{ lastName:"asc" },{ firstName:"asc" }], skip:(page-1)*pageSize, take:pageSize }),
      tx.student.count({ where })
    ]);
    return { items, total, page, pageSize };
  });
  return res.json({ data });
}));

studentRouter.post("/:organizationId/:schoolId/students", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.create"); if (!s) return;
  if (!await studentEntitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Student management is not included in the active subscription" });
  const parsed = createStudentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid student details", details: parsed.error.flatten() });
  const { guardians, ...student } = parsed.data;
  if (guardians.filter(g => g.isPrimary).length > 1) return res.status(400).json({ error: "Only one primary guardian may be specified" });
  const result = await withTenantContext(prisma, s, async tx => {
    const created = await tx.student.create({
      data: { ...student, organizationId:s.organizationId, schoolId:s.schoolId,
        dateOfBirth:date(student.dateOfBirth), admissionDate:date(student.admissionDate), createdBy:s.userId }
    });
    for (const guardian of guardians) {
      const { relationship, isPrimary, isEmergency, canPickup, canReceiveCommunications, ...contact } = guardian;
      const createdGuardian = await tx.guardian.create({
        data: { ...contact, organizationId:s.organizationId, schoolId:s.schoolId }
      });
      await tx.studentGuardian.create({
        data: { organizationId:s.organizationId, schoolId:s.schoolId, studentId:created.id,
          guardianId:createdGuardian.id, relationship, isPrimary, isEmergency, canPickup, canReceiveCommunications }
      });
    }
    return created;
  });
  await prisma.auditLog.create({ data: {
    actorUserId:s.userId, organizationId:s.organizationId, schoolId:s.schoolId,
    action:"student.created", resourceType:"Student", resourceId:result.id, outcome:"SUCCESS",
    metadata:{ admissionNumber:result.admissionNumber }
  }});
  return res.status(201).json({ data: result });
}));

studentRouter.get("/:organizationId/:schoolId/students/:studentId", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const canReadPii = await hasSchoolPermission(s.userId, s.organizationId, s.schoolId, "students.pii.read");
  const data = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({
      where:{ id:req.params.studentId, organizationId:s.organizationId, schoolId:s.schoolId },
      select:{ id:true, admissionNumber:true, firstName:true, middleName:true, lastName:true, preferredName:true,
        status:true, admissionDate:true, leavingDate:true, createdAt:true, updatedAt:true,
        dateOfBirth:canReadPii, gender:canReadPii, bloodGroup:canReadPii, nationality:canReadPii,
        primaryLanguage:canReadPii, email:canReadPii, phone:canReadPii, addressLine1:canReadPii,
        addressLine2:canReadPii, locality:canReadPii, city:canReadPii, state:canReadPii,
        postalCode:canReadPii, countryCode:canReadPii, notes:canReadPii, previousSchoolName:canReadPii, previousSchoolBoard:canReadPii, previousSchoolGrade:canReadPii, previousSchoolLeavingDate:canReadPii, medicalConditions:canReadPii, allergies:canReadPii, medicationNotes:canReadPii, emergencyMedicalNotes:canReadPii,
        enrollments:{ select:{ id:true, academicYearId:true, gradeLevelId:true, sectionName:true, rollNumber:true, status:true, enrolledOn:true, endedOn:true }, orderBy:{ enrolledOn:"desc" } },
        guardians: canReadPii ? { select:{ id:true, relationship:true, isPrimary:true, isEmergency:true, canPickup:true, canReceiveCommunications:true, guardian:{ select:{ id:true, firstName:true, lastName:true, email:true, phone:true, alternatePhone:true } } } } : false,
        pickupContacts: canReadPii ? { where:{ isActive:true }, select:{ id:true, fullName:true, relationship:true, phone:true, validFrom:true, validUntil:true, isActive:true } } : false,
        documents: canReadPii ? { select:{ id:true, documentType:true, displayName:true, mimeType:true, sizeBytes:true, issuedAt:true, expiresAt:true, securityStatus:true, isPrimaryPhoto:true, isActive:true, createdAt:true } } : false
      }
    });
    if (!student) return null;
    if (!await canTeacherAccessStudent(tx, s.userId, s.organizationId, s.schoolId, student.id)) return null;
    return student;
  });
  if (!data) return res.status(404).json({ error:"Student not found" });
  if (canReadPii) await withTenantContext(prisma,s,tx=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"student.pii.read",resourceType:"Student",resourceId:data.id,outcome:"SUCCESS"}}));
  const safeData = { ...data, documents: (data.documents || []).map((doc:any) => ({ ...doc, sizeBytes: doc.sizeBytes === null ? null : doc.sizeBytes.toString() })) };
  return res.json({ data: safeData });
}));


studentRouter.get("/:organizationId/:schoolId/students/:studentId/photos/:documentId/preview", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.read"); if (!s) return;
  if (!await hasSchoolPermission(s.userId, s.organizationId, s.schoolId, "students.pii.read")) return res.status(403).json({ error:"Student PII permission required" });
  const photo = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({ where:{ id:req.params.studentId, organizationId:s.organizationId, schoolId:s.schoolId }, select:{ id:true } });
    if (!student || !await canTeacherAccessStudent(tx, s.userId, s.organizationId, s.schoolId, student.id)) return null;
    return tx.studentDocument.findFirst({ where:{ id:req.params.documentId, studentId:student.id, organizationId:s.organizationId, schoolId:s.schoolId, documentType:"PHOTO", isActive:true, securityStatus:"CLEAN", mimeType:{ in:["image/jpeg","image/png"] } }, select:{ id:true, objectKey:true, mimeType:true } });
  });
  if (!photo) return res.status(404).json({ error:"Approved photo not found or access not permitted" });
  const previewUrl = await createInlinePreviewUrl(photo.objectKey, photo.mimeType);
  await withTenantContext(prisma, s, tx => tx.auditLog.create({ data:{ actorUserId:s.userId, organizationId:s.organizationId, schoolId:s.schoolId, action:"student.photo.preview.signed", resourceType:"StudentDocument", resourceId:photo.id, outcome:"SUCCESS" } }));
  return res.json({ data:{ previewUrl, expiresInSeconds:60, mimeType:photo.mimeType } });
}));

studentRouter.patch("/:organizationId/:schoolId/students/:studentId/photos/:documentId/primary", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.update"); if (!s) return;
  if (!await hasSchoolPermission(s.userId, s.organizationId, s.schoolId, "students.pii.read")) return res.status(403).json({ error:"Student PII permission required" });
  const updated = await withTenantContext(prisma, s, async tx => {
    await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", `student-primary-photo:${s.organizationId}:${s.schoolId}:${req.params.studentId}`);
    const student = await tx.student.findFirst({ where:{ id:req.params.studentId, organizationId:s.organizationId, schoolId:s.schoolId }, select:{ id:true } });
    if (!student || !await canTeacherAccessStudent(tx, s.userId, s.organizationId, s.schoolId, student.id)) return null;
    const photo = await tx.studentDocument.findFirst({ where:{ id:req.params.documentId, studentId:student.id, organizationId:s.organizationId, schoolId:s.schoolId, documentType:"PHOTO", isActive:true, securityStatus:"CLEAN", mimeType:{ in:["image/jpeg","image/png"] } }, select:{ id:true } });
    if (!photo) return false;
    await tx.studentDocument.updateMany({ where:{ studentId:student.id, organizationId:s.organizationId, schoolId:s.schoolId, documentType:"PHOTO", isActive:true }, data:{ isPrimaryPhoto:false } });
    return tx.studentDocument.update({ where:{ id:photo.id }, data:{ isPrimaryPhoto:true }, select:{ id:true, displayName:true, isPrimaryPhoto:true, securityStatus:true } });
  });
  if (updated === null) return res.status(404).json({ error:"Student not found or access not permitted" });
  if (updated === false) return res.status(409).json({ error:"Only clean, approved JPEG/PNG photo records can be selected as primary" });
  await withTenantContext(prisma, s, tx => tx.auditLog.create({ data:{ actorUserId:s.userId, organizationId:s.organizationId, schoolId:s.schoolId, action:"student.photo.primary.set", resourceType:"StudentDocument", resourceId:updated.id, outcome:"SUCCESS" } }));
  return res.json({ data:updated });
}));

studentRouter.patch("/:organizationId/:schoolId/students/:studentId/photos/:documentId/deactivate", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.update"); if (!s) return;
  if (!await hasSchoolPermission(s.userId, s.organizationId, s.schoolId, "students.pii.read")) return res.status(403).json({ error:"Student PII permission required" });
  const result = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({ where:{ id:req.params.studentId, organizationId:s.organizationId, schoolId:s.schoolId }, select:{ id:true } });
    if (!student || !await canTeacherAccessStudent(tx, s.userId, s.organizationId, s.schoolId, student.id)) return null;
    const photo = await tx.studentDocument.findFirst({ where:{ id:req.params.documentId, studentId:student.id, organizationId:s.organizationId, schoolId:s.schoolId, documentType:"PHOTO", isActive:true }, select:{ id:true, isPrimaryPhoto:true } });
    if (!photo) return false;
    // Safety rule: the active primary photo cannot be deactivated until a replacement
    // clean/active photo has been explicitly designated primary.
    if (photo.isPrimaryPhoto) return { blockedPrimary:true, isPrimaryPhoto:true };
    await tx.studentDocument.update({ where:{ id:photo.id }, data:{ isActive:false, isPrimaryPhoto:false } });
    return photo;
  });
  if (result === null) return res.status(404).json({ error:"Student not found or access not permitted" });
  if (result === false) return res.status(404).json({ error:"Active student photo not found" });
  if (result && "blockedPrimary" in result && result.blockedPrimary) return res.status(409).json({ error:"Primary photo cannot be deactivated. Set a clean replacement as primary first, then deactivate the previous photo." });
  await withTenantContext(prisma, s, tx => tx.auditLog.create({ data:{ actorUserId:s.userId, organizationId:s.organizationId, schoolId:s.schoolId, action:"student.photo.deactivated", resourceType:"StudentDocument", resourceId:req.params.documentId, outcome:"SUCCESS", metadata:{ wasPrimary:result.isPrimaryPhoto } } }));
  return res.json({ data:{ id:req.params.documentId, isActive:false, isPrimaryPhoto:false } });
}));

studentRouter.patch("/:organizationId/:schoolId/students/:studentId/profile", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.update"); if (!s) return;
  if (!await hasSchoolPermission(s.userId, s.organizationId, s.schoolId, "students.pii.read")) return res.status(403).json({ error:"Missing required permission: students.pii.read" });
  const profileSchema = createStudentSchema.omit({ guardians:true, admissionNumber:true }).partial().extend({ middleName:z.string().trim().max(100).nullable().optional(), preferredName:z.string().trim().max(100).nullable().optional(), dateOfBirth:dateOnly.nullable().optional(), gender:z.enum(["FEMALE","MALE","NON_BINARY","UNDISCLOSED"]).nullable().optional(), bloodGroup:z.enum(["A_POSITIVE","A_NEGATIVE","B_POSITIVE","B_NEGATIVE","AB_POSITIVE","AB_NEGATIVE","O_POSITIVE","O_NEGATIVE","UNKNOWN"]).nullable().optional(), email:z.string().trim().email().max(254).nullable().optional(), phone:z.string().trim().max(30).nullable().optional(), addressLine1:z.string().trim().max(180).nullable().optional(), addressLine2:z.string().trim().max(180).nullable().optional(), locality:z.string().trim().max(100).nullable().optional(), city:z.string().trim().max(100).nullable().optional(), state:z.string().trim().max(100).nullable().optional(), postalCode:z.string().trim().max(20).nullable().optional(), countryCode:z.string().length(2).nullable().optional(), nationality:z.string().trim().max(80).nullable().optional(), primaryLanguage:z.string().trim().max(20).nullable().optional(), notes:z.string().trim().max(2000).nullable().optional(), previousSchoolName:z.string().trim().max(160).nullable().optional(), previousSchoolBoard:z.string().trim().max(80).nullable().optional(), previousSchoolGrade:z.string().trim().max(80).nullable().optional(), previousSchoolLeavingDate:dateOnly.nullable().optional(), medicalConditions:z.string().trim().max(2000).nullable().optional(), allergies:z.string().trim().max(2000).nullable().optional(), medicationNotes:z.string().trim().max(2000).nullable().optional(), emergencyMedicalNotes:z.string().trim().max(2000).nullable().optional() }).strict();
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:"Invalid student profile update", details:parsed.error.flatten() });
  if (!Object.keys(parsed.data).length) return res.status(400).json({ error:"Provide at least one profile field to update" });
  const data = { ...parsed.data, dateOfBirth: parsed.data.dateOfBirth === null ? null : parsed.data.dateOfBirth ? date(parsed.data.dateOfBirth) : undefined, admissionDate: parsed.data.admissionDate ? date(parsed.data.admissionDate) : undefined, previousSchoolLeavingDate: parsed.data.previousSchoolLeavingDate === null ? null : parsed.data.previousSchoolLeavingDate ? date(parsed.data.previousSchoolLeavingDate) : undefined };
  const updated = await withTenantContext(prisma, s, async tx => {
    const existing = await tx.student.findFirst({ where:{ id:req.params.studentId, organizationId:s.organizationId, schoolId:s.schoolId }, select:{ id:true } });
    if (!existing || !await canTeacherAccessStudent(tx, s.userId, s.organizationId, s.schoolId, existing.id)) return null;
    return tx.student.update({ where:{ id:existing.id }, data, select:{ id:true, firstName:true, lastName:true, updatedAt:true } });
  });
  if (!updated) return res.status(404).json({ error:"Student not found or access not permitted" });
  const changedFields = Object.keys(parsed.data);
  const clearedFields = changedFields.filter(field => parsed.data[field as keyof typeof parsed.data] === null);
  await withTenantContext(prisma, s, tx=>tx.auditLog.create({ data:{ actorUserId:s.userId, organizationId:s.organizationId, schoolId:s.schoolId, action:"student.profile.updated", resourceType:"Student", resourceId:updated.id, outcome:"SUCCESS", metadata:{ fields:changedFields, clearedFields, auditValuesOmitted:true } } }));
  return res.json({ data:updated });
}));

studentRouter.get("/:organizationId/:schoolId/students/:studentId/profile-completeness", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.read"); if (!s) return;
  if (!await hasSchoolPermission(s.userId, s.organizationId, s.schoolId, "students.pii.read")) return res.status(403).json({ error: "Missing required permission: students.pii.read" });
  const result = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({ where: { id: req.params.studentId, organizationId: s.organizationId, schoolId: s.schoolId }, select: {
      id:true, firstName:true, lastName:true, dateOfBirth:true, gender:true, email:true, phone:true,
      addressLine1:true, city:true, state:true, postalCode:true, countryCode:true,
      guardians:{ select:{ isPrimary:true, isEmergency:true, guardian:{ select:{ firstName:true, phone:true, email:true } } } },
      documents:{ select:{ documentType:true } }, enrollments:{ where:{ status:{ in:["ENROLLED","PROMOTED"] } }, select:{ id:true } }
    }});
    if (!student || !await canTeacherAccessStudent(tx, s.userId, s.organizationId, s.schoolId, student.id)) return null;
    const missing: string[] = [];
    const checks = [
      { label:"Date of birth", ok:!!student.dateOfBirth }, { label:"Gender", ok:!!student.gender },
      { label:"Student email", ok:!!student.email }, { label:"Student phone", ok:!!student.phone },
      { label:"Address line 1", ok:!!student.addressLine1 }, { label:"City", ok:!!student.city },
      { label:"State", ok:!!student.state }, { label:"Postal code", ok:!!student.postalCode },
      { label:"Primary guardian", ok:student.guardians.some(g=>g.isPrimary) },
      { label:"Emergency guardian/contact", ok:student.guardians.some(g=>g.isEmergency && !!g.guardian.phone) },
      { label:"Guardian phone", ok:student.guardians.some(g=>!!g.guardian.phone) },
      { label:"Birth certificate document", ok:student.documents.some(d=>d.documentType==="BIRTH_CERTIFICATE") },
      { label:"Student photo document", ok:student.documents.some(d=>d.documentType==="PHOTO") },
      { label:"Active enrollment", ok:student.enrollments.length>0 }
    ];
    missing.push(...checks.filter(c=>!c.ok).map(c=>c.label));
    const complete=checks.length-missing.length;
    return { studentId:student.id, completed:complete, total:checks.length, percentage:Math.round(complete/checks.length*100), missing, checks };
  });
  if (!result) return res.status(404).json({ error:"Student not found" });
  await withTenantContext(prisma, s, tx=>tx.auditLog.create({ data:{ actorUserId:s.userId, organizationId:s.organizationId, schoolId:s.schoolId, action:"student.profile_completeness.read", resourceType:"Student", resourceId:result.studentId, outcome:"SUCCESS", metadata:{ percentage:result.percentage, missingCount:result.missing.length } } }));
  return res.json({ data:result });
}));

studentRouter.get("/:organizationId/:schoolId/students/:studentId/guardians", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.read"); if (!s) return;
  if (!await hasSchoolPermission(s.userId, s.organizationId, s.schoolId, "students.pii.read")) return res.status(403).json({ error: "Missing required permission: students.pii.read" });
  const data = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({ where: { id: req.params.studentId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true } });
    if (!student || !await canTeacherAccessStudent(tx, s.userId, s.organizationId, s.schoolId, student.id)) return null;
    return tx.studentGuardian.findMany({ where: { studentId: student.id, organizationId: s.organizationId, schoolId: s.schoolId },
      include: { guardian: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, alternatePhone: true, occupation: true, isActive: true } } }, orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] });
  });
  if (!data) return res.status(404).json({ error: "Student not found" });
  await withTenantContext(prisma, s, tx => tx.auditLog.create({ data: { actorUserId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, action: "student.guardians.read", resourceType: "Student", resourceId: req.params.studentId, outcome: "SUCCESS" } }));
  return res.json({ data });
}));

// P29: guardian linking is explicit. Similar contacts are surfaced for review; records are never auto-merged.
studentRouter.post("/:organizationId/:schoolId/students/:studentId/guardians", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.update"); if (!s) return;
  if (!await hasSchoolPermission(s.userId, s.organizationId, s.schoolId, "students.pii.read")) return res.status(403).json({ error: "Missing required permission: students.pii.read" });
  const body = z.object({
    guardianId: z.string().optional(),
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().max(100).optional(),
    email: z.string().email().optional(), phone: z.string().trim().min(5).max(30).optional(),
    alternatePhone: z.string().max(30).optional(), occupation: z.string().max(120).optional(),
    address: z.string().max(1000).optional(),
    relationship: z.enum(["MOTHER","FATHER","LEGAL_GUARDIAN","GRANDPARENT","SIBLING","OTHER"]),
    isPrimary: z.boolean().default(false), isEmergency: z.boolean().default(false),
    canPickup: z.boolean().default(false), canReceiveCommunications: z.boolean().default(true)
  }).refine(v => Boolean(v.guardianId) || Boolean(v.firstName && (v.email || v.phone)), { message: "Provide guardianId or guardian details with an email or phone" }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid guardian link", details: body.error.flatten() });
  const d = body.data;
  const result = await withTenantContext(prisma, s, async tx => {
    await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", `${s.organizationId}:${s.schoolId}:guardian:${req.params.studentId}`);
    const student = await tx.student.findFirst({ where: { id: req.params.studentId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true } });
    if (!student) return { kind: "STUDENT_NOT_FOUND" as const };
    let guardianId = d.guardianId;
    if (!guardianId) {
      const email = normalizeGuardianEmail(d.email);
      const phone = normalizeGuardianPhone(d.phone);
      const matches = await tx.guardian.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, isActive: true,
        OR: [...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []), ...(phone ? [{ phone: { equals: phone } }, { phone: { equals: d.phone } }] : [])] },
        select: { id: true, firstName: true, lastName: true, email: true, phone: true }, take: 6 });
      if (matches.length) return { kind: "MATCHES" as const, candidates: matches };
      const guardian = await tx.guardian.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId,
        firstName: d.firstName!, lastName: d.lastName, email, phone, alternatePhone: d.alternatePhone,
        occupation: d.occupation, address: d.address } });
      guardianId = guardian.id;
    } else {
      const guardian = await tx.guardian.findFirst({ where: { id: guardianId, organizationId: s.organizationId, schoolId: s.schoolId, isActive: true }, select: { id: true } });
      if (!guardian) return { kind: "GUARDIAN_NOT_FOUND" as const };
    }
    const existing = await tx.studentGuardian.findFirst({ where: { studentId: student.id, guardianId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (existing) return { kind: "ALREADY_LINKED" as const };
    if (d.isPrimary) await tx.studentGuardian.updateMany({ where: { studentId: student.id, organizationId: s.organizationId, schoolId: s.schoolId, isPrimary: true }, data: { isPrimary: false } });
    const link = await tx.studentGuardian.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: student.id, guardianId: guardianId!,
      relationship: d.relationship, isPrimary: d.isPrimary, isEmergency: d.isEmergency, canPickup: d.canPickup, canReceiveCommunications: d.canReceiveCommunications } });
    await tx.auditLog.create({ data: { actorUserId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, action: "student.guardian.linked", resourceType: "StudentGuardian", resourceId: link.id, outcome: "SUCCESS" } });
    return { kind: "CREATED" as const, link };
  });
  if (result.kind === "STUDENT_NOT_FOUND") return res.status(404).json({ error: "Student not found" });
  if (result.kind === "GUARDIAN_NOT_FOUND") return res.status(404).json({ error: "Active guardian not found in this school" });
  if (result.kind === "ALREADY_LINKED") return res.status(409).json({ error: "Guardian is already linked to this student" });
  if (result.kind === "MATCHES") return res.status(409).json({ error: "Possible existing guardian records found. Select an existing guardian to link; records are not merged automatically.", code: "GUARDIAN_MATCH_FOUND", candidates: result.candidates });
  return res.status(201).json({ data: result.link });
}));

studentRouter.patch("/:organizationId/:schoolId/students/:studentId/guardians/:guardianId", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.update"); if (!s) return;
  if (!await hasSchoolPermission(s.userId, s.organizationId, s.schoolId, "students.pii.read")) return res.status(403).json({ error: "Missing required permission: students.pii.read" });
  const body = z.object({ firstName: z.string().trim().min(1).max(100).optional(), lastName: z.string().max(100).nullable().optional(),
    email: z.string().email().nullable().optional(), phone: z.string().max(30).nullable().optional(), alternatePhone: z.string().max(30).nullable().optional(),
    occupation: z.string().max(120).nullable().optional(), address: z.string().max(1000).nullable().optional(), isActive: z.boolean().optional(),
    relationship: z.enum(["MOTHER","FATHER","LEGAL_GUARDIAN","GRANDPARENT","SIBLING","OTHER"]).optional(),
    isPrimary: z.boolean().optional(), isEmergency: z.boolean().optional(), canPickup: z.boolean().optional(), canReceiveCommunications: z.boolean().optional()
  }).refine(v => Object.keys(v).length > 0, { message: "At least one field is required" }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid guardian update", details: body.error.flatten() });
  const d = body.data;
  const result = await withTenantContext(prisma, s, async tx => {
    await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", `${s.organizationId}:${s.schoolId}:guardian:${req.params.studentId}`);
    const link = await tx.studentGuardian.findFirst({ where: { studentId: req.params.studentId, guardianId: req.params.guardianId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!link) return null;
    if (d.isPrimary) await tx.studentGuardian.updateMany({ where: { studentId: link.studentId, organizationId: s.organizationId, schoolId: s.schoolId, isPrimary: true, id: { not: link.id } }, data: { isPrimary: false } });
    const guardianFields = { firstName: d.firstName, lastName: d.lastName, email: d.email === undefined ? undefined : (d.email?.trim().toLowerCase() ?? null), phone: d.phone, alternatePhone: d.alternatePhone, occupation: d.occupation, address: d.address, isActive: d.isActive };
    const guardian = await tx.guardian.update({ where: { id: link.guardianId }, data: Object.fromEntries(Object.entries(guardianFields).filter(([,v]) => v !== undefined)) });
    const relationFields = { relationship: d.relationship, isPrimary: d.isPrimary, isEmergency: d.isEmergency, canPickup: d.canPickup, canReceiveCommunications: d.canReceiveCommunications };
    const updatedLink = await tx.studentGuardian.update({ where: { id: link.id }, data: Object.fromEntries(Object.entries(relationFields).filter(([,v]) => v !== undefined)) });
    await tx.auditLog.create({ data: { actorUserId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, action: "student.guardian.updated", resourceType: "Guardian", resourceId: guardian.id, outcome: "SUCCESS" } });
    return { guardian, link: updatedLink };
  });
  if (!result) return res.status(404).json({ error: "Student guardian link not found" });
  return res.json({ data: result });
}));

studentRouter.get("/:organizationId/:schoolId/students/:studentId/status-history", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.read"); if (!s) return;
  const data = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({ where: { id: req.params.studentId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true } });
    if (!student) return null;
    return tx.studentStatusHistory.findMany({ where: { studentId: student.id, organizationId: s.organizationId, schoolId: s.schoolId }, orderBy: [{ effectiveAt: "desc" }, { createdAt: "desc" }], take: 100 });
  });
  if (!data) return res.status(404).json({ error: "Student not found" });
  return res.json({ data });
}));

studentRouter.post("/:organizationId/:schoolId/students/:studentId/status", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.update"); if (!s) return;
  const parsed = z.object({ toStatus: z.enum(["APPLICANT", "ACTIVE", "INACTIVE", "TRANSFERRED", "GRADUATED", "WITHDRAWN", "ARCHIVED"]), reason: z.string().trim().min(3).max(1000), effectiveAt: z.string().refine(isDateOnly, "Effective date must be a real calendar date in YYYY-MM-DD format") }).strict().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid student status transition", details: parsed.error.flatten() });
  const effectiveAt = date(parsed.data.effectiveAt)!;
  const result = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({ where: { id: req.params.studentId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!student) return { kind: "NOT_FOUND" as const };
    const fromStatus = student.status as StudentLifecycleStatus;
    const toStatus = parsed.data.toStatus as StudentLifecycleStatus;
    if (!canTransitionStudent(fromStatus, toStatus)) return { kind: "INVALID_TRANSITION" as const, fromStatus };
    const changed = await tx.student.updateMany({
      where: { id: student.id, organizationId: s.organizationId, schoolId: s.schoolId, status: fromStatus },
      data: { status: toStatus, ...(isStudentExitStatus(toStatus) ? { leavingDate: effectiveAt } : toStatus === "ACTIVE" ? { leavingDate: null } : {}) }
    });
    if (changed.count !== 1) return { kind: "CONCURRENT_CHANGE" as const };
    const history = await tx.studentStatusHistory.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: student.id, fromStatus, toStatus, reason: parsed.data.reason, effectiveAt, actorUserId: s.userId } });
    await tx.auditLog.create({ data: { actorUserId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, action: "student.status.changed", resourceType: "Student", resourceId: student.id, outcome: "SUCCESS", metadata: { fromStatus, toStatus, effectiveAt: parsed.data.effectiveAt } } });
    return { kind: "UPDATED" as const, history };
  });
  if (result.kind === "NOT_FOUND") return res.status(404).json({ error: "Student not found" });
  if (result.kind === "INVALID_TRANSITION") return res.status(409).json({ error: `Student status transition ${result.fromStatus} -> ${parsed.data.toStatus} is not allowed` });
  if (result.kind === "CONCURRENT_CHANGE") return res.status(409).json({ error: "Student status changed concurrently; reload and retry" });
  return res.status(201).json({ data: result.history });
}));

studentRouter.post("/:organizationId/:schoolId/students/:studentId/enrollments", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.update"); if (!s) return;
  const parsed = enrollmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:"Invalid enrollment", details:parsed.error.flatten() });
  const data = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({ where:{ id:req.params.studentId, organizationId:s.organizationId, schoolId:s.schoolId } });
    const year = await tx.academicYear.findFirst({ where:{ id:parsed.data.academicYearId, organizationId:s.organizationId, schoolId:s.schoolId } });
    const grade = await tx.gradeLevel.findFirst({ where:{ id:parsed.data.gradeLevelId, organizationId:s.organizationId, schoolId:s.schoolId, isActive:true } });
    if (!student || !year || !grade) return null;
    // Friendly conflict checks for the database uniqueness constraints. The constraints remain
    // authoritative for races; these checks make ordinary duplicate attempts actionable.
    const existingForYear = await tx.studentEnrollment.findFirst({ where:{
      organizationId:s.organizationId, schoolId:s.schoolId, studentId:student.id, academicYearId:year.id
    }, select:{ id:true } });
    if (existingForYear) return { kind: "ALREADY_ENROLLED" as const };
    if (parsed.data.rollNumber) {
      const rollNumberConflict = await tx.studentEnrollment.findFirst({ where:{
        organizationId:s.organizationId, schoolId:s.schoolId, academicYearId:year.id,
        gradeLevelId:grade.id, rollNumber:parsed.data.rollNumber
      }, select:{ id:true } });
      if (rollNumberConflict) return { kind: "ROLL_NUMBER_TAKEN" as const };
    }
    if (parsed.data.status === "ENROLLED" && student.status !== "ACTIVE" && !canTransitionStudent(student.status as StudentLifecycleStatus, "ACTIVE")) return { kind: "INVALID_LIFECYCLE" as const };
    // If this section has configured capacity, claim a seat atomically before creating
    // the enrollment. Unconfigured sections retain the legacy enrollment behavior.
    let capacityId: string | undefined;
    if (parsed.data.status === "ENROLLED" && parsed.data.sectionName) {
      const capacity = await tx.gradeSectionCapacity.findFirst({ where:{
        organizationId:s.organizationId, schoolId:s.schoolId, academicYearId:year.id,
        gradeLevelId:grade.id, sectionName:parsed.data.sectionName
      }, select:{ id:true, capacity:true, enrolledSeats:true, reservedSeats:true } });
      if (capacity) {
        const claimed = await tx.gradeSectionCapacity.updateMany({ where:{
          id:capacity.id, organizationId:s.organizationId, schoolId:s.schoolId,
          enrolledSeats:capacity.enrolledSeats, reservedSeats:capacity.reservedSeats,
          capacity:{ gte:capacity.enrolledSeats + capacity.reservedSeats + 1 }
        }, data:{ enrolledSeats:{ increment:1 } } });
        if (!claimed.count) return { kind: "SECTION_AT_CAPACITY" as const };
        capacityId = capacity.id;
      }
    }
    const enrollment = await tx.studentEnrollment.create({ data:{
      organizationId:s.organizationId, schoolId:s.schoolId, studentId:student.id,
      academicYearId:year.id, gradeLevelId:grade.id, sectionName:parsed.data.sectionName,
      rollNumber:parsed.data.rollNumber, enrolledOn:date(parsed.data.enrolledOn)!, status:parsed.data.status,
      createdBy:s.userId
    }});
    if (parsed.data.status === "ENROLLED" && student.status !== "ACTIVE") {
      const changed = await tx.student.updateMany({ where: { id: student.id, organizationId: s.organizationId, schoolId: s.schoolId, status: student.status }, data: { status: "ACTIVE", leavingDate: null } });
      if (changed.count !== 1) {
        // Roll back the just-created enrollment explicitly before returning a conflict result.
        await tx.studentEnrollment.deleteMany({ where:{ id:enrollment.id, organizationId:s.organizationId, schoolId:s.schoolId, studentId:student.id } });
        if (capacityId) await tx.gradeSectionCapacity.updateMany({ where:{ id:capacityId, organizationId:s.organizationId, schoolId:s.schoolId, enrolledSeats:{ gt:0 } }, data:{ enrolledSeats:{ decrement:1 } } });
        return { kind: "CONCURRENT_CHANGE" as const };
      }
      await tx.studentStatusHistory.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: student.id, fromStatus: student.status, toStatus: "ACTIVE", reason: "Student enrolled in an academic year", effectiveAt: date(parsed.data.enrolledOn)!, actorUserId: s.userId } });
      await tx.auditLog.create({ data: { actorUserId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, action: "student.status.changed", resourceType: "Student", resourceId: student.id, outcome: "SUCCESS", metadata: { fromStatus: student.status, toStatus: "ACTIVE", source: "enrollment" } } });
    }
    return { kind: "CREATED" as const, enrollment };
  }).catch((error:any) => {
    if (error?.code === "P2002") return { kind: "CONCURRENT_CONFLICT" as const };
    throw error;
  });
  if (!data) return res.status(404).json({ error:"Student, academic year or active grade not found in this school" });
  if (data.kind === "ALREADY_ENROLLED") return res.status(409).json({ error: "Student already has an enrollment for this academic year" });
  if (data.kind === "ROLL_NUMBER_TAKEN") return res.status(409).json({ error: "Roll number is already assigned in this grade for the academic year" });
  if (data.kind === "INVALID_LIFECYCLE") return res.status(409).json({ error: "This student lifecycle status cannot be reactivated by enrollment" });
  if (data.kind === "SECTION_AT_CAPACITY") return res.status(409).json({ error: "Selected section is at capacity or its seat count changed concurrently; choose another section or retry" });
  if (data.kind === "CONCURRENT_CONFLICT") return res.status(409).json({ error: "Enrollment conflicts with an existing enrollment or roll number; reload and retry" });
  if (data.kind === "CONCURRENT_CHANGE") return res.status(409).json({ error: "Student status changed concurrently; retry enrollment" });
  return res.status(201).json({ data: data.enrollment });
}));

studentRouter.post("/:organizationId/:schoolId/students/:studentId/pickup-contacts", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.update"); if (!s) return;
  const parsed = pickupContactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:"Invalid pickup contact", details:parsed.error.flatten() });
  const data = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({ where:{ id:req.params.studentId, organizationId:s.organizationId, schoolId:s.schoolId }, select:{ id:true } });
    if (!student) return null;
    return tx.studentPickupContact.create({ data:{
      ...parsed.data, organizationId:s.organizationId, schoolId:s.schoolId, studentId:student.id,
      validFrom:date(parsed.data.validFrom), validUntil:date(parsed.data.validUntil), createdBy:s.userId
    }});
  });
  if (!data) return res.status(404).json({ error:"Student not found" });
  return res.status(201).json({ data });
}));

studentRouter.post("/:organizationId/:schoolId/students/:studentId/documents", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.update"); if (!s) return;
  const parsed = studentDocumentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:"Invalid document metadata", details:parsed.error.flatten() });
  const data = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({ where:{ id:req.params.studentId, organizationId:s.organizationId, schoolId:s.schoolId }, select:{ id:true } });
    if (!student) return null;
    return tx.studentDocument.create({ data:{
      ...parsed.data, organizationId:s.organizationId, schoolId:s.schoolId, studentId:student.id,
      sizeBytes:parsed.data.sizeBytes === undefined ? undefined : BigInt(parsed.data.sizeBytes),
      issuedAt:date(parsed.data.issuedAt), expiresAt:date(parsed.data.expiresAt), uploadedBy:s.userId
    }, select:{ id:true, documentType:true, displayName:true, mimeType:true, sizeBytes:true, issuedAt:true, expiresAt:true, createdAt:true } });
  });
  if (!data) return res.status(404).json({ error:"Student not found" });
  return res.status(201).json({ data: { ...data, sizeBytes: data.sizeBytes === null ? null : data.sizeBytes.toString() } });
}));

studentRouter.patch("/:organizationId/:schoolId/students/:studentId/enrollments/:enrollmentId/status", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "students.update"); if (!s) return;
  const parsed = enrollmentStatusChangeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:"Invalid enrollment status change", details:parsed.error.flatten() });
  const data = await withTenantContext(prisma, s, async tx => {
    const current = await tx.studentEnrollment.findFirst({ where:{
      id:req.params.enrollmentId, studentId:req.params.studentId, organizationId:s.organizationId, schoolId:s.schoolId
    }});
    if (!current) return { kind:"NOT_FOUND" as const };
    if (!canTransitionEnrollment(current.status as StudentEnrollmentStatus, parsed.data.status)) {
      return { kind:"INVALID_TRANSITION" as const, from:current.status, to:parsed.data.status };
    }
    const endedOn = date(parsed.data.endedOn) ?? (isEnrollmentExitStatus(parsed.data.status) ? new Date() : null);
    const changed = await tx.studentEnrollment.updateMany({ where:{
      id:current.id, organizationId:s.organizationId, schoolId:s.schoolId, status:current.status
    }, data:{ status:parsed.data.status, endedOn } });
    if (changed.count !== 1) return { kind:"CONCURRENT_CHANGE" as const };
    if (isEnrollmentExitStatus(parsed.data.status) && (current.status === "ENROLLED" || current.status === "PROMOTED") && current.sectionName) {
      await tx.gradeSectionCapacity.updateMany({ where:{
        organizationId:s.organizationId, schoolId:s.schoolId, academicYearId:current.academicYearId,
        gradeLevelId:current.gradeLevelId, sectionName:current.sectionName, enrolledSeats:{ gt:0 }
      }, data:{ enrolledSeats:{ decrement:1 } } });
    }
    await tx.auditLog.create({ data:{
      actorUserId:s.userId, organizationId:s.organizationId, schoolId:s.schoolId,
      action:"student.enrollment.status.changed", resourceType:"StudentEnrollment", resourceId:current.id,
      outcome:"SUCCESS", metadata:{ studentId:current.studentId, fromStatus:current.status, toStatus:parsed.data.status, endedOn:endedOn?.toISOString() ?? null }
    }});
    return { kind:"UPDATED" as const, status:parsed.data.status, endedOn };
  });
  if (data.kind === "NOT_FOUND") return res.status(404).json({ error:"Enrollment not found for this student and school" });
  if (data.kind === "INVALID_TRANSITION") return res.status(409).json({ error:`Enrollment status transition ${data.from} -> ${data.to} is not allowed` });
  if (data.kind === "CONCURRENT_CHANGE") return res.status(409).json({ error:"Enrollment changed concurrently; reload and retry" });
  return res.json({ data:{ status:data.status, endedOn:data.endedOn } });
}));


// P495 — Student-scoped Library and Transport read integrations. These routes resolve the
// active linked student from the authenticated account; client-supplied student IDs are never trusted.
studentRouter.get('/students/me/:organizationId/:schoolId/library',asyncRoute(async(req,res)=>{
 const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);
 const student=await linkedStudentContext(userId,organizationId,schoolId);if(!student)return res.status(403).json({error:'Active student account link required'});
 const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const [loans,reservations]=await Promise.all([
   tx.libraryLoan.findMany({where:{organizationId,schoolId,borrowerId:student.id,borrowerType:'STUDENT'},include:{copy:{include:{book:true}}},orderBy:{issuedAt:'desc'},take:100}),
   tx.libraryReservation.findMany({where:{organizationId,schoolId,borrowerId:student.id,borrowerType:'STUDENT'},orderBy:{createdAt:'desc'},take:100})
  ]);
  return {loans:loans.map(l=>({id:l.id,issuedAt:l.issuedAt,dueAt:l.dueAt,returnedAt:l.returnedAt,fineAmount:l.fineAmount.toString(),copy:{accessionNumber:l.copy.accessionNumber,shelfLocation:l.copy.shelfLocation,book:{id:l.copy.book.id,title:l.copy.book.title,author:l.copy.book.author,subject:l.copy.book.subject}}})),reservations:reservations.map(r=>({id:r.id,status:r.status,createdAt:r.createdAt,expiresAt:r.expiresAt,bookId:r.bookId}))};
 });
 return res.json({data});
}));
studentRouter.get('/students/me/:organizationId/:schoolId/transport',asyncRoute(async(req,res)=>{
 const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);
 const student=await linkedStudentContext(userId,organizationId,schoolId);if(!student)return res.status(403).json({error:'Active student account link required'});
 const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const allocations=await tx.transportAllocation.findMany({where:{organizationId,schoolId,studentId:student.id,status:'ACTIVE'},include:{route:{include:{stops:{orderBy:{sequence:'asc'}}}}},orderBy:{createdAt:'desc'},take:10});
  const routeIds=allocations.map(a=>a.routeId);
  const trips=routeIds.length?await tx.transportTrip.findMany({where:{organizationId,schoolId,routeId:{in:routeIds},tripDate:{gte:new Date(Date.now()-14*24*60*60*1000)},events:{some:{studentId:student.id}}},include:{events:{where:{studentId:student.id},orderBy:{eventAt:'desc'},take:20}},orderBy:{tripDate:'desc'},take:20}):[];
  return {allocations:allocations.map(a=>({id:a.id,academicYear:a.academicYear,monthlyFee:a.monthlyFee.toString(),route:{id:a.route.id,name:a.route.name,code:a.route.code,startTime:a.route.startTime,endTime:a.route.endTime,stops:a.route.stops.map(st=>({id:st.id,name:st.name,sequence:st.sequence,pickupTime:st.pickupTime,dropTime:st.dropTime}))}})),recentStudentEvents:trips.flatMap(t=>t.events.map(e=>({tripId:t.id,tripDate:t.tripDate,direction:t.direction,status:t.status,eventType:e.eventType,eventAt:e.eventAt,stopId:e.stopId,notes:e.notes}))).sort((a,b)=>b.eventAt.getTime()-a.eventAt.getTime()).slice(0,30)};
 });
 return res.json({data});
}));

// P558 — authenticated student self-service library history and reminders.
studentRouter.get('/students/me/:organizationId/:schoolId/library',asyncRoute(async(req,res)=>{const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const link=await withPlatformContext(prisma,tx=>tx.studentAccountLink.findFirst({where:{organizationId,schoolId,userId,isActive:true,student:{status:'ACTIVE'}},select:{studentId:true}}));if(!link)return res.status(403).json({error:'Active student account link required'});const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const school=await tx.school.findFirst({where:{id:schoolId,organizationId,isActive:true},select:{id:true}});if(!school)return null;const loans=await tx.libraryLoan.findMany({where:{organizationId,schoolId,borrowerId:link.studentId},include:{copy:{include:{book:true}}},orderBy:{issuedAt:'desc'},take:200});const reservations=await tx.libraryReservation.findMany({where:{organizationId,schoolId,borrowerId:link.studentId},include:{book:true},orderBy:{createdAt:'desc'},take:100});const activeQueue=await tx.libraryReservation.findMany({where:{organizationId,schoolId,status:'ACTIVE'},select:{id:true,bookId:true,createdAt:true},orderBy:[{createdAt:'asc'},{id:'asc'}],take:5000});const reservationsWithPosition=reservations.map(r=>({...r,queuePosition:r.status==='ACTIVE'?activeQueue.filter(q=>q.bookId===r.bookId&&(q.createdAt<r.createdAt||(q.createdAt.getTime()===r.createdAt.getTime()&&q.id<=r.id))).length+1:null}));const now=new Date(),limit=new Date(now.getTime()+3*86400000);const reminders=loans.filter(l=>!l.returnedAt&&l.dueAt<=limit).map(l=>({loanId:l.id,title:l.copy.book.title,dueAt:l.dueAt,overdue:l.dueAt<now,daysUntilDue:Math.ceil((l.dueAt.getTime()-now.getTime())/86400000)}));return {loans,reservations:reservationsWithPosition,reminders};});if(data===null)return res.status(404).json({error:'School not found'});return res.json({data});}));
