import { Prisma } from "@prisma/client";
import { createHash, randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext } from "../auth/tenant-context.js";
import { hasSchoolPermission } from "../auth/school-permissions.js";
import { hasActiveSchoolMembership } from "../schools/school-config.authorization.js";
import { createOpaqueToken, hashOpaqueToken, hashPassword, verifyPassword } from "../auth/security.js";
import { encryptInvitationPayload } from "./parent-invitations.js";
import { enqueueParentInvitation } from "./parent-delivery-queue.js";
import { withIdentityContext } from "../auth/tenant-context.js";
import { parentPortalAccessAllowed } from "./parent-portal-security.js";
import { parentAttendanceDateFilter, parentAttendanceQuerySchema, sliceParentAttendancePage } from "./parent-attendance-pagination.js";
import { calculateFeePayment } from "./parent-fees.js";
import { calculateFeeConcession } from "./fee-concessions.mjs";
import { createUploadUrl, verifyUploadedObject, createDownloadUrl, promoteCleanObject, deleteObject } from "../documents/document-storage.js";
import { ensureSchoolAccountingSetup, postSchoolJournal, postFeeCharge, postFeePayment, postFeeRefundSettlement } from "../billing/school-accounting-ledger.js";
import { isDraftPublishable, isValidResultSummary } from "./parent-operations.js";
import { enqueueDocumentScan } from "../documents/document-scan-queue.js";
import { buildParentListPage, parseParentListPage } from "./parent-list-pagination.js";
import { decodeNotificationCursor, encodeNotificationCursor, notificationPageSize, notificationSnapshotWhere } from "./parent-notification-pagination.js";
import { decodeInboxCursor, encodeInboxCursor, groupInboxRows, parseInboxLimit } from "../notifications/in-app-inbox-pagination.js";
import { notifyHostelLeaveGuardians } from "../hostel/hostel-leave-notifications.js";

export const parentRouter=Router();
const wrap=(fn:(req:any,res:any)=>Promise<any>)=>(req:any,res:any,next:any)=>Promise.resolve(fn(req,res)).catch(next);
const base="/:organizationId/:schoolId/parents";
async function teacherOwnsHomework(tx:any,userId:string,organizationId:string,schoolId:string,assignmentId:string,operatorAccess=false){
 if(operatorAccess)return true;
 const staff=await tx.staffMember.findFirst({where:{userId,organizationId,schoolId},select:{id:true,status:true}});
 if(!staff)return false;
 if(staff.status!=="ACTIVE")return false;
 const assignment=await tx.homeworkAssignment.findFirst({where:{id:assignmentId,organizationId,schoolId},select:{studentId:true}});if(!assignment)return false;
 const enrollments=await tx.studentEnrollment.findMany({where:{studentId:assignment.studentId,organizationId,schoolId,status:"ENROLLED"},select:{academicYearId:true,gradeLevelId:true,sectionName:true},take:5});
 const today=new Date();today.setHours(0,0,0,0);
 for(const enrollment of enrollments){const match=await tx.teacherAssignment.findFirst({where:{organizationId,schoolId,staffMemberId:staff.id,isActive:true,academicYearId:enrollment.academicYearId,gradeLevelId:enrollment.gradeLevelId,sectionName:enrollment.sectionName||"",OR:[{startsOn:null},{startsOn:{lte:today}}],AND:[{OR:[{endsOn:null},{endsOn:{gte:today}}]}]},select:{id:true}});if(match)return true;}
 return false;
}

async function scope(req:any,res:any,permission="students.update") {const organizationId=String(req.params.organizationId||""),schoolId=String(req.params.schoolId||""),userId=req.auth!.userId;if(!await hasActiveSchoolMembership(userId,organizationId,schoolId)){res.status(403).json({error:"Active school membership required"});return null;}if(!await hasSchoolPermission(userId,organizationId,schoolId,permission)){res.status(403).json({error:`Missing required permission: ${permission}`});return null;}return {organizationId,schoolId,userId};}
async function homeworkScope(req:any,res:any,permission:"homework.read"|"homework.grade"){const organizationId=String(req.params.organizationId||""),schoolId=String(req.params.schoolId||""),userId=req.auth!.userId;if(!await hasActiveSchoolMembership(userId,organizationId,schoolId)){res.status(403).json({error:"Active school membership required"});return null;}if(!await hasSchoolPermission(userId,organizationId,schoolId,permission)&&!await hasSchoolPermission(userId,organizationId,schoolId,"academics.manage")){res.status(403).json({error:`Missing required permission: ${permission}`});return null;}return {organizationId,schoolId,userId};}

parentRouter.post(base+"/guardians/:guardianId/invitations",authenticate,wrap(async(req,res)=>{
  const s=await scope(req,res,"students.pii.read");if(!s)return;if(!await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"students.update"))return res.status(403).json({error:"Missing required permission: students.update"});
  const p=z.object({consentVersion:z.string().trim().min(1).max(40),consentNoticeText:z.string().trim().min(50).max(4000)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:"A consent notice version and complete consent notice text are required"});
  const rawToken=createOpaqueToken(48);const tokenHash=hashOpaqueToken(rawToken);const expiresAt=new Date(Date.now()+48*60*60*1000);
  const result=await withTenantContext(prisma,s,async tx=>{
    await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:guardian:${req.params.guardianId}`);
    const guardian=await tx.guardian.findFirst({where:{id:req.params.guardianId,organizationId:s.organizationId,schoolId:s.schoolId,isActive:true}});
    if(!guardian||!guardian.email)return {kind:"NO_VERIFIED_CONTACT" as const};
    if(guardian.userId){
      const [membership,role]=await Promise.all([
        tx.schoolMembership.findFirst({where:{userId:guardian.userId,organizationId:s.organizationId,schoolId:s.schoolId,status:"ACTIVE"},select:{id:true}}),
        tx.userRoleAssignment.findFirst({where:{userId:guardian.userId,organizationId:s.organizationId,schoolId:s.schoolId,scopeType:"SCHOOL",role:{key:"PARENT"}},select:{id:true}})
      ]);
      if(membership&&role)return {kind:"ALREADY_LINKED" as const};
      const linkedUser=await tx.user.findUnique({where:{id:guardian.userId},select:{email:true,isActive:true}});
      if(!linkedUser||!linkedUser.isActive||linkedUser.email.toLowerCase()!==guardian.email.trim().toLowerCase())return {kind:"NO_VERIFIED_CONTACT" as const};
      // Re-consent invitation repairs older linked guardians that predate the
      // PARENT role/membership provisioning lifecycle.
    }
    await tx.parentInvitation.updateMany({where:{guardianId:guardian.id,organizationId:s.organizationId,schoolId:s.schoolId,status:"PENDING"},data:{status:"REVOKED",deliveryStatus:"CANCELLED",deliveryCiphertext:"",deliveryNonce:"",deliveryTag:""}});
    const id=`pi_${Date.now().toString(36)}_${createOpaqueToken(9)}`;
    const encrypted=encryptInvitationPayload({email:guardian.email.trim().toLowerCase(),token:rawToken,invitationId:id});
    const invitation=await tx.parentInvitation.create({data:{id,organizationId:s.organizationId,schoolId:s.schoolId,guardianId:guardian.id,invitedEmail:guardian.email.trim().toLowerCase(),tokenHash,consentVersion:p.data.consentVersion,consentNoticeText:p.data.consentNoticeText,expiresAt,createdBy:s.userId,...encrypted}});
    await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"parent.invitation.queued",resourceType:"ParentInvitation",resourceId:invitation.id,outcome:"SUCCESS",metadata:{guardianId:guardian.id,consentVersion:p.data.consentVersion}}});
    return {kind:"CREATED" as const,id:invitation.id,email:invitation.invitedEmail,expiresAt:invitation.expiresAt,deliveryStatus:"QUEUED"};
  });
  if(result.kind==="NO_VERIFIED_CONTACT")return res.status(409).json({error:"An active guardian with an email address is required"});
  if(result.kind==="ALREADY_LINKED")return res.status(409).json({error:"Guardian already has active parent portal access"});
  try { await enqueueParentInvitation(result.id); } catch { /* durable DB outbox remains QUEUED for worker reconciliation */ }
  return res.status(202).json({data:result,message:"Invitation is encrypted in the delivery outbox. Delivery is asynchronous; no raw token is returned by this API."});
}));

parentRouter.post("/invitations/preview",wrap(async(req,res)=>{
  const parsed=z.object({token:z.string().min(32).max(200)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:"Invalid invitation token"});
  const token=parsed.data.token;
  const tokenHash=hashOpaqueToken(token);
  const invitation=await prisma.$transaction(async tx=>{await tx.$executeRaw`SELECT set_config('app.parent_invitation_token_hash',${tokenHash},true)`;return tx.parentInvitation.findUnique({where:{tokenHash},select:{id:true,invitedEmail:true,consentVersion:true,consentNoticeText:true,expiresAt:true,status:true}});});
  if(!invitation||invitation.status!=="PENDING"||invitation.expiresAt<=new Date())return res.status(404).json({error:"Invitation is invalid or expired"});
  const [local,domain]=invitation.invitedEmail.split("@");const masked=local.length<3?`${local[0]||"*"}***@${domain}`:`${local.slice(0,2)}***@${domain}`;
  return res.json({data:{consentVersion:invitation.consentVersion,consentNoticeText:invitation.consentNoticeText,expiresAt:invitation.expiresAt,invitedEmail:masked}});
}));

parentRouter.post("/invitations/accept",wrap(async(req,res)=>{
  const p=z.object({token:z.string().min(32).max(200),password:z.string().min(12).max(200),consentAccepted:z.literal(true),consentVersion:z.string().trim().min(1).max(40)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:"Invalid invitation acceptance details"});
  const tokenHash=hashOpaqueToken(p.data.token);
  const lookup=await prisma.$transaction(async tx=>{await tx.$executeRaw`SELECT set_config('app.parent_invitation_token_hash',${tokenHash},true)`;return tx.parentInvitation.findUnique({where:{tokenHash},select:{organizationId:true,schoolId:true}});});
  const tenant=lookup;if(!tenant)return res.status(400).json({error:"Invitation is invalid, expired or already used"});
  const passwordHash=await hashPassword(p.data.password);
  const result=await withTenantContext(prisma,tenant,async tx=>{
    await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`parent-invite:${tokenHash}`);
    const invite=await tx.parentInvitation.findUnique({where:{tokenHash}});if(!invite)return {kind:"INVALID" as const};
    if(invite.status!=="PENDING")return {kind:"USED" as const};
    if(invite.consentVersion!==p.data.consentVersion)return {kind:"CONSENT_VERSION" as const};
    if(invite.expiresAt<=new Date()){await tx.parentInvitation.update({where:{id:invite.id},data:{status:"EXPIRED",deliveryStatus:"CANCELLED",deliveryCiphertext:"",deliveryNonce:"",deliveryTag:""}});return {kind:"EXPIRED" as const};}
    const guardian=await tx.guardian.findFirst({where:{id:invite.guardianId,organizationId:invite.organizationId,schoolId:invite.schoolId,isActive:true}});if(!guardian||guardian.email?.trim().toLowerCase()!==invite.invitedEmail)return {kind:"INVALID" as const};
    let user=await tx.user.findFirst({where:{email:{equals:invite.invitedEmail,mode:"insensitive"}}});
    if(user&&!user.isActive)return {kind:"ACCOUNT_DISABLED" as const};
    if(user&&!(await verifyPassword(user.passwordHash,p.data.password)))return {kind:"ACCOUNT_PASSWORD" as const};
    if(guardian.userId&&(!user||guardian.userId!==user.id))return {kind:"LINK_CONFLICT" as const};
    if(!user)user=await tx.user.create({data:{email:invite.invitedEmail,displayName:[guardian.firstName,guardian.lastName].filter(Boolean).join(" "),passwordHash,emailVerifiedAt:new Date()}});else if(!user.emailVerifiedAt)user=await tx.user.update({where:{id:user.id},data:{emailVerifiedAt:new Date()}});
    await tx.guardian.update({where:{id:guardian.id},data:{userId:user.id,emailVerifiedAt:guardian.emailVerifiedAt||new Date()}});
    // Parent membership and least-privilege role are provisioned only after the
    // verified invitation token and explicit consent have both been accepted.
    await tx.organizationMembership.upsert({where:{userId_organizationId:{userId:user.id,organizationId:invite.organizationId}},update:{status:"ACTIVE",joinedAt:new Date()},create:{userId:user.id,organizationId:invite.organizationId,status:"ACTIVE",joinedAt:new Date()}});
    await tx.schoolMembership.upsert({where:{userId_schoolId:{userId:user.id,schoolId:invite.schoolId}},update:{organizationId:invite.organizationId,status:"ACTIVE",joinedAt:new Date()},create:{userId:user.id,organizationId:invite.organizationId,schoolId:invite.schoolId,status:"ACTIVE",joinedAt:new Date()}});
    const parentRole=await tx.role.findUnique({where:{key:"PARENT"}});
    if(!parentRole)throw Object.assign(new Error("Parent role is not seeded; run the idempotent seed before accepting invitations"),{status:503});
    const existingParentRole=await tx.userRoleAssignment.findFirst({where:{userId:user.id,roleId:parentRole.id,scopeType:"SCHOOL",organizationId:invite.organizationId,schoolId:invite.schoolId}});
    if(!existingParentRole)await tx.userRoleAssignment.create({data:{userId:user.id,roleId:parentRole.id,scopeType:"SCHOOL",organizationId:invite.organizationId,schoolId:invite.schoolId,assignedBy:invite.createdBy}});
    await tx.parentInvitation.update({where:{id:invite.id},data:{status:"ACCEPTED",acceptedAt:new Date(),acceptedByUserId:user.id,consentAcceptedAt:new Date(),deliveryCiphertext:"",deliveryNonce:"",deliveryTag:"",deliveryStatus:"CONSUMED"}});
    await tx.dataConsentEvent.create({data:{organizationId:invite.organizationId,schoolId:invite.schoolId,guardianId:guardian.id,invitationId:invite.id,actorUserId:user.id,eventType:"ACCEPTED",consentVersion:invite.consentVersion,noticeSnapshot:invite.consentNoticeText}});
    await tx.auditLog.create({data:{actorUserId:user.id,organizationId:invite.organizationId,schoolId:invite.schoolId,action:"parent.invitation.accepted",resourceType:"Guardian",resourceId:guardian.id,outcome:"SUCCESS"}});
    return {kind:"ACCEPTED" as const,userId:user.id,email:user.email,guardianId:guardian.id};
  });
  if(result.kind==="INVALID")return res.status(400).json({error:"Invitation is invalid"});
  if(result.kind==="CONSENT_VERSION")return res.status(409).json({error:"Consent notice version changed; request a new invitation"});
  if(result.kind==="USED")return res.status(409).json({error:"Invitation has already been used or revoked"});
  if(result.kind==="EXPIRED")return res.status(410).json({error:"Invitation has expired"});
  if(result.kind==="ACCOUNT_DISABLED")return res.status(409).json({error:"The existing account is disabled; contact school support before linking"});
  if(result.kind==="ACCOUNT_PASSWORD")return res.status(401).json({error:"The supplied password did not match the existing account"});
  if(result.kind==="LINK_CONFLICT")return res.status(409).json({error:"Guardian is already linked to a different account"});
  return res.status(201).json({data:result,message:"Guardian email ownership verified, consent recorded, and least-privilege parent school membership provisioned."});
}));

parentRouter.get(base+"/invitations/:invitationId",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"students.pii.read");if(!s)return;const invitation=await withTenantContext(prisma,s,tx=>tx.parentInvitation.findFirst({where:{id:req.params.invitationId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,invitedEmail:true,status:true,deliveryStatus:true,deliveryAttempts:true,expiresAt:true,acceptedAt:true,acceptedByUserId:true,consentAcceptedAt:true,consentWithdrawnAt:true,consentVersion:true,consentNoticeText:true,createdAt:true}}));if(!invitation)return res.status(404).json({error:"Invitation not found"});return res.json({data:invitation});}));

parentRouter.post(base+"/invitations/:invitationId/revoke",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"students.pii.read");if(!s)return;if(!await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"students.update"))return res.status(403).json({error:"Missing required permission: students.update"});const changed=await withTenantContext(prisma,s,async tx=>{const row=await tx.parentInvitation.findFirst({where:{id:req.params.invitationId,organizationId:s.organizationId,schoolId:s.schoolId,status:"PENDING"}});if(!row)return false;await tx.parentInvitation.update({where:{id:row.id},data:{status:"REVOKED",deliveryStatus:"CANCELLED",deliveryCiphertext:"",deliveryNonce:"",deliveryTag:""}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"parent.invitation.revoked",resourceType:"ParentInvitation",resourceId:row.id,outcome:"SUCCESS"}});return true;});if(!changed)return res.status(404).json({error:"Pending invitation not found"});return res.status(204).send();}));

parentRouter.get(base+"/guardians/:guardianId/merge-preview",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"students.pii.read");if(!s)return;const targetId=String(req.query.targetGuardianId||"");if(!targetId)return res.status(400).json({error:"targetGuardianId is required"});const preview=await withTenantContext(prisma,s,async tx=>{const [source,target]=await Promise.all([tx.guardian.findFirst({where:{id:req.params.guardianId,organizationId:s.organizationId,schoolId:s.schoolId,isActive:true}}),tx.guardian.findFirst({where:{id:targetId,organizationId:s.organizationId,schoolId:s.schoolId,isActive:true}})]);if(!source||!target||source.id===target.id)return null;const links=await tx.studentGuardian.findMany({where:{guardianId:source.id,organizationId:s.organizationId,schoolId:s.schoolId}});const targetLinks=await tx.studentGuardian.findMany({where:{guardianId:target.id,organizationId:s.organizationId,schoolId:s.schoolId,studentId:{in:links.map(x=>x.studentId)}}});return {source:{id:source.id,name:[source.firstName,source.lastName].filter(Boolean).join(" "),userLinked:Boolean(source.userId)},target:{id:target.id,name:[target.firstName,target.lastName].filter(Boolean).join(" "),userLinked:Boolean(target.userId)},sourceStudentLinks:links.length,duplicateStudentLinks:targetLinks.length,accountConflict:Boolean(source.userId&&target.userId&&source.userId!==target.userId),students:links.map(x=>({studentId:x.studentId,primary:x.isPrimary,alreadyLinked:targetLinks.some(t=>t.studentId===x.studentId)}))};});if(!preview)return res.status(404).json({error:"Source or target guardian not found in this school"});return res.json({data:preview});}));

parentRouter.post(base+"/guardians/:guardianId/merge",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"students.pii.read");if(!s)return;if(!await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"students.update"))return res.status(403).json({error:"Missing required permission: students.update"});const p=z.object({targetGuardianId:z.string().min(1),confirmation:z.literal("MERGE_GUARDIAN_RECORDS")}).safeParse(req.body);if(!p.success)return res.status(400).json({error:"Explicit merge confirmation and target are required"});const result=await withTenantContext(prisma,s,async tx=>{for(const guardianId of [req.params.guardianId,p.data.targetGuardianId].sort())await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:guardian:${guardianId}`);const source=await tx.guardian.findFirst({where:{id:req.params.guardianId,organizationId:s.organizationId,schoolId:s.schoolId,isActive:true}});const target=await tx.guardian.findFirst({where:{id:p.data.targetGuardianId,organizationId:s.organizationId,schoolId:s.schoolId,isActive:true}});if(!source||!target||source.id===target.id)return {kind:"NOT_FOUND" as const};if(source.userId&&target.userId&&source.userId!==target.userId)return {kind:"ACCOUNT_CONFLICT" as const};if(source.userId&&!target.userId){const linkedUser=await tx.user.findUnique({where:{id:source.userId},select:{email:true}});if(!linkedUser||(target.email&&target.email.trim().toLowerCase()!==linkedUser.email.toLowerCase()))return {kind:"ACCOUNT_CONFLICT" as const};}const links=await tx.studentGuardian.findMany({where:{guardianId:source.id,organizationId:s.organizationId,schoolId:s.schoolId}});await tx.studentGuardian.updateMany({where:{guardianId:source.id,organizationId:s.organizationId,schoolId:s.schoolId,isPrimary:true},data:{isPrimary:false}});let moved=0,combined=0;for(const link of links){const existing=await tx.studentGuardian.findFirst({where:{guardianId:target.id,studentId:link.studentId,organizationId:s.organizationId,schoolId:s.schoolId}});if(existing){await tx.studentGuardian.update({where:{id:existing.id},data:{isPrimary:existing.isPrimary||link.isPrimary,isEmergency:existing.isEmergency||link.isEmergency,canPickup:existing.canPickup||link.canPickup,canReceiveCommunications:existing.canReceiveCommunications||link.canReceiveCommunications}});await tx.studentGuardian.delete({where:{id:link.id}});combined++;}else{await tx.studentGuardian.update({where:{id:link.id},data:{guardianId:target.id}});moved++;}}await tx.parentInvitation.updateMany({where:{guardianId:source.id,status:"PENDING"},data:{status:"REVOKED",deliveryStatus:"CANCELLED",deliveryCiphertext:"",deliveryNonce:"",deliveryTag:""}});if(source.userId&&!target.userId)await tx.guardian.update({where:{id:target.id},data:{userId:source.userId,email:target.email||source.email,emailVerifiedAt:source.emailVerifiedAt||target.emailVerifiedAt}});await tx.guardian.update({where:{id:source.id},data:{isActive:false,mergedIntoGuardianId:target.id,userId:null}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"guardian.merged",resourceType:"Guardian",resourceId:source.id,outcome:"SUCCESS",metadata:{targetGuardianId:target.id,movedLinks:moved,combinedLinks:combined}}});return {kind:"MERGED" as const,movedLinks:moved,combinedLinks:combined,sourceGuardianId:source.id,targetGuardianId:target.id};});if(result.kind==="NOT_FOUND")return res.status(404).json({error:"Active source or target guardian not found"});if(result.kind==="ACCOUNT_CONFLICT")return res.status(409).json({error:"Source and target guardians are linked to different user accounts; resolve account ownership before merging"});return res.json({data:result});}));


parentRouter.post("/:organizationId/:schoolId/portal/consent/withdraw",authenticate,wrap(async(req,res)=>{
 const organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId),userId=req.auth!.userId;
 const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);
  if(!guardianIds.length)return {kind:"NOT_FOUND" as const};
  const activeInvitations=await tx.parentInvitation.findMany({where:{organizationId,schoolId,guardianId:{in:guardianIds},acceptedByUserId:userId,status:"ACCEPTED",consentWithdrawnAt:null},select:{id:true,guardianId:true,consentVersion:true,consentNoticeText:true}});
  const withdrawnAt=new Date();
  await tx.parentInvitation.updateMany({where:{organizationId,schoolId,guardianId:{in:guardianIds},acceptedByUserId:userId,status:"ACCEPTED",consentWithdrawnAt:null},data:{consentWithdrawnAt:withdrawnAt}});
  if(activeInvitations.length)await tx.dataConsentEvent.createMany({data:activeInvitations.map(invite=>({organizationId,schoolId,guardianId:invite.guardianId,invitationId:invite.id,actorUserId:userId,eventType:"WITHDRAWN" as const,consentVersion:invite.consentVersion,noticeSnapshot:invite.consentNoticeText,occurredAt:withdrawnAt}))});
  await tx.schoolMembership.updateMany({where:{userId,organizationId,schoolId,status:"ACTIVE"},data:{status:"LEFT"}});
  await tx.userRoleAssignment.deleteMany({where:{userId,organizationId,schoolId,scopeType:"SCHOOL",role:{key:"PARENT"}}});
  const otherMembership=await tx.schoolMembership.findFirst({where:{userId,organizationId,status:"ACTIVE"},select:{id:true}});
  if(!otherMembership)await tx.organizationMembership.updateMany({where:{userId,organizationId,status:"ACTIVE"},data:{status:"LEFT"}});
  await tx.auditLog.create({data:{actorUserId:userId,organizationId,schoolId,action:"parent.consent.withdrawn",resourceType:"Guardian",resourceId:guardianIds[0],outcome:"SUCCESS",metadata:{guardianCount:guardianIds.length}}});
  return {kind:"WITHDRAWN" as const,guardianCount:guardianIds.length};
 });
 if(result.kind==="NOT_FOUND")return res.status(404).json({error:"No active parent consent was found for this school"});
 return res.json({data:result,message:"Parent portal consent has been withdrawn for this school. Contact the school to restore access."});
}));

// Parent portal APIs are deliberately guardian-link based. A school membership
// alone never grants access to a student record. Only guardians with an accepted,
// consented invitation for this exact school are eligible for student links.
async function consentedGuardianIds(tx:any,userId:string,organizationId:string,schoolId:string) {
  const invitations=await tx.parentInvitation.findMany({where:{organizationId,schoolId,status:"ACCEPTED",acceptedByUserId:userId,consentAcceptedAt:{not:null},consentWithdrawnAt:null},select:{guardianId:true}});
  const ids=[...new Set(invitations.map((row:any)=>row.guardianId))];
  if(!ids.length)return [] as string[];
  const guardians=await tx.guardian.findMany({where:{id:{in:ids},userId,isActive:true,emailVerifiedAt:{not:null}},select:{id:true}});
  return guardians.map((row:any)=>row.id) as string[];
}
async function parentScope(userId:string,organizationId:string,schoolId:string,permission="parent.portal.read") {
  return withTenantContext(prisma,{userId,organizationId,schoolId},async tx=>{
    const [membership,organizationMembership]=await Promise.all([
      tx.schoolMembership.findFirst({where:{userId,organizationId,schoolId,status:"ACTIVE"},select:{id:true}}),
      tx.organizationMembership.findFirst({where:{userId,organizationId,status:"ACTIVE"},select:{id:true}})
    ]);
    const assignment=await tx.userRoleAssignment.findFirst({where:{userId,organizationId,schoolId,scopeType:"SCHOOL",role:{key:"PARENT",rolePermissions:{some:{permission:{key:permission}}}}},select:{id:true}});
    const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);
    const visibleLink=guardianIds.length?await tx.studentGuardian.findFirst({where:{organizationId,schoolId,guardianId:{in:guardianIds},canReceiveCommunications:true},select:{id:true}}):null;
    return parentPortalAccessAllowed({membershipActive:!!membership,organizationMembershipActive:!!organizationMembership,parentRoleAssigned:!!assignment,permissionGranted:!!assignment,verifiedGuardian:guardianIds.length>0,acceptedInvitation:guardianIds.length>0,consentAccepted:guardianIds.length>0,visibleStudentLink:!!visibleLink});
  });
}


// P540: health visibility consent is granular per student and independent of general parent-portal consent.
parentRouter.post("/:organizationId/:schoolId/portal/children/:studentId/health-consent",authenticate,wrap(async(req,res)=>{
 const organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId),userId=req.auth!.userId;
 if(!await parentScope(userId,organizationId,schoolId,"parent.health.read"))return res.status(403).json({error:"Verified guardian membership and active portal consent are required"});
 const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);
  const link=guardianIds.length?await tx.studentGuardian.findFirst({where:{organizationId,schoolId,studentId:req.params.studentId,guardianId:{in:guardianIds},canReceiveCommunications:true},select:{guardianId:true}}):null;
  if(!link)return null;
  const row=await tx.studentHealthConsent.upsert({where:{organizationId_schoolId_studentId_guardianId:{organizationId,schoolId,studentId:req.params.studentId,guardianId:link.guardianId}},create:{organizationId,schoolId,studentId:req.params.studentId,guardianId:link.guardianId,grantedAt:new Date(),revokedAt:null,consentVersion:"health-visibility-v1"},update:{grantedAt:new Date(),revokedAt:null,consentVersion:"health-visibility-v1"}});
  await tx.auditLog.create({data:{actorUserId:userId,organizationId,schoolId,action:"parent.health.consent.granted",resourceType:"StudentHealthConsent",resourceId:row.id,outcome:"SUCCESS",metadata:{studentId:req.params.studentId,consentVersion:row.consentVersion}}});return row;
 });if(!result)return res.status(404).json({error:"Student is not linked to this verified guardian"});return res.json({data:{studentId:result.studentId,grantedAt:result.grantedAt,revokedAt:result.revokedAt,consentVersion:result.consentVersion}});
}));
parentRouter.delete("/:organizationId/:schoolId/portal/children/:studentId/health-consent",authenticate,wrap(async(req,res)=>{
 const organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId),userId=req.auth!.userId;
 if(!await parentScope(userId,organizationId,schoolId,"parent.health.read"))return res.status(403).json({error:"Verified guardian membership and active portal consent are required"});
 const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);
  const links=guardianIds.length?await tx.studentGuardian.findMany({where:{organizationId,schoolId,studentId:req.params.studentId,guardianId:{in:guardianIds},canReceiveCommunications:true},select:{guardianId:true}}):[];
  if(!links.length)return null;
  const rows=await tx.studentHealthConsent.updateMany({where:{organizationId,schoolId,studentId:req.params.studentId,guardianId:{in:links.map((x:any)=>x.guardianId)},revokedAt:null},data:{revokedAt:new Date()}});
  await tx.auditLog.create({data:{actorUserId:userId,organizationId,schoolId,action:"parent.health.consent.revoked",resourceType:"StudentHealthConsent",resourceId:req.params.studentId,outcome:"SUCCESS",metadata:{studentId:req.params.studentId,revokedCount:rows.count}}});return {revokedCount:rows.count};
 });if(!result)return res.status(404).json({error:"Student is not linked to this verified guardian"});return res.json({data:result,message:"Health visibility consent revoked."});
}));

// P351: Health summary is restricted to verified, consented guardian-linked students.
parentRouter.get("/:organizationId/:schoolId/portal/health",authenticate,wrap(async(req,res)=>{
 const organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId),userId=req.auth!.userId;
 if(!await parentScope(userId,organizationId,schoolId,"parent.health.read"))return res.status(403).json({error:"Verified guardian membership, consent and health permission are required"});
 const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);
  const links=await tx.studentGuardian.findMany({where:{organizationId,schoolId,guardianId:{in:guardianIds},canReceiveCommunications:true},select:{studentId:true,guardianId:true}});
  const consentRows=links.length?await tx.studentHealthConsent.findMany({where:{organizationId,schoolId,guardianId:{in:guardianIds},studentId:{in:[...new Set(links.map(l=>l.studentId))]},grantedAt:{not:null},revokedAt:null},select:{studentId:true,guardianId:true}}):[];
  const consentedStudentIds=new Set(consentRows.map((c:any)=>c.studentId));
  const studentIds=[...new Set(links.filter(l=>consentedStudentIds.has(l.studentId)).map(l=>l.studentId))];if(!studentIds.length)return {profiles:[],events:[]};
  const [profiles,events]=await Promise.all([tx.studentHealthProfile.findMany({where:{organizationId,schoolId,studentId:{in:studentIds}}}),tx.studentHealthEvent.findMany({where:{organizationId,schoolId,studentId:{in:studentIds}},orderBy:{occurredAt:"desc"},take:100})]);return {profiles,events};
 });return res.json({data:result});
}));
parentRouter.get("/parents/me/schools",authenticate,wrap(async(req,res)=>{
  const userId=req.auth!.userId;
  const memberships=await withIdentityContext(prisma,userId,tx=>tx.schoolMembership.findMany({where:{userId,status:"ACTIVE"},select:{organizationId:true,schoolId:true},orderBy:{createdAt:"asc"}}));
  const rows=[];
  for(const membership of memberships){
    const data=await withTenantContext(prisma,{...membership,userId},async tx=>{
      const [school,organization,guardianIds]=await Promise.all([
        tx.school.findFirst({where:{id:membership.schoolId,organizationId:membership.organizationId,isActive:true},select:{id:true,name:true,code:true,timezone:true}}),
        tx.organization.findFirst({where:{id:membership.organizationId,isActive:true},select:{id:true,name:true,slug:true}}),
        consentedGuardianIds(tx,userId,membership.organizationId,membership.schoolId)
      ]);
      const [organizationMembership,parentRole]=await Promise.all([
        tx.organizationMembership.findFirst({where:{userId,organizationId:membership.organizationId,status:"ACTIVE"},select:{id:true}}),
        tx.userRoleAssignment.findFirst({where:{userId,organizationId:membership.organizationId,schoolId:membership.schoolId,scopeType:"SCHOOL",role:{key:"PARENT",rolePermissions:{some:{permission:{key:"parent.portal.read"}}}}},select:{id:true}})
      ]);
      const guardian=organizationMembership&&parentRole&&guardianIds.length?await tx.guardian.findMany({where:{id:{in:guardianIds},userId,isActive:true,emailVerifiedAt:{not:null}},select:{id:true,studentLinks:{where:{organizationId:membership.organizationId,schoolId:membership.schoolId,canReceiveCommunications:true},select:{studentId:true}}}}):[];
      if(!school||!organization||!guardian.length)return null;
      return {organization,school,studentCount:new Set(guardian.flatMap(g=>g.studentLinks.map(l=>l.studentId))).size};
    });
    if(data)rows.push(data);
  }
  return res.json({data:rows});
}));

parentRouter.get("/:organizationId/:schoolId/portal/children",authenticate,wrap(async(req,res)=>{
  const organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId),userId=req.auth!.userId;
  if(!await parentScope(userId,organizationId,schoolId))return res.status(403).json({error:"Verified guardian membership and consent are required"});
  const children=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
    const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);
    const links=guardianIds.length?await tx.studentGuardian.findMany({where:{organizationId,schoolId,guardianId:{in:guardianIds},canReceiveCommunications:true},select:{studentId:true,relationship:true,isPrimary:true,guardianId:true}}):[];
    const ids=[...new Set(links.map(link=>link.studentId))];
    if(!ids.length)return [];
    const students=await tx.student.findMany({where:{id:{in:ids},organizationId,schoolId},select:{id:true,admissionNumber:true,firstName:true,lastName:true,preferredName:true,status:true,enrollments:{where:{status:"ENROLLED"},select:{academicYearId:true,gradeLevelId:true,sectionName:true,rollNumber:true,status:true},orderBy:{createdAt:"desc"},take:1}} ,orderBy:{firstName:"asc"}});
    return students.map(student=>({ ...student, relationships:links.filter(link=>link.studentId===student.id).map(link=>({relationship:link.relationship,isPrimary:link.isPrimary})) }));
  });
  return res.json({data:children});
}));

parentRouter.get("/:organizationId/:schoolId/portal/children/:studentId/attendance",authenticate,wrap(async(req,res)=>{
  const organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId),userId=req.auth!.userId;
  if(!await parentScope(userId,organizationId,schoolId,"parent.attendance.read"))return res.status(403).json({error:"Verified guardian membership, consent and attendance permission are required"});
  const range=parentAttendanceQuerySchema.safeParse(req.query);
  if(!range.success)return res.status(400).json({error:"Invalid attendance date range or pagination parameters"});
  const dateFilter=parentAttendanceDateFilter(range.data);
  const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
    const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);
    const link=await tx.studentGuardian.findFirst({where:{organizationId,schoolId,studentId:req.params.studentId,guardianId:{in:guardianIds},canReceiveCommunications:true},select:{studentId:true}});
    if(!link)return null;
    const where:any={organizationId,schoolId,studentId:link.studentId,session:{organizationId,schoolId,status:{in:["SUBMITTED","LOCKED"]},...(Object.keys(dateFilter).length?{sessionDate:dateFilter}:{})}};
    if(range.data.cursor){
      const cursorRow=await tx.studentAttendance.findFirst({where:{...where,id:range.data.cursor},select:{id:true}});
      if(!cursorRow)return {invalidCursor:true as const};
    }
    const rows=await tx.studentAttendance.findMany({
      where,
      select:{id:true,sessionId:true,status:true,arrivalTime:true,markedAt:true,session:{select:{id:true,sessionDate:true,gradeLevelId:true,sectionName:true,status:true}}},
      orderBy:[{markedAt:"desc"},{id:"desc"}],
      take:range.data.limit+1,
      ...(range.data.cursor?{cursor:{id:range.data.cursor},skip:1}:{})
    });
    return sliceParentAttendancePage(rows,range.data.limit);
  });
  if(result===null)return res.status(404).json({error:"Student is not linked to this guardian"});
  if("invalidCursor" in result)return res.status(400).json({error:"Attendance cursor is invalid for this student or date range"});
  return res.json(result);
}));


// P33 — Parent fee statements, homework, report cards and notifications.
const parentStudentLink = async (tx:any,userId:string,organizationId:string,schoolId:string,studentId:string) => {
  const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);
  if(!guardianIds.length)return false;
  return Boolean(await tx.studentGuardian.findFirst({where:{organizationId,schoolId,studentId,guardianId:{in:guardianIds},canReceiveCommunications:true},select:{id:true}}));
};
parentRouter.get('/:organizationId/:schoolId/portal/children/:studentId/fees',authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;
 if(!await parentScope(userId,organizationId,schoolId,'parent.fees.read'))return res.status(403).json({error:'Parent fee permission and active consent are required'});
 const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{if(!await parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId))return null;return tx.studentFeeCharge.findMany({where:{organizationId,schoolId,studentId:req.params.studentId,status:{in:['PUBLISHED','PAID','PARTIALLY_PAID','OVERDUE']}},select:{id:true,chargeCode:true,title:true,description:true,category:true,currency:true,amount:true,amountPaid:true,dueAt:true,status:true,publishedAt:true,installmentSchedule:{select:{id:true,status:true,totalAmount:true,installmentCount:true,intervalMonths:true,installments:{select:{id:true,sequence:true,amount:true,amountPaid:true,dueAt:true,status:true},orderBy:{sequence:'asc'}}}},payments:{where:{status:{in:['RECORDED','PARTIALLY_REFUNDED']}},select:{id:true,amount:true,method:true,reference:true,paidAt:true,status:true,feeReceipt:{select:{id:true,receiptNumber:true,invoiceNumber:true,amount:true,currency:true,paymentMethod:true,paymentReference:true,paidAt:true,allocationSnapshot:true,schoolSnapshot:true,issuedAt:true}},installmentAllocations:{select:{amount:true,installment:{select:{id:true,sequence:true,dueAt:true}}}}},orderBy:{paidAt:'desc'}}},orderBy:[{dueAt:'desc'},{createdAt:'desc'}],take:100});});
 if(!data)return res.status(404).json({error:'Student is not linked to this guardian'});return res.json({data});
}));
// P144 — Guardian-initiated refund request; consent, student link and payment ownership are enforced.
parentRouter.post('/:organizationId/:schoolId/portal/children/:studentId/fees/payments/:paymentId/refunds',authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId,userId}= {...req.params,userId:req.auth!.userId};
 if(!await parentScope(userId,organizationId,schoolId,'parent.fees.read'))return res.status(403).json({error:'Parent fee permission and active consent are required'});
 const key=String(req.get('idempotency-key')||'').trim();if(key.length<8||key.length>120)return res.status(400).json({error:'An idempotency-key header between 8 and 120 characters is required'});
 const parsed=z.object({amount:z.number().positive().max(100000000).refine(v=>Math.round(v*100)===v*100),reason:z.string().trim().min(5).max(1000)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'A valid refund amount and reason are required'});
 const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  if(!await parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId))return {kind:'NOT_LINKED' as const};
  await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${organizationId}:${schoolId}:parent-refund:${key}`);
  await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${organizationId}:${schoolId}:payment-refund:${req.params.paymentId}`);
  const existing=await tx.studentFeeRefund.findFirst({where:{schoolId,idempotencyKey:key}});if(existing&&existing.paymentId!==req.params.paymentId)return {kind:'IDEMPOTENCY_CONFLICT' as const};if(existing)return {kind:'EXISTING' as const,row:existing};
  const payment=await tx.studentFeePayment.findFirst({where:{id:req.params.paymentId,organizationId,schoolId,studentId:req.params.studentId,status:{in:['RECORDED','PARTIALLY_REFUNDED']}},select:{id:true,studentId:true,chargeId:true,amount:true,currency:true}});if(!payment)return {kind:'PAYMENT_NOT_FOUND' as const};
  const prior=await tx.studentFeeRefund.aggregate({where:{organizationId,schoolId,paymentId:payment.id,status:{in:['REQUESTED','APPROVED_PENDING_SETTLEMENT','SETTLED']}},_sum:{amount:true}});const reserved=Number(prior._sum.amount||0);if(Math.round((reserved+parsed.data.amount)*100)>Math.round(Number(payment.amount)*100))return {kind:'LIMIT' as const};
  const row=await tx.studentFeeRefund.create({data:{organizationId,schoolId,studentId:payment.studentId,chargeId:payment.chargeId,paymentId:payment.id,amount:parsed.data.amount,currency:payment.currency,reason:parsed.data.reason,idempotencyKey:key,requestedBy:userId,status:'REQUESTED'}});
  await tx.studentFeeRefundEvent.create({data:{organizationId,schoolId,refundId:row.id,eventType:'REQUESTED',toStatus:'REQUESTED',actorUserId:userId,note:parsed.data.reason}});await tx.auditLog.create({data:{actorUserId:userId,organizationId,schoolId,action:'student.fee.refund.parent_requested',resourceType:'StudentFeeRefund',resourceId:row.id,outcome:'SUCCESS',metadata:{paymentId:payment.id,amount:parsed.data.amount}}});return {kind:'CREATED' as const,row};
 });
 if(result.kind==='NOT_LINKED')return res.status(404).json({error:'Student is not linked to this guardian'});if(result.kind==='PAYMENT_NOT_FOUND')return res.status(404).json({error:'Payment is not available for this linked student'});if(result.kind==='LIMIT')return res.status(409).json({error:'Refund requests exceed the payment amount'});if(result.kind==='IDEMPOTENCY_CONFLICT')return res.status(409).json({error:'Idempotency key already belongs to another payment'});return res.status(result.kind==='CREATED'?201:200).json({data:(result as any).row,message:'Refund request recorded; school approval and settlement are pending.'});
}));

// P143 — Parent-visible refund timeline. Internal notes and staff identities are never exposed.
parentRouter.get('/:organizationId/:schoolId/portal/children/:studentId/refunds',authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;
 if(!await parentScope(userId,organizationId,schoolId,'parent.fees.read'))return res.status(403).json({error:'Parent fee permission and active consent are required'});
 const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  if(!await parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId))return null;
  return tx.studentFeeRefund.findMany({where:{organizationId,schoolId,studentId:req.params.studentId,parentVisibleAt:{not:null}},select:{id:true,amount:true,currency:true,reason:true,status:true,createdAt:true,approvedAt:true,settledAt:true,payment:{select:{reference:true,charge:{select:{title:true}}}},events:{where:{eventType:{in:['REQUESTED','APPROVED','REJECTED','SETTLED']}},select:{id:true,eventType:true,fromStatus:true,toStatus:true,createdAt:true},orderBy:{createdAt:'asc'}}},orderBy:{createdAt:'desc'},take:100});
 });
 if(!data)return res.status(404).json({error:'Student is not linked to this guardian'});return res.json({data});
}));

parentRouter.get('/:organizationId/:schoolId/portal/children/:studentId/homework',authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.homework.read'))return res.status(403).json({error:'Parent homework permission and active consent are required'});
 const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{if(!await parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId))return null;const assignments=await tx.homeworkAssignment.findMany({where:{organizationId,schoolId,studentId:req.params.studentId,status:'PUBLISHED'},select:{id:true,title:true,subjectName:true,description:true,dueAt:true,attachmentMetadata:true,publishedAt:true},orderBy:[{dueAt:'asc'},{publishedAt:'desc'}],take:100});const submissions=assignments.length?await tx.homeworkSubmission.findMany({where:{organizationId,schoolId,studentId:req.params.studentId,homeworkAssignmentId:{in:assignments.map(x=>x.id)}},select:{id:true,homeworkAssignmentId:true,status:true,answerText:true,submittedAt:true,score:true,maxScore:true,teacherFeedback:true,rubricResults:true,gradedAt:true,attachments:{select:{id:true,displayName:true,securityStatus:true,createdAt:true}}}}):[];return assignments.map(a=>({...a,submission:submissions.find(x=>x.homeworkAssignmentId===a.id)||null}));});
 if(!data)return res.status(404).json({error:'Student is not linked to this guardian'});return res.json({data});
}));
parentRouter.post('/:organizationId/:schoolId/portal/children/:studentId/homework/:assignmentId/submissions',authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.homework.read'))return res.status(403).json({error:'Parent homework permission and active consent are required'});
 const p=z.object({answerText:z.string().trim().min(1).max(8000)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'A text answer between 1 and 8000 characters is required'});
 const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{if(!await parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId))return {kind:'NOT_LINKED' as const};const assignment=await tx.homeworkAssignment.findFirst({where:{id:req.params.assignmentId,organizationId,schoolId,studentId:req.params.studentId,status:'PUBLISHED'},select:{id:true}});if(!assignment)return {kind:'NOT_FOUND' as const};const existing=await tx.homeworkSubmission.findFirst({where:{organizationId,schoolId,homeworkAssignmentId:assignment.id,studentId:req.params.studentId}});if(existing&&existing.status==='GRADED')return {kind:'GRADED' as const};if(existing){const row=await tx.homeworkSubmission.update({where:{id:existing.id},data:{answerText:p.data.answerText,submittedByUserId:userId,status:'RESUBMITTED',submittedAt:new Date(),gradedByUserId:null,score:null,maxScore:null,teacherFeedback:null,gradedAt:null}});return {kind:'OK' as const,row};}const row=await tx.homeworkSubmission.create({data:{organizationId,schoolId,homeworkAssignmentId:assignment.id,studentId:req.params.studentId,submittedByUserId:userId,answerText:p.data.answerText,status:'SUBMITTED'}});return {kind:'OK' as const,row};});
 if(result.kind==='NOT_LINKED')return res.status(404).json({error:'Student is not linked to this guardian'});if(result.kind==='NOT_FOUND')return res.status(404).json({error:'Published homework assignment not found'});if(result.kind==='GRADED')return res.status(409).json({error:'A graded submission cannot be replaced; request a teacher reopen'});return res.status(201).json({data:result.row});
}));

parentRouter.get('/:organizationId/:schoolId/portal/children/:studentId/report-cards',authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.reports.read'))return res.status(403).json({error:'Parent report permission and active consent are required'});
 const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{if(!await parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId))return null;return tx.studentReportCard.findMany({where:{organizationId,schoolId,studentId:req.params.studentId,status:'PUBLISHED',publishedAt:{not:null}},select:{id:true,academicYearId:true,termLabel:true,resultSummary:true,teacherRemarks:true,principalRemarks:true,publishedAt:true},orderBy:{publishedAt:'desc'},take:50});});
 if(!data)return res.status(404).json({error:'Student is not linked to this guardian'});return res.json({data});
}));
// P476 — parent academic planner APIs. All reads are scoped to a consented guardian link.
const parentPlannerRangeSchema=z.object({from:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),to:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)}).refine(v=>{const a=new Date(`${v.from}T00:00:00.000Z`),b=new Date(`${v.to}T00:00:00.000Z`);return !Number.isNaN(a.valueOf())&&!Number.isNaN(b.valueOf())&&a.toISOString().slice(0,10)===v.from&&b.toISOString().slice(0,10)===v.to&&a<=b&&((b.valueOf()-a.valueOf())/86400000)<=35;},{message:"Date range must be valid, ordered and no longer than 36 days"});
function parentPlannerDates(req:any,res:any){const parsed=parentPlannerRangeSchema.safeParse({from:req.query.from,to:req.query.to});if(!parsed.success){res.status(400).json({error:"A valid from/to date range of up to 36 days is required"});return null;}return {from:new Date(`${parsed.data.from}T00:00:00.000Z`),toExclusive:new Date(`${parsed.data.to}T00:00:00.000Z`),fromKey:parsed.data.from,toKey:parsed.data.to};}
async function parentPlannerContext(tx:any,userId:string,organizationId:string,schoolId:string,studentId:string){
 if(!await parentStudentLink(tx,userId,organizationId,schoolId,studentId))return null;
 return tx.studentEnrollment.findMany({where:{organizationId,schoolId,studentId,status:"ENROLLED"},select:{academicYearId:true,gradeLevelId:true,sectionName:true},orderBy:{createdAt:"desc"},take:10});
}
const parentPlannerBase="/:organizationId/:schoolId/portal/children/:studentId";
parentRouter.get(parentPlannerBase+"/timetable",authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;const dates=parentPlannerDates(req,res);if(!dates)return;
 if(!await parentScope(userId,organizationId,schoolId,"parent.portal.read"))return res.status(403).json({error:"Verified guardian membership, consent and parent portal access are required"});
 const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const enrollments=await parentPlannerContext(tx,userId,organizationId,schoolId,req.params.studentId);if(!enrollments)return null;if(!enrollments.length)return [];
  const scopes=enrollments.map((e:any)=>({academicYearId:e.academicYearId,gradeLevelId:e.gradeLevelId,sectionName:e.sectionName||""}));
  const assignments=await tx.teacherAssignment.findMany({where:{organizationId,schoolId,isActive:true,OR:scopes,AND:[{OR:[{startsOn:null},{startsOn:{lte:dates.toExclusive}}]},{OR:[{endsOn:null},{endsOn:{gte:dates.from}}]}]},select:{id:true,academicYearId:true,gradeLevelId:true,sectionName:true,startsOn:true,endsOn:true}});
  const assignmentIds=assignments.map((a:any)=>a.id);if(!assignmentIds.length)return [];
  const slots=await tx.teacherTimetableSlot.findMany({where:{organizationId,schoolId,isActive:true,teacherAssignmentId:{in:assignmentIds},OR:[{effectiveFrom:null},{effectiveFrom:{lte:dates.toExclusive}}],AND:[{OR:[{effectiveTo:null},{effectiveTo:{gte:dates.from}}]}]},orderBy:[{dayOfWeek:"asc"},{startsAt:"asc"},{periodNumber:"asc"}],select:{id:true,dayOfWeek:true,periodNumber:true,startsAt:true,endsAt:true,subjectName:true,room:true,effectiveFrom:true,effectiveTo:true,academicYearId:true,teacherAssignmentId:true}});
  const exceptions=slots.length?await tx.teacherTimetableException.findMany({where:{organizationId,schoolId,isActive:true,exceptionDate:{gte:dates.from,lte:dates.toExclusive},timetableSlotId:{in:slots.map((s:any)=>s.id)}},select:{timetableSlotId:true,exceptionDate:true,exceptionType:true,startsAt:true,endsAt:true,room:true,reason:true}}):[];
  const assignmentById=new Map(assignments.map((a:any)=>[a.id,a]));const exceptionByDate=new Map(exceptions.map((e:any)=>[`${e.timetableSlotId}:${e.exceptionDate.toISOString().slice(0,10)}`,e]));
  const occurrences:any[]=[];const cursor=new Date(dates.from);for(;cursor<=dates.toExclusive;cursor.setUTCDate(cursor.getUTCDate()+1)){const dateKey=cursor.toISOString().slice(0,10),dayOfWeek=((cursor.getUTCDay()+6)%7)+1;for(const slot of slots){if(slot.dayOfWeek!==dayOfWeek)continue;const assignment=assignmentById.get(slot.teacherAssignmentId) as any;if(!assignment)continue;if(assignment.startsOn&&assignment.startsOn>cursor)continue;if(assignment.endsOn&&assignment.endsOn<cursor)continue;if(slot.effectiveFrom&&slot.effectiveFrom>cursor)continue;if(slot.effectiveTo&&slot.effectiveTo<cursor)continue;const exception=exceptionByDate.get(`${slot.id}:${dateKey}`) as any;if(exception?.exceptionType==="CANCEL")continue;const start=exception?.startsAt||slot.startsAt,end=exception?.endsAt||slot.endsAt;occurrences.push({id:`${slot.id}:${dateKey}`,slotId:slot.id,date:dateKey,dayOfWeek,periodNumber:slot.periodNumber,startsAt:`${dateKey}T${start}:00`,endsAt:`${dateKey}T${end}:00`,subjectName:slot.subjectName,room:exception?.room||slot.room,exceptionType:exception?.exceptionType||null,substitute:exception?.exceptionType==="SUBSTITUTE",reason:exception?.reason||null});}}return occurrences.sort((a,b)=>a.date.localeCompare(b.date)||a.startsAt.localeCompare(b.startsAt)||a.periodNumber-b.periodNumber);
 });
 if(data===null)return res.status(404).json({error:"Student is not linked to this guardian"});return res.json({data,range:{from:dates.fromKey,to:dates.toKey}});
}));
parentRouter.get(parentPlannerBase+"/calendar",authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;const dates=parentPlannerDates(req,res);if(!dates)return;
 if(!await parentScope(userId,organizationId,schoolId,"parent.portal.read"))return res.status(403).json({error:"Verified guardian membership, consent and parent portal access are required"});
 const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  if(!await parentPlannerContext(tx,userId,organizationId,schoolId,req.params.studentId))return null;
  return tx.calendarEvent.findMany({where:{organizationId,schoolId,audience:{in:["ALL","STUDENTS","PARENTS"]},startsAt:{lt:new Date(dates.toExclusive.valueOf()+86400000)},endsAt:{gte:dates.from}},select:{id:true,title:true,description:true,eventType:true,audience:true,startsAt:true,endsAt:true,isAllDay:true,isInstructionDay:true,location:true},orderBy:{startsAt:"asc"},take:200});
 });
 if(data===null)return res.status(404).json({error:"Student is not linked to this guardian"});return res.json({data,range:{from:dates.fromKey,to:dates.toKey}});
}));
parentRouter.get(parentPlannerBase+"/exams",authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;const dates=parentPlannerDates(req,res);if(!dates)return;
 if(!await parentScope(userId,organizationId,schoolId,"parent.portal.read"))return res.status(403).json({error:"Verified guardian membership, consent and parent portal access are required"});
 const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const enrollments=await parentPlannerContext(tx,userId,organizationId,schoolId,req.params.studentId);if(!enrollments)return null;if(!enrollments.length)return [];
  return tx.schoolAssessmentExam.findMany({where:{organizationId,schoolId,status:"PUBLISHED",examDate:{gte:dates.from,lte:dates.toExclusive},OR:enrollments.map((e:any)=>({academicYearId:e.academicYearId,gradeLevelId:e.gradeLevelId,sectionName:e.sectionName||null}))},select:{id:true,examName:true,subjectName:true,examDate:true,maxMarks:true,passMarks:true,status:true,academicYearId:true,gradeLevelId:true,sectionName:true},orderBy:[{examDate:"asc"},{examName:"asc"}],take:200});
 });
 if(data===null)return res.status(404).json({error:"Student is not linked to this guardian"});return res.json({data,range:{from:dates.fromKey,to:dates.toKey}});
}));

async function parentNotificationWhere(tx:any,organizationId:string,schoolId:string,userId:string){
 const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);
 const links=guardianIds.length?await tx.studentGuardian.findMany({where:{organizationId,schoolId,guardianId:{in:guardianIds},canReceiveCommunications:true},select:{studentId:true}}):[];
 const studentIds=[...new Set(links.map((x:any)=>x.studentId))];
 const where:any={organizationId,schoolId,recipientUserId:userId,OR:[{studentId:null},{studentId:{in:studentIds}}]};
 return where;
}
parentRouter.get('/:organizationId/:schoolId/portal/notifications',authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.notifications.read'))return res.status(403).json({error:'Parent notification permission and active consent are required'});
 const limit=notificationPageSize(req.query.limit);const suppliedCursor=req.query.cursor;const cursor=suppliedCursor===undefined?null:decodeNotificationCursor(suppliedCursor);
 if(suppliedCursor!==undefined&&!cursor)return res.status(400).json({error:'Invalid notification cursor; refresh the inbox'});
 const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const where=await parentNotificationWhere(tx,organizationId,schoolId,userId);
  let watermarkCreatedAt:string,watermarkId:string;
  if(cursor){
   const anchor=await tx.parentNotification.findFirst({where:{...where,id:cursor.lastId,createdAt:new Date(cursor.lastCreatedAt)},select:{id:true}});
   if(!anchor)return {invalidCursor:true as const};
   watermarkCreatedAt=cursor.watermarkCreatedAt;watermarkId=cursor.watermarkId;
  }else{
   const watermark=await tx.parentNotification.findFirst({where,orderBy:[{createdAt:'desc'},{id:'desc'}],select:{id:true,createdAt:true}});
   if(!watermark)return {invalidCursor:false as const,data:[],nextCursor:null,hasMore:false,unreadCount:0};
   watermarkCreatedAt=watermark.createdAt.toISOString();watermarkId=watermark.id;
  }
  const rows=await tx.parentNotification.findMany({where:cursor?{...where,...notificationSnapshotWhere(cursor)}:{...where,AND:[{OR:[{createdAt:{lt:new Date(watermarkCreatedAt)}},{createdAt:new Date(watermarkCreatedAt),id:{lte:watermarkId}}]}]},select:{id:true,studentId:true,category:true,title:true,body:true,readAt:true,createdAt:true},orderBy:[{createdAt:'desc'},{id:'desc'}],take:limit+1});
  const hasMore=rows.length>limit;const page=hasMore?rows.slice(0,limit):rows;const last=page[page.length-1];
  const unreadCount=await tx.parentNotification.count({where:{...where,readAt:null}});
  const nextCursor=hasMore&&last?encodeNotificationCursor({v:1,lastCreatedAt:last.createdAt.toISOString(),lastId:last.id,watermarkCreatedAt,watermarkId}):null;
  return {invalidCursor:false as const,data:page,nextCursor,hasMore,unreadCount};
 });
 if(result.invalidCursor)return res.status(400).json({error:'Notification cursor is stale or outside the active guardian scope; refresh the inbox'});
 return res.json(result);
}));
parentRouter.get('/:organizationId/:schoolId/portal/notifications/unread-count',authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.notifications.read'))return res.status(403).json({error:'Parent notification permission and active consent are required'});
 const count=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>tx.parentNotification.count({where:{...(await parentNotificationWhere(tx,organizationId,schoolId,userId)),readAt:null}}));return res.json({data:{unreadCount:count}});
}));
parentRouter.post('/:organizationId/:schoolId/portal/notifications/read-all',authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.notifications.read'))return res.status(403).json({error:'Parent notification permission and active consent are required'});
 const changed=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>tx.parentNotification.updateMany({where:{...(await parentNotificationWhere(tx,organizationId,schoolId,userId)),readAt:null},data:{readAt:new Date()}}));return res.json({data:{markedRead:changed.count,unreadCount:0}});
}));
parentRouter.post('/:organizationId/:schoolId/portal/notifications/:notificationId/read',authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.notifications.read'))return res.status(403).json({error:'Parent notification permission and active consent are required'});
 const changed=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>tx.parentNotification.updateMany({where:{id:req.params.notificationId,...(await parentNotificationWhere(tx,organizationId,schoolId,userId)),readAt:null},data:{readAt:new Date()}}));if(!changed.count)return res.status(404).json({error:'Unread notification not found'});return res.status(204).send();
}));

// Teacher/school operator submission review and grading. Access is permission-gated; only records in this tenant are addressable.
parentRouter.get(base+'/homework/:assignmentId/submissions',authenticate,wrap(async(req,res)=>{const s=await homeworkScope(req,res,'homework.read');if(!s)return;const operatorAccess=await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,'academics.manage');const assignment=await withTenantContext(prisma,s,async tx=>{const row=await tx.homeworkAssignment.findFirst({where:{id:req.params.assignmentId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});if(!row)return null;if(!await teacherOwnsHomework(tx,s.userId,s.organizationId,s.schoolId,row.id,operatorAccess))return 'FORBIDDEN';return row;});if(assignment==='FORBIDDEN')return res.status(403).json({error:'Teacher is not assigned to this student class'});if(!assignment)return res.status(404).json({error:'Homework assignment not found'});const rows=await withTenantContext(prisma,s,tx=>tx.homeworkSubmission.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,homeworkAssignmentId:assignment.id},select:{id:true,studentId:true,status:true,answerText:true,submittedAt:true,score:true,maxScore:true,teacherFeedback:true,rubricResults:true,gradedAt:true,attachments:{select:{id:true,displayName:true,securityStatus:true,createdAt:true}}},orderBy:{submittedAt:'desc'},take:200}));return res.json({data:rows});}));
parentRouter.patch(base+'/homework/submissions/:submissionId/grade',authenticate,wrap(async(req,res)=>{const s=await homeworkScope(req,res,'homework.grade');if(!s)return;const operatorAccess=await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,'academics.manage');const p=z.object({score:z.number().min(0).max(100000),maxScore:z.number().positive().max(100000),teacherFeedback:z.string().trim().max(4000).optional(),rubricResults:z.array(z.object({criterion:z.string().trim().min(1).max(120),score:z.number().min(0).max(100000),maxScore:z.number().positive().max(100000),feedback:z.string().trim().max(1000).optional()}).refine(v=>v.score<=v.maxScore)).max(30).optional()}).refine(v=>v.score<=v.maxScore).refine(v=>!v.rubricResults||v.rubricResults.every(x=>x.score<=x.maxScore)).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid grade; score must be between zero and maxScore'});const result=await withTenantContext(prisma,s,async tx=>{const row=await tx.homeworkSubmission.findFirst({where:{id:req.params.submissionId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!row)return null;if(!await teacherOwnsHomework(tx,s.userId,s.organizationId,s.schoolId,row.homeworkAssignmentId,operatorAccess))return {forbidden:true};if(row.status==='GRADED')return {conflict:true};const updated=await tx.homeworkSubmission.update({where:{id:row.id},data:{status:'GRADED',score:p.data.score,maxScore:p.data.maxScore,teacherFeedback:p.data.teacherFeedback,rubricResults:p.data.rubricResults as any,gradedByUserId:s.userId,gradedAt:new Date()}});await tx.homeworkSubmissionGradeEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,submissionId:row.id,actorUserId:s.userId,eventType:'GRADED',score:p.data.score,maxScore:p.data.maxScore,rubricResults:p.data.rubricResults as any,feedback:p.data.teacherFeedback}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'homework.submission.graded',resourceType:'HomeworkSubmission',resourceId:row.id,outcome:'SUCCESS'}});return updated;});if(!result)return res.status(404).json({error:'Homework submission not found'});if((result as any).forbidden)return res.status(403).json({error:'Teacher is not assigned to this student class'});if((result as any).conflict)return res.status(409).json({error:'Submission is already graded; reopen it before grading again'});return res.json({data:result});}));

// Grade history is append-only; reopening clears the current grade but preserves every prior assessment.
parentRouter.get(base+'/homework/submissions/:submissionId/history',authenticate,wrap(async(req,res)=>{const s=await homeworkScope(req,res,'homework.read');if(!s)return;const operatorAccess=await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,'academics.manage');const rows=await withTenantContext(prisma,s,async tx=>{const sub=await tx.homeworkSubmission.findFirst({where:{id:req.params.submissionId,organizationId:s.organizationId,schoolId:s.schoolId},select:{homeworkAssignmentId:true}});if(!sub)return null;if(!await teacherOwnsHomework(tx,s.userId,s.organizationId,s.schoolId,sub.homeworkAssignmentId,operatorAccess))return 'FORBIDDEN';return tx.homeworkSubmissionGradeEvent.findMany({where:{submissionId:req.params.submissionId,organizationId:s.organizationId,schoolId:s.schoolId},orderBy:{createdAt:'asc'},take:100});});if(rows==='FORBIDDEN')return res.status(403).json({error:'Teacher is not assigned to this student class'});if(!rows)return res.status(404).json({error:'Submission not found'});return res.json({data:rows});}));
parentRouter.post(base+'/homework/submissions/:submissionId/reopen',authenticate,wrap(async(req,res)=>{const s=await homeworkScope(req,res,'homework.grade');if(!s)return;const operatorAccess=await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,'academics.manage');const p=z.object({reason:z.string().trim().min(5).max(1000)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'A reason is required to reopen a graded submission'});const result=await withTenantContext(prisma,s,async tx=>{const row=await tx.homeworkSubmission.findFirst({where:{id:req.params.submissionId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!row)return null;if(!await teacherOwnsHomework(tx,s.userId,s.organizationId,s.schoolId,row.homeworkAssignmentId,operatorAccess))return {forbidden:true};if(row.status!=='GRADED')return {conflict:true};await tx.homeworkSubmissionGradeEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,submissionId:row.id,actorUserId:s.userId,eventType:'REOPENED',score:row.score,maxScore:row.maxScore,rubricResults:row.rubricResults as any,feedback:p.data.reason}});const updated=await tx.homeworkSubmission.update({where:{id:row.id},data:{status:'SUBMITTED',score:null,maxScore:null,rubricResults:null,teacherFeedback:null,gradedByUserId:null,gradedAt:null}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'homework.submission.reopened',resourceType:'HomeworkSubmission',resourceId:row.id,outcome:'SUCCESS',metadata:{reason:p.data.reason}}});return {updated};});if(!result)return res.status(404).json({error:'Submission not found'});if((result as any).forbidden)return res.status(403).json({error:'Teacher is not assigned to this student class'});if((result as any).conflict)return res.status(409).json({error:'Only graded submissions can be reopened'});return res.json({data:(result as any).updated});}));

// School operators publish fee charges, homework and report cards; parents only read published records.
parentRouter.post(base+'/children/:studentId/fees',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'fees.manage');if(!s)return;const p=z.object({chargeCode:z.string().trim().min(1).max(50),title:z.string().trim().min(1).max(160),description:z.string().max(2000).optional(),category:z.string().trim().max(40).default('GENERAL'),currency:z.string().length(3).default('INR'),amount:z.number().positive().max(100000000),dueAt:z.string().date().optional(),publish:z.boolean().default(false)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid fee charge'});const student=await withTenantContext(prisma,s,tx=>tx.student.findFirst({where:{id:req.params.studentId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}}));if(!student)return res.status(404).json({error:'Student not found'});const row=await withTenantContext(prisma,s,tx=>tx.studentFeeCharge.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:student.id,chargeCode:p.data.chargeCode,title:p.data.title,description:p.data.description,category:p.data.category,currency:p.data.currency,amount:p.data.amount,dueAt:p.data.dueAt?new Date(`${p.data.dueAt}T00:00:00.000Z`):null,status:'DRAFT',approvalStatus:'DRAFT',publishedAt:null,createdBy:s.userId}}));return res.status(201).json({data:row});}));
// P512 — deterministic draft installment schedules for student fee charges.
const installmentScheduleInput=z.object({installmentCount:z.number().int().min(1).max(24),firstDueAt:z.string().date(),intervalMonths:z.number().int().min(1).max(12)});
function buildInstallmentRows(totalAmount:any,count:number,firstDueAt:string,intervalMonths:number){
 const totalCents=Math.round(Number(totalAmount)*100);const baseCents=Math.floor(totalCents/count);const remainder=totalCents-baseCents*count;
 const first=new Date(`${firstDueAt}T00:00:00.000Z`);const rows=[];
 for(let i=0;i<count;i++){const date=new Date(first);const day=date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+i*intervalMonths);const lastDay=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(day,lastDay));rows.push({sequence:i+1,amount:((baseCents+(i<remainder?1:0))/100).toFixed(2),dueAt:date});}
 return rows;
}
parentRouter.get(base+'/fees/:chargeId/installment-schedule',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'fees.read');if(!s)return;const schedule=await withTenantContext(prisma,s,tx=>tx.feeInstallmentSchedule.findFirst({where:{chargeId:req.params.chargeId,organizationId:s.organizationId,schoolId:s.schoolId},include:{installments:{orderBy:{sequence:'asc'}}}}));if(!schedule)return res.json({data:null});return res.json({data:schedule});}));
parentRouter.post(base+'/fees/:chargeId/installment-schedule',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'fees.manage');if(!s)return;const p=installmentScheduleInput.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Installment count, first due date and interval are required'});const result=await withTenantContext(prisma,s,async tx=>{await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:fee-installment-schedule:${req.params.chargeId}`);const charge=await tx.studentFeeCharge.findFirst({where:{id:req.params.chargeId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!charge)return {kind:'NOT_FOUND' as const};if(charge.status!=='DRAFT'||charge.approvalStatus!=='DRAFT'||Number(charge.amountPaid)>0)return {kind:'CONFLICT' as const};const existing=await tx.feeInstallmentSchedule.findFirst({where:{chargeId:charge.id,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});if(existing)return {kind:'EXISTS' as const};const rows=buildInstallmentRows(charge.amount,p.data.installmentCount,p.data.firstDueAt,p.data.intervalMonths);const schedule=await tx.feeInstallmentSchedule.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:charge.studentId,chargeId:charge.id,currency:charge.currency,totalAmount:charge.amount,installmentCount:p.data.installmentCount,intervalMonths:p.data.intervalMonths,status:'DRAFT',createdBy:s.userId,installments:{create:rows.map(row=>({...row,organizationId:s.organizationId,schoolId:s.schoolId,status:'DRAFT'}))}},include:{installments:{orderBy:{sequence:'asc'}}}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.installment_schedule.created',resourceType:'FeeInstallmentSchedule',resourceId:schedule.id,outcome:'SUCCESS',metadata:{chargeId:charge.id,installmentCount:p.data.installmentCount,totalAmount:charge.amount.toString()}}});return {kind:'CREATED' as const,schedule};});if(result.kind==='NOT_FOUND')return res.status(404).json({error:'Fee charge not found'});if(result.kind==='CONFLICT')return res.status(409).json({error:'Schedules can only be configured for an unapproved draft charge'});if(result.kind==='EXISTS')return res.status(409).json({error:'An installment schedule already exists for this charge; use update'});return res.status(201).json({data:result.schedule});}));
parentRouter.put(base+'/fees/:chargeId/installment-schedule',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'fees.manage');if(!s)return;const p=installmentScheduleInput.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Installment count, first due date and interval are required'});const result=await withTenantContext(prisma,s,async tx=>{await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:fee-installment-schedule:${req.params.chargeId}`);const charge=await tx.studentFeeCharge.findFirst({where:{id:req.params.chargeId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!charge)return {kind:'NOT_FOUND' as const};if(charge.status!=='DRAFT'||charge.approvalStatus!=='DRAFT'||Number(charge.amountPaid)>0)return {kind:'CONFLICT' as const};const schedule=await tx.feeInstallmentSchedule.findFirst({where:{chargeId:charge.id,organizationId:s.organizationId,schoolId:s.schoolId},include:{installments:true}});if(!schedule)return {kind:'NOT_FOUND_SCHEDULE' as const};if(schedule.status!=='DRAFT'||schedule.installments.some(x=>Number(x.amountPaid)>0))return {kind:'CONFLICT' as const};const rows=buildInstallmentRows(charge.amount,p.data.installmentCount,p.data.firstDueAt,p.data.intervalMonths);await tx.feeInstallment.deleteMany({where:{scheduleId:schedule.id,organizationId:s.organizationId,schoolId:s.schoolId}});const updated=await tx.feeInstallmentSchedule.update({where:{id:schedule.id},data:{installmentCount:p.data.installmentCount,intervalMonths:p.data.intervalMonths,totalAmount:charge.amount,currency:charge.currency,installments:{create:rows.map(row=>({...row,organizationId:s.organizationId,schoolId:s.schoolId,status:'DRAFT'}))}},include:{installments:{orderBy:{sequence:'asc'}}}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.installment_schedule.updated',resourceType:'FeeInstallmentSchedule',resourceId:schedule.id,outcome:'SUCCESS',metadata:{chargeId:charge.id,installmentCount:p.data.installmentCount}}});return {kind:'UPDATED' as const,schedule:updated};});if(result.kind==='NOT_FOUND')return res.status(404).json({error:'Fee charge not found'});if(result.kind==='NOT_FOUND_SCHEDULE')return res.status(404).json({error:'Installment schedule not found'});if(result.kind==='CONFLICT')return res.status(409).json({error:'Only unpaid draft schedules for draft charges can be changed'});return res.json({data:result.schedule});}));

// P515 — invoice-aware collection, safe retries and automatic installment allocation.
parentRouter.post(base+'/fees/:chargeId/payments',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.payments.record');if(!s)return;
 const p=z.object({amount:z.number().positive().max(100000000).refine(v=>Math.round(v*100)===v*100,'Amount must have at most two decimal places'),method:z.string().trim().min(2).max(32).transform(v=>v.toUpperCase()),reference:z.string().trim().min(3).max(120),paidAt:z.string().date()}).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:'Valid payment amount, method, unique reference and date are required'});
 const financeRows=await withTenantContext(prisma,s,tx=>tx.$queryRaw<any[]>`SELECT \"configuration\" FROM \"SchoolFinanceConfiguration\" WHERE \"organizationId\"=${s.organizationId} AND \"schoolId\"=${s.schoolId} LIMIT 1`);
 const financeConfig=financeRows[0]?.configuration;const configuredMethods=Array.isArray(financeConfig?.paymentMethods)?financeConfig.paymentMethods.filter((m:any)=>m?.enabled===true).map((m:any)=>String(m.code).toUpperCase()):['CASH','UPI','BANK_TRANSFER','CHEQUE','CARD','OTHER'];
 if(!configuredMethods.includes(p.data.method))return res.status(400).json({error:'This payment method is disabled in the school finance configuration'});
 if(financeConfig?.requireReferenceForNonCash===true&&p.data.method!=='CASH'&&!p.data.reference.trim())return res.status(400).json({error:'Transaction reference is required for non-cash payments'});
 const result=await withTenantContext(prisma,s,async tx=>{
  await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:fee:${req.params.chargeId}`);
  const charge=await tx.studentFeeCharge.findFirst({where:{id:req.params.chargeId,organizationId:s.organizationId,schoolId:s.schoolId,status:{in:['PUBLISHED','PARTIALLY_PAID','OVERDUE']}},include:{invoice:{include:{lines:true}},installmentSchedule:{include:{installments:{orderBy:{sequence:'asc'}}}}}});
  if(!charge)return {kind:'NOT_FOUND' as const};
  const duplicate=await tx.studentFeePayment.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,chargeId:charge.id,reference:p.data.reference}});
  if(duplicate){
   const same=Math.round(Number(duplicate.amount)*100)===Math.round(p.data.amount*100)&&duplicate.method===p.data.method&&duplicate.paidAt.toISOString().slice(0,10)===p.data.paidAt;
   return same?{kind:'IDEMPOTENT' as const,payment:duplicate}:{kind:'DUPLICATE' as const};
  }
  const paidCents=Math.round(Number(charge.amountPaid)*100),paymentCents=Math.round(p.data.amount*100),grossCents=Math.round(Number(charge.amount)*100);
  const invoice=charge.invoice;
  if(invoice&&invoice.status!=='ISSUED'&&invoice.status!=='PARTIALLY_PAID')return {kind:'INVOICE_NOT_PAYABLE' as const};
  const payableCents=invoice?Math.round(Number(invoice.total)*100):grossCents;
  const outstandingCents=Math.max(0,payableCents-paidCents);
  if(paymentCents>outstandingCents)return {kind:'OVERPAYMENT' as const};
  const nextPaidCents=paidCents+paymentCents;
  if(nextPaidCents>grossCents)return {kind:'OVERPAYMENT' as const};
  const schedule=charge.installmentSchedule;
  let targets:any[]=[];
  let allocations:{installmentId:string;amountCents:number}[]=[];
  if(schedule?.installments?.length){
   targets=schedule.installments.map((inst:any)=>{
    const invoiceLines=invoice?.lines?.filter((line:any)=>line.sourceInstallmentId===inst.id)||[];
    const targetCents=invoiceLines.length?invoiceLines.reduce((sum:number,line:any)=>sum+Math.round(Number(line.netAmount)*100),0):Math.round(Number(inst.amount)*100);
    return {inst,capacityCents:Math.max(0,targetCents),paidCents:Math.min(targetCents,Math.round(Number(inst.amountPaid)*100))};
   });
   // Reconcile older charge-level payments that predate P515 allocation records.
   let baselineRemaining=Math.max(0,paidCents-targets.reduce((sum:number,t:any)=>sum+t.paidCents,0));
   for(const target of targets){if(!baselineRemaining)break;const room=Math.max(0,target.capacityCents-target.paidCents),take=Math.min(room,baselineRemaining);target.paidCents+=take;baselineRemaining-=take;}
   let remaining=paymentCents;
   for(const target of targets){if(!remaining)break;const room=Math.max(0,target.capacityCents-target.paidCents),take=Math.min(room,remaining);if(take>0){allocations.push({installmentId:target.inst.id,amountCents:take});target.paidCents+=take;remaining-=take;}}
   if(remaining>0)return {kind:'INSTALLMENT_ALLOCATION_ERROR' as const};
  }
  const payment=await tx.studentFeePayment.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:charge.studentId,chargeId:charge.id,...(invoice?{invoiceId:invoice.id}:{}),amount:p.data.amount,currency:charge.currency,method:p.data.method,reference:p.data.reference,paidAt:new Date(`${p.data.paidAt}T00:00:00.000Z`),recordedBy:s.userId}});
  await postFeePayment(tx,{organizationId:s.organizationId,schoolId:s.schoolId,actorUserId:s.userId,paymentId:payment.id,amount:p.data.amount,currency:charge.currency,postingDate:new Date(`${p.data.paidAt}T00:00:00.000Z`)});
  for(const target of targets){
   await tx.feeInstallment.update({where:{id:target.inst.id},data:{amountPaid:target.paidCents/100,status:target.paidCents>=target.capacityCents?'PAID':target.paidCents>0?'PARTIALLY_PAID':'DUE'}});
   const allocation=allocations.find(a=>a.installmentId===target.inst.id);
   if(allocation)await tx.feeInstallmentPaymentAllocation.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,paymentId:payment.id,installmentId:target.inst.id,amount:allocation.amountCents/100}});
  }
  if(schedule?.installments?.length){const allPaid=targets.every(t=>t.paidCents>=t.capacityCents);await tx.feeInstallmentSchedule.update({where:{id:schedule.id},data:{status:allPaid?'PAID':'PARTIALLY_PAID'}});}
  const invoiceDueCents=Math.max(0,payableCents-nextPaidCents);
  if(invoice)await tx.schoolFeeInvoice.update({where:{id:invoice.id},data:{amountDue:invoiceDueCents/100,status:invoiceDueCents===0?'PAID':'PARTIALLY_PAID'}});
  const nextStatus=invoice?invoiceDueCents===0?'PAID':'PARTIALLY_PAID':nextPaidCents===grossCents?'PAID':'PARTIALLY_PAID';
  await tx.studentFeeCharge.update({where:{id:charge.id},data:{amountPaid:nextPaidCents/100,status:nextStatus}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.payment.recorded',resourceType:'StudentFeeCharge',resourceId:charge.id,outcome:'SUCCESS',metadata:{paymentId:payment.id,invoiceId:invoice?.id||null,amount:p.data.amount,reference:p.data.reference,installmentAllocationCount:allocations.length}}});
  return {kind:'RECORDED' as const,payment,invoiceId:invoice?.id||null,allocations};
 });
 if(result.kind==='NOT_FOUND')return res.status(404).json({error:'Fee charge not found'});
 if(result.kind==='DUPLICATE')return res.status(409).json({error:'Payment reference already exists for this charge with different details'});
 if(result.kind==='INVOICE_NOT_PAYABLE')return res.status(409).json({error:'Invoice must be issued before payment can be recorded'});
 if(result.kind==='OVERPAYMENT')return res.status(409).json({error:'Payment exceeds invoice or charge outstanding balance'});
 if(result.kind==='INSTALLMENT_ALLOCATION_ERROR')return res.status(409).json({error:'Payment cannot be allocated across the remaining installment balances'});
 if(result.kind==='IDEMPOTENT')return res.status(200).json({data:result.payment,message:'Matching payment reference and details already recorded; existing payment returned.'});
 return res.status(201).json({data:result.payment,invoiceId:result.invoiceId,installmentAllocations:result.allocations?.map(a=>({installmentId:a.installmentId,amount:a.amountCents/100})),message:'Manual payment reconciliation recorded; no gateway transaction was initiated.'});
}));

// P126 refund lifecycle. Approval is separate from request; settlement requires an external reconciliation reference.
parentRouter.post(base+'/fees/payments/:paymentId/refunds',authenticate,wrap(async(req,res)=>{
  const s=await scope(req,res,'fees.refunds.request');if(!s)return;
  const idempotencyKey=String(req.get('idempotency-key')||'').trim();
  if(idempotencyKey.length<8||idempotencyKey.length>120)return res.status(400).json({error:'An idempotency-key header between 8 and 120 characters is required'});
  const p=z.object({amount:z.number().positive().max(100000000).refine(v=>Math.round(v*100)===v*100,'Amount must have at most two decimal places'),reason:z.string().trim().min(5).max(1000)}).safeParse(req.body);
  if(!p.success)return res.status(400).json({error:'A valid refund amount and reason are required'});
  const result=await withTenantContext(prisma,s,async tx=>{
    await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:refund-idempotency:${idempotencyKey}`);
    await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:payment-refund:${req.params.paymentId}`);
    const existing=await tx.studentFeeRefund.findFirst({where:{schoolId:s.schoolId,idempotencyKey}});
    if(existing&&existing.paymentId!==req.params.paymentId)return {kind:'IDEMPOTENCY_CONFLICT' as const};
    if(existing)return {kind:'IDEMPOTENT' as const,refund:existing};
    const payment=await tx.studentFeePayment.findFirst({where:{id:req.params.paymentId,organizationId:s.organizationId,schoolId:s.schoolId,status:{in:['RECORDED','PARTIALLY_REFUNDED']}}});
    if(!payment)return {kind:'NOT_FOUND' as const};
    const prior=await tx.studentFeeRefund.aggregate({where:{organizationId:s.organizationId,schoolId:s.schoolId,paymentId:payment.id,status:{in:['REQUESTED','APPROVED_PENDING_SETTLEMENT','SETTLED']}},_sum:{amount:true}});
    const reserved=Number(prior._sum.amount||0);
    if(Math.round((reserved+p.data.amount)*100)>Math.round(Number(payment.amount)*100))return {kind:'EXCEEDS_PAYMENT' as const};
    const refund=await tx.studentFeeRefund.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:payment.studentId,chargeId:payment.chargeId,paymentId:payment.id,amount:p.data.amount,currency:payment.currency,reason:p.data.reason,idempotencyKey,requestedBy:s.userId,status:'REQUESTED'}});
    await tx.studentFeeRefundEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,refundId:refund.id,eventType:'REQUESTED',toStatus:'REQUESTED',actorUserId:s.userId,note:p.data.reason}});
    await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.refund.requested',resourceType:'StudentFeeRefund',resourceId:refund.id,outcome:'SUCCESS',metadata:{paymentId:payment.id,amount:p.data.amount}}});
    return {kind:'CREATED' as const,refund};
  });
  if(result.kind==='NOT_FOUND')return res.status(404).json({error:'Recorded payment not found'});
  if(result.kind==='EXCEEDS_PAYMENT')return res.status(409).json({error:'Refund requests exceed the original payment amount'});
  if(result.kind==='IDEMPOTENCY_CONFLICT')return res.status(409).json({error:'Idempotency key was already used for another payment'});
  return res.status(result.kind==='CREATED'?201:200).json({data:result.refund,message:result.kind==='IDEMPOTENT'?'Existing refund request returned.':'Refund requested; no money has been transferred.'});
}));

parentRouter.get(base+'/fees/payments/:paymentId/refunds',authenticate,wrap(async(req,res)=>{
  const s=await scope(req,res,'fees.payments.read');if(!s)return;
  const rows=await withTenantContext(prisma,s,async tx=>{
    const payment=await tx.studentFeePayment.findFirst({where:{id:req.params.paymentId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});
    if(!payment)return null;
    return tx.studentFeeRefund.findMany({where:{paymentId:payment.id,organizationId:s.organizationId,schoolId:s.schoolId},include:{events:{orderBy:{createdAt:'asc'}}},orderBy:{createdAt:'desc'},take:100});
  });
  if(!rows)return res.status(404).json({error:'Payment not found'});
  return res.json({data:rows});
}));

// P143 — School-controlled publication of refund status to the verified parent portal.
// P518 — Refund reconciliation control summary. Totals are grouped by currency and include reserved requests separately from settled refunds.
parentRouter.get(base+"/fees/refunds/reconciliation-summary",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const rows=await withTenantContext(prisma,s,async tx=>tx.studentFeeRefund.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,amount:true,currency:true,status:true,paymentId:true,settlementReference:true,createdAt:true,settledAt:true},orderBy:{createdAt:"desc"},take:5000}));
 const totals:Record<string,{requested:number;approvedPending:number;settled:number;rejected:number;reserved:number;count:number}>={};const paymentReserved=new Map<string,number>();
 for(const r of rows){const c=r.currency||"INR";const t=totals[c]||(totals[c]={requested:0,approvedPending:0,settled:0,rejected:0,reserved:0,count:0});const cents=Math.round(Number(r.amount)*100);t.count++;if(r.status==="REQUESTED")t.requested+=cents;else if(r.status==="APPROVED_PENDING_SETTLEMENT")t.approvedPending+=cents;else if(r.status==="SETTLED")t.settled+=cents;else if(r.status==="REJECTED")t.rejected+=cents;if(["REQUESTED","APPROVED_PENDING_SETTLEMENT","SETTLED"].includes(r.status))paymentReserved.set(r.paymentId,(paymentReserved.get(r.paymentId)||0)+cents);}
 for(const [currency,t] of Object.entries(totals)){t.reserved=t.requested+t.approvedPending;}
 const paymentIds=[...paymentReserved.keys()];const payments=paymentIds.length?await withTenantContext(prisma,s,tx=>tx.studentFeePayment.findMany({where:{id:{in:paymentIds},organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,amount:true,currency:true,reference:true}})):[];
 const overReserved=payments.filter(p=>(paymentReserved.get(p.id)||0)>Math.round(Number(p.amount)*100)).map(p=>({paymentId:p.id,reference:p.reference,currency:p.currency,amount:Number(p.amount).toFixed(2),reserved:((paymentReserved.get(p.id)||0)/100).toFixed(2),excess:(((paymentReserved.get(p.id)||0)-Math.round(Number(p.amount)*100))/100).toFixed(2)}));
 return res.json({data:{asOf:new Date().toISOString(),sampledRefunds:rows.length,capped:rows.length===5000,totals:Object.fromEntries(Object.entries(totals).map(([currency,t])=>[currency,{requested:(t.requested/100).toFixed(2),approvedPending:(t.approvedPending/100).toFixed(2),settled:(t.settled/100).toFixed(2),rejected:(t.rejected/100).toFixed(2),reserved:(t.reserved/100).toFixed(2),count:t.count}])),overReservedPayments:overReserved,overReservedCount:overReserved.length,note:"Requested and approved-pending amounts reserve refund capacity. Settled amounts are reported separately. This summary is a source-level control report, not bank-statement reconciliation."}});
}));

parentRouter.get(base+"/fees/refunds",authenticate,wrap(async(req,res)=>{
  const s=await scope(req,res,"fees.refunds.approve");if(!s)return;
  const rows=await withTenantContext(prisma,s,tx=>tx.studentFeeRefund.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,studentId:true,amount:true,currency:true,reason:true,status:true,createdAt:true,approvedAt:true,settledAt:true,rejectionReason:true,settlementReference:true,parentVisibleAt:true,payment:{select:{reference:true,charge:{select:{title:true}}}}},orderBy:{createdAt:"desc"},take:100}));
  return res.json({data:rows});
}));
parentRouter.post(base+"/fees/refunds/:refundId/parent-visibility",authenticate,wrap(async(req,res)=>{
  const s=await scope(req,res,"fees.refunds.approve");if(!s)return;
  const parsed=z.object({visible:z.boolean()}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:"visible must be a boolean"});
  const result=await withTenantContext(prisma,s,async tx=>{
    const refund=await tx.studentFeeRefund.findFirst({where:{id:req.params.refundId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!refund)return null;
    const now=parsed.data.visible?new Date():null;
    const updated=await tx.studentFeeRefund.update({where:{id:refund.id},data:{parentVisibleAt:now,parentVisibleBy:now?s.userId:null}});
    await tx.studentFeeRefundEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,refundId:refund.id,eventType:now?"PARENT_VISIBILITY_PUBLISHED":"PARENT_VISIBILITY_REVOKED",fromStatus:refund.status,toStatus:refund.status,actorUserId:s.userId,note:now?"Refund status published to verified parent portal":"Refund status hidden from verified parent portal"}});
    await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:now?"student.fee.refund.parent_published":"student.fee.refund.parent_hidden",resourceType:"StudentFeeRefund",resourceId:refund.id,outcome:"SUCCESS",metadata:{status:refund.status}}});
    return updated;
  });
  if(!result)return res.status(404).json({error:"Refund request not found"});
  return res.json({data:result,message:parsed.data.visible?"Refund status is now visible to the linked parent":"Refund status is hidden from the parent portal"});
}));

parentRouter.post(base+'/fees/refunds/:refundId/approve',authenticate,wrap(async(req,res)=>{
  const s=await scope(req,res,'fees.refunds.approve');if(!s)return;
  const p=z.object({note:z.string().trim().min(5).max(1000)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Approval note is required'});
  const result=await withTenantContext(prisma,s,async tx=>{
    await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:refund:${req.params.refundId}`);
    const refund=await tx.studentFeeRefund.findFirst({where:{id:req.params.refundId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!refund)return {kind:'NOT_FOUND' as const};
    if(refund.requestedBy===s.userId)return {kind:'SELF_APPROVAL' as const};
    if(refund.status!=='REQUESTED')return {kind:'CONFLICT' as const};
    const updated=await tx.studentFeeRefund.update({where:{id:refund.id},data:{status:'APPROVED_PENDING_SETTLEMENT',approvedBy:s.userId,approvedAt:new Date()}});
    await tx.studentFeeRefundEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,refundId:refund.id,eventType:'APPROVED',fromStatus:'REQUESTED',toStatus:'APPROVED_PENDING_SETTLEMENT',actorUserId:s.userId,note:p.data.note}});
    await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.refund.approved',resourceType:'StudentFeeRefund',resourceId:refund.id,outcome:'SUCCESS',metadata:{amount:refund.amount.toString()}}});
    return {kind:'UPDATED' as const,refund:updated};
  });
  if(result.kind==='NOT_FOUND')return res.status(404).json({error:'Refund request not found'});
  if(result.kind==='SELF_APPROVAL')return res.status(403).json({error:'Refund requester cannot approve their own request'});
  if(result.kind==='CONFLICT')return res.status(409).json({error:'Only pending refund requests can be approved'});
  return res.json({data:result.refund,message:'Refund approved; settlement is still pending and no money has been transferred.'});
}));

parentRouter.post(base+'/fees/refunds/:refundId/reject',authenticate,wrap(async(req,res)=>{
  const s=await scope(req,res,'fees.refunds.approve');if(!s)return;
  const p=z.object({reason:z.string().trim().min(5).max(1000)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Rejection reason is required'});
  const result=await withTenantContext(prisma,s,async tx=>{
    await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:refund:${req.params.refundId}`);
    const refund=await tx.studentFeeRefund.findFirst({where:{id:req.params.refundId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!refund)return {kind:'NOT_FOUND' as const};
    if(refund.status!=='REQUESTED')return {kind:'CONFLICT' as const};
    const updated=await tx.studentFeeRefund.update({where:{id:refund.id},data:{status:'REJECTED',rejectedBy:s.userId,rejectedAt:new Date(),rejectionReason:p.data.reason}});
    await tx.studentFeeRefundEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,refundId:refund.id,eventType:'REJECTED',fromStatus:'REQUESTED',toStatus:'REJECTED',actorUserId:s.userId,note:p.data.reason}});
    await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.refund.rejected',resourceType:'StudentFeeRefund',resourceId:refund.id,outcome:'SUCCESS'}});
    return {kind:'UPDATED' as const,refund:updated};
  });
  if(result.kind==='NOT_FOUND')return res.status(404).json({error:'Refund request not found'});
  if(result.kind==='CONFLICT')return res.status(409).json({error:'Only pending refund requests can be rejected'});
  return res.json({data:result.refund});
}));


// P149 — Durable refund reconciliation discrepancy notes.
parentRouter.post(base+'/fees/refunds/:refundId/reconciliation-notes',authenticate,wrap(async(req,res)=>{
  const s=await scope(req,res,'accounting.reconcile');if(!s)return;
  const p=z.object({note:z.string().trim().min(10).max(2000),resolutionStatus:z.enum(['OPEN','IN_REVIEW','RESOLVED']).default('OPEN')}).safeParse(req.body);
  if(!p.success)return res.status(400).json({error:'A reconciliation note of at least 10 characters is required'});
  const result=await withTenantContext(prisma,s,async tx=>{
    const refund=await tx.studentFeeRefund.findFirst({where:{id:req.params.refundId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!refund)return null;
    const note=await tx.studentFeeRefundReconciliationNote.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,refundId:refund.id,authorUserId:s.userId,note:p.data.note,resolutionStatus:p.data.resolutionStatus}});
    await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.refund.reconciliation_note.created',resourceType:'StudentFeeRefund',resourceId:refund.id,outcome:'SUCCESS',metadata:{noteId:note.id,resolutionStatus:note.resolutionStatus}}});
    return note;
  });
  if(!result)return res.status(404).json({error:'Refund request not found'});
  return res.status(201).json({data:result});
}));
parentRouter.get(base+'/fees/refunds/:refundId/reconciliation-notes',authenticate,wrap(async(req,res)=>{
  const s=await scope(req,res,'accounting.reconcile');if(!s)return;
  const rows=await withTenantContext(prisma,s,async tx=>{
    const refund=await tx.studentFeeRefund.findFirst({where:{id:req.params.refundId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});
    if(!refund)return null;
    return tx.studentFeeRefundReconciliationNote.findMany({where:{refundId:refund.id,organizationId:s.organizationId,schoolId:s.schoolId},orderBy:{createdAt:'desc'}});
  });
  if(!rows)return res.status(404).json({error:'Refund request not found'});
  return res.json({data:rows});
}));

parentRouter.post(base+'/fees/refunds/:refundId/reconciliation-notes/:noteId/status',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'accounting.reconcile');if(!s)return;
 const p=z.object({resolutionStatus:z.enum(['OPEN','IN_REVIEW','RESOLVED'])}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Valid resolution status required'});
 const result=await withTenantContext(prisma,s,async tx=>{
  const refund=await tx.studentFeeRefund.findFirst({where:{id:req.params.refundId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});if(!refund)return {kind:'NOT_FOUND' as const};
  const note=await tx.studentFeeRefundReconciliationNote.findFirst({where:{id:req.params.noteId,refundId:refund.id,organizationId:s.organizationId,schoolId:s.schoolId}});if(!note)return {kind:'NOTE_NOT_FOUND' as const};
  const updated=await tx.studentFeeRefundReconciliationNote.update({where:{id:note.id},data:{resolutionStatus:p.data.resolutionStatus,resolvedAt:p.data.resolutionStatus==='RESOLVED'?new Date():null}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.refund.reconciliation_note.status_updated',resourceType:'StudentFeeRefundReconciliationNote',resourceId:note.id,outcome:'SUCCESS',metadata:{refundId:refund.id,fromStatus:note.resolutionStatus,toStatus:updated.resolutionStatus}}});return {kind:'OK' as const,note:updated};
 });
 if(result.kind==='NOT_FOUND')return res.status(404).json({error:'Refund request not found'});if(result.kind==='NOTE_NOT_FOUND')return res.status(404).json({error:'Reconciliation note not found'});return res.json({data:result.note});
}));

// P163 — tenant-scoped operational alert history, acknowledgement and retry.
// Platform-wide worker alerts with NULL tenant identifiers are deliberately hidden
// from school-level users; only tenant-attributed events are returned here.
parentRouter.get(base+"/operations/alerts",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const status=z.enum(["ALL","PENDING","RETRY","SENDING","DELIVERED"]).catch("ALL").parse(String(req.query.status||"ALL"));
 const limit=Math.min(100,Math.max(1,Number(req.query.limit)||50));
 const rows=await withTenantContext(prisma,s,tx=>tx.$queryRawUnsafe<Array<any>>(
  `SELECT "id","eventType","severity","status","attempts","nextAttemptAt","lastErrorCode","deliveredAt","createdAt","updatedAt","acknowledgedAt","acknowledgedByUserId" FROM "OperationsAlertOutbox" WHERE "organizationId"=$1 AND "schoolId"=$2 AND ($3='ALL' OR "status"=$3) ORDER BY "createdAt" DESC LIMIT $4`,s.organizationId,s.schoolId,status,limit));
 const counts=await withTenantContext(prisma,s,tx=>tx.$queryRawUnsafe<Array<any>>(
  `SELECT "status",COUNT(*)::int AS count,COUNT(*) FILTER (WHERE "acknowledgedAt" IS NULL)::int AS unacknowledged FROM "OperationsAlertOutbox" WHERE "organizationId"=$1 AND "schoolId"=$2 GROUP BY "status"`,s.organizationId,s.schoolId));
 return res.json({data:{rows,counts,retentionDays:90,asOf:new Date().toISOString()}});
}));
parentRouter.post(base+"/operations/alerts/:alertId/acknowledge",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  const changed=await tx.$executeRawUnsafe(`UPDATE "OperationsAlertOutbox" SET "acknowledgedAt"=NOW(),"acknowledgedByUserId"=$3,"updatedAt"=NOW() WHERE "id"=$1 AND "organizationId"=$2 AND "schoolId"=$4 AND "acknowledgedAt" IS NULL`,req.params.alertId,s.organizationId,s.userId,s.schoolId);
  if(changed)await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"operations.alert.acknowledged",resourceType:"OperationsAlertOutbox",resourceId:req.params.alertId,outcome:"SUCCESS"}});
  return changed;
 });
 if(!result)return res.status(404).json({error:"Unacknowledged tenant alert not found"});
 return res.json({data:{acknowledged:true}});
}));
parentRouter.post(base+"/operations/alerts/:alertId/retry",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  const changed=await tx.$executeRawUnsafe(`UPDATE "OperationsAlertOutbox" SET "status"='RETRY',"nextAttemptAt"=NOW(),"lastErrorCode"=NULL,"updatedAt"=NOW() WHERE "id"=$1 AND "organizationId"=$2 AND "schoolId"=$3 AND "status"='RETRY'`,req.params.alertId,s.organizationId,s.schoolId);
  if(changed)await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"operations.alert.delivery_retry_requested",resourceType:"OperationsAlertOutbox",resourceId:req.params.alertId,outcome:"SUCCESS"}});
  return changed;
 });
 if(!result)return res.status(404).json({error:"Retryable tenant alert not found"});
 return res.status(202).json({data:{queued:true}});
}));

// P163 — tenant-scoped operational alert history, acknowledgement and retry.
// Platform-wide worker alerts with NULL tenant identifiers are deliberately hidden
// from school-level users; only tenant-attributed events are returned here.
parentRouter.get(base+"/operations/alerts",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const status=z.enum(["ALL","PENDING","RETRY","SENDING","DELIVERED"]).catch("ALL").parse(String(req.query.status||"ALL"));
 const limit=Math.min(100,Math.max(1,Number(req.query.limit)||50));
 const rows=await withTenantContext(prisma,s,tx=>tx.$queryRawUnsafe<Array<any>>(
  `SELECT "id","eventType","severity","status","attempts","nextAttemptAt","lastErrorCode","deliveredAt","createdAt","updatedAt","acknowledgedAt","acknowledgedByUserId" FROM "OperationsAlertOutbox" WHERE "organizationId"=$1 AND "schoolId"=$2 AND ($3='ALL' OR "status"=$3) ORDER BY "createdAt" DESC LIMIT $4`,s.organizationId,s.schoolId,status,limit));
 const counts=await withTenantContext(prisma,s,tx=>tx.$queryRawUnsafe<Array<any>>(
  `SELECT "status",COUNT(*)::int AS count,COUNT(*) FILTER (WHERE "acknowledgedAt" IS NULL)::int AS unacknowledged FROM "OperationsAlertOutbox" WHERE "organizationId"=$1 AND "schoolId"=$2 GROUP BY "status"`,s.organizationId,s.schoolId));
 return res.json({data:{rows,counts,retentionDays:90,asOf:new Date().toISOString()}});
}));
parentRouter.post(base+"/operations/alerts/:alertId/acknowledge",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  const changed=await tx.$executeRawUnsafe(`UPDATE "OperationsAlertOutbox" SET "acknowledgedAt"=NOW(),"acknowledgedByUserId"=$3,"updatedAt"=NOW() WHERE "id"=$1 AND "organizationId"=$2 AND "schoolId"=$4 AND "acknowledgedAt" IS NULL`,req.params.alertId,s.organizationId,s.userId,s.schoolId);
  if(changed)await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"operations.alert.acknowledged",resourceType:"OperationsAlertOutbox",resourceId:req.params.alertId,outcome:"SUCCESS"}});
  return changed;
 });
 if(!result)return res.status(404).json({error:"Unacknowledged tenant alert not found"});
 return res.json({data:{acknowledged:true}});
}));
parentRouter.post(base+"/operations/alerts/:alertId/retry",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  const changed=await tx.$executeRawUnsafe(`UPDATE "OperationsAlertOutbox" SET "status"='RETRY',"nextAttemptAt"=NOW(),"lastErrorCode"=NULL,"updatedAt"=NOW() WHERE "id"=$1 AND "organizationId"=$2 AND "schoolId"=$3 AND "status"='RETRY'`,req.params.alertId,s.organizationId,s.schoolId);
  if(changed)await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"operations.alert.delivery_retry_requested",resourceType:"OperationsAlertOutbox",resourceId:req.params.alertId,outcome:"SUCCESS"}});
  return changed;
 });
 if(!result)return res.status(404).json({error:"Retryable tenant alert not found"});
 return res.status(202).json({data:{queued:true}});
}));

// P160 — tenant-scoped refund evidence operations dashboard and authorized scan retry.
parentRouter.get(base+"/fees/refund-evidence/operations",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const status=z.enum(["ALL","PENDING_UPLOAD","QUARANTINED","CLEAN","REJECTED"]).catch("ALL").parse(String(req.query.status||"ALL"));
 const limit=Math.min(100,Math.max(1,Number(req.query.limit)||50));
 const now=new Date(),pendingCutoff=new Date(now.getTime()-24*60*60*1000),scanCutoff=new Date(now.getTime()-10*60*1000);
 const result=await withTenantContext(prisma,s,async tx=>{
  const tenant={organizationId:s.organizationId,schoolId:s.schoolId};
  const [pendingUpload,quarantined,clean,rejected,overdueUploads,staleScans,cleanupFailures,rows,workerHealth]=await Promise.all([
   tx.studentFeeRefundReconciliationEvidence.count({where:{...tenant,securityStatus:"PENDING_UPLOAD"}}),
   tx.studentFeeRefundReconciliationEvidence.count({where:{...tenant,securityStatus:"QUARANTINED"}}),
   tx.studentFeeRefundReconciliationEvidence.count({where:{...tenant,securityStatus:"CLEAN"}}),
   tx.studentFeeRefundReconciliationEvidence.count({where:{...tenant,securityStatus:"REJECTED"}}),
   tx.studentFeeRefundReconciliationEvidence.count({where:{...tenant,securityStatus:"PENDING_UPLOAD",createdAt:{lt:pendingCutoff}}}),
   tx.studentFeeRefundReconciliationEvidence.count({where:{...tenant,securityStatus:"QUARANTINED",OR:[{scanRequestedAt:null},{scanRequestedAt:{lt:scanCutoff}}]}}),
   tx.studentFeeRefundReconciliationEvidence.count({where:{...tenant,cleanupLastErrorAt:{not:null}}}),
   tx.studentFeeRefundReconciliationEvidence.findMany({where:{...tenant,...(status==="ALL"?{}:{securityStatus:status})},orderBy:{createdAt:"desc"},take:limit,select:{id:true,refundId:true,noteId:true,label:true,mimeType:true,securityStatus:true,scanRequestedAt:true,createdAt:true,addedByUserId:true,referenceType:true,cleanupLastErrorAt:true,cleanupAttemptCount:true,cleanupLastErrorCode:true,cleanupNextRetryAt:true,refund:{select:{status:true,amount:true,currency:true}},note:{select:{resolutionStatus:true}}}})
  ,tx.$queryRawUnsafe<Array<{workerName:string,status:string,lastHeartbeatAt:Date,lastSuccessAt:Date|null,lastErrorAt:Date|null,lastErrorCode:string|null,consecutiveFailures:number}>>('SELECT "workerName","status","lastHeartbeatAt","lastSuccessAt","lastErrorAt","lastErrorCode","consecutiveFailures" FROM "BackgroundWorkerHeartbeat" WHERE "workerName"=$1 LIMIT 1','document-scan-worker')
  ]);
  const worker=workerHealth[0]||null;const workerStale=!worker||worker.lastHeartbeatAt<new Date(Date.now()-2*60_000);
  return {summary:{pendingUpload,quarantined,clean,rejected,overdueUploads,staleScans,cleanupFailures,worker:{...worker,stale:workerStale,alert:workerStale||worker?.status==='DEGRADED'||(worker?.consecutiveFailures||0)>=3},asOf:now.toISOString()},rows};
 });
 return res.json({data:result});
}));
parentRouter.post(base+"/fees/refund-evidence/:evidenceId/retry-scan",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const evidence=await withTenantContext(prisma,s,tx=>tx.studentFeeRefundReconciliationEvidence.findFirst({where:{id:req.params.evidenceId,organizationId:s.organizationId,schoolId:s.schoolId,securityStatus:"QUARANTINED"},select:{id:true,refundId:true,noteId:true,scanRequestedAt:true}}));
 if(!evidence)return res.status(404).json({error:"Quarantined refund evidence was not found"});
 if(evidence.scanRequestedAt&&evidence.scanRequestedAt>new Date(Date.now()-60_000))return res.status(409).json({error:"A scan attempt was requested recently; refresh the dashboard before retrying"});
 try{await enqueueDocumentScan("refund-evidence",evidence.id,`manual-${Date.now().toString(36)}`);await withTenantContext(prisma,s,tx=>tx.studentFeeRefundReconciliationEvidence.updateMany({where:{id:evidence.id,securityStatus:"QUARANTINED"},data:{scanRequestedAt:new Date()}}));}catch{return res.status(503).json({error:"Unable to enqueue scan retry; retry later"});}
 await withTenantContext(prisma,s,async tx=>{await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"student.fee.refund.reconciliation_evidence.scan_retry_requested",resourceType:"StudentFeeRefundReconciliationEvidence",resourceId:evidence.id,outcome:"SUCCESS",metadata:{refundId:evidence.refundId,noteId:evidence.noteId}}});});
 return res.status(202).json({data:{evidenceId:evidence.id,queued:true}});
}));

parentRouter.post(base+"/fees/refund-evidence/:evidenceId/retry-cleanup",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const cutoff=new Date(Date.now()-24*60*60*1000);
 const result=await withTenantContext(prisma,s,async tx=>{
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`refund-evidence-expiry:${req.params.evidenceId}`);
  const evidence=await tx.studentFeeRefundReconciliationEvidence.findFirst({where:{id:req.params.evidenceId,organizationId:s.organizationId,schoolId:s.schoolId,securityStatus:"PENDING_UPLOAD",referenceType:"STORAGE_KEY",createdAt:{lt:cutoff}},select:{id:true,referenceValue:true,refundId:true,noteId:true}});
  if(!evidence)return {kind:"NOT_ELIGIBLE" as const};
  try{await deleteObject(evidence.referenceValue);}catch(error){await tx.studentFeeRefundReconciliationEvidence.update({where:{id:evidence.id},data:{cleanupLastErrorAt:new Date(),cleanupLastErrorCode:(error instanceof Error?error.name:"UnknownError").slice(0,80),cleanupAttemptCount:{increment:1},cleanupNextRetryAt:new Date(Date.now()+60_000)}});return {kind:"STORAGE_FAILED" as const};}
  const changed=await tx.studentFeeRefundReconciliationEvidence.updateMany({where:{id:evidence.id,securityStatus:"PENDING_UPLOAD"},data:{securityStatus:"REJECTED",cleanupLastErrorAt:null,cleanupLastErrorCode:null,cleanupNextRetryAt:null}});
  if(changed.count)await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"student.fee.refund.reconciliation_evidence.cleanup_retried",resourceType:"StudentFeeRefundReconciliationEvidence",resourceId:evidence.id,outcome:"SUCCESS",metadata:{refundId:evidence.refundId,noteId:evidence.noteId}}});
  return {kind:changed.count?"CLEANED" as const:"NOT_ELIGIBLE" as const};
 });
 if(result.kind==="NOT_ELIGIBLE")return res.status(409).json({error:"Only abandoned pending uploads older than 24 hours can be cleaned up"});
 if(result.kind==="STORAGE_FAILED")return res.status(503).json({error:"Storage cleanup failed; the failure is recorded and remains retryable"});
 return res.json({data:{cleaned:true,securityStatus:"REJECTED"}});
}));

// P151 — Evidence references linked to a refund reconciliation note. Binary upload is handled by the configured document-storage workflow.
parentRouter.post(base+'/fees/refunds/:refundId/reconciliation-notes/:noteId/evidence',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'accounting.reconcile');if(!s)return;
 const p=z.object({label:z.string().trim().min(2).max(180),referenceType:z.enum(['DOCUMENT_URL','STORAGE_KEY','TRANSACTION_REFERENCE']),referenceValue:z.string().trim().min(3).max(1000),mimeType:z.string().trim().max(120).optional(),checksumSha256:z.string().regex(/^[a-fA-F0-9]{64}$/).optional()}).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:'Valid evidence label, reference type and reference value are required'});
 if(p.data.referenceType==='DOCUMENT_URL'&&!/^https:\/\//i.test(p.data.referenceValue))return res.status(400).json({error:'Evidence document URLs must use HTTPS'});
 const result=await withTenantContext(prisma,s,async tx=>{
  const refund=await tx.studentFeeRefund.findFirst({where:{id:req.params.refundId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});if(!refund)return {kind:'REFUND_NOT_FOUND' as const};
  const note=await tx.studentFeeRefundReconciliationNote.findFirst({where:{id:req.params.noteId,refundId:refund.id,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});if(!note)return {kind:'NOTE_NOT_FOUND' as const};
  const evidence=await tx.studentFeeRefundReconciliationEvidence.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,refundId:refund.id,noteId:note.id,addedByUserId:s.userId,...p.data}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.refund.reconciliation_evidence.added',resourceType:'StudentFeeRefundReconciliationEvidence',resourceId:evidence.id,outcome:'SUCCESS',metadata:{refundId:refund.id,noteId:note.id,referenceType:evidence.referenceType}}});return {kind:'OK' as const,evidence};
 });
 if(result.kind==='REFUND_NOT_FOUND')return res.status(404).json({error:'Refund request not found'});if(result.kind==='NOTE_NOT_FOUND')return res.status(404).json({error:'Reconciliation note not found'});return res.status(201).json({data:result.evidence});
}));
// P152 — secure upload initiation and completion for reconciliation evidence.
parentRouter.post(base+'/fees/refunds/:refundId/reconciliation-notes/:noteId/evidence/upload',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'accounting.reconcile');if(!s)return;
 const p=z.object({label:z.string().trim().min(2).max(180),mimeType:z.enum(['application/pdf','image/jpeg','image/png']),sizeBytes:z.number().int().positive().max(10*1024*1024),idempotencyKey:z.string().trim().min(12).max(128).optional()}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Evidence must be PDF/JPEG/PNG and <=10 MB; a valid label is required'});
 const idempotencyKey=String(req.header('idempotency-key')||p.data.idempotencyKey||'').trim();if(idempotencyKey.length<12||idempotencyKey.length>128)return res.status(400).json({error:'A 12-128 character idempotency key is required'});
 const fingerprint=createHash('sha256').update(`${p.data.label}\n${p.data.mimeType}\n${p.data.sizeBytes}`).digest('hex');
 const result=await withTenantContext(prisma,s,async tx=>{
  await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:${s.userId}:refund-evidence-upload:${idempotencyKey}`);
  const refund=await tx.studentFeeRefund.findFirst({where:{id:req.params.refundId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});if(!refund)return {kind:'REFUND_NOT_FOUND' as const};
  const note=await tx.studentFeeRefundReconciliationNote.findFirst({where:{id:req.params.noteId,refundId:refund.id,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});if(!note)return {kind:'NOTE_NOT_FOUND' as const};
  const existing=await tx.studentFeeRefundReconciliationEvidence.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,addedByUserId:s.userId,idempotencyKey}});
  if(existing){if(existing.requestFingerprint!==fingerprint||existing.refundId!==refund.id||existing.noteId!==note.id)return {kind:'IDEMPOTENCY_CONFLICT' as const};if(existing.securityStatus!=='PENDING_UPLOAD')return {kind:'ALREADY_PROCESSED' as const,evidence:existing};const upload=await createUploadUrl(existing.referenceValue,existing.mimeType||p.data.mimeType,existing.id);return {kind:'OK' as const,evidence:existing,upload,reused:true};}
  const id=createOpaqueToken(24);const key=`quarantine/${s.organizationId}/${s.schoolId}/refund-evidence/${id}`;const upload=await createUploadUrl(key,p.data.mimeType,id);
  const evidence=await tx.studentFeeRefundReconciliationEvidence.create({data:{id,organizationId:s.organizationId,schoolId:s.schoolId,refundId:refund.id,noteId:note.id,addedByUserId:s.userId,label:p.data.label,referenceType:'STORAGE_KEY',referenceValue:key,mimeType:p.data.mimeType,idempotencyKey,requestFingerprint:fingerprint}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.refund.reconciliation_evidence.upload_started',resourceType:'StudentFeeRefundReconciliationEvidence',resourceId:evidence.id,outcome:'SUCCESS',metadata:{sizeBytes:p.data.sizeBytes,mimeType:p.data.mimeType,idempotencyKey}}});return {kind:'OK' as const,evidence,upload,reused:false};
 });
 if(result.kind==='REFUND_NOT_FOUND')return res.status(404).json({error:'Refund request not found'});if(result.kind==='NOTE_NOT_FOUND')return res.status(404).json({error:'Reconciliation note not found'});if(result.kind==='IDEMPOTENCY_CONFLICT')return res.status(409).json({error:'Idempotency key was already used with a different upload request'});if(result.kind==='ALREADY_PROCESSED')return res.status(409).json({error:'This upload has already progressed; refresh evidence status instead of uploading again'});
 return res.status(201).json({data:{evidence:result.evidence,upload:result.upload,reused:result.reused,completionPath:`/api/v1/${s.organizationId}/${s.schoolId}/parents/fees/refunds/${req.params.refundId}/reconciliation-notes/${req.params.noteId}/evidence/${result.evidence.id}/complete`}});
}));
parentRouter.post(base+'/fees/refunds/:refundId/reconciliation-notes/:noteId/evidence/:evidenceId/complete',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'accounting.reconcile');if(!s)return;const evidence=await withTenantContext(prisma,s,tx=>tx.studentFeeRefundReconciliationEvidence.findFirst({where:{id:req.params.evidenceId,refundId:req.params.refundId,noteId:req.params.noteId,organizationId:s.organizationId,schoolId:s.schoolId,addedByUserId:s.userId,referenceType:'STORAGE_KEY'}}));if(!evidence)return res.status(404).json({error:'Evidence upload record not found'});const actual=await verifyUploadedObject(evidence.referenceValue);if(actual.mimeType!==evidence.mimeType||actual.sizeBytes<=0||actual.sizeBytes>10*1024*1024){await deleteObject(evidence.referenceValue);await withTenantContext(prisma,s,tx=>tx.studentFeeRefundReconciliationEvidence.update({where:{id:evidence.id},data:{securityStatus:'REJECTED'}}));return res.status(400).json({error:'Uploaded evidence does not meet validation requirements'});}await withTenantContext(prisma,s,tx=>tx.studentFeeRefundReconciliationEvidence.update({where:{id:evidence.id},data:{securityStatus:'QUARANTINED'}}));try{await enqueueDocumentScan('refund-evidence',evidence.id);}catch{/* worker reconciles quarantined evidence */}return res.status(202).json({data:{evidenceId:evidence.id,verified:true,securityStatus:'QUARANTINED',message:'Evidence remains unavailable until malware scanning approves it.'}});
}));
// P158 — allow the initiating finance user to cancel only an unfinished upload.
parentRouter.delete(base+'/fees/refunds/:refundId/reconciliation-notes/:noteId/evidence/:evidenceId/cancel',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'accounting.reconcile');if(!s)return;
 const evidence=await withTenantContext(prisma,s,tx=>tx.studentFeeRefundReconciliationEvidence.findFirst({where:{id:req.params.evidenceId,refundId:req.params.refundId,noteId:req.params.noteId,organizationId:s.organizationId,schoolId:s.schoolId,addedByUserId:s.userId,referenceType:'STORAGE_KEY',securityStatus:'PENDING_UPLOAD'}}));
 if(!evidence)return res.status(409).json({error:'Upload is no longer cancellable; refresh evidence status'});
 await deleteObject(evidence.referenceValue);
 await withTenantContext(prisma,s,async tx=>{await tx.studentFeeRefundReconciliationEvidence.delete({where:{id:evidence.id}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.refund.reconciliation_evidence.upload_cancelled',resourceType:'StudentFeeRefundReconciliationEvidence',resourceId:evidence.id,outcome:'SUCCESS',metadata:{refundId:evidence.refundId,noteId:evidence.noteId}}});});
 return res.status(204).send();
}));
parentRouter.get(base+'/fees/refunds/:refundId/reconciliation-notes/:noteId/evidence/:evidenceId/download',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'accounting.reconcile');if(!s)return;const evidence=await withTenantContext(prisma,s,tx=>tx.studentFeeRefundReconciliationEvidence.findFirst({where:{id:req.params.evidenceId,refundId:req.params.refundId,noteId:req.params.noteId,organizationId:s.organizationId,schoolId:s.schoolId,securityStatus:'CLEAN',referenceType:'STORAGE_KEY'}}));if(!evidence)return res.status(423).json({error:'Evidence is unavailable until malware scanning approves it'});return res.json({data:{downloadUrl:await createDownloadUrl(evidence.referenceValue.replace(/^quarantine\//,'private/')),expiresInSeconds:60}});}));
parentRouter.get(base+'/fees/refunds/:refundId/reconciliation-notes/:noteId/evidence',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'accounting.reconcile');if(!s)return;
 const rows=await withTenantContext(prisma,s,async tx=>{
  const refund=await tx.studentFeeRefund.findFirst({where:{id:req.params.refundId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});if(!refund)return null;
  const note=await tx.studentFeeRefundReconciliationNote.findFirst({where:{id:req.params.noteId,refundId:refund.id,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});if(!note)return null;
  return tx.studentFeeRefundReconciliationEvidence.findMany({where:{refundId:refund.id,noteId:note.id,organizationId:s.organizationId,schoolId:s.schoolId},orderBy:{createdAt:'desc'}});
 });if(!rows)return res.status(404).json({error:'Refund or reconciliation note not found'});return res.json({data:rows});
}));
parentRouter.post(base+'/fees/refunds/:refundId/settle',authenticate,wrap(async(req,res)=>{
  const s=await scope(req,res,'fees.refunds.settle');if(!s)return;
  const p=z.object({settlementReference:z.string().trim().min(3).max(120),settledAt:z.string().date(),note:z.string().trim().min(5).max(1000)}).safeParse(req.body);
  if(!p.success)return res.status(400).json({error:'External settlement reference, settlement date and note are required'});
  const result=await withTenantContext(prisma,s,async tx=>{
    await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:refund:${req.params.refundId}`);
    const refund=await tx.studentFeeRefund.findFirst({where:{id:req.params.refundId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!refund)return {kind:'NOT_FOUND' as const};
    await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:payment-refund:${refund.paymentId}`);
    await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:fee:${refund.chargeId}`);
    const currentRefund=await tx.studentFeeRefund.findFirst({where:{id:refund.id,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!currentRefund||currentRefund.status!=='APPROVED_PENDING_SETTLEMENT')return {kind:'CONFLICT' as const};
    const duplicate=await tx.studentFeeRefund.findFirst({where:{schoolId:s.schoolId,settlementReference:p.data.settlementReference,id:{not:refund.id}},select:{id:true}});
    if(duplicate)return {kind:'DUPLICATE_REFERENCE' as const};
    const charge=await tx.studentFeeCharge.findFirst({where:{id:refund.chargeId,organizationId:s.organizationId,schoolId:s.schoolId}});
    const payment=await tx.studentFeePayment.findFirst({where:{id:refund.paymentId,organizationId:s.organizationId,schoolId:s.schoolId}});
    if(!charge||!payment)return {kind:'BROKEN_LINK' as const};
    if(Number(charge.amountPaid)+0.0001<Number(refund.amount))return {kind:'BALANCE_CONFLICT' as const};
    const settledAt=new Date(`${p.data.settledAt}T00:00:00.000Z`);const updated=await tx.studentFeeRefund.update({where:{id:currentRefund.id},data:{status:'SETTLED',settledBy:s.userId,settledAt,settlementReference:p.data.settlementReference}});await postFeeRefundSettlement(tx,{organizationId:s.organizationId,schoolId:s.schoolId,actorUserId:s.userId,refundId:currentRefund.id,amount:refund.amount.toString(),currency:refund.currency,postingDate:settledAt});
    const nextPaid=Math.max(0,Number(charge.amountPaid)-Number(refund.amount));
    const nextStatus=nextPaid===0?(charge.dueAt&&charge.dueAt<new Date()?'OVERDUE':'PUBLISHED'):nextPaid+0.0001>=Number(charge.amount)?'PAID':(charge.dueAt&&charge.dueAt<new Date()?'OVERDUE':'PARTIALLY_PAID');
    await tx.studentFeeCharge.update({where:{id:charge.id},data:{amountPaid:nextPaid,status:nextStatus}});
    const settled=await tx.studentFeeRefund.aggregate({where:{paymentId:payment.id,organizationId:s.organizationId,schoolId:s.schoolId,status:'SETTLED'},_sum:{amount:true}});
    const paymentStatus=Number(settled._sum.amount||0)+0.0001>=Number(payment.amount)?'REVERSED':'PARTIALLY_REFUNDED';
    await tx.studentFeePayment.update({where:{id:payment.id},data:{status:paymentStatus}});
    await tx.studentFeeRefundEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,refundId:currentRefund.id,eventType:'SETTLED',fromStatus:'APPROVED_PENDING_SETTLEMENT',toStatus:'SETTLED',actorUserId:s.userId,note:p.data.note,metadata:{settlementReference:p.data.settlementReference}}});
    await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.refund.settled',resourceType:'StudentFeeRefund',resourceId:refund.id,outcome:'SUCCESS',metadata:{paymentId:payment.id,amount:refund.amount.toString(),settlementReference:p.data.settlementReference}}});
    return {kind:'SETTLED' as const,refund:updated};
  });
  if(result.kind==='NOT_FOUND')return res.status(404).json({error:'Refund request not found'});
  if(result.kind==='CONFLICT')return res.status(409).json({error:'Only approved refunds can be settled'});
  if(result.kind==='DUPLICATE_REFERENCE')return res.status(409).json({error:'Settlement reference already exists'});
  if(result.kind==='BROKEN_LINK')return res.status(409).json({error:'Refund payment or charge linkage is invalid'});
  if(result.kind==='BALANCE_CONFLICT')return res.status(409).json({error:'Refund exceeds the currently recorded charge balance'});
  return res.json({data:result.refund,message:'Settlement recorded against the supplied external reference; this API does not transfer funds.'});
}));

parentRouter.post(base+'/children/:studentId/homework',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'academics.manage');if(!s)return;const p=z.object({title:z.string().trim().min(1).max(180),subjectName:z.string().trim().min(1).max(100),description:z.string().trim().min(1).max(4000),dueAt:z.string().datetime().optional(),publish:z.boolean().default(false)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid homework assignment'});const student=await withTenantContext(prisma,s,tx=>tx.student.findFirst({where:{id:req.params.studentId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}}));if(!student)return res.status(404).json({error:'Student not found'});const row=await withTenantContext(prisma,s,tx=>tx.homeworkAssignment.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:student.id,title:p.data.title,subjectName:p.data.subjectName,description:p.data.description,dueAt:p.data.dueAt?new Date(p.data.dueAt):null,status:'DRAFT',approvalStatus:'DRAFT',publishedAt:null,createdBy:s.userId}}));return res.status(201).json({data:row});}));
parentRouter.post(base+'/children/:studentId/report-cards',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'reports.manage');if(!s)return;const p=z.object({academicYearId:z.string().min(1),termLabel:z.string().trim().min(1).max(80),resultSummary:z.record(z.unknown()),teacherRemarks:z.string().max(2000).optional(),principalRemarks:z.string().max(2000).optional(),publish:z.boolean().default(false)}).safeParse(req.body);if(!p.success||!isValidResultSummary(p.data.resultSummary)||p.data.publish)return res.status(400).json({error:'Report cards must be created as drafts and use the schema-backed approval workflow'});const student=await withTenantContext(prisma,s,tx=>tx.student.findFirst({where:{id:req.params.studentId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}}));if(!student)return res.status(404).json({error:'Student not found'});const row=await withTenantContext(prisma,s,tx=>tx.studentReportCard.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:student.id,academicYearId:p.data.academicYearId,termLabel:p.data.termLabel,resultSummary:p.data.resultSummary,teacherRemarks:p.data.teacherRemarks,principalRemarks:p.data.principalRemarks,status:'DRAFT',approvalStatus:'DRAFT',publishedAt:null,createdBy:s.userId}}));return res.status(201).json({data:row});}));
parentRouter.post(base+'/children/:studentId/notifications',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'parent.notifications.manage');if(!s)return;const p=z.object({category:z.string().trim().min(1).max(40),title:z.string().trim().min(1).max(180),body:z.string().trim().min(1).max(2000)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid parent notification'});const result=await withTenantContext(prisma,s,async tx=>{const student=await tx.student.findFirst({where:{id:req.params.studentId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});if(!student)return null;const links=await tx.studentGuardian.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:student.id,canReceiveCommunications:true},select:{guardianId:true}});const guardianIds=links.map(x=>x.guardianId);if(!guardianIds.length)return {count:0};const accepted=await tx.parentInvitation.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,guardianId:{in:guardianIds},status:'ACCEPTED',consentWithdrawnAt:null,consentAcceptedAt:{not:null},acceptedByUserId:{not:null}},select:{acceptedByUserId:true,guardianId:true}});const activeGuardians=await tx.guardian.findMany({where:{id:{in:accepted.map(x=>x.guardianId)},organizationId:s.organizationId,schoolId:s.schoolId,isActive:true,emailVerifiedAt:{not:null}},select:{id:true,userId:true}});const recipients=[...new Set(accepted.filter(x=>activeGuardians.some(g=>g.id===x.guardianId&&g.userId===x.acceptedByUserId)).map(x=>x.acceptedByUserId!).filter(Boolean))];if(!recipients.length)return {count:0};await tx.parentNotification.createMany({data:recipients.map(recipientUserId=>({organizationId:s.organizationId,schoolId:s.schoolId,recipientUserId,studentId:student.id,category:p.data.category,title:p.data.title,body:p.data.body,createdBy:s.userId}))});return {count:recipients.length};});if(!result)return res.status(404).json({error:'Student not found'});await withTenantContext(prisma,s,tx=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'parent.notification.published',resourceType:'Student',resourceId:req.params.studentId,outcome:'SUCCESS',metadata:{recipientCount:result.count,category:p.data.category}}}));return res.status(201).json({data:result});}));

// P127 — school-scoped accounting read and period-control APIs.
parentRouter.post(base+"/accounting/initialize",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.post");if(!s)return;
 const result=await withTenantContext(prisma,s,tx=>ensureSchoolAccountingSetup(tx,{organizationId:s.organizationId,schoolId:s.schoolId}));
 return res.status(201).json({data:{period:result.period,chartInitialized:true}});
}));
parentRouter.get(base+"/accounting/accounts",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.read");if(!s)return;
 const rows=await withTenantContext(prisma,s,tx=>tx.accountingAccount.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,isActive:true},orderBy:{accountCode:"asc"},select:{id:true,accountCode:true,name:true,accountType:true,normalBalance:true,isSystem:true}}));
 return res.json({data:rows});
}));
parentRouter.get(base+"/accounting/journals",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.read");if(!s)return;
 const takeRaw=Number(req.query.limit??50);if(!Number.isInteger(takeRaw)||takeRaw<1||takeRaw>100)return res.status(400).json({error:"Limit must be between 1 and 100"});
 const rows=await withTenantContext(prisma,s,tx=>tx.accountingJournalEntry.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,...(typeof req.query.periodId==="string"?{periodId:req.query.periodId}:{}),...(typeof req.query.sourceType==="string"?{sourceType:req.query.sourceType}:{})},include:{lines:{include:{account:{select:{accountCode:true,name:true,accountType:true}}}},period:{select:{periodKey:true,status:true}}},orderBy:[{postingDate:"desc"},{createdAt:"desc"}],take:takeRaw}));
 return res.json({data:rows});
}));
parentRouter.get(base+"/accounting/periods",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.read");if(!s)return;
 const rows=await withTenantContext(prisma,s,tx=>tx.accountingPeriod.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},orderBy:{startsOn:"desc"},take:36}));return res.json({data:rows});
}));
parentRouter.get(base+"/accounting/trial-balance",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.read");if(!s)return;
 const range=accountingDateRange(req,res);if(!range)return;
 const entryWhere={organizationId:s.organizationId,schoolId:s.schoolId,...(typeof req.query.periodId==="string"?{periodId:req.query.periodId}:{}),postingDate:{gte:range.start,lte:range.end}};
 const grouped=await withTenantContext(prisma,s,tx=>tx.accountingJournalLine.groupBy({by:["accountId"],where:{organizationId:s.organizationId,schoolId:s.schoolId,entry:entryWhere},_sum:{debit:true,credit:true}}));
 const accounts=await withTenantContext(prisma,s,tx=>tx.accountingAccount.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,isActive:true},orderBy:{accountCode:"asc"},select:{id:true,accountCode:true,name:true,accountType:true,normalBalance:true}}));
 const totals=new Map(grouped.map((row:any)=>[row.accountId,{debit:Number(row._sum.debit||0),credit:Number(row._sum.credit||0)}]));
 const rows=accounts.map((account:any)=>{const total=totals.get(account.id)||{debit:0,credit:0};return {...account,totalDebits:total.debit.toFixed(2),totalCredits:total.credit.toFixed(2),netBalance:(total.debit-total.credit).toFixed(2)}});
 const debit=rows.reduce((sum:any,row:any)=>sum+Number(row.totalDebits),0);const credit=rows.reduce((sum:any,row:any)=>sum+Number(row.totalCredits),0);
 return res.json({data:{accounts:rows,totalDebits:debit.toFixed(2),totalCredits:credit.toFixed(2),isBalanced:Math.abs(debit-credit)<0.005,currency:"INR",from:range.from,to:range.to,periodId:typeof req.query.periodId==="string"?req.query.periodId:null}});
}));
// P128 — account-wise ledger, fee reconciliation, daily cash activity and journal reversal.
function accountingDateRange(req:any,res:any){
 const from=typeof req.query.from==="string"?req.query.from:undefined;
 const to=typeof req.query.to==="string"?req.query.to:undefined;
 const valid=(value:string|undefined)=>{if(!value)return true;if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const parsed=new Date(`${value}T00:00:00.000Z`);return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;};
 if(!valid(from)||!valid(to)){res.status(400).json({error:"Dates must use YYYY-MM-DD"});return null;}
 const start=from?new Date(`${from}T00:00:00.000Z`):new Date(Date.UTC(new Date().getUTCFullYear(),0,1));
 const end=to?new Date(`${to}T23:59:59.999Z`):new Date();
 if(start>end){res.status(400).json({error:"Start date must not be after end date"});return null;}
 return {start,end,from:from||start.toISOString().slice(0,10),to:to||end.toISOString().slice(0,10)};
}
parentRouter.get(base+"/accounting/general-ledger",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.read");if(!s)return;
 const range=accountingDateRange(req,res);if(!range)return;
 const accountId=typeof req.query.accountId==="string"?req.query.accountId:undefined;
 const limit=Number(req.query.limit??100);if(!Number.isInteger(limit)||limit<1||limit>250)return res.status(400).json({error:"Limit must be between 1 and 250"});
 const result=await withTenantContext(prisma,s,async tx=>{
  if(accountId){const account=await tx.accountingAccount.findFirst({where:{id:accountId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});if(!account)return {notFound:true as const};}
  const baseWhere={organizationId:s.organizationId,schoolId:s.schoolId,...(accountId?{accountId}:{})};
  const [opening,lines]=await Promise.all([
   tx.accountingJournalLine.groupBy({by:["accountId"],where:{...baseWhere,entry:{organizationId:s.organizationId,schoolId:s.schoolId,postingDate:{lt:range.start}}},_sum:{debit:true,credit:true}}),
   tx.accountingJournalLine.findMany({where:{...baseWhere,entry:{organizationId:s.organizationId,schoolId:s.schoolId,postingDate:{gte:range.start,lte:range.end}}},include:{account:{select:{accountCode:true,name:true,accountType:true}},entry:{select:{id:true,entryNumber:true,postingDate:true,sourceType:true,sourceId:true,description:true,currency:true,status:true}}},orderBy:[{entry:{postingDate:"asc"}},{entry:{createdAt:"asc"}},{lineNumber:"asc"}],take:limit+1})
  ]);
  const visible=lines.slice(0,limit);const runningByAccount=new Map<string,number>(opening.map((row:any)=>[row.accountId,Number(row._sum.debit||0)-Number(row._sum.credit||0)]));
  const openingBalances=Object.fromEntries(opening.map((row:any)=>[row.accountId,(Number(row._sum.debit||0)-Number(row._sum.credit||0)).toFixed(2)]));
  const rows=visible.map((line:any)=>{const running=(runningByAccount.get(line.accountId)||0)+Number(line.debit)-Number(line.credit);runningByAccount.set(line.accountId,running);return {...line,debit:Number(line.debit).toFixed(2),credit:Number(line.credit).toFixed(2),runningBalance:accountId?running.toFixed(2):null}});
  return {rows,openingBalances,hasMore:lines.length>limit};
 });
 if((result as any).notFound)return res.status(404).json({error:"Accounting account not found"});
 return res.json({data:{...result,from:range.from,to:range.to,accountId:accountId||null}});
}));
// P521 — authoritative tenant-scoped finance aggregation (not bounded client rows).
parentRouter.get(base+"/accounting/finance-summary",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  const [chargeGroups,invoiceGroups,paymentGroups,refundGroups,policy,configuration]=await Promise.all([
   tx.$queryRaw<any[]>`SELECT c."currency", COUNT(c."id")::int AS "chargeCount", COALESCE(SUM(c."amount"),0)::numeric AS "billed", COALESCE(SUM(c."amountPaid"),0)::numeric AS "paid", COALESCE(SUM(COALESCE(con."approvedConcession",0)),0)::numeric AS "concessions" FROM "StudentFeeCharge" c LEFT JOIN (SELECT "organizationId","schoolId","chargeId",SUM("calculatedAmount") AS "approvedConcession" FROM "FeeConcession" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} AND "status"='APPROVED' GROUP BY "organizationId","schoolId","chargeId") con ON con."organizationId"=c."organizationId" AND con."schoolId"=c."schoolId" AND con."chargeId"=c."id" WHERE c."organizationId"=${s.organizationId} AND c."schoolId"=${s.schoolId} AND c."status" IN ('PUBLISHED','PARTIALLY_PAID','OVERDUE') GROUP BY c."currency" ORDER BY c."currency"`,
   tx.schoolFeeInvoice.groupBy({by:["currency","status"],where:{organizationId:s.organizationId,schoolId:s.schoolId,status:{notIn:["VOID","DRAFT"]}},_count:{_all:true},_sum:{total:true}}),
   tx.studentFeePayment.groupBy({by:["currency","status"],where:{organizationId:s.organizationId,schoolId:s.schoolId,status:{not:"REVERSED"}},_count:{_all:true},_sum:{amount:true}}),
   tx.studentFeeRefund.groupBy({by:["currency","status"],where:{organizationId:s.organizationId,schoolId:s.schoolId},_count:{_all:true},_sum:{amount:true}}),
   tx.feeLateFeePolicy.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId}}),
   tx.$queryRaw<any[]>`SELECT "configuration" FROM "SchoolFinanceConfiguration" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} LIMIT 1`
  ]);
  const byCurrency:Record<string,any>={};const ensure=(currency:string)=>byCurrency[currency]||(byCurrency[currency]={currency,chargeCount:0,billedCents:0,paidCents:0,approvedConcessionCents:0,invoiceCount:0,invoiceTotalCents:0,paymentCount:0,paymentCents:0,refundRequestedCents:0,refundApprovedPendingCents:0,refundSettledCents:0,refundRejectedCents:0,refundOtherCents:0,refundCount:0,outstandingCents:0,netCashCents:0});
  const cents=(v:any)=>Math.round(Number(v||0)*100);
  for(const g of chargeGroups){const m=ensure(String(g.currency||"INR"));m.chargeCount=Number(g.chargeCount||0);m.billedCents=cents(g.billed);m.paidCents=cents(g.paid);m.approvedConcessionCents=cents(g.concessions);m.outstandingCents=Math.max(0,m.billedCents-m.approvedConcessionCents-m.paidCents);}
  for(const g of invoiceGroups){const m=ensure(g.currency);m.invoiceCount+=g._count._all;m.invoiceTotalCents+=cents(g._sum.total);}
  for(const g of paymentGroups){const m=ensure(g.currency);m.paymentCount+=g._count._all;m.paymentCents+=cents(g._sum.amount);}
  for(const g of refundGroups){const m=ensure(g.currency);const amount=cents(g._sum.amount);m.refundCount+=g._count._all;switch(String(g.status)){case "REQUESTED":m.refundRequestedCents+=amount;break;case "APPROVED_PENDING_SETTLEMENT":m.refundApprovedPendingCents+=amount;break;case "SETTLED":m.refundSettledCents+=amount;break;case "REJECTED":m.refundRejectedCents+=amount;break;default:m.refundOtherCents+=amount;}}
  for(const m of Object.values(byCurrency) as any[])m.netCashCents=m.paymentCents-m.refundSettledCents;
  const cfg=configuration[0]?.configuration||{};const methods=Array.isArray(cfg.paymentMethods)?cfg.paymentMethods.filter((m:any)=>m?.enabled===true&&typeof m.code==="string").map((m:any)=>String(m.code).toUpperCase()):[];
  return {currencies:Object.keys(byCurrency).sort(),totals:Object.values(byCurrency).sort((a:any,b:any)=>a.currency.localeCompare(b.currency)),configurationReadiness:{paymentMethodsConfigured:methods.length>0,enabledPaymentMethodCount:methods.length,receiptPrefixConfigured:typeof cfg.feeReceiptPrefix==="string"&&cfg.feeReceiptPrefix.trim().length>0,lateFeePolicyEnabled:!!policy?.enabled,lateFeePreviewOnly:true},sourceScope:"tenant-school",aggregation:"server-side-grouped",note:"Amounts use integer minor units. Outstanding is based on published charge gross less approved concessions and charge-recorded payments; this endpoint is an operational summary and does not claim bank-statement reconciliation."};
 });
 return res.json({data:result});
}));

// P522 — currency-level fee operational-to-ledger reconciliation with bounded exception output.
parentRouter.get(base+"/accounting/finance-reconciliation-detail",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const datePattern=/^\d{4}-\d{2}-\d{2}$/;const validDate=(value:string)=>{if(!datePattern.test(value))return false;const d=new Date(`${value}T00:00:00.000Z`);return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===value;};const startDate=typeof req.query.startDate==="string"?req.query.startDate:"";const endDate=typeof req.query.endDate==="string"?req.query.endDate:"";
 if((startDate&&!validDate(startDate))||(endDate&&!validDate(endDate))||(startDate&&endDate&&startDate>endDate))return res.status(400).json({error:"Invalid date range. Use YYYY-MM-DD and ensure startDate is not after endDate."});
 const startBound=startDate?new Date(`${startDate}T00:00:00.000Z`):undefined;const endBound=endDate?new Date(`${endDate}T23:59:59.999Z`):undefined;
 const result=await withTenantContext(prisma,s,async tx=>{
  const paymentDateWhere:any={};if(startBound)paymentDateWhere.gte=startBound;if(endBound)paymentDateWhere.lte=endBound;
  const refundDateWhere:any={};if(startBound)refundDateWhere.gte=startBound;if(endBound)refundDateWhere.lte=endBound;
  const [paymentSources,refundSources,journalRows,paymentDetails,refundDetails,journalDetails,paymentLifecycleGroups,refundLifecycleGroups]=await Promise.all([
   tx.studentFeePayment.groupBy({by:["currency"],where:{organizationId:s.organizationId,schoolId:s.schoolId,status:{not:"REVERSED"},...(startBound||endBound?{paidAt:paymentDateWhere}:{})},_sum:{amount:true},_count:{_all:true}}),
   tx.studentFeeRefund.groupBy({by:["currency"],where:{organizationId:s.organizationId,schoolId,status:"SETTLED",...(startBound||endBound?{settledAt:refundDateWhere}:{})},_sum:{amount:true},_count:{_all:true}}),
   tx.$queryRaw<any[]>` SELECT e."currency",e."sourceType",a."accountCode",COUNT(DISTINCT e."id")::int AS "entryCount",COALESCE(SUM(l."debit"),0)::numeric AS "debit",COALESCE(SUM(l."credit"),0)::numeric AS "credit" FROM "AccountingJournalEntry" e LEFT JOIN "AccountingJournalLine" l ON l."entryId"=e."id" AND l."organizationId"=e."organizationId" AND l."schoolId"=e."schoolId" LEFT JOIN "AccountingAccount" a ON a."id"=l."accountId" AND a."organizationId"=e."organizationId" AND a."schoolId"=e."schoolId" WHERE e."organizationId"=${s.organizationId} AND e."schoolId"=${s.schoolId} AND e."status"='POSTED' AND e."sourceType" IN ('FEE_PAYMENT','FEE_REFUND') ${startDate?Prisma.sql`AND e."postingDate">=${startDate}::date`:Prisma.empty} ${endDate?Prisma.sql`AND e."postingDate"<=${endDate}::date`:Prisma.empty} GROUP BY e."currency",e."sourceType",a."accountCode" ORDER BY e."currency",e."sourceType",a."accountCode"`,
   tx.studentFeePayment.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,status:{not:"REVERSED"},...(startBound||endBound?{paidAt:paymentDateWhere}:{})},select:{id:true,studentId:true,chargeId:true,amount:true,currency:true,method:true,reference:true,paidAt:true,status:true},orderBy:{paidAt:"desc"},take:100}),
   tx.studentFeeRefund.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,status:"SETTLED",...(startBound||endBound?{settledAt:refundDateWhere}:{})},select:{id:true,studentId:true,chargeId:true,paymentId:true,amount:true,currency:true,status:true,settledAt:true,settlementReference:true},orderBy:{settledAt:"desc"},take:100}),
   tx.$queryRaw<any[]>`SELECT e."id",e."entryNumber",e."sourceType",e."sourceId",e."postingDate",e."currency",e."description",a."accountCode",a."name" AS "accountName",l."debit",l."credit" FROM "AccountingJournalEntry" e JOIN "AccountingJournalLine" l ON l."entryId"=e."id" AND l."organizationId"=e."organizationId" AND l."schoolId"=e."schoolId" JOIN "AccountingAccount" a ON a."id"=l."accountId" AND a."organizationId"=e."organizationId" AND a."schoolId"=e."schoolId" WHERE e."organizationId"=${s.organizationId} AND e."schoolId"=${s.schoolId} AND e."status"='POSTED' AND e."sourceType" IN ('FEE_PAYMENT','FEE_REFUND') ${startDate?Prisma.sql`AND e."postingDate">=${startDate}::date`:Prisma.empty} ${endDate?Prisma.sql`AND e."postingDate"<=${endDate}::date`:Prisma.empty} ORDER BY e."postingDate" DESC,e."entryNumber" DESC LIMIT 200`,
   tx.studentFeePayment.groupBy({by:["status","currency"],where:{organizationId:s.organizationId,schoolId:s.schoolId,...(startBound||endBound?{paidAt:paymentDateWhere}:{})},_sum:{amount:true},_count:{_all:true}}),
   tx.studentFeeRefund.groupBy({by:["status","currency"],where:{organizationId:s.organizationId,schoolId:s.schoolId},_sum:{amount:true},_count:{_all:true}})
  ]);
  const currencies=new Set<string>();const buckets:Record<string,any>={};const ensure=(currency:string)=>buckets[currency]||(buckets[currency]={currency,recordedPaymentsCents:0,settledRefundsCents:0,paymentCount:0,refundCount:0,paymentJournalDebitsCents:0,paymentJournalCreditsCents:0,refundJournalDebitsCents:0,refundJournalCreditsCents:0,paymentJournalEntryCount:0,refundJournalEntryCount:0,paymentVarianceCents:0,refundVarianceCents:0,exceptions:[]});
  const cents=(v:any)=>Math.round(Number(v||0)*100);
  for(const row of paymentSources){const m=ensure(String(row.currency||"INR"));currencies.add(m.currency);m.recordedPaymentsCents=cents(row._sum.amount);m.paymentCount=Number(row._count._all||0);}
  for(const row of refundSources){const m=ensure(String(row.currency||"INR"));currencies.add(m.currency);m.settledRefundsCents=cents(row._sum.amount);m.refundCount=Number(row._count._all||0);}
  for(const row of journalRows){const m=ensure(String(row.currency||"INR"));currencies.add(m.currency);if(String(row.accountCode)!=="1110")continue;const sourceType=String(row.sourceType);if(sourceType==="FEE_PAYMENT"){m.paymentJournalDebitsCents+=cents(row.debit);m.paymentJournalCreditsCents+=cents(row.credit);m.paymentJournalEntryCount+=Number(row.entryCount||0);}else if(sourceType==="FEE_REFUND"){m.refundJournalDebitsCents+=cents(row.debit);m.refundJournalCreditsCents+=cents(row.credit);m.refundJournalEntryCount+=Number(row.entryCount||0);}}
  for(const currency of currencies){const m=buckets[currency];m.paymentVarianceCents=m.recordedPaymentsCents-(m.paymentJournalDebitsCents-m.paymentJournalCreditsCents);m.refundVarianceCents=m.settledRefundsCents-(m.refundJournalCreditsCents-m.refundJournalDebitsCents);if(m.paymentVarianceCents!==0)m.exceptions.push({type:"PAYMENT_SOURCE_LEDGER_VARIANCE",varianceCents:m.paymentVarianceCents});if(m.refundVarianceCents!==0)m.exceptions.push({type:"REFUND_SOURCE_LEDGER_VARIANCE",varianceCents:m.refundVarianceCents});m.matches=m.exceptions.length===0;}
  const filteredCurrencies=new Set(Object.keys(buckets));const filteredPayments=paymentDetails.filter((r:any)=>filteredCurrencies.has(r.currency));const filteredRefunds=refundDetails.filter((r:any)=>filteredCurrencies.has(r.currency));
  const lifecycle={payments:paymentLifecycleGroups.map((g:any)=>({currency:g.currency,status:g.status,count:Number(g._count._all||0),amountCents:cents(g._sum.amount)})),refunds:refundLifecycleGroups.map((g:any)=>({currency:g.currency,status:g.status,count:Number(g._count._all||0),amountCents:cents(g._sum.amount)}))};
  return {currencies:[...currencies].sort(),rows:Object.values(buckets).sort((a:any,b:any)=>a.currency.localeCompare(b.currency)),exceptionCount:Object.values(buckets).reduce((n:number,m:any)=>n+m.exceptions.length,0),sourceScope:"tenant-school",dateScope:{startDate:startDate||null,endDate:endDate||null,sourcePaymentDate:"paidAt",sourceRefundDate:"settledAt",journalDate:"postingDate"},lifecycle,details:{payments:filteredPayments,refunds:filteredRefunds,journals:journalDetails},note:"Compares recorded payments and settled refunds with posted source journals by currency. Date windows use payment paidAt, refund settledAt and journal postingDate; differences in date semantics can cause timing variances. Detail lists are capped at 100 source payments, 100 refunds and 200 journal lines. This is not bank-statement reconciliation; refunds are compared separately and no journals are posted or modified."};
 });
 return res.json({data:result});
}));

parentRouter.get(base+"/accounting/fee-reconciliation",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  const rows=await tx.studentFeeCharge.groupBy({by:["studentId","currency"],where:{organizationId:s.organizationId,schoolId:s.schoolId,publishedAt:{not:null},status:{not:"DRAFT"}},_sum:{amount:true,amountPaid:true},_count:{_all:true}});
  return rows.map((row:any)=>({studentId:row.studentId,currency:row.currency,chargeCount:row._count._all,totalCharged:Number(row._sum.amount||0).toFixed(2),totalPaid:Number(row._sum.amountPaid||0).toFixed(2),outstanding:Math.max(0,Number(row._sum.amount||0)-Number(row._sum.amountPaid||0)).toFixed(2)})).sort((a:any,b:any)=>Number(b.outstanding)-Number(a.outstanding));
 });
 return res.json({data:result});
}));
parentRouter.get(base+"/accounting/daily-summary",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const range=accountingDateRange(req,res);if(!range)return;
 const spanDays=Math.ceil((range.end.getTime()-range.start.getTime())/86400000);if(spanDays>366)return res.status(400).json({error:"Date range cannot exceed 366 days"});
 const result=await withTenantContext(prisma,s,async tx=>{
  const [payments,refunds]=await Promise.all([
   tx.studentFeePayment.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,paidAt:{gte:range.start,lte:range.end},status:{in:["RECORDED","PARTIALLY_REFUNDED","REVERSED"]}},select:{amount:true,currency:true,paidAt:true,method:true},take:10001}),
   tx.studentFeeRefund.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,status:"SETTLED",settledAt:{gte:range.start,lte:range.end}},select:{amount:true,currency:true,settledAt:true},take:10001})
  ]);
  const daily=new Map<string,any>();const get=(date:Date,currency:string)=>{const key=`${date.toISOString().slice(0,10)}:${currency}`;if(!daily.has(key))daily.set(key,{date:date.toISOString().slice(0,10),currency,collections:0,refunds:0,paymentCount:0,refundCount:0});return daily.get(key);};
  for(const p of payments){const row=get(p.paidAt,p.currency);row.collections+=Number(p.amount);row.paymentCount++;}
  for(const r of refunds){if(!r.settledAt)continue;const row=get(r.settledAt,r.currency);row.refunds+=Number(r.amount);row.refundCount++;}
  const rows=[...daily.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.currency.localeCompare(b.currency)).map(row=>({...row,collections:row.collections.toFixed(2),refunds:row.refunds.toFixed(2),netCollections:(row.collections-row.refunds).toFixed(2)}));
  return {rows,truncated:payments.length>10000||refunds.length>10000};
 });
 return res.json({data:{...result,from:range.from,to:range.to}});
}));
parentRouter.get(base+"/accounting/clearing-reconciliation",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  const account=await tx.accountingAccount.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,accountCode:"1110"},select:{id:true,accountCode:true,name:true}});
  if(!account)return {configured:false};
  const [ledger,payments,refunds]=await Promise.all([
   tx.accountingJournalLine.aggregate({where:{organizationId:s.organizationId,schoolId:s.schoolId,accountId:account.id},_sum:{debit:true,credit:true}}),
   tx.studentFeePayment.aggregate({where:{organizationId:s.organizationId,schoolId:s.schoolId},_sum:{amount:true}}),
   tx.studentFeeRefund.aggregate({where:{organizationId:s.organizationId,schoolId:s.schoolId,status:"SETTLED"},_sum:{amount:true}})
  ]);
  const ledgerBalance=Number(ledger._sum.debit||0)-Number(ledger._sum.credit||0);
  const sourceBalance=Number(payments._sum.amount||0)-Number(refunds._sum.amount||0);
  return {configured:true,account,ledgerDebits:Number(ledger._sum.debit||0).toFixed(2),ledgerCredits:Number(ledger._sum.credit||0).toFixed(2),ledgerBalance:ledgerBalance.toFixed(2),recordedPaymentNet:sourceBalance.toFixed(2),difference:(ledgerBalance-sourceBalance).toFixed(2),matches:Math.abs(ledgerBalance-sourceBalance)<0.005,note:"Compares posted cash/bank clearing journals with recorded payments less settled refunds. This is an internal source-to-ledger check, not bank statement reconciliation."};
 });
 return res.json({data:result});
}));
parentRouter.post(base+"/accounting/journals/:journalId/reverse",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reverse");if(!s)return;
 const parsed=z.object({reason:z.string().trim().min(10).max(1000)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:"A reversal reason of at least 10 characters is required"});
 const result=await withTenantContext(prisma,s,async tx=>{
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:journal-reversal:${req.params.journalId}`);
  const original=await tx.accountingJournalEntry.findFirst({where:{id:req.params.journalId,organizationId:s.organizationId,schoolId:s.schoolId},include:{lines:{include:{account:{select:{accountCode:true}}}}}});
  if(!original)return {kind:"NOT_FOUND" as const};
  if(original.sourceType==="REVERSAL"||original.status!=="POSTED")return {kind:"INVALID" as const};
  const existing=await tx.accountingJournalEntry.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,sourceType:"REVERSAL",sourceId:original.id},include:{lines:true}});
  if(existing)return {kind:"EXISTS" as const,entry:existing};
  const entry=await postSchoolJournal(tx,{organizationId:s.organizationId,schoolId:s.schoolId,actorUserId:s.userId,sourceType:"REVERSAL",sourceId:original.id,postingDate:new Date(),currency:original.currency,description:`Reversal of ${original.entryNumber}: ${parsed.data.reason}`,lines:original.lines.map((line:any)=>({accountCode:line.account.accountCode,debit:Number(line.credit)>0?Number(line.credit).toFixed(2):undefined,credit:Number(line.debit)>0?Number(line.debit).toFixed(2):undefined,memo:`Reversal of ${original.entryNumber}`}))});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"accounting.journal.reversed",resourceType:"AccountingJournalEntry",resourceId:original.id,outcome:"SUCCESS",metadata:{reversalEntryId:entry.id,reason:parsed.data.reason}}});
  return {kind:"CREATED" as const,entry};
 });
 if(result.kind==="NOT_FOUND")return res.status(404).json({error:"Journal entry not found"});
 if(result.kind==="INVALID")return res.status(409).json({error:"A reversal journal cannot itself be reversed"});
 if(result.kind==="EXISTS")return res.status(200).json({data:result.entry,alreadyReversed:true});
 return res.status(201).json({data:result.entry});
}));

// P129 — staged student opening balances require independent approval before posting.
parentRouter.post(base+"/accounting/opening-balances",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.post");if(!s)return;
 const parsed=z.object({batchNumber:z.string().trim().min(3).max(40),currency:z.string().trim().length(3).default("INR"),asOfDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),sourceDescription:z.string().trim().min(10).max(500),sourceDocumentReference:z.string().trim().max(240).optional(),declaredTotals:z.object({charges:z.number().nonnegative(),payments:z.number().nonnegative(),refunds:z.number().nonnegative()}).optional(),rows:z.array(z.object({studentId:z.string().min(1),sourceReference:z.string().trim().min(1).max(120),description:z.string().trim().max(300).optional(),debitAmount:z.number().nonnegative().default(0),creditAmount:z.number().nonnegative().default(0)})).min(1).max(5000)}).safeParse(req.body);
 if(!parsed.success)return res.status(400).json({error:"Invalid opening balance batch",details:parsed.error.flatten()});
 const p=parsed.data;const date=new Date(`${p.asOfDate}T00:00:00.000Z`);if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==p.asOfDate)return res.status(400).json({error:"Invalid asOfDate"});
 if(p.rows.some(r=>!Number.isFinite(r.debitAmount)||!Number.isFinite(r.creditAmount)||Math.round(r.debitAmount*100)!==r.debitAmount*100||Math.round(r.creditAmount*100)!==r.creditAmount*100||((r.debitAmount>0)===(r.creditAmount>0))))return res.status(400).json({error:"Each row must contain exactly one positive amount with at most two decimal places"});
 if(new Set(p.rows.map(r=>r.sourceReference)).size!==p.rows.length)return res.status(400).json({error:"Duplicate sourceReference values are not allowed"});
 const result=await withTenantContext(prisma,s,async tx=>{
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:opening-batch:${p.batchNumber}`);
  const exists=await tx.accountingOpeningBalanceBatch.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,batchNumber:p.batchNumber}});if(exists)return {conflict:true};
  const students=await tx.student.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,id:{in:[...new Set(p.rows.map(r=>r.studentId))]}},select:{id:true}});
  if(students.length!==new Set(p.rows.map(r=>r.studentId)).size)return {invalidStudents:true};
  const batch=await tx.accountingOpeningBalanceBatch.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,batchNumber:p.batchNumber,currency:p.currency.toUpperCase(),asOfDate:date,sourceDescription:p.sourceDescription,sourceDocumentReference:p.sourceDocumentReference,declaredChargeTotal:p.declaredTotals?.charges.toFixed(2),declaredPaymentTotal:p.declaredTotals?.payments.toFixed(2),declaredRefundTotal:p.declaredTotals?.refunds.toFixed(2),controlTotalsVerifiedAt:p.declaredTotals?new Date():null,createdBy:s.userId,rows:{create:p.rows.map(r=>({...r,organizationId:s.organizationId,schoolId:s.schoolId,debitAmount:r.debitAmount.toFixed(2),creditAmount:r.creditAmount.toFixed(2)}))}},include:{rows:true}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"accounting.opening_balance.created",resourceType:"AccountingOpeningBalanceBatch",resourceId:batch.id,outcome:"SUCCESS",metadata:{batchNumber:batch.batchNumber,rowCount:batch.rows.length,currency:batch.currency,asOfDate:p.asOfDate}}});return {batch};
 });
 if((result as any).conflict)return res.status(409).json({error:"Batch number already exists"});if((result as any).invalidStudents)return res.status(400).json({error:"One or more students do not belong to this school"});return res.status(201).json({data:(result as any).batch});
}));
parentRouter.get(base+"/accounting/opening-balances",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.read");if(!s)return;
 const rows=await withTenantContext(prisma,s,tx=>tx.accountingOpeningBalanceBatch.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},include:{rows:{include:{student:{select:{id:true,admissionNumber:true,firstName:true,lastName:true}},operationalLink:true,operationalAllocationLinks:{select:{id:true,allocatedAmount:true,operationalPaymentId:true,operationalRefundId:true}}}},},orderBy:{createdAt:"desc"},take:100}));return res.json({data:rows});
}));
parentRouter.post(base+"/accounting/opening-balances/:batchId/approve",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.opening-balance.approve");if(!s)return;
 const p=z.object({approvalNote:z.string().trim().min(10).max(1000)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:"Approval note of at least 10 characters is required"});
 const result=await withTenantContext(prisma,s,async tx=>{await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:opening-approval:${req.params.batchId}`);const batch=await tx.accountingOpeningBalanceBatch.findFirst({where:{id:req.params.batchId,organizationId:s.organizationId,schoolId:s.schoolId},include:{rows:true}});if(!batch)return {kind:"NOT_FOUND" as const};if(batch.status!=="DRAFT"||batch.createdBy===s.userId||!batch.rows.length)return {kind:"CONFLICT" as const};const approved=await tx.accountingOpeningBalanceBatch.update({where:{id:batch.id},data:{status:"APPROVED",approvedBy:s.userId,approvedAt:new Date()}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"accounting.opening_balance.approved",resourceType:"AccountingOpeningBalanceBatch",resourceId:batch.id,outcome:"SUCCESS",metadata:{approvalNote:p.data.approvalNote,rowCount:batch.rows.length}}});return {kind:"OK" as const,batch:approved};});
 if(result.kind==="NOT_FOUND")return res.status(404).json({error:"Batch not found"});if(result.kind==="CONFLICT")return res.status(409).json({error:"Batch must be a non-empty draft approved by a different user"});return res.json({data:result.batch});
}));
parentRouter.post(base+"/accounting/opening-balances/:batchId/post",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.post");if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:opening-post:${req.params.batchId}`);const batch=await tx.accountingOpeningBalanceBatch.findFirst({where:{id:req.params.batchId,organizationId:s.organizationId,schoolId:s.schoolId},include:{rows:true}});if(!batch)return {kind:"NOT_FOUND" as const};if(batch.status==="POSTED"&&batch.journalEntryId){const journal=await tx.accountingJournalEntry.findFirst({where:{id:batch.journalEntryId,organizationId:s.organizationId,schoolId:s.schoolId},include:{lines:true}});return {kind:"EXISTS" as const,journal};}if(batch.status!=="APPROVED"||!batch.approvedBy)return {kind:"CONFLICT" as const};const debit=batch.rows.reduce((n:any,r:any)=>n+Math.round(Number(r.debitAmount)*100),0);const credit=batch.rows.reduce((n:any,r:any)=>n+Math.round(Number(r.creditAmount)*100),0);const net=debit-credit;if(net===0)return {kind:"ZERO" as const};const journal=await postSchoolJournal(tx,{organizationId:s.organizationId,schoolId:s.schoolId,actorUserId:s.userId,sourceType:"OPENING_BALANCE",sourceId:batch.id,postingDate:batch.asOfDate,currency:batch.currency,description:`Approved opening receivables ${batch.batchNumber}`,lines:net>0?[{accountCode:"1100",debit:(net/100).toFixed(2),memo:"Net student opening receivables"},{accountCode:"3000",credit:(net/100).toFixed(2),memo:"Opening balance equity offset"}]:[{accountCode:"3000",debit:(Math.abs(net)/100).toFixed(2),memo:"Opening balance equity offset"},{accountCode:"1100",credit:(Math.abs(net)/100).toFixed(2),memo:"Net student credit balances"}]});const posted=await tx.accountingOpeningBalanceBatch.update({where:{id:batch.id},data:{status:"POSTED",postedBy:s.userId,postedAt:new Date(),journalEntryId:journal.id}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"accounting.opening_balance.posted",resourceType:"AccountingOpeningBalanceBatch",resourceId:batch.id,outcome:"SUCCESS",metadata:{journalEntryId:journal.id,netMinorUnits:net,currency:batch.currency,rowCount:batch.rows.length}}});return {kind:"OK" as const,batch:posted,journal};});
 if(result.kind==="NOT_FOUND")return res.status(404).json({error:"Batch not found"});if(result.kind==="CONFLICT")return res.status(409).json({error:"Only independently approved batches can be posted"});if(result.kind==="ZERO")return res.status(409).json({error:"Net opening balance is zero; no aggregate journal was posted"});return res.status(result.kind==="EXISTS"?200:201).json({data:result});
}));

// P130 — staged historical charge/payment/refund evidence with independent approval.
parentRouter.post(base+"/accounting/historical-imports",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.post");if(!s)return;
 const parsed=z.object({batchNumber:z.string().trim().min(3).max(40),currency:z.string().trim().length(3).default("INR"),sourceDescription:z.string().trim().min(10).max(500),sourceDocumentReference:z.string().trim().max(240).optional(),rows:z.array(z.object({studentId:z.string().min(1),sourceType:z.enum(["CHARGE","PAYMENT","REFUND"]),sourceReference:z.string().trim().min(1).max(120),originalTransactionDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),amount:z.number().positive(),method:z.string().trim().max(40).optional(),externalSettlementReference:z.string().trim().min(1).max(120).optional(),relatedChargeSourceReference:z.string().trim().min(1).max(120).optional(),relatedPaymentSourceReference:z.string().trim().min(1).max(120).optional(),description:z.string().trim().max(300).optional()})).min(1).max(5000)}).safeParse(req.body);
 if(!parsed.success)return res.status(400).json({error:"Invalid historical transaction import",details:parsed.error.flatten()});
 const p=parsed.data;const computedTotals={charges:p.rows.filter(r=>r.sourceType==="CHARGE").reduce((n,r)=>n+Math.round(r.amount*100),0),payments:p.rows.filter(r=>r.sourceType==="PAYMENT").reduce((n,r)=>n+Math.round(r.amount*100),0),refunds:p.rows.filter(r=>r.sourceType==="REFUND").reduce((n,r)=>n+Math.round(r.amount*100),0)};if(p.declaredTotals&&([p.declaredTotals.charges,p.declaredTotals.payments,p.declaredTotals.refunds].some(v=>Math.round(v*100)!==v*100)||Math.round(p.declaredTotals.charges*100)!==computedTotals.charges||Math.round(p.declaredTotals.payments*100)!==computedTotals.payments||Math.round(p.declaredTotals.refunds*100)!==computedTotals.refunds))return res.status(400).json({error:"Declared source control totals do not match imported rows",computedTotals:{charges:(computedTotals.charges/100).toFixed(2),payments:(computedTotals.payments/100).toFixed(2),refunds:(computedTotals.refunds/100).toFixed(2)}});const keys=p.rows.map(r=>`${r.sourceType}:${r.sourceReference}`);if(new Set(keys).size!==keys.length)return res.status(400).json({error:"Duplicate source type/reference in batch"});
 for(const r of p.rows){const d=new Date(`${r.originalTransactionDate}T00:00:00.000Z`);if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==r.originalTransactionDate||Math.round(r.amount*100)!==r.amount*100)return res.status(400).json({error:"Invalid transaction date or amount precision"});if(r.sourceType==="REFUND"&&(!r.externalSettlementReference||!r.relatedPaymentSourceReference))return res.status(400).json({error:"Historical refunds require external settlement evidence and relatedPaymentSourceReference"});if(r.sourceType==="PAYMENT"&&!r.relatedChargeSourceReference)return res.status(400).json({error:"Historical payments require relatedChargeSourceReference for operational allocation"});if(r.sourceType==="REFUND"&&!r.relatedPaymentSourceReference)return res.status(400).json({error:"Historical refunds require relatedPaymentSourceReference"});}
 const result=await withTenantContext(prisma,s,async tx=>{await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:historical-import-batch:${p.batchNumber}`);await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:historical-import-source-references`);const exists=await tx.accountingHistoricalImportBatch.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,batchNumber:p.batchNumber}});if(exists)return {kind:"CONFLICT" as const};const duplicate=await tx.accountingHistoricalImportRow.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,OR:p.rows.map(r=>({sourceType:r.sourceType,sourceReference:r.sourceReference}))},select:{id:true}});if(duplicate)return {kind:"DUPLICATE_SOURCE" as const};const studentIds=[...new Set(p.rows.map(r=>r.studentId))];const students=await tx.student.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,id:{in:studentIds}},select:{id:true}});if(students.length!==studentIds.length)return {kind:"STUDENT" as const};const batch=await tx.accountingHistoricalImportBatch.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,batchNumber:p.batchNumber,currency:p.currency.toUpperCase(),sourceDescription:p.sourceDescription,sourceDocumentReference:p.sourceDocumentReference,createdBy:s.userId,rows:{create:p.rows.map(r=>({...r,organizationId:s.organizationId,schoolId:s.schoolId,originalTransactionDate:new Date(`${r.originalTransactionDate}T00:00:00.000Z`),amount:r.amount.toFixed(2)}))}},include:{rows:true}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"accounting.historical_import.created",resourceType:"AccountingHistoricalImportBatch",resourceId:batch.id,outcome:"SUCCESS",metadata:{batchNumber:p.batchNumber,rowCount:batch.rows.length,currency:batch.currency}}});return {kind:"OK" as const,batch};});
 if(result.kind==="CONFLICT")return res.status(409).json({error:"Historical import batch number already exists"});if(result.kind==="DUPLICATE_SOURCE")return res.status(409).json({error:"One or more source type/reference pairs were already imported for this school"});if(result.kind==="STUDENT")return res.status(400).json({error:"One or more students do not belong to this school"});return res.status(201).json({data:result.batch});
}));
parentRouter.get(base+"/accounting/historical-imports",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"accounting.read");if(!s)return;const rows=await withTenantContext(prisma,s,tx=>tx.accountingHistoricalImportBatch.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},include:{rows:{include:{student:{select:{id:true,admissionNumber:true,firstName:true,lastName:true}},operationalLink:true,operationalAllocationLinks:{select:{id:true,allocatedAmount:true,operationalPaymentId:true,operationalRefundId:true}}}},},orderBy:{createdAt:"desc"},take:100}));return res.json({data:rows});}));
parentRouter.get(base+"/accounting/historical-imports/reconciliation",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"accounting.reconcile");if(!s)return;const rows=await withTenantContext(prisma,s,tx=>tx.accountingHistoricalImportRow.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,batch:{status:{in:["APPROVED","POSTED"]}}},include:{batch:{select:{currency:true,status:true,batchNumber:true}},student:{select:{id:true,admissionNumber:true,firstName:true,lastName:true}}},take:10000,orderBy:[{studentId:"asc"},{originalTransactionDate:"asc"}]}));const grouped=new Map<string,any>();for(const r of rows){const key=`${r.studentId}:${r.batch.currency}`;const g=grouped.get(key)||{student:r.student,currency:r.batch.currency,charges:0,payments:0,refunds:0,chargeCount:0,paymentCount:0,refundCount:0};const amount=Math.round(Number(r.amount)*100);if(r.sourceType==="CHARGE"){g.charges+=amount;g.chargeCount++;}else if(r.sourceType==="PAYMENT"){g.payments+=amount;g.paymentCount++;}else{g.refunds+=amount;g.refundCount++;}grouped.set(key,g);}return res.json({data:[...grouped.values()].map(g=>({...g,charges:(g.charges/100).toFixed(2),payments:(g.payments/100).toFixed(2),refunds:(g.refunds/100).toFixed(2),netReceivable:((g.charges-g.payments+g.refunds)/100).toFixed(2)})),note:"Historical staging reconciliation only; it does not mutate operational fee charges or payment records. Compare with approved opening schedules before migration sign-off."});}));
parentRouter.get(base+"/accounting/historical-imports/control-reconciliation",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"accounting.reconcile");if(!s)return;const result=await withTenantContext(prisma,s,async tx=>{const batches=await tx.accountingHistoricalImportBatch.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,status:{in:["APPROVED","POSTED"]}},include:{rows:true},take:500});const control=batches.map(b=>{const totals={charges:0,payments:0,refunds:0};for(const r of b.rows){const k=r.sourceType==="CHARGE"?"charges":r.sourceType==="PAYMENT"?"payments":"refunds";totals[k]+=Math.round(Number(r.amount)*100);}const declared=b.declaredChargeTotal!==null&&b.declaredPaymentTotal!==null&&b.declaredRefundTotal!==null;const matches=declared&&totals.charges===Math.round(Number(b.declaredChargeTotal)*100)&&totals.payments===Math.round(Number(b.declaredPaymentTotal)*100)&&totals.refunds===Math.round(Number(b.declaredRefundTotal)*100);return {batchId:b.id,batchNumber:b.batchNumber,currency:b.currency,status:b.status,rowCount:b.rows.length,computed:{charges:(totals.charges/100).toFixed(2),payments:(totals.payments/100).toFixed(2),refunds:(totals.refunds/100).toFixed(2)},declared:declared?{charges:String(b.declaredChargeTotal),payments:String(b.declaredPaymentTotal),refunds:String(b.declaredRefundTotal)}:null,controlTotalsProvided:declared,controlTotalsMatch:matches,controlTotalsVerifiedAt:b.controlTotalsVerifiedAt};});return {batches:control,unverifiedBatches:control.filter(b=>!b.controlTotalsProvided).length,mismatchedBatches:control.filter(b=>b.controlTotalsProvided&&!b.controlTotalsMatch).length};});return res.json({data:result,note:"Control totals compare operator-declared totals with imported rows. They are not cryptographic signatures or independent source-document verification."});}));
parentRouter.get(base+"/accounting/historical-imports/opening-overlap",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"accounting.reconcile");if(!s)return;const result=await withTenantContext(prisma,s,async tx=>{const [historical,opening]=await Promise.all([tx.accountingHistoricalImportRow.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,batch:{status:{in:["APPROVED","POSTED"]}}},include:{batch:{select:{currency:true}}},take:20000}),tx.accountingOpeningBalanceRow.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,batch:{status:{in:["APPROVED","POSTED"]}}},include:{batch:{select:{currency:true,asOfDate:true}}},take:20000})]);const groups=new Map<string,any>();for(const r of historical){const k=`${r.studentId}:${r.batch.currency}`;const g=groups.get(k)||{studentId:r.studentId,currency:r.batch.currency,historicalNetMinor:0,openingNetMinor:0};g.historicalNetMinor+=(r.sourceType==="CHARGE"?1:r.sourceType==="PAYMENT"?-1:1)*Math.round(Number(r.amount)*100);groups.set(k,g);}for(const r of opening){const k=`${r.studentId}:${r.batch.currency}`;const g=groups.get(k)||{studentId:r.studentId,currency:r.batch.currency,historicalNetMinor:0,openingNetMinor:0};g.openingNetMinor+=Math.round((Number(r.debitAmount)-Number(r.creditAmount))*100);groups.set(k,g);}const rows=[...groups.values()].map(g=>({...g,historicalNet:(g.historicalNetMinor/100).toFixed(2),openingNet:(g.openingNetMinor/100).toFixed(2),difference:((g.historicalNetMinor-g.openingNetMinor)/100).toFixed(2),possibleOverlap:g.historicalNetMinor!==0&&g.openingNetMinor!==0}));return {rows,possibleOverlapCount:rows.filter(r=>r.possibleOverlap).length,note:"Comparison is a review signal only. It does not prove duplication because opening-balance as-of dates and historical coverage windows may differ; finance sign-off is required."};});return res.json({data:result});}));
parentRouter.get(base+"/accounting/historical-imports/operational-reconciliation",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"accounting.reconcile");if(!s)return;const rows=await withTenantContext(prisma,s,tx=>tx.accountingHistoricalImportRow.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,batch:{status:"POSTED"}},include:{batch:{select:{batchNumber:true,currency:true}},operationalLink:true,operationalAllocationLinks:true},take:10000,orderBy:[{batchId:"asc"},{originalTransactionDate:"asc"}]}));const isLinked=(r:any)=>Boolean(r.operationalLink)||((r.operationalAllocationLinks||[]).length>0&&Math.round((r.operationalAllocationLinks||[]).reduce((n:number,x:any)=>n+Math.round(Number(x.allocatedAmount)*100),0))===Math.round(Number(r.amount)*100));const linked=rows.filter(isLinked);const byType=(type:string)=>({sourceRows:rows.filter(r=>r.sourceType===type).length,linkedRows:linked.filter(r=>r.sourceType===type).length,unlinkedRows:rows.filter(r=>r.sourceType===type&&!isLinked(r)).length});return res.json({data:{totalRows:rows.length,linkedRows:linked.length,unlinkedRows:rows.length-linked.length,charges:byType("CHARGE"),payments:byType("PAYMENT"),refunds:byType("REFUND"),batches:[...new Set(rows.map(r=>r.batch.batchNumber))]},note:"Linkage reconciliation includes one-to-many allocation links. Historical accounting journals were posted before operationalization and are not posted again."});}));
// P133 — explicit cross-batch historical allocations and finance exception queue.
parentRouter.get(base+"/accounting/historical-imports/allocations",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const rows=await withTenantContext(prisma,s,tx=>tx.accountingHistoricalAllocation.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},include:{sourceRow:{include:{batch:{select:{batchNumber:true,currency:true}}}},targetRow:{include:{batch:{select:{batchNumber:true,currency:true}}}}},orderBy:{createdAt:"desc"},take:1000}));
 return res.json({data:rows});
}));

// P141 — searchable operational payment slices and refundable-balance preview for historical refund allocation.
parentRouter.get(base+"/accounting/historical-imports/refund-payment-slices/:targetRowId",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const q=String(req.query.q||"").trim().slice(0,120);
 const result=await withTenantContext(prisma,s,async tx=>{
  const target=await tx.accountingHistoricalImportRow.findFirst({where:{id:req.params.targetRowId,organizationId:s.organizationId,schoolId:s.schoolId},include:{batch:{select:{status:true,currency:true}},student:{select:{id:true,admissionNumber:true,firstName:true,lastName:true}},operationalLink:{select:{operationalPaymentId:true}},operationalAllocationLinks:{where:{operationalPaymentId:{not:null}},select:{operationalPaymentId:true}}}});
  if(!target)return {kind:"NOT_FOUND" as const};
  if(target.sourceType!=="PAYMENT"||target.batch.status!=="POSTED")return {kind:"NOT_REFUNDABLE_TARGET" as const};
  const ids=[...new Set([target.operationalLink?.operationalPaymentId,...target.operationalAllocationLinks.map((x:any)=>x.operationalPaymentId)].filter(Boolean))] as string[];
  if(!ids.length)return {kind:"NOT_OPERATIONALIZED" as const};
  const payments=await tx.studentFeePayment.findMany({where:{id:{in:ids},organizationId:s.organizationId,schoolId:s.schoolId,studentId:target.studentId,currency:target.batch.currency,...(q?{OR:[{id:{contains:q,mode:"insensitive"}},{reference:{contains:q,mode:"insensitive"}},{method:{contains:q,mode:"insensitive"}}]}:{})},select:{id:true,amount:true,currency:true,method:true,reference:true,status:true,paidAt:true,chargeId:true,refunds:{where:{organizationId:s.organizationId,schoolId:s.schoolId,status:{in:["REQUESTED","APPROVED_PENDING_SETTLEMENT","SETTLED"]}},select:{amount:true,status:true}}},orderBy:[{paidAt:"asc"},{id:"asc"}],take:100});
  const reservations=ids.length?await tx.accountingHistoricalAllocation.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,allocationType:"REFUND_TO_PAYMENT",targetOperationalPaymentId:{in:ids}},select:{targetOperationalPaymentId:true,amount:true,operationalLinks:{select:{operationalRefundId:true}}}}):[];
  return {kind:"OK" as const,target:{id:target.id,sourceReference:target.sourceReference,student:target.student},totalSliceCount:ids.length,slices:payments.map((p:any)=>{const paid=Math.round(Number(p.amount)*100);const refunded=p.refunds.reduce((n:number,r:any)=>n+Math.round(Number(r.amount)*100),0);const reserved=reservations.filter((a:any)=>a.targetOperationalPaymentId===p.id&&!(a.operationalLinks||[]).some((l:any)=>l.operationalRefundId)).reduce((n:number,a:any)=>n+Math.round(Number(a.amount)*100),0);const available=Math.max(0,paid-refunded-reserved);return {id:p.id,reference:p.reference,method:p.method,status:p.status,paidAt:p.paidAt,currency:p.currency,amount:(paid/100).toFixed(2),refunded:(refunded/100).toFixed(2),pendingAllocation:(reserved/100).toFixed(2),availableRefundable:(available/100).toFixed(2),refundState:available===0?"FULLY_REFUNDED":refunded+reserved>0?"PARTIALLY_REFUNDED":"AVAILABLE"};})};
 });
 if(result.kind==="NOT_FOUND")return res.status(404).json({error:"Historical payment row not found"});
 if(result.kind==="NOT_REFUNDABLE_TARGET")return res.status(409).json({error:"Select a posted historical PAYMENT row"});
 if(result.kind==="NOT_OPERATIONALIZED")return res.status(409).json({error:"Operationalize the target payment batch before selecting payment slices"});
 return res.json({data:result});
}));

parentRouter.post(base+"/accounting/historical-imports/allocations",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.historical-allocation.manage");if(!s)return;
 const parsed=z.object({sourceRowId:z.string().min(1),targetRowId:z.string().min(1),allocationType:z.enum(["PAYMENT_TO_CHARGE","REFUND_TO_PAYMENT"]),amount:z.number().finite().positive().max(999999999999),targetOperationalPaymentId:z.string().min(1).optional()}).safeParse(req.body);
 if(!parsed.success)return res.status(400).json({error:"Valid source/target rows, allocation type and positive amount are required"});
 const result=await withTenantContext(prisma,s,async tx=>{
  const {sourceRowId,targetRowId,allocationType,amount}=parsed.data;
  const rowLockKeys=[sourceRowId,targetRowId].sort();
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:historical-allocation-row:${rowLockKeys[0]}`);
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:historical-allocation-row:${rowLockKeys[1]}`);
  const [source,target]=await Promise.all([tx.accountingHistoricalImportRow.findFirst({where:{id:sourceRowId,organizationId:s.organizationId,schoolId:s.schoolId},include:{batch:{select:{status:true,currency:true}}}}),tx.accountingHistoricalImportRow.findFirst({where:{id:targetRowId,organizationId:s.organizationId,schoolId:s.schoolId},include:{batch:{select:{status:true,currency:true}},operationalLink:{select:{operationalPaymentId:true}},operationalAllocationLinks:{where:{operationalPaymentId:{not:null}},select:{operationalPaymentId:true}}}})]);
  if(!source||!target)return {kind:"NOT_FOUND" as const};
  const expectedSource=allocationType==="PAYMENT_TO_CHARGE"?"PAYMENT":"REFUND";const expectedTarget=allocationType==="PAYMENT_TO_CHARGE"?"CHARGE":"PAYMENT";
  if(source.sourceType!==expectedSource||target.sourceType!==expectedTarget||source.studentId!==target.studentId||source.batch.currency!==target.batch.currency||source.batch.status!=="POSTED"||target.batch.status!=="POSTED"||source.originalTransactionDate<target.originalTransactionDate)return {kind:"INVALID_LINK" as const};
  let lockedPayment:any=null;
  if(allocationType==="REFUND_TO_PAYMENT"){
   const paymentIds=[...new Set([target.operationalLink?.operationalPaymentId,...(target.operationalAllocationLinks||[]).map((x:any)=>x.operationalPaymentId)].filter(Boolean))] as string[];
   if(parsed.data.targetOperationalPaymentId){if(!paymentIds.includes(parsed.data.targetOperationalPaymentId))return {kind:"INVALID_PAYMENT_SLICE" as const};}
   else if(paymentIds.length>1)return {kind:"TARGET_PAYMENT_SLICE_REQUIRED" as const};
   const paymentId=parsed.data.targetOperationalPaymentId??paymentIds[0];
   if(paymentId){
    await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:refund-payment-slice:${paymentId}`);
    lockedPayment=await tx.studentFeePayment.findFirst({where:{id:paymentId,organizationId:s.organizationId,schoolId:s.schoolId,studentId:source.studentId,currency:source.batch.currency},select:{id:true,amount:true}});
    if(!lockedPayment)return {kind:"INVALID_PAYMENT_SLICE" as const};
   }
  } else if(parsed.data.targetOperationalPaymentId)return {kind:"INVALID_PAYMENT_SLICE" as const};
  const amountMinor=Math.round(amount*100);if(Math.abs(amount*100-amountMinor)>0.0001)return {kind:"INVALID_AMOUNT" as const};
  if(allocationType==="REFUND_TO_PAYMENT"&&lockedPayment){
   const activeRefunds=await tx.studentFeeRefund.aggregate({where:{paymentId:lockedPayment.id,organizationId:s.organizationId,schoolId:s.schoolId,status:{in:["REQUESTED","APPROVED_PENDING_SETTLEMENT","SETTLED"]}},_sum:{amount:true}});
   const reservations=await tx.accountingHistoricalAllocation.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,allocationType:"REFUND_TO_PAYMENT",targetOperationalPaymentId:lockedPayment.id},select:{amount:true,operationalLinks:{select:{operationalRefundId:true}}}});
   const reservedMinor=reservations.filter((a:any)=>!(a.operationalLinks||[]).some((l:any)=>l.operationalRefundId)).reduce((n:number,a:any)=>n+Math.round(Number(a.amount)*100),0);
   const committedMinor=Math.round(Number(activeRefunds._sum.amount||0)*100);
   if(committedMinor+reservedMinor+amountMinor>Math.round(Number(lockedPayment.amount)*100))return {kind:"PAYMENT_SLICE_REFUND_LIMIT" as const};
  }
  const [sourceAlloc,targetAlloc,duplicate]=await Promise.all([
   tx.accountingHistoricalAllocation.aggregate({where:{organizationId:s.organizationId,schoolId:s.schoolId,sourceRowId,allocationType},_sum:{amount:true}}),
   tx.accountingHistoricalAllocation.aggregate({where:{organizationId:s.organizationId,schoolId:s.schoolId,targetRowId,allocationType},_sum:{amount:true}}),
   tx.accountingHistoricalAllocation.findFirst({where:{sourceRowId,targetRowId,allocationType},select:{id:true}})
  ]);
  if(duplicate)return {kind:"DUPLICATE" as const};
  const sourceUsed=Math.round(Number(sourceAlloc._sum.amount||0)*100),targetUsed=Math.round(Number(targetAlloc._sum.amount||0)*100);
  if(sourceUsed+amountMinor>Math.round(Number(source.amount)*100))return {kind:"SOURCE_OVERALLOCATED" as const};
  if(targetUsed+amountMinor>Math.round(Number(target.amount)*100))return {kind:"TARGET_OVERALLOCATED" as const};
  const inferredPaymentId=allocationType!=="REFUND_TO_PAYMENT"?undefined:(parsed.data.targetOperationalPaymentId??target.operationalLink?.operationalPaymentId??((target.operationalAllocationLinks||[]).length===1?target.operationalAllocationLinks[0].operationalPaymentId:undefined));
  const created=await tx.accountingHistoricalAllocation.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,sourceRowId,targetRowId,allocationType,amount:amount.toFixed(2),targetOperationalPaymentId:inferredPaymentId,createdBy:s.userId}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"accounting.historical_allocation.created",resourceType:"AccountingHistoricalAllocation",resourceId:created.id,outcome:"SUCCESS",metadata:{sourceRowId,targetRowId,allocationType,amount:amount.toFixed(2),targetOperationalPaymentId:inferredPaymentId||null,crossBatch:source.batchId!==target.batchId}}});
  return {kind:"OK" as const,allocation:created};
 });
 if(result.kind==="NOT_FOUND")return res.status(404).json({error:"Historical source or target row not found"});
 if(result.kind!=="OK")return res.status(409).json({error:result.kind==="TARGET_PAYMENT_SLICE_REQUIRED"?"Select the exact operational payment slice for this split-payment refund":result.kind==="PAYMENT_SLICE_REFUND_LIMIT"?"Refund allocation exceeds the payment slice's remaining refundable balance":`Historical allocation rejected: ${result.kind}`});
 return res.status(201).json({data:result.allocation});
}));

parentRouter.post(base+"/accounting/historical-imports/exceptions/scan",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  const where={organizationId:s.organizationId,schoolId:s.schoolId,batch:{status:"POSTED"}};
  const totalRows=await tx.accountingHistoricalImportRow.count({where});if(totalRows>20000)return {kind:"TOO_MANY" as const,totalRows};
  const rows=await tx.accountingHistoricalImportRow.findMany({where,include:{batch:{select:{currency:true}}},take:20000});
  const created:any[]=[];
  for(const row of rows){if(row.sourceType!=="PAYMENT"&&row.sourceType!=="REFUND")continue;
   const type=row.sourceType==="PAYMENT"?"PAYMENT_TO_CHARGE":"REFUND_TO_PAYMENT";const ref=row.sourceType==="PAYMENT"?row.relatedChargeSourceReference:row.relatedPaymentSourceReference;const targetType=row.sourceType==="PAYMENT"?"CHARGE":"PAYMENT";
   const existing=await tx.accountingHistoricalAllocation.aggregate({where:{organizationId:s.organizationId,schoolId:s.schoolId,sourceRowId:row.id,allocationType:type},_sum:{amount:true}});
   if(Number(existing._sum.amount||0)>=Number(row.amount))continue;
   const candidates=ref?rows.filter(t=>t.sourceType===targetType&&t.sourceReference===ref&&t.studentId===row.studentId&&t.batch.currency===row.batch.currency&&t.originalTransactionDate<=row.originalTransactionDate):[];
   const exceptionType=!ref?"MISSING_SOURCE_REFERENCE":candidates.length===0?"ORPHAN_TARGET_REFERENCE":candidates.length>1?"AMBIGUOUS_TARGET_REFERENCE":"UNALLOCATED_REMAINDER";
   const details=!ref?"Transaction does not contain a required source relationship reference.":candidates.length===0?`No posted ${targetType} row matches reference ${ref} for this student and currency.`:candidates.length>1?`More than one posted ${targetType} row matches reference ${ref}; finance review is required.`:`Historical source amount is not fully allocated to its referenced ${targetType.toLowerCase()}.`;
   const item=await tx.accountingHistoricalException.upsert({where:{historicalRowId_exceptionType:{historicalRowId:row.id,exceptionType}},create:{organizationId:s.organizationId,schoolId:s.schoolId,historicalRowId:row.id,exceptionType,details},update:{}});created.push(item);
  }
  return {kind:"OK" as const,scannedRows:rows.length,detectedOrOpen:created.length};
 });
 if(result.kind==="TOO_MANY")return res.status(409).json({error:"Historical exception scan is limited to 20,000 posted rows per run",totalRows:result.totalRows});
 return res.json({data:result,note:"Exception scan records missing, ambiguous or incompletely allocated relationships. It does not alter source rows or post journals."});
}));

parentRouter.get(base+"/accounting/historical-imports/exceptions",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const status=typeof req.query.status==="string"&&["OPEN","RESOLVED"].includes(req.query.status)?req.query.status:undefined;
 const rows=await withTenantContext(prisma,s,tx=>tx.accountingHistoricalException.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,...(status?{status}:{})},include:{row:{include:{batch:{select:{batchNumber:true,currency:true,status:true}}}},events:{orderBy:{createdAt:"asc"}}},orderBy:{detectedAt:"desc"},take:500}));
 return res.json({data:rows});
}));

parentRouter.post(base+"/accounting/historical-imports/exceptions/:exceptionId/resolve",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.historical-exception.resolve");if(!s)return;
 const parsed=z.object({resolutionNote:z.string().trim().min(10).max(1000)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:"Resolution note of at least 10 characters is required"});
 const result=await withTenantContext(prisma,s,async tx=>{
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:historical-exception:${req.params.exceptionId}`);
  const item=await tx.accountingHistoricalException.findFirst({where:{id:req.params.exceptionId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!item)return {kind:"NOT_FOUND" as const};if(item.status!=="OPEN")return {kind:"CONFLICT" as const};
  const updated=await tx.accountingHistoricalException.update({where:{id:item.id},data:{status:"RESOLVED",resolvedBy:s.userId,resolvedAt:new Date(),resolutionNote:parsed.data.resolutionNote}});
  await tx.accountingHistoricalExceptionEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,exceptionId:item.id,actorUserId:s.userId,eventType:"RESOLVED",note:parsed.data.resolutionNote,metadata:{exceptionType:item.exceptionType,historicalRowId:item.historicalRowId}}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"accounting.historical_exception.resolved",resourceType:"AccountingHistoricalException",resourceId:item.id,outcome:"SUCCESS",metadata:{exceptionType:item.exceptionType,resolutionNote:parsed.data.resolutionNote}}});return {kind:"OK" as const,exception:updated};
 });
 if(result.kind==="NOT_FOUND")return res.status(404).json({error:"Historical exception not found"});if(result.kind==="CONFLICT")return res.status(409).json({error:"Historical exception is already resolved"});return res.json({data:result.exception});
}));

parentRouter.post(base+"/accounting/historical-imports/:batchId/approve",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"accounting.historical-import.approve");if(!s)return;const p=z.object({approvalNote:z.string().trim().min(10).max(1000)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:"Approval note of at least 10 characters is required"});const result=await withTenantContext(prisma,s,async tx=>{await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:historical-approval:${req.params.batchId}`);const b=await tx.accountingHistoricalImportBatch.findFirst({where:{id:req.params.batchId,organizationId:s.organizationId,schoolId:s.schoolId},include:{rows:true}});if(!b)return {kind:"NOT_FOUND" as const};if(b.status!=="DRAFT"||b.createdBy===s.userId||!b.rows.length)return {kind:"CONFLICT" as const};if(b.controlTotalsVerifiedAt){const totals={charges:0,payments:0,refunds:0};for(const r of b.rows){const k=r.sourceType==="CHARGE"?"charges":r.sourceType==="PAYMENT"?"payments":"refunds";totals[k]+=Math.round(Number(r.amount)*100);}if(totals.charges!==Math.round(Number(b.declaredChargeTotal)*100)||totals.payments!==Math.round(Number(b.declaredPaymentTotal)*100)||totals.refunds!==Math.round(Number(b.declaredRefundTotal)*100))return {kind:"CONTROL_MISMATCH" as const};}const approved=await tx.accountingHistoricalImportBatch.update({where:{id:b.id},data:{status:"APPROVED",approvedBy:s.userId,approvedAt:new Date(),approvalNote:p.data.approvalNote}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"accounting.historical_import.approved",resourceType:"AccountingHistoricalImportBatch",resourceId:b.id,outcome:"SUCCESS",metadata:{rowCount:b.rows.length,approvalNote:p.data.approvalNote}}});return {kind:"OK" as const,batch:approved};});if(result.kind==="NOT_FOUND")return res.status(404).json({error:"Historical import not found"});if(result.kind==="CONFLICT")return res.status(409).json({error:"A non-empty draft must be approved by a different user"});if(result.kind==="CONTROL_MISMATCH")return res.status(409).json({error:"Declared source control totals no longer match batch rows"});return res.json({data:result.batch});}));
parentRouter.post(base+"/accounting/historical-imports/:batchId/post",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"accounting.post");if(!s)return;const result=await withTenantContext(prisma,s,async tx=>{await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:historical-post:${req.params.batchId}`);const b=await tx.accountingHistoricalImportBatch.findFirst({where:{id:req.params.batchId,organizationId:s.organizationId,schoolId:s.schoolId},include:{rows:true}});if(!b)return {kind:"NOT_FOUND" as const};if(b.status==="POSTED")return {kind:"EXISTS" as const};if(b.status!=="APPROVED"||!b.approvedBy)return {kind:"CONFLICT" as const};for(const r of b.rows){const amount=Number(r.amount).toFixed(2);const common={organizationId:s.organizationId,schoolId:s.schoolId,actorUserId:s.userId,postingDate:r.originalTransactionDate,currency:b.currency};const type=r.sourceType==="CHARGE"?"HISTORICAL_CHARGE":r.sourceType==="PAYMENT"?"HISTORICAL_PAYMENT":"HISTORICAL_REFUND";const lines=r.sourceType==="CHARGE"?[{accountCode:"1100",debit:amount,memo:`Historical receivable · ${r.studentId}`},{accountCode:"4000",credit:amount,memo:"Historical fee revenue"}]:r.sourceType==="PAYMENT"?[{accountCode:"1110",debit:amount,memo:`Historical receipt · ${r.studentId}`},{accountCode:"1100",credit:amount,memo:"Historical receivable settlement"}]:[{accountCode:"1100",debit:amount,memo:`Historical refund · ${r.studentId}`},{accountCode:"1110",credit:amount,memo:`Refund settlement ${r.externalSettlementReference}`}];await postSchoolJournal(tx,{...common,sourceType:type,sourceId:r.id,description:`Historical ${r.sourceType.toLowerCase()} ${r.sourceReference}${r.description?`: ${r.description}`:""}`,lines});}const posted=await tx.accountingHistoricalImportBatch.update({where:{id:b.id},data:{status:"POSTED",postedBy:s.userId,postedAt:new Date()}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"accounting.historical_import.posted",resourceType:"AccountingHistoricalImportBatch",resourceId:b.id,outcome:"SUCCESS",metadata:{rowCount:b.rows.length,currency:b.currency,originalDatesPreserved:true}}});return {kind:"OK" as const,batch:posted,postedRows:b.rows.length};});if(result.kind==="NOT_FOUND")return res.status(404).json({error:"Historical import not found"});if(result.kind==="CONFLICT")return res.status(409).json({error:"Only independently approved batches can be posted"});return res.status(result.kind==="EXISTS"?200:201).json({data:result});}));

// P135 — deterministic dependency planning for cross-batch operationalization.
parentRouter.get(base+"/accounting/historical-imports/operationalization-plan",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.reconcile");if(!s)return;
 const requested=typeof req.query.batchIds==="string"?req.query.batchIds.split(",").map(v=>v.trim()).filter(Boolean):[];
 if(requested.length>200)return res.status(400).json({error:"At most 200 batch IDs may be planned at once"});
 const result=await withTenantContext(prisma,s,async tx=>{
  const batches=await tx.accountingHistoricalImportBatch.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,status:"POSTED"},include:{rows:{include:{operationalLink:true,operationalAllocationLinks:true}}},orderBy:{createdAt:"asc"},take:2000});
  const byId=new Map(batches.map(b=>[b.id,b]));
  const allocations=await tx.accountingHistoricalAllocation.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},include:{sourceRow:{select:{id:true,batchId:true,sourceType:true,sourceReference:true}},targetRow:{select:{id:true,batchId:true,sourceType:true,sourceReference:true,operationalLink:{select:{operationalChargeId:true,operationalPaymentId:true}},operationalAllocationLinks:{select:{operationalChargeId:true,operationalPaymentId:true}}}}},take:10000});
  const deps=new Map<string,Set<string>>();const reasons=new Map<string,any[]>();
  for(const a of allocations){const from=a.sourceRow.batchId,to=a.targetRow.batchId;if(from===to)continue;if(!byId.has(from))continue;const set=deps.get(from)||new Set<string>();set.add(to);deps.set(from,set);const list=reasons.get(from)||[];list.push({targetBatchId:to,allocationType:a.allocationType,sourceReference:a.sourceRow.sourceReference,targetReference:a.targetRow.sourceReference,targetOperationalized:a.allocationType==="PAYMENT_TO_CHARGE"?Boolean(a.targetRow.operationalLink?.operationalChargeId||(a.targetRow.operationalAllocationLinks||[]).some((x:any)=>x.operationalChargeId)):Boolean(a.targetOperationalPaymentId||a.targetRow.operationalLink?.operationalPaymentId||(a.targetRow.operationalAllocationLinks||[]).some((x:any)=>x.operationalPaymentId))});reasons.set(from,list);}
  const selected=new Set<string>();const includePrerequisites=(id:string)=>{if(selected.has(id))return;selected.add(id);for(const d of deps.get(id)||[])if(byId.has(d))includePrerequisites(d);};
  if(requested.length){for(const id of requested){if(!byId.has(id))return {kind:"NOT_FOUND" as const,batchId:id};includePrerequisites(id);}}else for(const b of batches)includePrerequisites(b.id);
  const indegree=new Map<string,number>();const dependents=new Map<string,Set<string>>();for(const id of selected)indegree.set(id,0);
  for(const [source,targets] of deps){if(!selected.has(source))continue;for(const target of targets){if(!selected.has(target))continue;indegree.set(source,(indegree.get(source)||0)+1);const list=dependents.get(target)||new Set<string>();list.add(source);dependents.set(target,list);}}
  const ready=[...selected].filter(id=>indegree.get(id)===0).sort((a,b)=>String(byId.get(a)?.createdAt).localeCompare(String(byId.get(b)?.createdAt)));const order:string[]=[];
  while(ready.length){const id=ready.shift()!;order.push(id);for(const dependent of dependents.get(id)||[]){const next=(indegree.get(dependent)||0)-1;indegree.set(dependent,next);if(next===0){ready.push(dependent);ready.sort((a,b)=>String(byId.get(a)?.createdAt).localeCompare(String(byId.get(b)?.createdAt)));}}}
  const cycleIds=[...selected].filter(id=>!order.includes(id));
  const rowComplete=(r:any)=>Boolean(r.operationalLink)||((r.operationalAllocationLinks||[]).length>0&&Math.round((r.operationalAllocationLinks||[]).reduce((n:number,x:any)=>n+Math.round(Number(x.allocatedAmount)*100),0))===Math.round(Number(r.amount)*100));
  const plan=order.map((id,index)=>{const b=byId.get(id)!;const dependencies=[...(deps.get(id)||[])].filter(d=>selected.has(d));const pending=dependencies.filter(d=>!batches.find(x=>x.id===d)?.rows.every(rowComplete));const allRowsComplete=b.rows.every(rowComplete);const anyRowsComplete=b.rows.some(rowComplete);return {sequence:index+1,batchId:id,batchNumber:b.batchNumber,status:b.status,rowCount:b.rows.length,linkedRows:b.rows.filter(rowComplete).length,dependencies,dependencyAllocations:reasons.get(id)||[],ready:dependencies.every(d=>batches.find(x=>x.id===d)?.rows.every(rowComplete))&&!allRowsComplete,alreadyLinked:allRowsComplete,partialLinkage:anyRowsComplete&&!allRowsComplete,blockedBy:pending};});
  return {kind:"OK" as const,plan,cycleBatchIds:cycleIds,selectedBatchCount:selected.size,dependencyEdgeCount:[...deps.values()].reduce((n,v)=>n+v.size,0),note:"Targets must be operationalized before dependent source batches. The plan is advisory and does not mutate batches or post journals."};
 });
 if(result.kind==="NOT_FOUND")return res.status(404).json({error:"A requested posted batch was not found",batchId:result.batchId});
 return res.json({data:result});
}));

// P139 shared transactional worker: each batch is independently locked and committed.
const runHistoricalOperationalizationBatch = async (s:any,batchId:string) => withTenantContext(prisma,s,async tx=>{
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:historical-operationalize:${batchId}`);
  const batch=await tx.accountingHistoricalImportBatch.findFirst({where:{id:batchId,organizationId:s.organizationId,schoolId:s.schoolId},include:{rows:{orderBy:[{originalTransactionDate:"asc"},{createdAt:"asc"}]}}});
  if(!batch)return {kind:"NOT_FOUND" as const};
  if(batch.status!=="POSTED")return {kind:"CONFLICT" as const};
  const priorRows=await tx.accountingHistoricalImportRow.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,batchId:batch.id},include:{operationalLink:true,operationalAllocationLinks:true}});
  const completedRows=priorRows.filter((r:any)=>r.operationalLink||((r.operationalAllocationLinks||[]).length>0&&Math.round((r.operationalAllocationLinks||[]).reduce((n:number,x:any)=>n+Math.round(Number(x.allocatedAmount)*100),0))===Math.round(Number(r.amount)*100)));
  const existing=completedRows.length;
  if(existing===batch.rows.length)return {kind:"EXISTS" as const,linkedRows:existing};
  if(existing>0)return {kind:"PARTIAL" as const,linkedRows:existing};
  const rowBySource=new Map(batch.rows.map(r=>[`${r.sourceType}:${r.sourceReference}`,r]));
  const charges=batch.rows.filter(r=>r.sourceType==="CHARGE");
  const payments=batch.rows.filter(r=>r.sourceType==="PAYMENT");
  const refunds=batch.rows.filter(r=>r.sourceType==="REFUND");
  // P138: materialize each immutable allocation slice as its own operational payment/refund.
  // Legacy same-batch references remain supported when no explicit allocation rows exist.
  const allocations=await tx.accountingHistoricalAllocation.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,sourceRowId:{in:batch.rows.map(r=>r.id)}},include:{targetRow:{include:{batch:{select:{id:true,status:true,currency:true}},operationalLink:true,operationalAllocationLinks:true}}}});
  const allocationBySource=new Map<string,typeof allocations>();for(const a of allocations){const list=allocationBySource.get(a.sourceRowId)||[];list.push(a);allocationBySource.set(a.sourceRowId,list);}
  const targetFor=(r:any,type:string,legacyType:string,legacyRef:string)=>{const found=allocationBySource.get(r.id)||[];if(found.length){if(found.some(a=>a.allocationType!==type))return {error:"ALLOCATION_TYPE_MISMATCH" as const};const total=found.reduce((n,a)=>n+Math.round(Number(a.amount)*100),0);if(total!==Math.round(Number(r.amount)*100))return {error:"ALLOCATION_TOTAL_MISMATCH" as const};return {targets:found.map(a=>({row:a.targetRow,crossBatch:a.targetRow.batchId!==batch.id,allocation:a}))};}const legacy=rowBySource.get(`${legacyType}:${legacyRef}`);return legacy?{targets:[{row:legacy,crossBatch:false,allocation:null}]}:{error:"ALLOCATION_REQUIRED" as const};};
  const paymentTargets=new Map<string,any[]>();const refundTargets=new Map<string,any[]>();
  for(const r of payments){const resolved=targetFor(r,"PAYMENT_TO_CHARGE","CHARGE",r.relatedChargeSourceReference||"");if("error" in resolved)return {kind:resolved.error as any,sourceReference:r.sourceReference};for(const target of resolved.targets){const parent=target.row;const parentBatch=target.crossBatch?parent.batch:batch;if(parent.sourceType!=="CHARGE"||parent.studentId!==r.studentId||parentBatch.currency!==batch.currency||parentBatch.status!=="POSTED")return {kind:"CHARGE_LINK" as const,sourceReference:r.sourceReference};if(r.originalTransactionDate<parent.originalTransactionDate)return {kind:"DATE_ORDER" as const,sourceReference:r.sourceReference};if(target.crossBatch&&!parent.operationalLink?.operationalChargeId)return {kind:"CROSS_BATCH_TARGET_NOT_OPERATIONAL" as const,sourceReference:r.sourceReference};}paymentTargets.set(r.id,resolved.targets);}
  for(const r of refunds){const resolved=targetFor(r,"REFUND_TO_PAYMENT","PAYMENT",r.relatedPaymentSourceReference||"");if("error" in resolved)return {kind:resolved.error as any,sourceReference:r.sourceReference};for(const target of resolved.targets){const parent=target.row;const parentBatch=target.crossBatch?parent.batch:batch;if(parent.sourceType!=="PAYMENT"||parent.studentId!==r.studentId||parentBatch.currency!==batch.currency||parentBatch.status!=="POSTED")return {kind:"PAYMENT_LINK" as const,sourceReference:r.sourceReference};if(r.originalTransactionDate<parent.originalTransactionDate)return {kind:"DATE_ORDER" as const,sourceReference:r.sourceReference};const targetSlices=paymentTargets.get(parent.id)||[];if(targetSlices.length>1&&!target.allocation?.targetOperationalPaymentId)return {kind:"REFUND_TARGET_PAYMENT_SLICE_REQUIRED" as const,sourceReference:r.sourceReference};const persistedSlices=(parent.operationalAllocationLinks||[]).filter((x:any)=>x.operationalPaymentId);const availableIds=[parent.operationalLink?.operationalPaymentId,...persistedSlices.map((x:any)=>x.operationalPaymentId)].filter(Boolean);if(target.allocation?.targetOperationalPaymentId&&!availableIds.includes(target.allocation.targetOperationalPaymentId))return {kind:"REFUND_PAYMENT_SLICE_MISMATCH" as const,sourceReference:r.sourceReference};if(availableIds.length>1&&!target.allocation?.targetOperationalPaymentId)return {kind:"REFUND_TARGET_PAYMENT_SLICE_REQUIRED" as const,sourceReference:r.sourceReference};const hasOperationalPayment=Boolean(target.allocation?.targetOperationalPaymentId||availableIds.length===1||targetSlices.length===1);if(target.crossBatch&&!hasOperationalPayment)return {kind:"CROSS_BATCH_TARGET_NOT_OPERATIONAL" as const,sourceReference:r.sourceReference};}refundTargets.set(r.id,resolved.targets);}
  const chargeTotals=new Map<string,number>();const paymentTotals=new Map<string,number>();
  for(const r of payments)for(const target of paymentTargets.get(r.id)||[])chargeTotals.set(target.row.id,(chargeTotals.get(target.row.id)||0)+Math.round(Number(target.allocation?.amount??r.amount)*100));
  for(const r of refunds)for(const target of refundTargets.get(r.id)||[])paymentTotals.set(target.row.id,(paymentTotals.get(target.row.id)||0)+Math.round(Number(target.allocation?.amount??r.amount)*100));
  const chargeCodeKeys=new Set<string>();const settlementReferences=new Set<string>();
  for(const r of batch.rows.filter(x=>x.sourceType==="CHARGE")){const code=`HIST-${r.sourceReference}`.replace(/[^A-Za-z0-9_-]/g,"-").slice(0,50);const key=`${r.studentId}:${code}`;if(chargeCodeKeys.has(key))return {kind:"CHARGE_CONFLICT" as const,sourceReference:r.sourceReference};chargeCodeKeys.add(key);const duplicate=await tx.studentFeeCharge.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:r.studentId,chargeCode:code},select:{id:true}});if(duplicate)return {kind:"CHARGE_CONFLICT" as const,sourceReference:r.sourceReference};if((chargeTotals.get(r.id)||0)>Math.round(Number(r.amount)*100))return {kind:"OVERPAYMENT" as const,sourceReference:r.sourceReference};}
  for(const r of batch.rows.filter(x=>x.sourceType==="PAYMENT")){if((paymentTotals.get(r.id)||0)>Math.round(Number(r.amount)*100))return {kind:"REFUND_OVERPAYMENT" as const,sourceReference:r.sourceReference};}
  for(const r of refunds){const reference=r.externalSettlementReference||"";if(settlementReferences.has(reference))return {kind:"SETTLEMENT_REFERENCE" as const,sourceReference:r.sourceReference};settlementReferences.add(reference);const duplicate=await tx.studentFeeRefund.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,settlementReference:reference},select:{id:true}});if(duplicate)return {kind:"SETTLEMENT_REFERENCE" as const,sourceReference:r.sourceReference};}
  const chargeIds=new Map<string,string>();const paymentIds=new Map<string,string>();let linked=0;
  for(const r of charges){
   const chargeCode=`HIST-${r.sourceReference}`.replace(/[^A-Za-z0-9_-]/g,"-").slice(0,50);
   const duplicate=await tx.studentFeeCharge.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:r.studentId,chargeCode},select:{id:true}});
   if(duplicate)throw new Error("P131 charge uniqueness changed during operationalization; transaction rolled back");
   const charge=await tx.studentFeeCharge.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:r.studentId,chargeCode,title:r.description?.slice(0,160)||`Historical fee ${r.sourceReference}`,description:`Imported historical source ${r.sourceReference}`,category:"HISTORICAL",currency:batch.currency,amount:r.amount,amountPaid:"0.00",dueAt:null,status:"PUBLISHED",approvalStatus:"APPROVED",publishedAt:r.originalTransactionDate,createdBy:s.userId}});
   await tx.accountingHistoricalOperationalLink.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,historicalRowId:r.id,operationalChargeId:charge.id,linkedBy:s.userId}});chargeIds.set(r.sourceReference,charge.id);linked++;
  }
  for(const r of payments){
   const targets=paymentTargets.get(r.id)||[];if(!targets.length)throw new Error("P138 payment allocations missing; transaction rolled back");
   for(const target of targets){
    const sourceCharge=target.row;const chargeId=target.crossBatch?sourceCharge.operationalLink?.operationalChargeId:chargeIds.get(sourceCharge.sourceReference);if(!chargeId)throw new Error("P138 target charge must be operationalized before this payment; transaction rolled back");
    const charge=await tx.studentFeeCharge.findFirst({where:{id:chargeId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!charge)throw new Error("P131 operational charge missing; transaction rolled back");
    const amount=target.allocation?.amount??r.amount;const calculation=calculateFeePayment(charge.amount.toString(),charge.amountPaid.toString(),amount.toString());if(!calculation)throw new Error("P138 allocated payment exceeds target charge balance; transaction rolled back");
    const method=["CASH","BANK_TRANSFER","CHEQUE","CARD","UPI","OTHER"].includes((r.method||"").toUpperCase())?(r.method||"OTHER").toUpperCase():"OTHER";
    const payment=await tx.studentFeePayment.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:r.studentId,chargeId:charge.id,amount,currency:batch.currency,method,reference:target.allocation?`${r.sourceReference}-${target.allocation.id}`:r.sourceReference,paidAt:r.originalTransactionDate,recordedBy:s.userId}});
    await tx.studentFeeCharge.update({where:{id:charge.id},data:{amountPaid:calculation.amountPaid,status:calculation.status}});
    if(target.allocation)await tx.accountingHistoricalOperationalAllocationLink.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,allocationId:target.allocation.id,historicalRowId:r.id,operationalChargeId:charge.id,operationalPaymentId:payment.id,allocatedAmount:amount,linkedBy:s.userId}});
    else await tx.accountingHistoricalOperationalLink.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,historicalRowId:r.id,operationalChargeId:charge.id,operationalPaymentId:payment.id,linkedBy:s.userId}});
    if(!paymentIds.has(r.sourceReference))paymentIds.set(r.sourceReference,payment.id);linked++;
   }
  }
  for(const r of refunds){
   const targets=refundTargets.get(r.id)||[];if(!targets.length)throw new Error("P138 refund allocations missing; transaction rolled back");
   for(const target of targets){
    const sourcePayment=target.row;if(!sourcePayment||sourcePayment.studentId!==r.studentId)throw new Error("P138 refund allocation target changed; transaction rolled back");
    let paymentId:string|undefined=target.allocation?.targetOperationalPaymentId||undefined;
    if(!paymentId&&target.crossBatch){paymentId=sourcePayment.operationalLink?.operationalPaymentId;if(!paymentId){const linked=sourcePayment.operationalAllocationLinks?.filter((x:any)=>x.operationalPaymentId)||[];if(linked.length===1)paymentId=linked[0].operationalPaymentId||undefined;}}
    else if(!paymentId)paymentId=paymentIds.get(sourcePayment.sourceReference);
    if(!paymentId)throw new Error("P140 refund target requires an explicit operational payment slice when its historical payment has multiple slices; transaction rolled back");
    await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:refund-payment-slice:${paymentId}`);
    const payment=await tx.studentFeePayment.findFirst({where:{id:paymentId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!payment)throw new Error("P131 operational payment missing; transaction rolled back");
    const charge=await tx.studentFeeCharge.findFirst({where:{id:payment.chargeId,organizationId:s.organizationId,schoolId:s.schoolId}});const amount=target.allocation?.amount??r.amount;if(!charge||Number(charge.amountPaid)+0.0001<Number(amount))throw new Error("P138 refund exceeds operational charge balance; transaction rolled back");
    const already=await tx.studentFeeRefund.aggregate({where:{paymentId:payment.id,organizationId:s.organizationId,schoolId:s.schoolId,status:{in:["REQUESTED","APPROVED_PENDING_SETTLEMENT","SETTLED"]}},_sum:{amount:true}});
    if(Number(already._sum.amount||0)+Number(amount)>Number(payment.amount)+0.0001)throw new Error("P142 refund exceeds the remaining payment-slice balance; transaction rolled back");
    const refund=await tx.studentFeeRefund.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:r.studentId,chargeId:charge.id,paymentId:payment.id,amount,currency:batch.currency,reason:r.description||`Historical refund ${r.sourceReference}`,idempotencyKey:`HIST-${r.id}-${target.allocation?.id||"LEGACY"}`,requestedBy:s.userId,approvedBy:s.userId,approvedAt:r.originalTransactionDate,status:"SETTLED",settledBy:s.userId,settledAt:r.originalTransactionDate,settlementReference:r.externalSettlementReference}});
    await tx.studentFeeRefundEvent.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,refundId:refund.id,eventType:"SETTLED",fromStatus:"APPROVED_PENDING_SETTLEMENT",toStatus:"SETTLED",actorUserId:s.userId,note:"Imported from verified historical settlement evidence",metadata:{sourceReference:r.sourceReference,allocationId:target.allocation?.id||null,externalSettlementReference:r.externalSettlementReference}}});
    const nextPaid=Math.max(0,Number(charge.amountPaid)-Number(amount));const nextStatus=nextPaid===0?"PUBLISHED":nextPaid+0.0001>=Number(charge.amount)?"PAID":"PARTIALLY_PAID";
    await tx.studentFeeCharge.update({where:{id:charge.id},data:{amountPaid:nextPaid.toFixed(2),status:nextStatus}});
    const settled=await tx.studentFeeRefund.aggregate({where:{paymentId:payment.id,organizationId:s.organizationId,schoolId:s.schoolId,status:"SETTLED"},_sum:{amount:true}});
    await tx.studentFeePayment.update({where:{id:payment.id},data:{status:Number(settled._sum.amount||0)+0.0001>=Number(payment.amount)?"REVERSED":"PARTIALLY_REFUNDED"}});
    if(target.allocation)await tx.accountingHistoricalOperationalAllocationLink.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,allocationId:target.allocation.id,historicalRowId:r.id,operationalChargeId:charge.id,operationalRefundId:refund.id,allocatedAmount:amount,linkedBy:s.userId}});
    else await tx.accountingHistoricalOperationalLink.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,historicalRowId:r.id,operationalChargeId:charge.id,operationalPaymentId:payment.id,operationalRefundId:refund.id,linkedBy:s.userId}});
    linked++;
   }
  }
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"accounting.historical_import.operationalized",resourceType:"AccountingHistoricalImportBatch",resourceId:batch.id,outcome:"SUCCESS",metadata:{linkedRows:linked,charges:charges.length,payments:payments.length,refunds:refunds.length,crossBatchAllocations:allocations.length,accountingJournalsReposted:false}}});
  return {kind:"OK" as const,linkedRows:linked,charges:charges.length,payments:payments.length,refunds:refunds.length};
 });

// P131 — materialize approved historical journals into operational fee records without reposting accounting entries.
parentRouter.post(base+"/accounting/historical-imports/:batchId/operationalize",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.historical-operationalize");if(!s)return;
 const result=await runHistoricalOperationalizationBatch(s,req.params.batchId);;
 if(result.kind==="NOT_FOUND")return res.status(404).json({error:"Historical import batch not found"});
 if(result.kind==="CONFLICT")return res.status(409).json({error:"Historical batch must be posted to the accounting ledger first"});
 if(result.kind==="EXISTS")return res.json({data:result,message:"Operational fee records were already linked"});
 if(result.kind==="PARTIAL")return res.status(409).json({error:"Partial operationalization detected; manual reconciliation is required",linkedRows:result.linkedRows});
 if(result.kind!=="OK")return res.status(409).json({error:`Historical operationalization blocked: ${result.kind}`,sourceReference:(result as any).sourceReference});
 return res.status(201).json({data:result,message:"Operational fee records and refund histories created. Existing historical accounting journals were not reposted."});
}));

// P139 — execute dependency batches in target-first order; each batch commits independently for safe resume.
parentRouter.post(base+"/accounting/historical-imports/operationalize-batches",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.historical-operationalize");if(!s)return;
 const parsed=z.object({batchIds:z.array(z.string().trim().min(1)).min(1).max(200)}).safeParse(req.body);
 if(!parsed.success)return res.status(400).json({error:"Provide between 1 and 200 historical batch IDs"});
 const requested=[...new Set(parsed.data.batchIds)];
 const graph=await withTenantContext(prisma,s,async tx=>{
  const batches=await tx.accountingHistoricalImportBatch.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,status:"POSTED"},select:{id:true},take:2000});
  const ids=new Set(batches.map((b:any)=>b.id));
  const missing=requested.filter(id=>!ids.has(id));if(missing.length)return {missing};
  const allocs=await tx.accountingHistoricalAllocation.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,sourceRow:{batchId:{in:[...ids]}},targetRow:{batchId:{in:[...ids]}}},select:{sourceRow:{select:{batchId:true}},targetRow:{select:{batchId:true}}},take:10000});
  const deps=new Map<string,Set<string>>();for(const a of allocs){const from=a.sourceRow.batchId,to=a.targetRow.batchId;if(from!==to){const set=deps.get(from)||new Set<string>();set.add(to);deps.set(from,set);}}
  const selected=new Set<string>();const visitSelect=(id:string)=>{if(selected.has(id))return;selected.add(id);for(const d of deps.get(id)||[])visitSelect(d);};requested.forEach(visitSelect);
  const order:string[]=[],visiting=new Set<string>(),visited=new Set<string>();let cycle=false;
  const visit=(id:string)=>{if(visiting.has(id)){cycle=true;return;}if(visited.has(id))return;visiting.add(id);for(const d of deps.get(id)||[])if(selected.has(d))visit(d);visiting.delete(id);visited.add(id);order.push(id);};
  for(const id of selected)visit(id);
  return {order,cycle};
 });
 if((graph as any).missing)return res.status(404).json({error:"One or more requested batches are not POSTED or not found",batchIds:(graph as any).missing});
 if((graph as any).cycle)return res.status(409).json({error:"Dependency cycle detected; no batches were executed"});
 const order=(graph as any).order as string[];const completed:any[]=[];let blocked:any=null;
 for(const batchId of order){
  try{
   const result:any=await runHistoricalOperationalizationBatch(s,batchId);
   if(result.kind==="OK"||result.kind==="EXISTS")completed.push({batchId,status:result.kind,linkedRows:result.linkedRows||0});
   else {blocked={batchId,kind:result.kind,sourceReference:result.sourceReference||null};break;}
  }catch(error:any){blocked={batchId,kind:"EXECUTION_ERROR",message:String(error?.message||"Batch execution failed").slice(0,300)};break;}
 }
 const remaining=order.filter(id=>!completed.some(x=>x.batchId===id));
 await withTenantContext(prisma,s,tx=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"accounting.historical_import.batch_orchestration",resourceType:"AccountingHistoricalImportBatch",resourceId:requested[0],outcome:blocked?"PARTIAL":"SUCCESS",metadata:{requestedBatchIds:requested,executionOrder:order,completedBatchIds:completed.map(x=>x.batchId),blocked,remainingBatchIds:remaining,accountingJournalsReposted:false}}}));
 return res.status(200).json({data:{executionOrder:order,completed,blocked,remaining,resumable:true},message:blocked?"Execution stopped safely; retry the same request to resume remaining batches":"All dependency batches operationalized"});
}));

parentRouter.post(base+"/accounting/periods/:periodId/close",authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,"accounting.periods.manage");if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{const period=await tx.accountingPeriod.findFirst({where:{id:req.params.periodId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!period)return null;await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${s.organizationId}:${s.schoolId}:accounting-period:${period.id}`);const current=await tx.accountingPeriod.findFirst({where:{id:period.id,organizationId:s.organizationId,schoolId:s.schoolId}});if(!current||current.status!=="OPEN")return {conflict:true};const updated=await tx.accountingPeriod.update({where:{id:current.id},data:{status:"CLOSED",closedAt:new Date(),closedBy:s.userId}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"accounting.period.closed",resourceType:"AccountingPeriod",resourceId:period.id,outcome:"SUCCESS",metadata:{periodKey:period.periodKey}}});return {period:updated};});
 if(!result)return res.status(404).json({error:"Accounting period not found"});if(result.conflict)return res.status(409).json({error:"Accounting period is already closed"});return res.json({data:result.period});
}));

// School Admin operational views. Lists use bounded keyset pagination and
// intentionally omit recipient account identifiers from notification results.
// P275 — school fee-structure lifecycle (student assignment is P276).
const feeStructureComponentSchema=z.object({name:z.string().trim().min(1).max(100),categoryCode:z.string().trim().regex(/^[A-Z0-9_-]{2,24}$/).optional(),amount:z.number().positive().max(10000000),frequency:z.enum(['ONE_TIME','ANNUAL','TERM','MONTHLY']),mandatory:z.boolean().default(true)});
const feeStructureSchema=z.object({code:z.string().trim().min(2).max(50),name:z.string().trim().min(2).max(160),description:z.string().max(2000).optional(),academicYearId:z.string().optional(),gradeLevelId:z.string().optional(),currency:z.string().length(3).default('INR'),components:z.array(feeStructureComponentSchema).min(1).max(40),effectiveFrom:z.string().date().optional(),effectiveTo:z.string().date().optional()});
const fallbackFeeCategoryCodes=['TUITION','ADMISSION','TRANSPORT','BOOKS','UNIFORM','EXAM','OTHER'];
async function activeFeeCategoryCodes(s:any){
 const rows=await withTenantContext(prisma,s,tx=>tx.$queryRaw<any[]>`SELECT "configuration" FROM "SchoolFinanceConfiguration" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} LIMIT 1`);
 const configuration=rows[0]?.configuration; const categories=Array.isArray(configuration?.feeCategories)?configuration.feeCategories:null;
 if(!categories)return fallbackFeeCategoryCodes;
 return categories.filter((category:any)=>category?.active===true).map((category:any)=>String(category.code).toUpperCase());
}
function validateFeeComponentCategories(components:any[],activeCodes:string[]){
 const missing=components.filter(component=>!component.categoryCode).length;
 const invalid=components.filter(component=>component.categoryCode&& !activeCodes.includes(String(component.categoryCode).toUpperCase())).map(component=>component.categoryCode);
 return {missing,invalid};
}
// P516 — formal fee receipts and student financial ledger.
// P517 — overdue balances, aging and disabled-by-default late-fee policy.
parentRouter.get(base+'/fees/outstanding',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.read');if(!s)return;
 const p=z.object({studentId:z.string().trim().min(1).optional(),limit:z.coerce.number().int().min(1).max(500).default(200)}).safeParse(req.query);if(!p.success)return res.status(400).json({error:'Invalid outstanding-balance filters'});
 const data=await withTenantContext(prisma,s,async tx=>{
  const policy=await tx.feeLateFeePolicy.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId}});
  const charges=await tx.studentFeeCharge.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,status:{in:['PUBLISHED','PARTIALLY_PAID','OVERDUE']},...(p.data.studentId?{studentId:p.data.studentId}:{})},include:{concessions:{where:{status:'APPROVED'}},select:{calculatedAmount:true}},orderBy:[{dueAt:'asc'},{createdAt:'asc'}],take:p.data.limit});
  const today=new Date();today.setUTCHours(0,0,0,0);const rows=charges.map((c:any)=>{const concessionCents=c.concessions.reduce((n:number,x:any)=>n+Math.round(Number(x.calculatedAmount)*100),0);const grossCents=Math.round(Number(c.amount)*100);const netCents=Math.max(0,grossCents-concessionCents);const paidCents=Math.max(0,Math.round(Number(c.amountPaid||0)*100));const outstandingCents=Math.max(0,netCents-paidCents);const due=c.dueAt?new Date(c.dueAt):null;const daysPastDue=due&&outstandingCents>0?Math.max(0,Math.floor((today.getTime()-due.getTime())/86400000)):0;const grace=Math.max(0,Number(policy?.graceDays||0));const eligibleDays=Math.max(0,daysPastDue-grace);let lateFeeCents=0;if(policy?.enabled&&eligibleDays>0&&outstandingCents>0){lateFeeCents=policy.calculationType==='PERCENTAGE'?Math.round(outstandingCents*Number(policy.percentage||0)/100):Math.round(Number(policy.fixedAmount||0)*100);if(policy.capAmount!=null)lateFeeCents=Math.min(lateFeeCents,Math.round(Number(policy.capAmount)*100));}const aging=daysPastDue===0?'CURRENT':daysPastDue<=30?'1_30':daysPastDue<=60?'31_60':daysPastDue<=90?'61_90':'90_PLUS';return {chargeId:c.id,studentId:c.studentId,chargeCode:c.chargeCode,title:c.title,currency:c.currency,dueAt:c.dueAt,daysPastDue,aging,amount:Number(c.amount).toFixed(2),approvedConcessions:(concessionCents/100).toFixed(2),netDue:(netCents/100).toFixed(2),paid:(paidCents/100).toFixed(2),outstanding:(outstandingCents/100).toFixed(2),lateFeePreview:(lateFeeCents/100).toFixed(2),lateFeeEligible:!!policy?.enabled&&eligibleDays>0&&outstandingCents>0};});
  const buckets:any={CURRENT:0,'1_30':0,'31_60':0,'61_90':0,'90_PLUS':0};const totals:any={};for(const r of rows){buckets[r.aging]+=Math.round(Number(r.outstanding)*100);totals[r.currency]=(totals[r.currency]||0)+Math.round(Number(r.outstanding)*100);}return {rows,aging:Object.fromEntries(Object.entries(buckets).map(([k,v])=>[k,(Number(v)/100).toFixed(2)])),currencyTotals:Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,(Number(v)/100).toFixed(2)])),lateFeePolicy:policy||{enabled:false,calculationType:'FIXED',fixedAmount:'0',percentage:'0',graceDays:0,capAmount:null,currency:'INR'},count:rows.length};
 });return res.json({data});
}));
parentRouter.put(base+'/fees/late-fee-policy',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.manage');if(!s)return;
 const p=z.object({enabled:z.boolean().default(false),calculationType:z.enum(['FIXED','PERCENTAGE']).default('FIXED'),fixedAmount:z.coerce.number().min(0).max(1000000).default(0),percentage:z.coerce.number().min(0).max(100).default(0),graceDays:z.number().int().min(0).max(365).default(0),capAmount:z.coerce.number().min(0).max(10000000).nullable().optional(),currency:z.string().trim().min(3).max(3).default('INR')}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid late-fee policy',details:p.error.issues});
 const policy=await withTenantContext(prisma,s,tx=>tx.feeLateFeePolicy.upsert({where:{organizationId_schoolId:{organizationId:s.organizationId,schoolId:s.schoolId}},create:{organizationId:s.organizationId,schoolId:s.schoolId,...p.data,currency:p.data.currency.toUpperCase(),updatedBy:s.userId},update:{...p.data,currency:p.data.currency.toUpperCase(),updatedBy:s.userId}}));
 await withTenantContext(prisma,s,tx=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.late_fee_policy.updated',resourceType:'FeeLateFeePolicy',resourceId:policy.id,outcome:'SUCCESS',metadata:{enabled:policy.enabled,calculationType:policy.calculationType,graceDays:policy.graceDays}}}));return res.json({data:policy,message:'Late-fee policy saved. Late fees remain preview-only and are not assessed automatically.'});
}));

parentRouter.get(base+'/fees/receipts',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.payments.read');if(!s)return;
 const p=z.object({studentId:z.string().trim().min(1).optional(),from:z.string().date().optional(),to:z.string().date().optional(),limit:z.coerce.number().int().min(1).max(100).default(50)}).safeParse(req.query);
 if(!p.success)return res.status(400).json({error:'Invalid receipt filters'});
 const rows=await withTenantContext(prisma,s,tx=>tx.schoolFeeReceipt.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,...(p.data.studentId?{studentId:p.data.studentId}:{}),...(p.data.from||p.data.to?{issuedAt:{...(p.data.from?{gte:new Date(`${p.data.from}T00:00:00.000Z`)}:{}),...(p.data.to?{lte:new Date(`${p.data.to}T23:59:59.999Z`)}:{})}}:{})},orderBy:{issuedAt:'desc'},take:p.data.limit}));
 return res.json({data:rows});
}));
parentRouter.post(base+'/fees/payments/:paymentId/receipt',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.payments.record');if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:fee-receipt:${req.params.paymentId}`);
  const existing=await tx.schoolFeeReceipt.findFirst({where:{paymentId:req.params.paymentId,organizationId:s.organizationId,schoolId:s.schoolId}});if(existing)return {kind:'EXISTS' as const,receipt:existing};
  const payment=await tx.studentFeePayment.findFirst({where:{id:req.params.paymentId,organizationId:s.organizationId,schoolId:s.schoolId},include:{charge:true,invoice:true,installmentAllocations:{include:{installment:true}}}});if(!payment)return {kind:'NOT_FOUND' as const};
  if(payment.status==='REVERSED')return {kind:'REVERSED' as const};
  const school=await tx.school.findFirst({where:{id:s.schoolId,organizationId:s.organizationId},select:{name:true,code:true,timezone:true}});
  const finance=await tx.$queryRaw<any[]>`SELECT "configuration" FROM "SchoolFinanceConfiguration" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} LIMIT 1`;
  const prefix=String(finance[0]?.configuration?.feeReceiptPrefix||'FEE').trim().toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,12)||'FEE';
  const counter=await tx.schoolFeeReceiptCounter.upsert({where:{organizationId_schoolId:{organizationId:s.organizationId,schoolId:s.schoolId}},create:{organizationId:s.organizationId,schoolId:s.schoolId,lastSequence:1},update:{lastSequence:{increment:1}}});
  const seq=counter.lastSequence;
  const receiptNumber=`${prefix}-${String(seq).padStart(6,'0')}`;
  const receipt=await tx.schoolFeeReceipt.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:payment.studentId,chargeId:payment.chargeId,invoiceId:payment.invoiceId,invoiceNumber:payment.invoice?.invoiceNumber||null,paymentId:payment.id,receiptNumber,amount:payment.amount,currency:payment.currency,paymentMethod:payment.method,paymentReference:payment.reference,paidAt:payment.paidAt,allocationSnapshot:payment.installmentAllocations.map((a:any)=>({installmentSequence:a.installment.sequence,dueAt:a.installment.dueAt,amount:a.amount})),schoolSnapshot:{schoolName:school?.name||'',schoolCode:school?.code||'',timezone:school?.timezone||'Asia/Kolkata',receiptPrefix:prefix},issuedBy:s.userId}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.receipt.issued',resourceType:'SchoolFeeReceipt',resourceId:receipt.id,outcome:'SUCCESS',metadata:{receiptNumber,paymentId:payment.id,amount:String(payment.amount)}}});
  return {kind:'CREATED' as const,receipt};
 });
 if(result.kind==='NOT_FOUND')return res.status(404).json({error:'Payment not found'});if(result.kind==='REVERSED')return res.status(409).json({error:'Reversed payments cannot receive a receipt'});return res.status(result.kind==='EXISTS'?200:201).json({data:result.receipt,message:result.kind==='EXISTS'?'Existing formal receipt returned.':'Formal fee receipt issued.'});
}));
parentRouter.get(base+'/fees/receipts/:receiptId',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.payments.read');if(!s)return;
 const receipt=await withTenantContext(prisma,s,tx=>tx.schoolFeeReceipt.findFirst({where:{id:req.params.receiptId,organizationId:s.organizationId,schoolId:s.schoolId}}));if(!receipt)return res.status(404).json({error:'Receipt not found'});return res.json({data:receipt});
}));
parentRouter.get(base+'/fees/ledger',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.payments.read');if(!s)return;
 const p=z.object({studentId:z.string().trim().min(1),from:z.string().date().optional(),to:z.string().date().optional(),limit:z.coerce.number().int().min(1).max(200).default(100)}).safeParse(req.query);if(!p.success)return res.status(400).json({error:'Student ID is required and ledger filters must be valid'});
 const data=await withTenantContext(prisma,s,async tx=>{
  const student=await tx.student.findFirst({where:{id:p.data.studentId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,admissionNumber:true}});if(!student)return null;
  const fromDate=p.data.from?new Date(`${p.data.from}T00:00:00.000Z`):undefined;const toDate=p.data.to?new Date(`${p.data.to}T23:59:59.999Z`):undefined;const dateFilter=(fromDate||toDate)?{...(fromDate?{gte:fromDate}:{}),...(toDate?{lte:toDate}:{})}:undefined;
  const charges=await tx.studentFeeCharge.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:student.id,status:{in:['PUBLISHED','PARTIALLY_PAID','OVERDUE','PAID']}},include:{concessions:{where:{status:'APPROVED'}}},orderBy:{createdAt:'asc'}});
  const payments=await tx.studentFeePayment.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:student.id,...(dateFilter?{paidAt:dateFilter}:{})},include:{invoice:{select:{invoiceNumber:true}},installmentAllocations:{include:{installment:{select:{sequence:true,dueAt:true}}}}},orderBy:{paidAt:'asc'}});
  const refunds=await tx.studentFeeRefund.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:student.id,status:'SETTLED',...(dateFilter?{settledAt:dateFilter}:{})},orderBy:{settledAt:'asc'}});
  const events:any[]=[];
  for(const charge of charges){if((!fromDate||charge.createdAt>=fromDate)&&(!toDate||charge.createdAt<=toDate))events.push({id:`charge:${charge.id}`,date:charge.createdAt,kind:'CHARGE',debit:Number(charge.amount),credit:0,currency:charge.currency,reference:charge.chargeCode,description:charge.title});for(const c of charge.concessions){if((!fromDate||c.createdAt>=fromDate)&&(!toDate||c.createdAt<=toDate))events.push({id:`concession:${c.id}`,date:c.createdAt,kind:'CONCESSION',debit:0,credit:Number(c.calculatedAmount),currency:charge.currency,reference:charge.chargeCode,description:`Approved concession: ${c.reason}`});}}
  for(const payment of payments)events.push({id:`payment:${payment.id}`,date:payment.paidAt,kind:'PAYMENT',debit:0,credit:Number(payment.amount),currency:payment.currency,reference:payment.reference,invoiceNumber:payment.invoice?.invoiceNumber||null,description:`${payment.method} payment`,allocations:payment.installmentAllocations.map(a=>({sequence:a.installment.sequence,amount:Number(a.amount)}))});
  for(const refund of refunds)events.push({id:`refund:${refund.id}`,date:refund.settledAt||refund.createdAt,kind:'REFUND',debit:Number(refund.amount),credit:0,currency:refund.currency,reference:refund.settlementReference||refund.id,description:refund.reason});
  events.sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime()||a.kind.localeCompare(b.kind));const balances:any={};for(const event of events){const c=event.currency||'INR';balances[c]=(balances[c]||0)+Math.round((event.debit-event.credit)*100);event.runningBalance=(balances[c]/100).toFixed(2);event.debit=Number(event.debit).toFixed(2);event.credit=Number(event.credit).toFixed(2);}
  return {student,rows:events.slice(-p.data.limit),currencyBalances:Object.fromEntries(Object.entries(balances).map(([k,v])=>[k,(Number(v)/100).toFixed(2)])),totalRows:events.length};
 });if(!data)return res.status(404).json({error:'Student not found'});return res.json({data});
}));

// P514 — school fee billing/invoice lifecycle. One invoice per published fee charge.
parentRouter.get(base+'/fees/invoices',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.read');if(!s)return;
 const status=typeof req.query.status==='string'?req.query.status:undefined;
 const studentId=typeof req.query.studentId==='string'?req.query.studentId:undefined;
 const rows=await withTenantContext(prisma,s,tx=>tx.schoolFeeInvoice.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,...(status?{status}:{}) ,...(studentId?{studentId}:{})},include:{lines:{orderBy:{lineNumber:'asc'}}},orderBy:[{createdAt:'desc'},{id:'desc'}],take:100}));
 return res.json({data:rows});
}));
parentRouter.get(base+'/fees/invoices/:invoiceId',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.read');if(!s)return;
 const row=await withTenantContext(prisma,s,tx=>tx.schoolFeeInvoice.findFirst({where:{id:req.params.invoiceId,organizationId:s.organizationId,schoolId:s.schoolId},include:{lines:{orderBy:{lineNumber:'asc'}}}}));
 if(!row)return res.status(404).json({error:'Invoice not found'});return res.json({data:row});
}));
parentRouter.post(base+'/fees/charges/:chargeId/invoice',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.manage');if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:fee-invoice:${req.params.chargeId}`);
  const charge=await tx.studentFeeCharge.findFirst({where:{id:req.params.chargeId,organizationId:s.organizationId,schoolId:s.schoolId,status:{in:['PUBLISHED','PARTIALLY_PAID','OVERDUE']}}});
  if(!charge)return {kind:'NOT_PUBLISHABLE' as const};
  const existing=await tx.schoolFeeInvoice.findFirst({where:{chargeId:charge.id,organizationId:s.organizationId,schoolId:s.schoolId},include:{lines:{orderBy:{lineNumber:'asc'}}}});
  if(existing)return {kind:'EXISTS' as const,invoice:existing};
  const approved=await tx.feeConcession.findMany({where:{chargeId:charge.id,organizationId:s.organizationId,schoolId:s.schoolId,status:'APPROVED'},select:{type:true,value:true,calculatedAmount:true,reason:true}});
  const grossCents=Math.round(Number(charge.amount)*100);const discountCents=approved.reduce((sum:number,c:any)=>sum+Math.round(Number(c.calculatedAmount)*100),0);
  if(discountCents>grossCents)return {kind:'INVALID_DISCOUNT' as const};
  const netCents=grossCents-discountCents;const amountDueCents=Math.max(0,netCents-Math.round(Number(charge.amountPaid)*100));
  const schedule=await tx.feeInstallmentSchedule.findFirst({where:{chargeId:charge.id,organizationId:s.organizationId,schoolId:s.schoolId},include:{installments:{orderBy:{sequence:'asc'}}}});
  let sourceRows:any[]=[];
  if(schedule&&schedule.installments.length){sourceRows=schedule.installments.map((i:any)=>({description:`${charge.title} — installment ${i.sequence}/${schedule.installmentCount}`,grossCents:Math.round(Number(i.amount)*100),dueAt:i.dueAt,sourceInstallmentId:i.id}));}
  else sourceRows=[{description:charge.title,grossCents,dueAt:charge.dueAt,sourceInstallmentId:null}];
  // Allocate approved concessions across line items proportionally; last line receives the rounding remainder.
  let allocated=0;const lines=sourceRows.map((row:any,index:number)=>{const concession=index===sourceRows.length-1?discountCents-allocated:Math.round(discountCents*row.grossCents/grossCents);allocated+=concession;return {lineNumber:index+1,description:row.description,quantity:1,grossAmount:row.grossCents/100,concessionAmount:concession/100,netAmount:(row.grossCents-concession)/100,dueAt:row.dueAt,sourceInstallmentId:row.sourceInstallmentId};});
  const number=`${charge.currency}-${new Date().getUTCFullYear()}-${randomUUID().slice(0,8).toUpperCase()}`;
  const snapshot={chargeId:charge.id,chargeCode:charge.chargeCode,title:charge.title,category:charge.category,grossAmount:grossCents/100,approvedConcessions:approved.map(c=>({type:c.type,value:c.value.toString(),amount:c.calculatedAmount.toString(),reason:c.reason})),concessionTotal:discountCents/100,netAmount:netCents/100,amountDue:amountDueCents/100,installmentCount:lines.length,createdAt:new Date().toISOString()};
  const invoice=await tx.schoolFeeInvoice.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:charge.studentId,chargeId:charge.id,invoiceNumber:number,status:'DRAFT',currency:charge.currency,subtotal:grossCents/100,concessionTotal:discountCents/100,total:netCents/100,amountDue:amountDueCents/100,dueAt:charge.dueAt,billingSnapshot:snapshot,createdBy:s.userId,lines:{create:lines.map(l=>({...l,organizationId:s.organizationId,schoolId:s.schoolId}))}},include:{lines:{orderBy:{lineNumber:'asc'}}}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.invoice.draft_created',resourceType:'SchoolFeeInvoice',resourceId:invoice.id,outcome:'SUCCESS',metadata:{chargeId:charge.id,invoiceNumber:number,amount:netCents/100}}});return {kind:'CREATED' as const,invoice};
 });
 if(result.kind==='NOT_PUBLISHABLE')return res.status(409).json({error:'Only published fee charges can be invoiced'});
 if(result.kind==='INVALID_DISCOUNT')return res.status(409).json({error:'Approved concessions exceed the gross charge'});
 if(result.kind==='EXISTS')return res.status(409).json({error:'An invoice already exists for this charge',data:result.invoice});
 return res.status(201).json({data:result.invoice,message:'Draft invoice created from the published fee charge. Review before issuing.'});
}));
parentRouter.patch(base+'/fees/invoices/:invoiceId/issue',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.manage');if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:fee-invoice-issue:${req.params.invoiceId}`);
  const row=await tx.schoolFeeInvoice.findFirst({where:{id:req.params.invoiceId,organizationId:s.organizationId,schoolId:s.schoolId},include:{lines:true}});if(!row)return {kind:'NOT_FOUND' as const};if(row.status!=='DRAFT')return {kind:'CONFLICT' as const};
  const issuedAt=new Date();const updated=await tx.schoolFeeInvoice.update({where:{id:row.id},data:{status:'ISSUED',issuedAt},include:{lines:{orderBy:{lineNumber:'asc'}}}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.invoice.issued',resourceType:'SchoolFeeInvoice',resourceId:row.id,outcome:'SUCCESS',metadata:{invoiceNumber:row.invoiceNumber,total:row.total.toString()}}});return {kind:'ISSUED' as const,invoice:updated};
 });
 if(result.kind==='NOT_FOUND')return res.status(404).json({error:'Invoice not found'});if(result.kind==='CONFLICT')return res.status(409).json({error:'Only draft invoices can be issued'});return res.json({data:result.invoice});
}));
parentRouter.patch(base+'/fees/invoices/:invoiceId/void',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.manage');if(!s)return;
 const p=z.object({reason:z.string().trim().min(10).max(500)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'A void reason of at least 10 characters is required'});
 const result=await withTenantContext(prisma,s,async tx=>{
  const row=await tx.schoolFeeInvoice.findFirst({where:{id:req.params.invoiceId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!row)return {kind:'NOT_FOUND' as const};if(!['DRAFT','ISSUED'].includes(row.status))return {kind:'CONFLICT' as const};if(row.status==='ISSUED'){const charge=await tx.studentFeeCharge.findFirst({where:{id:row.chargeId,organizationId:s.organizationId,schoolId:s.schoolId},select:{amountPaid:true}});if(charge&&Number(charge.amountPaid)>0)return {kind:'CONFLICT' as const};}
  const updated=await tx.schoolFeeInvoice.update({where:{id:row.id},data:{status:'VOID',voidedAt:new Date(),voidReason:p.data.reason}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.invoice.voided',resourceType:'SchoolFeeInvoice',resourceId:row.id,outcome:'SUCCESS',metadata:{invoiceNumber:row.invoiceNumber,reason:p.data.reason}}});return {kind:'VOIDED' as const,invoice:updated};
 });
 if(result.kind==='NOT_FOUND')return res.status(404).json({error:'Invoice not found'});if(result.kind==='CONFLICT')return res.status(409).json({error:'Only draft or issued unpaid invoices can be voided'});return res.json({data:result.invoice});
}));

parentRouter.get(base+'/fee-structures',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'fees.read');if(!s)return;const status=typeof req.query.status==='string'?req.query.status:undefined;const rows=await withTenantContext(prisma,s,tx=>tx.feeStructure.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,...(status?{status}:{})},orderBy:[{createdAt:'desc'},{id:'desc'}],take:100}));return res.json({data:rows});}));
parentRouter.post(base+'/fee-structures',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'fees.manage');if(!s)return;const p=feeStructureSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid fee structure',details:p.error.issues});if(p.data.effectiveFrom&&p.data.effectiveTo&&p.data.effectiveTo<p.data.effectiveFrom)return res.status(400).json({error:'Effective end date must be on or after the start date'});const activeCodes=await activeFeeCategoryCodes(s);const categoryCheck=validateFeeComponentCategories(p.data.components,activeCodes);if(categoryCheck.missing)return res.status(400).json({error:'Each fee component must select a configured fee category'});if(categoryCheck.invalid.length)return res.status(400).json({error:'Fee component uses an inactive or unknown category',categories:categoryCheck.invalid});const duplicate=await withTenantContext(prisma,s,tx=>tx.feeStructure.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,code:p.data.code},select:{id:true}}));if(duplicate)return res.status(409).json({error:'Fee structure code already exists in this school'});const row=await withTenantContext(prisma,s,tx=>tx.feeStructure.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,code:p.data.code,name:p.data.name,description:p.data.description,academicYearId:p.data.academicYearId,gradeLevelId:p.data.gradeLevelId,currency:p.data.currency.toUpperCase(),components:p.data.components as any,effectiveFrom:p.data.effectiveFrom?new Date(p.data.effectiveFrom+'T00:00:00.000Z'):null,effectiveTo:p.data.effectiveTo?new Date(p.data.effectiveTo+'T00:00:00.000Z'):null,createdBy:s.userId}}));await withTenantContext(prisma,s,tx=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'fee.structure.created',resourceType:'FeeStructure',resourceId:row.id,outcome:'SUCCESS',metadata:{code:row.code,componentCount:p.data.components.length}}}));return res.status(201).json({data:row});}));
parentRouter.patch(base+'/fee-structures/:structureId',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'fees.manage');if(!s)return;const p=feeStructureSchema.partial().safeParse(req.body);if(!p.success||!Object.keys(req.body||{}).length)return res.status(400).json({error:'Invalid fee structure update'});if(p.data.components){const activeCodes=await activeFeeCategoryCodes(s);const categoryCheck=validateFeeComponentCategories(p.data.components,activeCodes);if(categoryCheck.missing)return res.status(400).json({error:'Each updated fee component must select a configured fee category'});if(categoryCheck.invalid.length)return res.status(400).json({error:'Updated fee component uses an inactive or unknown category',categories:categoryCheck.invalid});}const current=await withTenantContext(prisma,s,tx=>tx.feeStructure.findFirst({where:{id:req.params.structureId,organizationId:s.organizationId,schoolId:s.schoolId}}));if(!current)return res.status(404).json({error:'Fee structure not found'});if(current.status!=='DRAFT')return res.status(409).json({error:'Only draft fee structures can be edited'});const row=await withTenantContext(prisma,s,tx=>tx.feeStructure.update({where:{id:current.id},data:{...p.data, ...(p.data.currency?{currency:p.data.currency.toUpperCase()}:{}),...(p.data.effectiveFrom?{effectiveFrom:new Date(p.data.effectiveFrom+'T00:00:00.000Z')}:{}),...(p.data.effectiveTo?{effectiveTo:new Date(p.data.effectiveTo+'T00:00:00.000Z')}: {})}}));return res.json({data:row});}));
parentRouter.get(base+'/fee-structures/:structureId/assignment-preview',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'fees.read');if(!s)return;const academicYearId=typeof req.query.academicYearId==='string'?req.query.academicYearId:'';const gradeLevelId=typeof req.query.gradeLevelId==='string'?req.query.gradeLevelId:'';const sectionName=typeof req.query.sectionName==='string'?req.query.sectionName:undefined;if(!academicYearId||!gradeLevelId)return res.status(400).json({error:'Academic year and grade level are required'});const result=await withTenantContext(prisma,s,async tx=>{const structure=await tx.feeStructure.findFirst({where:{id:req.params.structureId,organizationId:s.organizationId,schoolId:s.schoolId,status:'PUBLISHED'},select:{id:true,code:true,name:true,currency:true,components:true,academicYearId:true,gradeLevelId:true}});if(!structure)return null;if((structure.academicYearId&&structure.academicYearId!==academicYearId)||(structure.gradeLevelId&&structure.gradeLevelId!==gradeLevelId))return {mismatch:true};const [year,grade]=await Promise.all([tx.academicYear.findFirst({where:{id:academicYearId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,name:true}}),tx.gradeLevel.findFirst({where:{id:gradeLevelId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,name:true}})]);if(!year||!grade)return {invalidCatalog:true};const enrollmentWhere={organizationId:s.organizationId,schoolId:s.schoolId,academicYearId,gradeLevelId,status:'ENROLLED',...(sectionName?{sectionName}:{})};const enrollments=await tx.studentEnrollment.findMany({where:enrollmentWhere,select:{studentId:true},take:5001});if(enrollments.length>5000)return {tooManyStudents:true};const students=[...new Set(enrollments.map(e=>e.studentId))];const allComponents=(Array.isArray(structure.components)?structure.components as any[]:[]).map((c,i)=>({c,i}));const components=allComponents.filter(x=>x.c.mandatory!==false);const optionalComponents=allComponents.filter(x=>x.c.mandatory===false);const charges=students.length*components.length;const componentBreakdown=await Promise.all(allComponents.map(async({c,i})=>{const code=`${structure.code.slice(0,42)}-${String(i+1).padStart(2,'0')}`;const existingCharges=c.mandatory!==false&&students.length?await tx.studentFeeCharge.count({where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:{in:students},chargeCode:code}}):0;return {name:String(c.name||`Component ${i+1}`),categoryCode:String(c.categoryCode||'OTHER'),frequency:String(c.frequency||'ONE_TIME'),mandatory:c.mandatory!==false,amount:Number(c.amount||0),chargeCode:code,estimatedStudentCharges:c.mandatory!==false?students.length:0,existingCharges,estimatedNewCharges:c.mandatory!==false?Math.max(0,students.length-existingCharges):0};}));const already=componentBreakdown.reduce((sum:any,x:any)=>sum+x.existingCharges,0);const estimatedNewCharges=componentBreakdown.reduce((sum:any,x:any)=>sum+x.estimatedNewCharges,0);return {structure:{id:structure.id,code:structure.code,name:structure.name,currency:structure.currency},academicYear:year,grade,sectionName:sectionName||null,eligibleStudents:students.length,componentCount:components.length,optionalComponentCount:optionalComponents.length,estimatedCharges:charges,existingCharges:already,estimatedNewCharges,estimatedTotal:components.reduce((sum:number,x:any)=>sum+Number(x.c.amount||0),0),mandatoryTotal:components.reduce((sum:number,x:any)=>sum+Number(x.c.amount||0),0),optionalTotal:optionalComponents.reduce((sum:number,x:any)=>sum+Number(x.c.amount||0),0),allComponentsTotal:allComponents.reduce((sum:number,x:any)=>sum+Number(x.c.amount||0),0),componentBreakdown};;});if(!result)return res.status(404).json({error:'Published fee structure not found'});if(result.mismatch)return res.status(409).json({error:'Selected year or grade conflicts with the structure scope'});if(result.invalidCatalog)return res.status(400).json({error:'Academic year or grade level is invalid for this school'});if(result.tooManyStudents)return res.status(409).json({error:'Assignment preview exceeds the 5,000 enrollment safety limit; narrow the scope by section'});return res.json({data:result});}));
// P276 — assign a published structure to enrolled students in a school-grade/section slice.
parentRouter.post(base+'/fee-structures/:structureId/assign',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.manage');if(!s)return;
 const p=z.object({academicYearId:z.string().trim().min(1),gradeLevelId:z.string().trim().min(1),sectionName:z.string().trim().max(80).optional(),dueAt:z.string().date().optional()}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Academic year and grade level are required'});
 const result=await withTenantContext(prisma,s,async tx=>{
  await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',`${s.organizationId}:${s.schoolId}:fee-assign:${req.params.structureId}:${p.data.academicYearId}:${p.data.gradeLevelId}`);
  const structure=await tx.feeStructure.findFirst({where:{id:req.params.structureId,organizationId:s.organizationId,schoolId:s.schoolId,status:'PUBLISHED'}});if(!structure)return {kind:'STRUCTURE_NOT_FOUND' as const};
  if((structure.academicYearId&&structure.academicYearId!==p.data.academicYearId)||(structure.gradeLevelId&&structure.gradeLevelId!==p.data.gradeLevelId))return {kind:'SCOPE_MISMATCH' as const};
  const year=await tx.academicYear.findFirst({where:{id:p.data.academicYearId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});const grade=await tx.gradeLevel.findFirst({where:{id:p.data.gradeLevelId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});if(!year||!grade)return {kind:'INVALID_CATALOG' as const};
  const enrollments=await tx.studentEnrollment.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,academicYearId:year.id,gradeLevelId:grade.id,status:'ENROLLED',...(p.data.sectionName?{sectionName:p.data.sectionName}:{})},select:{studentId:true},take:5001});if(enrollments.length>5000)return {kind:'TOO_MANY_STUDENTS' as const};const studentIds=[...new Set(enrollments.map(e=>e.studentId))];if(!studentIds.length)return {kind:'NO_STUDENTS' as const};
  const components=Array.isArray(structure.components)?structure.components as any[]:[];let created=0;let duplicates=0;for(const studentId of studentIds){for(let index=0;index<components.length;index++){const c=components[index];if(c.mandatory===false)continue;const suffix=String(index+1).padStart(2,'0');const code=`${structure.code.slice(0,42)}-${suffix}`;const exists=await tx.studentFeeCharge.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,studentId,chargeCode:code},select:{id:true}});if(exists){duplicates++;continue;}const charge=await tx.studentFeeCharge.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId,chargeCode:code,title:`${structure.name} - ${String(c.name).slice(0,100)}`,description:`Assigned from fee structure ${structure.code}; component ${c.name}; frequency ${c.frequency}`,category:String(c.categoryCode||'OTHER'),currency:structure.currency,amount:Number(c.amount),amountPaid:0,dueAt:p.data.dueAt?new Date(`${p.data.dueAt}T00:00:00.000Z`):null,status:'DRAFT',approvalStatus:'DRAFT',publishedAt:null,createdBy:s.userId}});created++;}}
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'fee.structure.assigned',resourceType:'FeeStructure',resourceId:structure.id,outcome:'SUCCESS',metadata:{academicYearId:year.id,gradeLevelId:grade.id,sectionName:p.data.sectionName||null,eligibleStudents:studentIds.length,createdCharges:created,duplicateChargesSkipped:duplicates,dueAt:p.data.dueAt||null}}});return {kind:'ASSIGNED' as const,eligibleStudents:studentIds.length,createdCharges:created,duplicateChargesSkipped:duplicates,academicYearId:year.id,gradeLevelId:grade.id,sectionName:p.data.sectionName||null,mandatoryComponents:components.filter((c:any)=>c.mandatory!==false).length};
 });
 if(result.kind==='STRUCTURE_NOT_FOUND')return res.status(404).json({error:'Published fee structure not found'});if(result.kind==='SCOPE_MISMATCH')return res.status(409).json({error:'Assignment academic year or grade does not match the structure scope'});if(result.kind==='INVALID_CATALOG')return res.status(400).json({error:'Academic year or grade level is invalid for this school'});if(result.kind==='NO_STUDENTS')return res.status(409).json({error:'No enrolled students match the selected academic year, grade and section'});if(result.kind==='TOO_MANY_STUDENTS')return res.status(409).json({error:'Assignment exceeds the 5,000 enrollment safety limit; narrow the scope by section'});return res.status(201).json({data:result,message:'Student fee assignment created as draft charges; publish/approval and collection are handled by subsequent workflows.'});
}));

parentRouter.post(base+'/fee-structures/:structureId/publish',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'fees.manage');if(!s)return;const row:any=await withTenantContext(prisma,s,async tx=>{const current=await tx.feeStructure.findFirst({where:{id:req.params.structureId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!current)return null;if(current.status!=='DRAFT')return {conflict:true};const components=Array.isArray(current.components)?current.components as any[]:[];if(!components.length||components.some(c=>!c?.name||!(Number(c.amount)>0))||!components.some(c=>c.mandatory!==false))return {invalid:true};return tx.feeStructure.update({where:{id:current.id},data:{status:'PUBLISHED',publishedAt:new Date()}});});if(!row)return res.status(404).json({error:'Fee structure not found'});if(row.conflict)return res.status(409).json({error:'Fee structure is not a draft'});if(row.invalid)return res.status(400).json({error:'Fee structure requires valid positive components before publishing'});await withTenantContext(prisma,s,tx=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'fee.structure.published',resourceType:'FeeStructure',resourceId:req.params.structureId,outcome:'SUCCESS'}}));return res.json({data:row});}));
parentRouter.post(base+'/fee-structures/:structureId/archive',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'fees.manage');if(!s)return;const current=await withTenantContext(prisma,s,tx=>tx.feeStructure.findFirst({where:{id:req.params.structureId,organizationId:s.organizationId,schoolId:s.schoolId}}));if(!current)return res.status(404).json({error:'Fee structure not found'});if(current.status==='ARCHIVED')return res.status(409).json({error:'Fee structure is already archived'});const row=await withTenantContext(prisma,s,tx=>tx.feeStructure.update({where:{id:current.id},data:{status:'ARCHIVED',archivedAt:new Date()}}));await withTenantContext(prisma,s,tx=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'fee.structure.archived',resourceType:'FeeStructure',resourceId:row.id,outcome:'SUCCESS'}}));return res.json({data:row});}));

// P513 — charge-level scholarship/concession request and independent approval lifecycle.
const feeConcessionRequestSchema=z.object({type:z.enum(["FIXED","PERCENTAGE"]),value:z.number().positive().max(100000000),reason:z.string().trim().min(10).max(500)}).superRefine((v,ctx)=>{if(v.type==="PERCENTAGE"&&v.value>100)ctx.addIssue({code:z.ZodIssueCode.custom,message:"Percentage must be at most 100"});});
parentRouter.get(base+"/fees/:chargeId/concessions",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"fees.read");if(!s)return;const result=await withTenantContext(prisma,s,async tx=>{const charge=await tx.studentFeeCharge.findFirst({where:{id:req.params.chargeId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,amount:true,amountPaid:true,status:true,studentId:true}});if(!charge)return null;const concessions=await tx.feeConcession.findMany({where:{chargeId:charge.id,organizationId:s.organizationId,schoolId:s.schoolId},orderBy:{createdAt:"desc"}});const approved=concessions.filter((c:any)=>c.status==="APPROVED").reduce((sum:number,c:any)=>sum+Number(c.calculatedAmount),0);return {charge,concessions,approvedConcessionTotal:Number(approved.toFixed(2)),netAmount:Math.max(0,Number(charge.amount)-approved)};});if(!result)return res.status(404).json({error:"Fee charge not found"});return res.json({data:result});}));
parentRouter.post(base+"/fees/:chargeId/concessions",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"fees.manage");if(!s)return;const p=feeConcessionRequestSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:"Invalid concession request",details:p.error.issues});const result=await withTenantContext(prisma,s,async tx=>{await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${s.organizationId+":" +s.schoolId+":fee-concession:"+req.params.chargeId})::bigint)`;const charge=await tx.studentFeeCharge.findFirst({where:{id:req.params.chargeId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!charge)return {kind:"NOT_FOUND" as const};if(charge.status!=="DRAFT"||charge.approvalStatus!=="DRAFT")return {kind:"NOT_DRAFT" as const};const existing=await tx.feeConcession.findMany({where:{chargeId:charge.id,organizationId:s.organizationId,schoolId:s.schoolId,status:{in:["PENDING_APPROVAL","APPROVED"]}},select:{status:true,calculatedAmount:true}});if(existing.some((c:any)=>c.status==="PENDING_APPROVAL"))return {kind:"PENDING_EXISTS" as const};const approvedTotal=existing.filter((c:any)=>c.status==="APPROVED").reduce((sum:number,c:any)=>sum+Number(c.calculatedAmount),0);const gross=Number(charge.amount);const calculation=calculateFeeConcession({grossAmount:gross,type:p.data.type,value:p.data.value,approvedExisting:approvedTotal});const calculatedAmount=calculation.amount;if(!calculation.valid)return {kind:"EXCEEDS" as const,available:calculation.remaining,reason:calculation.reason};const row=await tx.feeConcession.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,studentId:charge.studentId,chargeId:charge.id,type:p.data.type,value:p.data.value,calculatedAmount,reason:p.data.reason,status:"PENDING_APPROVAL",requestedBy:s.userId}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"fee.concession.requested",resourceType:"FeeConcession",resourceId:row.id,outcome:"SUCCESS",metadata:{chargeId:charge.id,type:row.type,value:row.value,calculatedAmount:row.calculatedAmount}}});return {kind:"CREATED" as const,row};});if(result.kind==="NOT_FOUND")return res.status(404).json({error:"Fee charge not found"});if(result.kind==="NOT_DRAFT")return res.status(409).json({error:"Concessions can only be requested for draft charges before approval/publishing"});if(result.kind==="PENDING_EXISTS")return res.status(409).json({error:"A concession request is already awaiting approval for this charge"});if(result.kind==="EXCEEDS")return res.status(409).json({error:"Concession exceeds the remaining charge balance",availableAmount:result.available});return res.status(201).json({data:result.row,message:"Concession submitted for independent approval; the gross fee charge is unchanged."});}));
parentRouter.post(base+"/fees/:chargeId/concessions/:concessionId/decision",authenticate,wrap(async(req,res)=>{const s=await scope(req,res,"fees.approve");if(!s)return;const p=z.object({decision:z.enum(["APPROVE","REJECT"]),reason:z.string().trim().min(10).max(500).optional()}).superRefine((v,ctx)=>{if(v.decision==="REJECT"&&!v.reason)ctx.addIssue({code:z.ZodIssueCode.custom,message:"A rejection reason is required"});}).safeParse(req.body);if(!p.success)return res.status(400).json({error:"Invalid concession decision",details:p.error.issues});const result=await withTenantContext(prisma,s,async tx=>{await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${s.organizationId+":" +s.schoolId+":fee-concession:"+req.params.chargeId})::bigint)`;const row=await tx.feeConcession.findFirst({where:{id:req.params.concessionId,chargeId:req.params.chargeId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!row)return {kind:"NOT_FOUND" as const};if(row.status!=="PENDING_APPROVAL")return {kind:"CONFLICT" as const};if(row.requestedBy===s.userId)return {kind:"SELF_APPROVAL" as const};if(p.data.decision==="APPROVE"){const charge=await tx.studentFeeCharge.findFirst({where:{id:row.chargeId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!charge||charge.status!=="DRAFT"||charge.approvalStatus!=="DRAFT")return {kind:"CHARGE_LOCKED" as const};const approved=await tx.feeConcession.findMany({where:{chargeId:charge.id,organizationId:s.organizationId,schoolId:s.schoolId,status:"APPROVED",id:{not:row.id}},select:{calculatedAmount:true}});const total=approved.reduce((sum:number,c:any)=>sum+Number(c.calculatedAmount),0);const remaining=Math.round((Number(charge.amount)-total)*100)/100;if(Number(row.calculatedAmount)>remaining)return {kind:"EXCEEDS" as const};}const updated=await tx.feeConcession.update({where:{id:row.id},data:{status:p.data.decision==="APPROVE"?"APPROVED":"REJECTED",decidedBy:s.userId,decisionReason:p.data.reason||null}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:`fee.concession.${p.data.decision.toLowerCase()}`,resourceType:"FeeConcession",resourceId:row.id,outcome:"SUCCESS",metadata:{chargeId:row.chargeId,reason:p.data.reason||null,calculatedAmount:row.calculatedAmount}}});return {kind:"DECIDED" as const,row:updated};});if(result.kind==="NOT_FOUND")return res.status(404).json({error:"Concession request not found"});if(result.kind==="CONFLICT")return res.status(409).json({error:"Concession request is not pending approval"});if(result.kind==="SELF_APPROVAL")return res.status(403).json({error:"The requester cannot approve their own concession"});if(result.kind==="CHARGE_LOCKED")return res.status(409).json({error:"The fee charge has moved beyond draft status; concession approval is blocked"});if(result.kind==="EXCEEDS")return res.status(409).json({error:"Approved concessions would exceed the fee charge"});return res.json({data:result.row});}));

parentRouter.get(base+"/fees", authenticate, wrap(async (req,res) => {
  const s=await scope(req,res,"fees.read"); if(!s)return;
  const page=parseParentListPage(req.query as Record<string,unknown>); if(!page)return res.status(400).json({error:"Invalid pagination parameters"});
  const studentId=typeof req.query.studentId==="string"?req.query.studentId:undefined;
  const where={organizationId:s.organizationId,schoolId:s.schoolId,...(studentId?{studentId}:{})};
  if(page.cursorId){const anchor=await withTenantContext(prisma,s,tx=>tx.studentFeeCharge.findFirst({where:{...where,id:page.cursorId},select:{id:true}}));if(!anchor)return res.status(400).json({error:"Pagination cursor is not valid for this school and filter"});}
  const canReadPaymentDetails=await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"fees.payments.read");
  const chargeSelect:any={id:true,studentId:true,chargeCode:true,title:true,category:true,currency:true,amount:true,amountPaid:true,dueAt:true,status:true,publishedAt:true,createdAt:true};
  if(canReadPaymentDetails)chargeSelect.payments={select:{id:true,amount:true,method:true,reference:true,paidAt:true,invoiceId:true,invoice:{select:{invoiceNumber:true,status:true}},installmentAllocations:{select:{amount:true,installment:{select:{sequence:true,dueAt:true}}}}},orderBy:{paidAt:"desc"},take:10};
  const rows=await withTenantContext(prisma,s,tx=>tx.studentFeeCharge.findMany({where,select:chargeSelect,orderBy:[{createdAt:"desc"},{id:"desc"}],take:page.limit+1,...(page.cursorId?{cursor:{id:page.cursorId},skip:1}:{})}));
  return res.json({data:buildParentListPage(rows,page.limit),paymentDetailsIncluded:canReadPaymentDetails});
}));
parentRouter.get(base+"/homework", authenticate, wrap(async (req,res) => {
  const s=await homeworkScope(req,res,"homework.read"); if(!s)return;
  const operatorAccess=await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"academics.manage");
  const page=parseParentListPage(req.query as Record<string,unknown>); if(!page)return res.status(400).json({error:"Invalid pagination parameters"});
  const studentId=typeof req.query.studentId==="string"?req.query.studentId:undefined;
  const where=await withTenantContext(prisma,s,async tx=>{
    if(operatorAccess)return {organizationId:s.organizationId,schoolId:s.schoolId,...(studentId?{studentId}:{})};
    const staff=await tx.staffMember.findFirst({where:{userId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,status:true}});
    if(!staff)return {organizationId:s.organizationId,schoolId:s.schoolId,studentId:"__no_teacher_profile__"};
    if(staff.status!=="ACTIVE")return {organizationId:s.organizationId,schoolId:s.schoolId,studentId:"__inactive_staff__"};
    const today=new Date();today.setHours(0,0,0,0);
    const assignments=await tx.teacherAssignment.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,staffMemberId:staff.id,isActive:true,OR:[{startsOn:null},{startsOn:{lte:today}}],AND:[{OR:[{endsOn:null},{endsOn:{gte:today}}]}]},select:{academicYearId:true,gradeLevelId:true,sectionName:true},take:100});
    if(!assignments.length)return {organizationId:s.organizationId,schoolId:s.schoolId,studentId:"__no_assigned_students__"};
    const enrollments=await tx.studentEnrollment.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,status:"ENROLLED",OR:assignments.map(a=>({academicYearId:a.academicYearId,gradeLevelId:a.gradeLevelId,sectionName:a.sectionName}))},select:{studentId:true},take:5000});
    const ids=[...new Set(enrollments.map(x=>x.studentId))];
    return {organizationId:s.organizationId,schoolId:s.schoolId,studentId:studentId?{in:ids.filter(id=>id===studentId)}:{in:ids}};
  });
  if(page.cursorId){const anchor=await withTenantContext(prisma,s,tx=>tx.homeworkAssignment.findFirst({where:{...where,id:page.cursorId},select:{id:true}}));if(!anchor)return res.status(400).json({error:"Pagination cursor is not valid for this school and filter"});}
  const rows=await withTenantContext(prisma,s,tx=>tx.homeworkAssignment.findMany({where,select:{id:true,studentId:true,title:true,subjectName:true,description:true,dueAt:true,status:true,publishedAt:true,createdAt:true},orderBy:[{createdAt:"desc"},{id:"desc"}],take:page.limit+1,...(page.cursorId?{cursor:{id:page.cursorId},skip:1}:{})}));
  return res.json({data:buildParentListPage(rows,page.limit)});
}));
parentRouter.get(base+"/report-cards", authenticate, wrap(async (req,res) => {
  const s=await scope(req,res,"reports.manage"); if(!s)return;
  const page=parseParentListPage(req.query as Record<string,unknown>); if(!page)return res.status(400).json({error:"Invalid pagination parameters"});
  const studentId=typeof req.query.studentId==="string"?req.query.studentId:undefined;
  const where={organizationId:s.organizationId,schoolId:s.schoolId,...(studentId?{studentId}:{})};
  if(page.cursorId){const anchor=await withTenantContext(prisma,s,tx=>tx.studentReportCard.findFirst({where:{...where,id:page.cursorId},select:{id:true}}));if(!anchor)return res.status(400).json({error:"Pagination cursor is not valid for this school and filter"});}
  const rows=await withTenantContext(prisma,s,tx=>tx.studentReportCard.findMany({where,select:{id:true,studentId:true,academicYearId:true,termLabel:true,resultSummary:true,teacherRemarks:true,principalRemarks:true,status:true,approvalStatus:true,publishedAt:true,createdAt:true},orderBy:[{createdAt:"desc"},{id:"desc"}],take:page.limit+1,...(page.cursorId?{cursor:{id:page.cursorId},skip:1}:{})}));
  return res.json({data:buildParentListPage(rows,page.limit)});
}));
parentRouter.get(base+"/notifications",authenticate,wrap(async(req,res)=>{
  const s=await scope(req,res,"parent.notifications.manage"); if(!s)return;
  const page=parseParentListPage(req.query as Record<string,unknown>); if(!page)return res.status(400).json({error:"Invalid pagination parameters"});
  const where={organizationId:s.organizationId,schoolId:s.schoolId};
  if(page.cursorId){const anchor=await withTenantContext(prisma,s,tx=>tx.parentNotification.findFirst({where:{...where,id:page.cursorId},select:{id:true}}));if(!anchor)return res.status(400).json({error:"Pagination cursor is not valid for this school"});}
  const rows=await withTenantContext(prisma,s,tx=>tx.parentNotification.findMany({where,select:{id:true,studentId:true,category:true,title:true,body:true,readAt:true,createdAt:true},orderBy:[{createdAt:"desc"},{id:"desc"}],take:page.limit+1,...(page.cursorId?{cursor:{id:page.cursorId},skip:1}:{})}));
  return res.json({data:{...buildParentListPage(rows,page.limit),recipientIdentityIncluded:false}});
}));
parentRouter.post(base+'/fees/:chargeId/submit-approval',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.manage');if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  const row=await tx.studentFeeCharge.findFirst({where:{id:req.params.chargeId,organizationId:s.organizationId,schoolId:s.schoolId}});
  if(!row)return null;if(row.status!=='DRAFT'||row.approvalStatus!=='DRAFT')return {conflict:true};
  const changed=await tx.studentFeeCharge.updateMany({where:{id:row.id,organizationId:s.organizationId,schoolId:s.schoolId,status:'DRAFT',approvalStatus:'DRAFT'},data:{approvalStatus:'PENDING_APPROVAL'}});
  if(!changed.count)return {conflict:true};
  const updated=await tx.studentFeeCharge.findFirst({where:{id:row.id,organizationId:s.organizationId,schoolId:s.schoolId}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.charge.submitted_for_approval',resourceType:'StudentFeeCharge',resourceId:row.id,outcome:'SUCCESS'}});return {row:updated};
 });
 if(!result)return res.status(404).json({error:'Fee charge not found'});if(result.conflict)return res.status(409).json({error:'Only draft fee charges can be submitted for approval'});return res.json({data:result.row});
}));
parentRouter.post(base+'/fees/:chargeId/approval-decision',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.approve');if(!s)return;
 const p=z.object({decision:z.enum(['APPROVE','REJECT']),reason:z.string().trim().max(1000).optional()}).refine(x=>x.decision!=='REJECT'||!!x.reason).safeParse(req.body);if(!p.success)return res.status(400).json({error:'A valid approval decision and rejection reason are required'});
 const result=await withTenantContext(prisma,s,async tx=>{
  const row=await tx.studentFeeCharge.findFirst({where:{id:req.params.chargeId,organizationId:s.organizationId,schoolId:s.schoolId}});
  if(!row)return null;if(row.createdBy===s.userId)return {selfApproval:true};if(row.approvalStatus!=='PENDING_APPROVAL'||row.status!=='DRAFT')return {conflict:true};
  const approvalStatus=p.data.decision==='APPROVE'?'APPROVED':'REJECTED';
  const changed=await tx.studentFeeCharge.updateMany({where:{id:row.id,organizationId:s.organizationId,schoolId:s.schoolId,status:'DRAFT',approvalStatus:'PENDING_APPROVAL'},data:{approvalStatus}});if(!changed.count)return {conflict:true};
  const updated=await tx.studentFeeCharge.findFirst({where:{id:row.id,organizationId:s.organizationId,schoolId:s.schoolId}});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:`student.fee.charge.${p.data.decision.toLowerCase()}`,resourceType:'StudentFeeCharge',resourceId:row.id,outcome:'SUCCESS',metadata:{reason:p.data.reason}}});return {row:updated};
 });
 if(!result)return res.status(404).json({error:'Fee charge not found'});if('selfApproval' in result)return res.status(403).json({error:'The fee charge author cannot approve or reject their own charge'});if('conflict' in result)return res.status(409).json({error:'Fee charge is not awaiting approval'});return res.json({data:result.row});
}));
parentRouter.patch(base+'/fees/:chargeId/publish',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'fees.manage');if(!s)return;
 const result=await withTenantContext(prisma,s,async tx=>{
  const row=await tx.studentFeeCharge.findFirst({where:{id:req.params.chargeId,organizationId:s.organizationId,schoolId:s.schoolId}});
  if(!row)return null;if(!isDraftPublishable(row.status)||row.approvalStatus!=="APPROVED")return {conflict:true};
  const publishedAt=new Date();
  const updated=await tx.studentFeeCharge.update({where:{id:row.id},data:{status:'PUBLISHED',publishedAt}});
  await postFeeCharge(tx,{organizationId:s.organizationId,schoolId:s.schoolId,actorUserId:s.userId,chargeId:row.id,amount:row.amount.toString(),currency:row.currency,postingDate:publishedAt});
  await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'student.fee.charge.published',resourceType:'StudentFeeCharge',resourceId:row.id,outcome:'SUCCESS'}});
  return {row:updated};
 });
 if(!result)return res.status(404).json({error:'Fee charge not found'});if(result.conflict)return res.status(409).json({error:'Only approved draft fee charges can be published'});return res.json({data:result.row});
}));
parentRouter.patch(base+'/homework/:assignmentId/publish',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'academics.manage');if(!s)return;const result=await withTenantContext(prisma,s,async tx=>{const row=await tx.homeworkAssignment.findFirst({where:{id:req.params.assignmentId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!row)return null;if(!isDraftPublishable(row.status)||row.approvalStatus!=="APPROVED")return {conflict:true};const updated=await tx.homeworkAssignment.update({where:{id:row.id},data:{status:'PUBLISHED',publishedAt:new Date()}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'homework.published',resourceType:'HomeworkAssignment',resourceId:row.id,outcome:'SUCCESS'}});return {row:updated};});if(!result)return res.status(404).json({error:'Homework assignment not found'});if(result.conflict)return res.status(409).json({error:'Only draft homework can be published'});return res.json({data:result.row});}));
parentRouter.patch(base+'/report-cards/:reportCardId/publish',authenticate,wrap(async(_req,res)=>res.status(409).json({error:'Direct publishing is disabled. Use the versioned approval and private PDF publication workflow.'})));

// P278 — school expense management workflow. Approval is recorded but ledger posting is deferred to P279.
const schoolExpenseSchema=z.object({expenseNumber:z.string().trim().min(2).max(40),title:z.string().trim().min(2).max(160),category:z.string().trim().min(2).max(60),vendorName:z.string().trim().max(160).optional(),description:z.string().max(2000).optional(),currency:z.string().length(3).default('INR'),amount:z.number().positive().max(100000000),expenseDate:z.string().date(),dueDate:z.string().date().optional(),reference:z.string().trim().max(120).optional()});
// P279 — expense reporting totals; calculations use integer minor units to avoid floating point drift.
parentRouter.get(base+'/finance/expense-report',authenticate,wrap(async(req,res)=>{
 const s=await scope(req,res,'accounting.expenses.read');if(!s)return;
 const from=typeof req.query.from==='string'?req.query.from:undefined;
 const to=typeof req.query.to==='string'?req.query.to:undefined;
 const datePattern=/^\\d{4}-\\d{2}-\\d{2}$/;
 if((from&&!datePattern.test(from))||(to&&!datePattern.test(to))||(from&&to&&from>to))return res.status(400).json({error:'Invalid expense report date range'});
 const dateRange:any={};if(from)dateRange.gte=new Date(`${from}T00:00:00.000Z`);if(to)dateRange.lte=new Date(`${to}T00:00:00.000Z`);
 const rows=await withTenantContext(prisma,s,tx=>tx.schoolExpense.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,...(from||to?{expenseDate:dateRange}:{})},select:{amount:true,currency:true,category:true,status:true,expenseDate:true,dueDate:true},take:5000}));
 const cents=(n:any)=>Math.round(Number(n||0)*100);const total:Record<string,number>={};const categoryTotals:Record<string,Record<string,number>>={};const statusTotals:Record<string,Record<string,number>>={};const monthlyTotals:Record<string,Record<string,number>>={};
 for(const row of rows){const currency=row.currency,amount=cents(row.amount),category=row.category||'UNCATEGORIZED',month=new Date(row.expenseDate).toISOString().slice(0,7);total[currency]=(total[currency]||0)+amount;categoryTotals[category]??={};categoryTotals[category][currency]=(categoryTotals[category][currency]||0)+amount;statusTotals[row.status]??={};statusTotals[row.status][currency]=(statusTotals[row.status][currency]||0)+amount;monthlyTotals[month]??={};monthlyTotals[month][currency]=(monthlyTotals[month][currency]||0)+amount;}
 const toMoney=(map:any)=>Object.fromEntries(Object.entries(map).map(([key,value]:any)=>[key,(value/100).toFixed(2)]));const nestedMoney=(map:any)=>Object.fromEntries(Object.entries(map).map(([key,value]:any)=>[key,toMoney(value)]));const now=new Date();const overdue=rows.filter((row:any)=>row.status==='APPROVED'&&row.dueDate&&new Date(row.dueDate)<now);const overdueTotals:Record<string,number>={};for(const row of overdue)overdueTotals[row.currency]=(overdueTotals[row.currency]||0)+cents(row.amount);
 return res.json({data:{period:{from:from||null,to:to||null},expenseCount:rows.length,totals:toMoney(total),categoryTotals:nestedMoney(categoryTotals),statusTotals:nestedMoney(statusTotals),monthlyTotals:nestedMoney(Object.fromEntries(Object.entries(monthlyTotals).sort(([a],[b])=>a.localeCompare(b)))),overdueApprovedCount:overdue.length,overdueApprovedTotals:toMoney(overdueTotals)}});
}));
parentRouter.get(base+'/finance/expenses',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'accounting.expenses.read');if(!s)return;const status=typeof req.query.status==='string'?req.query.status:undefined;const rows=await withTenantContext(prisma,s,tx=>tx.schoolExpense.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,...(status&&['DRAFT','SUBMITTED','APPROVED','REJECTED'].includes(status)?{status}:{})},orderBy:[{expenseDate:'desc'},{createdAt:'desc'}],take:200}));return res.json({data:rows});}));
parentRouter.post(base+'/finance/expenses',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'accounting.expenses.manage');if(!s)return;const p=schoolExpenseSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid expense details',details:p.error.flatten()});const data=p.data;const row=await withTenantContext(prisma,s,async tx=>{const duplicate=await tx.schoolExpense.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,expenseNumber:data.expenseNumber}});if(duplicate)throw Object.assign(new Error('Expense number already exists'),{status:409});const created=await tx.schoolExpense.create({data:{...data,expenseDate:new Date(`${data.expenseDate}T00:00:00.000Z`),dueDate:data.dueDate?new Date(`${data.dueDate}T00:00:00.000Z`):null,organizationId:s.organizationId,schoolId:s.schoolId,createdBy:s.userId,status:'DRAFT'}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'finance.expense.created',resourceType:'SchoolExpense',resourceId:created.id,outcome:'SUCCESS',metadata:{expenseNumber:created.expenseNumber,amount:String(created.amount),currency:created.currency}}});return created;});return res.status(201).json({data:row});}));
parentRouter.post(base+'/finance/expenses/:expenseId/submit',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'accounting.expenses.manage');if(!s)return;const row=await withTenantContext(prisma,s,async tx=>{const expense=await tx.schoolExpense.findFirst({where:{id:req.params.expenseId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!expense)return null;if(expense.status!=='DRAFT'&&expense.status!=='REJECTED')throw Object.assign(new Error('Only draft or rejected expenses can be submitted'),{status:409});const updated=await tx.schoolExpense.update({where:{id:expense.id},data:{status:'SUBMITTED',submittedAt:new Date(),rejectionReason:null,rejectedAt:null}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'finance.expense.submitted',resourceType:'SchoolExpense',resourceId:expense.id,outcome:'SUCCESS',metadata:{previousStatus:expense.status}}});return updated;});if(!row)return res.status(404).json({error:'Expense not found'});return res.json({data:row});}));
parentRouter.post(base+'/finance/expenses/:expenseId/decision',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'accounting.expenses.approve');if(!s)return;const p=z.object({decision:z.enum(['APPROVE','REJECT']),reason:z.string().trim().min(10).max(1000).optional()}).refine(d=>d.decision!=='REJECT'||Boolean(d.reason),{message:'Rejection reason is required'}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid expense decision',details:p.error.flatten()});const result=await withTenantContext(prisma,s,async tx=>{const expense=await tx.schoolExpense.findFirst({where:{id:req.params.expenseId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!expense)return null;if(expense.status!=='SUBMITTED')throw Object.assign(new Error('Only submitted expenses can be decided'),{status:409});if(expense.createdBy===s.userId&&p.data.decision==='APPROVE')throw Object.assign(new Error('Expense creator cannot approve their own expense'),{status:403});const updated=await tx.schoolExpense.update({where:{id:expense.id},data:p.data.decision==='APPROVE'?{status:'APPROVED',approvedAt:new Date(),approvedBy:s.userId}:{status:'REJECTED',rejectedAt:new Date(),rejectionReason:p.data.reason}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:p.data.decision==='APPROVE'?'finance.expense.approved':'finance.expense.rejected',resourceType:'SchoolExpense',resourceId:expense.id,outcome:'SUCCESS',metadata:{reason:p.data.reason||null}}});return updated;});if(!result)return res.status(404).json({error:'Expense not found'});return res.json({data:result});}));

// P280 — Communication Centre draft/publish lifecycle; actual recipient delivery is P281.
const schoolCommunicationSchema=z.object({title:z.string().trim().min(3).max(180),body:z.string().trim().min(10).max(10000),audience:z.enum(['ALL','PARENTS','TEACHERS','STUDENTS','STAFF']),targetAcademicYearId:z.string().trim().optional().nullable(),targetGradeLevelId:z.string().trim().optional().nullable(),targetSectionName:z.string().trim().max(40).optional().nullable(),priority:z.enum(['LOW','NORMAL','HIGH']).default('NORMAL')}).superRefine((v,ctx)=>{if((v.targetGradeLevelId||v.targetSectionName)&&!v.targetAcademicYearId)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Academic year is required for grade/section targeting',path:['targetAcademicYearId']});if(v.targetSectionName&&!v.targetGradeLevelId)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Grade is required when targeting a section',path:['targetGradeLevelId']});});
parentRouter.get(base+'/communications',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'communications.read');if(!s)return;const status=typeof req.query.status==='string'?req.query.status:undefined;const rows=await withTenantContext(prisma,s,tx=>tx.schoolCommunication.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,...(status&&['DRAFT','PUBLISHED'].includes(status)?{status}:{})},orderBy:{createdAt:'desc'},take:200}));return res.json({data:rows});}));
// P281 — recipient-scoped general in-app notification inbox and read status.
// P534 — school-scoped communication delivery summary. Recipient identities are intentionally not exposed here.
parentRouter.get(base+'/communications/:communicationId/delivery-summary',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'communications.read');if(!s)return;const result=await withTenantContext(prisma,s,async tx=>{const communication=await tx.schoolCommunication.findFirst({where:{id:req.params.communicationId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,status:true,publishedAt:true,title:true}});if(!communication)return null;if(communication.status!=='PUBLISHED')return {communication,totals:{total:0,delivered:0,pending:0,failed:0,read:0,unread:0},byChannel:[]};const outboxWhere={organizationId:s.organizationId,schoolId:s.schoolId,channel:'IN_APP',payload:{path:['communicationId'],equals:communication.id}};const [statusCounts,total,read,unread]=await Promise.all([tx.notificationOutbox.groupBy({by:['status'],where:outboxWhere,_count:{_all:true}}),tx.notificationOutbox.count({where:outboxWhere}),tx.notificationOutbox.count({where:{...outboxWhere,readAt:{not:null}}}),tx.notificationOutbox.count({where:{...outboxWhere,readAt:null}})]);const countFor=(status:string)=>statusCounts.find(x=>x.status===status)?._count._all||0;const totals={total,delivered:countFor('DELIVERED'),pending:countFor('PENDING')+countFor('PROCESSING'),failed:countFor('FAILED'),read,unread};return {communication,totals,byChannel:[{channel:'IN_APP',...totals}]};});if(!result)return res.status(404).json({error:'Communication not found'});return res.json({data:result});}));

parentRouter.get(base+'/communications/inbox',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'communications.read');if(!s)return;const limit=parseInboxLimit(req.query.limit);const unreadOnly=req.query.unread==='true';const grouped=req.query.grouped==='true';const cursorRaw=req.query.cursor;const cursor=cursorRaw===undefined?null:decodeInboxCursor(cursorRaw);if(cursorRaw!==undefined&&!cursor)return res.status(400).json({error:'Invalid inbox cursor; refresh the inbox'});const where={organizationId:s.organizationId,schoolId:s.schoolId,recipientUserId:s.userId,channel:'IN_APP',...(unreadOnly?{readAt:null}:{})};const result=await withTenantContext(prisma,s,async tx=>{const unreadCount=await tx.notificationOutbox.count({where:{organizationId:s.organizationId,schoolId:s.schoolId,recipientUserId:s.userId,channel:'IN_APP',readAt:null}});const rows=await tx.notificationOutbox.findMany({where:{...where,...(cursor?{OR:[{createdAt:{lt:new Date(cursor.createdAt)}},{createdAt:new Date(cursor.createdAt),id:{lt:cursor.id}}]}:{})},select:{id:true,category:true,status:true,payload:true,readAt:true,createdAt:true,deliveredAt:true},orderBy:[{createdAt:'desc'},{id:'desc'}],take:limit+1});const hasMore=rows.length>limit;const pageRows=rows.slice(0,limit);const last=pageRows.at(-1);return {rows:pageRows,hasMore,unreadCount,nextCursor:hasMore&&last?encodeInboxCursor({createdAt:last.createdAt.toISOString(),id:last.id}):null};});return res.json({data:result.rows,pagination:{limit,hasMore:result.hasMore,nextCursor:result.nextCursor},unreadCount:result.unreadCount,...(grouped?{groups:groupInboxRows(result.rows)}:{})});}));
parentRouter.get(base+'/communications/inbox/unread-count',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'communications.read');if(!s)return;const unreadCount=await withTenantContext(prisma,s,tx=>tx.notificationOutbox.count({where:{organizationId:s.organizationId,schoolId:s.schoolId,recipientUserId:s.userId,channel:'IN_APP',readAt:null}}));return res.json({data:{unreadCount}});}));
parentRouter.post(base+'/communications/inbox/:notificationId/read',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'communications.read');if(!s)return;const result=await withTenantContext(prisma,s,async tx=>{const row=await tx.notificationOutbox.findFirst({where:{id:req.params.notificationId,organizationId:s.organizationId,schoolId:s.schoolId,recipientUserId:s.userId,channel:'IN_APP'}});if(!row)return null;if(row.readAt)return row;return tx.notificationOutbox.update({where:{id:row.id},data:{readAt:new Date()}});});if(!result)return res.status(404).json({error:'Notification not found'});return res.json({data:result});}));
parentRouter.post(base+'/communications/inbox/read-all',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'communications.read');if(!s)return;const result=await withTenantContext(prisma,s,tx=>tx.notificationOutbox.updateMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,recipientUserId:s.userId,channel:'IN_APP',readAt:null},data:{readAt:new Date()}}));return res.json({data:{markedRead:result.count}});}));
parentRouter.post(base+'/communications',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'communications.manage');if(!s)return;const p=schoolCommunicationSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid communication details',details:p.error.flatten()});const row=await withTenantContext(prisma,s,async tx=>{const created=await tx.schoolCommunication.create({data:{...p.data,organizationId:s.organizationId,schoolId:s.schoolId,createdBy:s.userId,status:'DRAFT'}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'school.communication.created',resourceType:'SchoolCommunication',resourceId:created.id,outcome:'SUCCESS',metadata:{audience:created.audience,priority:created.priority}}});return created;});return res.status(201).json({data:row});}));
parentRouter.patch(base+'/communications/:communicationId/publish',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'communications.manage');if(!s)return;const result=await withTenantContext(prisma,s,async tx=>{const communication=await tx.schoolCommunication.findFirst({where:{id:req.params.communicationId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!communication)return null;if(communication.status!=='DRAFT')throw Object.assign(new Error('Only draft communications can be published'),{status:409});let targetStudentIds:string[]|null=null;if(communication.targetGradeLevelId||communication.targetSectionName){if(!communication.targetAcademicYearId)throw Object.assign(new Error('Academic year is required for targeted communications'),{status:400});const enrollments=await tx.studentEnrollment.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,academicYearId:communication.targetAcademicYearId,status:'ENROLLED',...(communication.targetGradeLevelId?{gradeLevelId:communication.targetGradeLevelId}:{}),...(communication.targetSectionName?{sectionName:communication.targetSectionName}:{})},select:{studentId:true}});targetStudentIds=[...new Set(enrollments.map(e=>e.studentId))];}let recipients:string[]=[],linksForParents:string[]=[];if(communication.audience==='ALL'){const members=await tx.schoolMembership.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,status:'ACTIVE'},select:{userId:true}});const nonParentAssignments=members.length?await tx.userRoleAssignment.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,scopeType:'SCHOOL',userId:{in:members.map(x=>x.userId)},role:{key:{not:'PARENT'}}},select:{userId:true}}):[];recipients.push(...nonParentAssignments.map(x=>x.userId));}if(['TEACHERS','STAFF','ALL'].includes(communication.audience)){const staff=await tx.staffMember.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,status:'ACTIVE',userId:{not:null}},select:{userId:true}});recipients.push(...staff.map(x=>x.userId).filter(Boolean) as string[]);}if(['PARENTS','STUDENTS','ALL'].includes(communication.audience)){const links=await tx.studentGuardian.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,canReceiveCommunications:true,...(targetStudentIds?{studentId:{in:targetStudentIds}}:{})},select:{studentId:true,guardianId:true,guardian:{select:{userId:true,isActive:true,emailVerifiedAt:true}}}});const guardianIds=links.map((x:any)=>x.guardianId);const consents=guardianIds.length?await tx.parentInvitation.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,guardianId:{in:guardianIds},status:'ACCEPTED',consentAcceptedAt:{not:null},consentWithdrawnAt:null,acceptedByUserId:{not:null}},select:{guardianId:true,acceptedByUserId:true}}):[];const consented=new Set(consents.map((x:any)=>`${x.guardianId}:${x.acceptedByUserId}`));linksForParents=links.filter((x:any)=>x.guardian?.isActive&&x.guardian?.emailVerifiedAt&&x.guardian?.userId&&consented.has(`${x.guardianId}:${x.guardian.userId}`)).map((x:any)=>x.guardian.userId as string);recipients.push(...linksForParents);if(communication.audience==='STUDENTS'||communication.audience==='ALL'){const studentLinks=await tx.studentAccountLink.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,isActive:true,...(targetStudentIds?{studentId:{in:targetStudentIds}}:{})},select:{userId:true}});recipients.push(...studentLinks.map(x=>x.userId));}}recipients=[...new Set(recipients)];const optOuts=recipients.length?await tx.notificationPreference.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,userId:{in:recipients},category:'GENERAL',channel:'IN_APP',enabled:false},select:{userId:true}}):[];const optedOut=new Set(optOuts.map((x:any)=>x.userId));recipients=recipients.filter(userId=>!optedOut.has(userId));const now=new Date();const published=await tx.schoolCommunication.update({where:{id:communication.id},data:{status:'PUBLISHED',publishedAt:now,publishedBy:s.userId}});let batchId:string|null=null;if(recipients.length){batchId=randomUUID();await tx.notificationBatch.create({data:{id:batchId,organizationId:s.organizationId,schoolId:s.schoolId,category:'GENERAL',title:communication.title,createdBy:s.userId,recipientCount:recipients.length}});await tx.notificationOutbox.createMany({data:recipients.map(recipientUserId=>({id:randomUUID(),organizationId:s.organizationId,schoolId:s.schoolId,batchId:batchId!,recipientUserId,category:'GENERAL',channel:'IN_APP',status:'DELIVERED',payload:{title:communication.title,body:communication.body,communicationId:communication.id,audience:communication.audience,priority:communication.priority},attempts:1,deliveredAt:now})),skipDuplicates:true});if(['PARENTS','STUDENTS','ALL'].includes(communication.audience)){const parentRecipients=recipients.filter(userId=>linksForParents?.includes(userId));if(parentRecipients.length)await tx.parentNotification.createMany({data:parentRecipients.map(recipientUserId=>({organizationId:s.organizationId,schoolId:s.schoolId,recipientUserId,category:'GENERAL',title:communication.title,body:communication.body,createdBy:s.userId})),skipDuplicates:true});}}await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'school.communication.published',resourceType:'SchoolCommunication',resourceId:communication.id,outcome:'SUCCESS',metadata:{audience:communication.audience,priority:communication.priority,recipientCount:recipients.length,batchId}}});return {communication:published,recipientCount:recipients.length,batchId};});if(!result)return res.status(404).json({error:'Communication not found'});return res.json({data:result,message:'Communication published and in-app notification fan-out created. Email/push delivery is not part of this phase.'});}));

async function notifyMessageUsers(tx:any,organizationId:string,schoolId:string,createdBy:string,title:string,body:string,recipientIds:string[],threadId:string,messageId:string){const unique=[...new Set(recipientIds.filter(id=>id&&id!==createdBy))];if(!unique.length)return 0;const optOuts=await tx.notificationPreference.findMany({where:{organizationId,schoolId,userId:{in:unique},category:'GENERAL',channel:'IN_APP',enabled:false},select:{userId:true}});const blocked=new Set(optOuts.map((x:any)=>x.userId));const recipients=unique.filter(id=>!blocked.has(id));if(!recipients.length)return 0;const batchId=randomUUID(),now=new Date();await tx.notificationBatch.create({data:{id:batchId,organizationId,schoolId,category:'GENERAL',title,createdBy,recipientCount:recipients.length}});await tx.notificationOutbox.createMany({data:recipients.map(recipientUserId=>({id:randomUUID(),organizationId,schoolId,batchId,recipientUserId,category:'GENERAL',channel:'IN_APP',status:'DELIVERED',payload:{title,body,threadId,messageId},attempts:1,deliveredAt:now})),skipDuplicates:true});return recipients.length;}
// P285 — school messaging threads: parent-owned threads, staff shared queue, replies and closure.
const messageCreateSchema=z.object({subject:z.string().trim().min(3).max(160),category:z.enum(['GENERAL','ACADEMIC','FINANCE','TRANSPORT','ATTENDANCE','OTHER']).default('GENERAL'),body:z.string().trim().min(10).max(4000)});
const messageReplySchema=z.object({body:z.string().trim().min(2).max(4000)});
parentRouter.get(base+'/portal/messages',authenticate,wrap(async(req,res)=>{const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.notifications.read'))return res.status(403).json({error:'Parent messaging access and active consent are required'});const data=await withTenantContext(prisma,{organizationId,schoolId,userId},tx=>tx.schoolMessageThread.findMany({where:{organizationId,schoolId,createdBy:userId},include:{messages:{orderBy:{createdAt:'asc'}}},orderBy:{lastMessageAt:'desc'},take:100}));return res.json({data});}));
parentRouter.post(base+'/portal/messages',authenticate,wrap(async(req,res)=>{const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.notifications.read'))return res.status(403).json({error:'Parent messaging access and active consent are required'});const p=messageCreateSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid message details',details:p.error.flatten()});const row=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const thread=await tx.schoolMessageThread.create({data:{organizationId,schoolId,subject:p.data.subject,category:p.data.category,createdBy:userId,creatorRole:'PARENT',status:'OPEN'}});const message=await tx.schoolMessage.create({data:{organizationId,schoolId,threadId:thread.id,senderUserId:userId,senderRole:'PARENT',body:p.data.body}});await tx.auditLog.create({data:{actorUserId:userId,organizationId,schoolId,action:'school.message.thread.created',resourceType:'SchoolMessageThread',resourceId:thread.id,outcome:'SUCCESS',metadata:{category:thread.category}}});const staff=await tx.staffMember.findMany({where:{organizationId,schoolId,status:'ACTIVE',userId:{not:null}},select:{userId:true}});await notifyMessageUsers(tx,organizationId,schoolId,userId,'New parent message',`${p.data.subject}: ${p.data.body.slice(0,300)}`,staff.map((x:any)=>x.userId).filter(Boolean) as string[],thread.id,message.id);return {...thread,messages:[message]};});return res.status(201).json({data:row});}));
parentRouter.post(base+'/portal/messages/:threadId/reply',authenticate,wrap(async(req,res)=>{const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.notifications.read'))return res.status(403).json({error:'Parent messaging access and active consent are required'});const p=messageReplySchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Message body is required'});const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const thread=await tx.schoolMessageThread.findFirst({where:{id:req.params.threadId,organizationId,schoolId,createdBy:userId}});if(!thread)return null;if(thread.status!=='OPEN')throw Object.assign(new Error('Closed threads cannot receive replies'),{status:409});const message=await tx.schoolMessage.create({data:{organizationId,schoolId,threadId:thread.id,senderUserId:userId,senderRole:'PARENT',body:p.data.body}});await tx.schoolMessageThread.update({where:{id:thread.id},data:{lastMessageAt:new Date()}});await tx.auditLog.create({data:{actorUserId:userId,organizationId,schoolId,action:'school.message.parent.replied',resourceType:'SchoolMessageThread',resourceId:thread.id,outcome:'SUCCESS',metadata:{messageId:message.id}}});const staff=await tx.staffMember.findMany({where:{organizationId,schoolId,status:'ACTIVE',userId:{not:null}},select:{userId:true}});await notifyMessageUsers(tx,organizationId,schoolId,userId,'Parent replied',p.data.body.slice(0,300),staff.map((x:any)=>x.userId).filter(Boolean) as string[],thread.id,message.id);return message;});if(!result)return res.status(404).json({error:'Message thread not found'});return res.status(201).json({data:result});}));
parentRouter.post(base+'/portal/messages/:threadId/close',authenticate,wrap(async(req,res)=>{const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.notifications.read'))return res.status(403).json({error:'Parent messaging access and active consent are required'});const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const updated=await tx.schoolMessageThread.updateMany({where:{id:req.params.threadId,organizationId,schoolId,createdBy:userId,status:'OPEN'},data:{status:'CLOSED'}});if(updated.count)await tx.auditLog.create({data:{actorUserId:userId,organizationId,schoolId,action:'school.message.thread.closed.parent',resourceType:'SchoolMessageThread',resourceId:req.params.threadId,outcome:'SUCCESS',metadata:{}}});return updated;});return res.json({data:{closed:result.count>0}});}));
parentRouter.get(base+'/messages',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'communications.read');if(!s)return;const data=await withTenantContext(prisma,s,tx=>tx.schoolMessageThread.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},include:{messages:{orderBy:{createdAt:'asc'}}},orderBy:{lastMessageAt:'desc'},take:200}));return res.json({data});}));
parentRouter.post(base+'/messages/:threadId/reply',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'communications.manage');if(!s)return;const p=messageReplySchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Message body is required'});const result=await withTenantContext(prisma,s,async tx=>{const thread=await tx.schoolMessageThread.findFirst({where:{id:req.params.threadId,organizationId:s.organizationId,schoolId:s.schoolId,status:'OPEN'}});if(!thread)return null;const message=await tx.schoolMessage.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,threadId:thread.id,senderUserId:s.userId,senderRole:'STAFF',body:p.data.body}});await tx.schoolMessageThread.update({where:{id:thread.id},data:{lastMessageAt:new Date()}});await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'school.message.staff.replied',resourceType:'SchoolMessageThread',resourceId:thread.id,outcome:'SUCCESS',metadata:{messageId:message.id}}});const guardianIds=await consentedGuardianIds(tx,thread.createdBy,s.organizationId,s.schoolId);const linkedGuardian=guardianIds.length?await tx.guardian.findFirst({where:{id:{in:guardianIds},userId:thread.createdBy,isActive:true,emailVerifiedAt:{not:null}},select:{id:true}}):null;if(linkedGuardian){await notifyMessageUsers(tx,s.organizationId,s.schoolId,s.userId,'School replied',p.data.body.slice(0,300),[thread.createdBy],thread.id,message.id);await tx.parentNotification.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,recipientUserId:thread.createdBy,category:'GENERAL',title:'School replied',body:p.data.body,createdBy:s.userId}});}return message;});if(!result)return res.status(404).json({error:'Open message thread not found'});return res.status(201).json({data:result});}));
parentRouter.patch(base+'/messages/:threadId/close',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'communications.manage');if(!s)return;const result=await withTenantContext(prisma,s,async tx=>{const updated=await tx.schoolMessageThread.updateMany({where:{id:req.params.threadId,organizationId:s.organizationId,schoolId:s.schoolId,status:'OPEN'},data:{status:'CLOSED'}});if(updated.count)await tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:'school.message.thread.closed.staff',resourceType:'SchoolMessageThread',resourceId:req.params.threadId,outcome:'SUCCESS',metadata:{}}});return updated;});if(!result.count)return res.status(404).json({error:'Open message thread not found'});return res.json({data:{closed:true}});}));

// P558 — parent-visible library circulation for consented, linked children.
parentRouter.get(base+'/portal/library',authenticate,wrap(async(req,res)=>{const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.portal.read'))return res.status(403).json({error:'Parent portal access and consent are required'});const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);const links=await tx.studentGuardian.findMany({where:{organizationId,schoolId,guardianId:{in:guardianIds},canReceiveCommunications:true},select:{studentId:true}});const studentIds=[...new Set(links.map(l=>l.studentId))];if(!studentIds.length)return {loans:[],reservations:[],reminders:[]};const loans=await tx.libraryLoan.findMany({where:{organizationId,schoolId,borrowerId:{in:studentIds}},include:{copy:{include:{book:true}}},orderBy:{issuedAt:'desc'},take:300});const reservations=await tx.libraryReservation.findMany({where:{organizationId,schoolId,borrowerId:{in:studentIds}},include:{book:true},orderBy:{createdAt:'desc'},take:200});const activeQueue=await tx.libraryReservation.findMany({where:{organizationId,schoolId,status:'ACTIVE'},select:{id:true,bookId:true,createdAt:true},orderBy:[{createdAt:'asc'},{id:'asc'}],take:5000});const reservationsWithPosition=reservations.map(r=>({...r,queuePosition:r.status==='ACTIVE'?activeQueue.filter(q=>q.bookId===r.bookId&&(q.createdAt<r.createdAt||(q.createdAt.getTime()===r.createdAt.getTime()&&q.id<=r.id))).length+1:null}));const now=new Date(),limit=new Date(now.getTime()+3*86400000);const reminders=loans.filter(l=>!l.returnedAt&&l.dueAt<=limit).map(l=>({loanId:l.id,studentId:l.borrowerId,title:l.copy.book.title,dueAt:l.dueAt,overdue:l.dueAt<now,daysUntilDue:Math.ceil((l.dueAt.getTime()-now.getTime())/86400000)}));return {loans,reservations:reservationsWithPosition,reminders};});return res.json({data});}));

// P563 — consent-scoped parent transport route visibility and privacy-safe live status.
parentRouter.get(base+'/portal/transport-fees',authenticate,wrap(async(req,res)=>{const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.portal.read'))return res.status(403).json({error:'Parent portal access and consent are required'});const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);if(!guardianIds.length)return {invoices:[],totals:{invoiced:0,paid:0,due:0}};const links=await tx.studentGuardian.findMany({where:{organizationId,schoolId,guardianId:{in:guardianIds},canReceiveCommunications:true},select:{studentId:true}});const studentIds=[...new Set(links.map((x:any)=>x.studentId))];const invoices=await tx.transportFeeInvoice.findMany({where:{organizationId,schoolId,studentId:{in:studentIds}},include:{payments:{select:{amount:true,method:true,paidAt:true,reference:true,receiptNumber:true}}},orderBy:{issuedAt:'desc'},take:500});return {invoices,totals:invoices.reduce((a:any,i:any)=>({invoiced:a.invoiced+Number(i.netAmount),paid:a.paid+Number(i.amountPaid),due:a.due+Number(i.amountDue)}),{invoiced:0,paid:0,due:0})};});return res.json({data});}));
parentRouter.get(base+'/portal/transport',authenticate,wrap(async(req,res)=>{const {organizationId,schoolId}=req.params,userId=req.auth!.userId;if(!await parentScope(userId,organizationId,schoolId,'parent.portal.read'))return res.status(403).json({error:'Parent portal access and consent are required'});const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);if(!guardianIds.length)return {children:[]};const links=await tx.studentGuardian.findMany({where:{organizationId,schoolId,guardianId:{in:guardianIds},canReceiveCommunications:true},select:{studentId:true}});const studentIds=[...new Set(links.map((x:any)=>x.studentId))];if(!studentIds.length)return {children:[]};const allocations=await tx.transportAllocation.findMany({where:{organizationId,schoolId,studentId:{in:studentIds},status:'ACTIVE'},include:{route:{include:{stops:{orderBy:{sequence:'asc'}},trips:{where:{tripDate:{gte:new Date(new Date().setHours(0,0,0,0))}},orderBy:{tripDate:'desc'},take:3}}}},orderBy:{createdAt:'desc'}});const students=await tx.student.findMany({where:{id:{in:studentIds},organizationId,schoolId},select:{id:true,firstName:true,lastName:true,preferredName:true,admissionNumber:true}});const routeIds=[...new Set(allocations.map((a:any)=>a.routeId))];const routes=await tx.transportRoute.findMany({where:{id:{in:routeIds},organizationId,schoolId},select:{id:true,driverId:true,vehicleId:true}});const vehicleIds=[...new Set(routes.map((r:any)=>r.vehicleId).filter(Boolean))];const vehicles=await tx.transportVehicle.findMany({where:{id:{in:vehicleIds},organizationId,schoolId},select:{id:true,registrationNumber:true,vehicleType:true}});const gps=await tx.transportGpsConfig.findUnique({where:{organizationId_schoolId:{organizationId,schoolId}}});const now=new Date(),freshAfter=new Date(now.getTime()-5*60*1000);const children=await Promise.all(allocations.map(async(a:any)=>{const student=students.find((x:any)=>x.id===a.studentId);if(!student)return null;const trips=a.route.trips||[],tripIds=trips.map((t:any)=>t.id),routeMeta=routes.find((r:any)=>r.id===a.routeId);const attendance=tripIds.length?await tx.transportTripAttendance.findMany({where:{organizationId,schoolId,studentId:a.studentId,tripId:{in:tripIds}},orderBy:{recordedAt:'desc'},take:10}):[];const events=tripIds.length?await tx.transportTripEvent.findMany({where:{organizationId,schoolId,tripId:{in:tripIds},studentId:a.studentId},orderBy:{eventAt:'desc'},take:10}):[];let liveLocation=null;if(gps?.enabled&&routeMeta?.driverId){const consent=await tx.transportGpsConsent.findFirst({where:{organizationId,schoolId,personnelId:routeMeta.driverId,consentGranted:true,revokedAt:null}});if(consent){const ping=await tx.transportLocationPing.findFirst({where:{organizationId,schoolId,personnelId:routeMeta.driverId,tripId:{in:tripIds.length?tripIds:['__no_current_trip__']},capturedAt:{gte:freshAfter},expiresAt:{gt:now}},orderBy:{capturedAt:'desc'},select:{latitude:true,longitude:true,accuracyMeters:true,capturedAt:true}});if(ping)liveLocation={latitude:Number(ping.latitude),longitude:Number(ping.longitude),accuracyMeters:ping.accuracyMeters?Number(ping.accuracyMeters):null,capturedAt:ping.capturedAt};}}return {student:{id:student.id,name:student.preferredName||[student.firstName,student.lastName].filter(Boolean).join(' '),admissionNumber:student.admissionNumber},route:{id:a.route.id,name:a.route.name,stops:a.route.stops.map((st:any)=>({id:st.id,name:st.name,sequence:st.sequence,pickupTime:st.pickupTime,dropTime:st.dropTime,latitude:st.latitude===null?null:Number(st.latitude),longitude:st.longitude===null?null:Number(st.longitude)}))},vehicle:vehicles.find((v:any)=>v.id===routeMeta?.vehicleId)||null,allocationStopId:a.stopId,trips:trips.map((t:any)=>({id:t.id,direction:t.direction,status:t.status,tripDate:t.tripDate,attendance:attendance.filter((x:any)=>x.tripId===t.id),events:events.filter((x:any)=>x.tripId===t.id)})),liveLocation,locationFreshnessMinutes:5};}));return {children:children.filter(Boolean)};});return res.json({data,privacy:{liveLocationOnlyWhenGpsEnabledAndDriverConsentActive:true,locationMustBeRecentMinutes:5,coordinatesOnlyForLinkedChildren:true}});}));


// P568 — guardian portal hostel leave requests and explicit leave-notification consent.
const parentHostelLeaveInput=z.object({
 requestedDeparture:z.string().datetime(),expectedReturn:z.string().datetime(),
 reason:z.string().trim().min(3).max(1000),destination:z.string().trim().max(240).optional(),
 contactNumber:z.string().trim().max(30).optional()
});
parentRouter.get("/:organizationId/:schoolId/portal/children/:studentId/hostel-leaves",authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;
 if(!await parentScope(userId,organizationId,schoolId,"parent.hostel.read"))return res.status(403).json({error:"Verified guardian membership, consent and hostel permission are required"});
 const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  if(!await parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId))return null;
  return tx.hostelLeaveRequest.findMany({where:{organizationId,schoolId,studentId:req.params.studentId},include:{gatePasses:{orderBy:{createdAt:"desc"}}},orderBy:{createdAt:"desc"},take:100});
 });
 if(!data)return res.status(404).json({error:"Student is not linked to this guardian"});
 return res.json({data:data.map((leave:any)=>({...leave,gatePass:leave.gatePasses?.[0]||null,gatePasses:undefined}))});
}));
parentRouter.get("/:organizationId/:schoolId/portal/children/:studentId/hostel-consent",authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;
 if(!await parentScope(userId,organizationId,schoolId,"parent.hostel.read"))return res.status(403).json({error:"Verified guardian membership and hostel permission are required"});
 const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);
  const link=guardianIds.length?await tx.studentGuardian.findFirst({where:{organizationId,schoolId,studentId:req.params.studentId,guardianId:{in:guardianIds},canReceiveCommunications:true},select:{id:true}}):null;
  if(!link)return null;
  return tx.hostelGuardianConsent.findMany({where:{organizationId,schoolId,studentId:req.params.studentId,guardianId:{in:guardianIds}},select:{leaveUpdatesEnabled:true,inAppEnabled:true,emailEnabled:true,consentVersion:true,grantedAt:true,revokedAt:true,updatedAt:true}});
 });
 if(!data)return res.status(404).json({error:"Student is not linked to this guardian"});
 return res.json({data});
}));
parentRouter.put("/:organizationId/:schoolId/portal/children/:studentId/hostel-consent",authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;
 if(!await parentScope(userId,organizationId,schoolId,"parent.hostel.manage"))return res.status(403).json({error:"Verified guardian membership and hostel consent-management permission are required"});
 const p=z.object({leaveUpdatesEnabled:z.boolean(),inAppEnabled:z.boolean(),emailEnabled:z.boolean()}).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:"Invalid hostel leave notification preferences"});
 if(p.data.leaveUpdatesEnabled&&!p.data.inAppEnabled&&!p.data.emailEnabled)return res.status(400).json({error:"Enable at least one notification channel or disable leave updates"});
 const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const guardianIds=await consentedGuardianIds(tx,userId,organizationId,schoolId);
  const links=guardianIds.length?await tx.studentGuardian.findMany({where:{organizationId,schoolId,studentId:req.params.studentId,guardianId:{in:guardianIds},canReceiveCommunications:true},include:{guardian:{select:{id:true,emailVerifiedAt:true}}}}):[];
  if(!links.length)return null;
  if(p.data.emailEnabled&&links.some((x:any)=>!x.guardian.emailVerifiedAt))throw Object.assign(new Error("Email notification consent requires a verified guardian email"),{status:409});
  const now=new Date(),rows=[];
  for(const link of links){
   rows.push(await tx.hostelGuardianConsent.upsert({
    where:{organizationId_schoolId_studentId_guardianId:{organizationId,schoolId,studentId:req.params.studentId,guardianId:link.guardianId}},
    create:{organizationId,schoolId,studentId:req.params.studentId,guardianId:link.guardianId,...p.data,consentVersion:"hostel-leave-v1",grantedAt:p.data.leaveUpdatesEnabled?now:null,revokedAt:p.data.leaveUpdatesEnabled?null:now,updatedBy:userId},
    update:{...p.data,consentVersion:"hostel-leave-v1",grantedAt:p.data.leaveUpdatesEnabled?now:undefined,revokedAt:p.data.leaveUpdatesEnabled?null:now,updatedBy:userId}
   }));
  }
  await tx.auditLog.create({data:{actorUserId:userId,organizationId,schoolId,action:p.data.leaveUpdatesEnabled?"parent.hostel.leave-consent.granted":"parent.hostel.leave-consent.revoked",resourceType:"HostelGuardianConsent",resourceId:rows[0].id,outcome:"SUCCESS",metadata:{studentId:req.params.studentId,channels:{inApp:p.data.inAppEnabled,email:p.data.emailEnabled},consentVersion:"hostel-leave-v1"}}});
  return rows.map((x:any)=>({leaveUpdatesEnabled:x.leaveUpdatesEnabled,inAppEnabled:x.inAppEnabled,emailEnabled:x.emailEnabled,consentVersion:x.consentVersion,grantedAt:x.grantedAt,revokedAt:x.revokedAt}));
 });
 if(!result)return res.status(404).json({error:"Student is not linked to this guardian"});
 return res.json({data:result});
}));
parentRouter.post("/:organizationId/:schoolId/portal/children/:studentId/hostel-leaves",authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;
 if(!await parentScope(userId,organizationId,schoolId,"parent.hostel.manage"))return res.status(403).json({error:"Verified guardian membership and hostel leave permission are required"});
 const p=parentHostelLeaveInput.safeParse(req.body);
 if(!p.success)return res.status(400).json({error:"Invalid leave request",details:p.error.flatten()});
 const departure=new Date(p.data.requestedDeparture),expectedReturn=new Date(p.data.expectedReturn),now=new Date();
 if(departure<=now||expectedReturn<=departure)return res.status(400).json({error:"Departure must be in the future and return must be later"});
 const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  if(!await parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId))return {kind:"NOT_LINKED" as const};
  const allocation=await tx.hostelAllocation.findFirst({where:{organizationId,schoolId,studentId:req.params.studentId,status:"ACTIVE"},select:{id:true}});
  if(!allocation)return {kind:"NO_ALLOCATION" as const};
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${organizationId}:${schoolId}:hostel-leave-student:${req.params.studentId}`);
  const overlap=await tx.hostelLeaveRequest.findFirst({where:{organizationId,schoolId,studentId:req.params.studentId,status:{in:["PENDING","APPROVED","LATE_RETURN"]},requestedDeparture:{lt:expectedReturn},expectedReturn:{gt:departure}}});
  if(overlap)return {kind:"OVERLAP" as const};
  const leave=await tx.hostelLeaveRequest.create({data:{organizationId,schoolId,studentId:req.params.studentId,allocationId:allocation.id,requestedDeparture:departure,expectedReturn,reason:p.data.reason,destination:p.data.destination,contactNumber:p.data.contactNumber,status:"PENDING",createdBy:userId}});
  await tx.auditLog.create({data:{actorUserId:userId,organizationId,schoolId,action:"parent.hostel.leave-request.created",resourceType:"HostelLeaveRequest",resourceId:leave.id,outcome:"SUCCESS",metadata:{studentId:req.params.studentId,requestedDeparture:departure.toISOString(),expectedReturn:expectedReturn.toISOString()}}});
  await notifyHostelLeaveGuardians(tx,{organizationId,schoolId,leaveRequestId:leave.id,studentId:leave.studentId,eventType:"REQUESTED",title:"Hostel leave request submitted",body:"A hostel leave request has been submitted and is awaiting warden review.",createdBy:userId});
  return {kind:"OK" as const,leave};
 });
 if(result.kind==="NOT_LINKED")return res.status(404).json({error:"Student is not linked to this guardian"});
 if(result.kind==="NO_ALLOCATION")return res.status(409).json({error:"Student does not have an active hostel allocation"});
 if(result.kind==="OVERLAP")return res.status(409).json({error:"An overlapping pending or approved leave request already exists"});
 return res.status(201).json({data:result.leave});
}));
parentRouter.patch("/:organizationId/:schoolId/portal/children/:studentId/hostel-leaves/:leaveRequestId",authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;
 if(!await parentScope(userId,organizationId,schoolId,"parent.hostel.manage"))return res.status(403).json({error:"Verified guardian membership and hostel leave permission are required"});
 const p=parentHostelLeaveInput.partial().strict().refine(x=>Object.keys(x).length>0).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:"Invalid leave update",details:p.error.flatten()});
 const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  if(!await parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId))return {kind:"NOT_LINKED" as const};
  const leave=await tx.hostelLeaveRequest.findFirst({where:{id:req.params.leaveRequestId,organizationId,schoolId,studentId:req.params.studentId,status:"PENDING"}});
  if(!leave)return {kind:"NOT_PENDING" as const};
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${organizationId}:${schoolId}:hostel-leave-student:${req.params.studentId}`);
  const departure=p.data.requestedDeparture?new Date(p.data.requestedDeparture):leave.requestedDeparture;
  const expected=p.data.expectedReturn?new Date(p.data.expectedReturn):leave.expectedReturn;
  if(departure<=new Date()||expected<=departure)return {kind:"INVALID_WINDOW" as const};
  const overlap=await tx.hostelLeaveRequest.findFirst({where:{id:{not:leave.id},organizationId,schoolId,studentId:req.params.studentId,status:{in:["PENDING","APPROVED","LATE_RETURN"]},requestedDeparture:{lt:expected},expectedReturn:{gt:departure}}});
  if(overlap)return {kind:"OVERLAP" as const};
  const updated=await tx.hostelLeaveRequest.update({where:{id:leave.id},data:{...p.data,requestedDeparture:departure,expectedReturn:expected}});
  await tx.auditLog.create({data:{actorUserId:userId,organizationId,schoolId,action:"parent.hostel.leave-request.updated",resourceType:"HostelLeaveRequest",resourceId:leave.id,outcome:"SUCCESS",metadata:{updatedFields:Object.keys(p.data)}}});
  await notifyHostelLeaveGuardians(tx,{organizationId,schoolId,leaveRequestId:leave.id,studentId:leave.studentId,eventType:"UPDATED",title:"Hostel leave request updated",body:"A pending hostel leave request has been updated.",createdBy:userId});
  return {kind:"OK" as const,leave:updated};
 });
 if(result.kind==="NOT_LINKED")return res.status(404).json({error:"Student is not linked to this guardian"});
 if(result.kind==="NOT_PENDING")return res.status(409).json({error:"Only pending leave requests can be edited"});
 if(result.kind==="INVALID_WINDOW")return res.status(400).json({error:"Departure must be in the future and return must be later"});
 if(result.kind==="OVERLAP")return res.status(409).json({error:"An overlapping leave request already exists"});
 return res.json({data:result.leave});
}));
parentRouter.post("/:organizationId/:schoolId/portal/children/:studentId/hostel-leaves/:leaveRequestId/cancel",authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;
 if(!await parentScope(userId,organizationId,schoolId,"parent.hostel.manage"))return res.status(403).json({error:"Verified guardian membership and hostel leave permission are required"});
 const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  if(!await parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId))return {kind:"NOT_LINKED" as const};
  const leave=await tx.hostelLeaveRequest.findFirst({where:{id:req.params.leaveRequestId,organizationId,schoolId,studentId:req.params.studentId,status:{in:["PENDING","APPROVED"]}},include:{gatePasses:{orderBy:{createdAt:"desc"}}}});
  if(!leave)return {kind:"NOT_CANCELLABLE" as const};
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`${organizationId}:${schoolId}:hostel-leave-student:${req.params.studentId}`);
  if(leave.gatePasses?.some((pass:any)=>pass.passType==="RESIDENT_OUT"&&["CHECKED_OUT","RETURNED","RETURNED_LATE","USED"].includes(pass.status)))return {kind:"ALREADY_DEPARTED" as const};
  const gatePass=leave.gatePasses?.find((pass:any)=>pass.passType==="RESIDENT_OUT"&&["PENDING","APPROVED"].includes(pass.status));
  if(gatePass)await tx.hostelGatePass.update({where:{id:gatePass.id},data:{status:"CANCELLED"}});
  const updated=await tx.hostelLeaveRequest.update({where:{id:leave.id},data:{status:"CANCELLED",cancelledAt:new Date(),cancelledBy:userId}});
  await tx.auditLog.create({data:{actorUserId:userId,organizationId,schoolId,action:"parent.hostel.leave-request.cancelled",resourceType:"HostelLeaveRequest",resourceId:leave.id,outcome:"SUCCESS",metadata:{gatePassId:gatePass?.id||null}}});
  await notifyHostelLeaveGuardians(tx,{organizationId,schoolId,leaveRequestId:leave.id,studentId:leave.studentId,eventType:"CANCELLED",title:"Hostel leave request cancelled",body:"The hostel leave request has been cancelled.",createdBy:userId});
  return {kind:"OK" as const,leave:updated};
 });
 if(result.kind==="NOT_LINKED")return res.status(404).json({error:"Student is not linked to this guardian"});
 if(result.kind==="NOT_CANCELLABLE")return res.status(409).json({error:"This leave request cannot be cancelled"});
 if(result.kind==="ALREADY_DEPARTED")return res.status(409).json({error:"The resident has already departed; contact the hostel warden"});
 return res.json({data:result.leave});
}));

// P570 — parent-visible hostel invoices and recorded payment status; no payment initiation is implied.
parentRouter.get("/:organizationId/:schoolId/portal/children/:studentId/hostel-fees",authenticate,wrap(async(req,res)=>{
 const {organizationId,schoolId}=req.params,userId=req.auth!.userId;
 if(!await parentScope(userId,organizationId,schoolId,"parent.portal.read"))return res.status(403).json({error:"Parent portal access and consent are required"});
 const data=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  if(!await parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId))return null;
  const invoices=await tx.hostelFeeInvoice.findMany({where:{organizationId,schoolId,studentId:req.params.studentId},select:{id:true,invoiceNumber:true,periodStart:true,periodEnd:true,dueAt:true,baseAmount:true,concessionAmount:true,lateFeeAmount:true,totalAmount:true,paidAmount:true,status:true,createdAt:true},orderBy:{dueAt:"desc"},take:200});
  const invoiceIds=invoices.map((x:any)=>x.id);
  const payments=invoiceIds.length?await tx.hostelPaymentRecord.findMany({where:{organizationId,schoolId,invoiceId:{in:invoiceIds},status:"RECORDED"},select:{id:true,invoiceId:true,amount:true,method:true,reference:true,status:true,recordedAt:true},orderBy:{recordedAt:"desc"},take:500}):[];
  return {invoices:invoices.map((i:any)=>({...i,calculation:undefined})),payments,totals:invoices.reduce((a:any,i:any)=>({invoiced:a.invoiced+Number(i.totalAmount),paid:a.paid+Number(i.paidAmount),due:a.due+Math.max(0,Number(i.totalAmount)-Number(i.paidAmount))}),{invoiced:0,paid:0,due:0})};
 });
 if(!data)return res.status(404).json({error:"Student is not linked to this guardian"});
 return res.json({data});
}));
