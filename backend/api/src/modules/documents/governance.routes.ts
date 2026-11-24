import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext } from "../auth/tenant-context.js";
import { hasSchoolPermission } from "../auth/school-permissions.js";
import { hasActiveSchoolMembership } from "../schools/school-config.authorization.js";

export const governanceRouter = Router();
const wrap=(fn:(req:any,res:any)=>Promise<any>)=>(req:any,res:any,next:any)=>Promise.resolve(fn(req,res)).catch(next);
async function governanceScope(req:any,res:any){
 const organizationId=String(req.params.organizationId||""),schoolId=String(req.params.schoolId||""),userId=req.auth!.userId;
 if(!await hasActiveSchoolMembership(userId,organizationId,schoolId)){res.status(403).json({error:"Active school membership required"});return null;}
 if(!await hasSchoolPermission(userId,organizationId,schoolId,"school.settings.manage")){res.status(403).json({error:"School settings governance permission required"});return null;}
 return {organizationId,schoolId,userId};
}
async function audit(s:any,action:string,resourceType:string,resourceId:string,metadata?:any){
 await withTenantContext(prisma,s,(tx:any)=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action,resourceType,resourceId,outcome:"SUCCESS",...(metadata?{metadata}: {})}}));
}
governanceRouter.use(authenticate);


governanceRouter.get("/:organizationId/:schoolId/governance/consent-events",wrap(async(req,res)=>{
 const s=await governanceScope(req,res);if(!s)return;
 const rows=await withTenantContext(prisma,s,(tx:any)=>tx.dataConsentEvent.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},orderBy:{occurredAt:"desc"},take:200}));
 return res.json({data:rows});
}));

governanceRouter.get("/:organizationId/:schoolId/governance/requests",wrap(async(req,res)=>{
 const s=await governanceScope(req,res);if(!s)return;
 const rows=await withTenantContext(prisma,s,(tx:any)=>tx.dataGovernanceRequest.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},orderBy:{requestedAt:"desc"},take:100}));
 return res.json({data:rows});
}));
governanceRouter.post("/:organizationId/:schoolId/governance/requests",wrap(async(req,res)=>{
 const s=await governanceScope(req,res);if(!s)return;
 const p=z.object({requestType:z.enum(["ACCESS","EXPORT","ERASURE","CORRECTION"]),subjectType:z.enum(["STUDENT","GUARDIAN","STAFF"]),subjectId:z.string().min(1).max(100),requesterName:z.string().trim().min(2).max(150),requesterEmail:z.string().email().max(254).optional(),relationship:z.string().trim().max(80).optional(),reason:z.string().trim().max(1000).optional(),dueAt:z.string().datetime().optional()}).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:"Invalid data governance request",details:p.error.flatten()});
 const subject=await withTenantContext(prisma,s,async(tx:any)=>{
  if(p.data.subjectType==="STUDENT")return tx.student.findFirst({where:{id:p.data.subjectId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});
  if(p.data.subjectType==="GUARDIAN")return tx.guardian.findFirst({where:{id:p.data.subjectId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});
  return tx.staffMember.findFirst({where:{id:p.data.subjectId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});
 });
 if(!subject)return res.status(404).json({error:"Data subject not found in this school"});
 const row=await withTenantContext(prisma,s,(tx:any)=>tx.dataGovernanceRequest.create({data:{...p.data,organizationId:s.organizationId,schoolId:s.schoolId,dueAt:p.data.dueAt?new Date(p.data.dueAt):undefined}}));
 await audit(s,"governance.request.created","DataGovernanceRequest",row.id,{requestType:row.requestType,subjectType:row.subjectType});
 return res.status(201).json({data:row});
}));
governanceRouter.post("/:organizationId/:schoolId/governance/requests/:requestId/review",wrap(async(req,res)=>{
 const s=await governanceScope(req,res);if(!s)return;
 const p=z.object({decision:z.enum(["UNDER_REVIEW","APPROVED","REJECTED","COMPLETED"]),resolutionNotes:z.string().trim().max(2000).optional()}).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:"Invalid governance decision"});
 const row=await withTenantContext(prisma,s,async(tx:any)=>{
  const current=await tx.dataGovernanceRequest.findFirst({where:{id:req.params.requestId,organizationId:s.organizationId,schoolId:s.schoolId}});
  if(!current)return null;
  const allowed:Record<string,string[]>={REQUESTED:["UNDER_REVIEW","APPROVED","REJECTED"],UNDER_REVIEW:["APPROVED","REJECTED"],APPROVED:[],REJECTED:[],COMPLETED:[]};
  if(!allowed[current.status]?.includes(p.data.decision))throw Object.assign(new Error(`Invalid request transition: ${current.status} to ${p.data.decision}`),{status:409});
  if(p.data.decision==="COMPLETED")throw Object.assign(new Error("Completion is disabled until an approved export/erasure/correction execution workflow is implemented"),{status:409});
  return tx.dataGovernanceRequest.update({where:{id:current.id},data:{status:p.data.decision,reviewedBy:s.userId,reviewedAt:new Date(),resolutionNotes:p.data.resolutionNotes}});
 });
 if(!row)return res.status(404).json({error:"Governance request not found"});
 await audit(s,"governance.request.reviewed","DataGovernanceRequest",row.id,{status:row.status});
 return res.json({data:row});
}));

governanceRouter.get("/:organizationId/:schoolId/governance/legal-holds",wrap(async(req,res)=>{
 const s=await governanceScope(req,res);if(!s)return;
 const rows=await withTenantContext(prisma,s,(tx:any)=>tx.documentLegalHold.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},orderBy:{placedAt:"desc"},take:200}));
 return res.json({data:rows});
}));
governanceRouter.post("/:organizationId/:schoolId/governance/legal-holds",wrap(async(req,res)=>{
 const s=await governanceScope(req,res);if(!s)return;
 const p=z.object({targetType:z.enum(["STUDENT_DOCUMENT","STAFF_DOCUMENT","HOMEWORK_ATTACHMENT"]),targetId:z.string().min(1).max(100),reason:z.string().trim().min(5).max(1000),authorityReference:z.string().trim().max(200).optional()}).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:"Invalid legal hold request",details:p.error.flatten()});
 const exists=await withTenantContext(prisma,s,async(tx:any)=>{
  if(p.data.targetType==="STUDENT_DOCUMENT")return tx.studentDocument.findFirst({where:{id:p.data.targetId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});
  if(p.data.targetType==="STAFF_DOCUMENT")return tx.staffDocument.findFirst({where:{id:p.data.targetId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});
  return tx.homeworkSubmissionAttachment.findFirst({where:{id:p.data.targetId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}});
 });
 if(!exists)return res.status(404).json({error:"Document not found in this school"});
 const row=await withTenantContext(prisma,s,async(tx:any)=>{
  const active=await tx.documentLegalHold.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,targetType:p.data.targetType,targetId:p.data.targetId,releasedAt:null}});
  if(active)return active;
  return tx.documentLegalHold.create({data:{...p.data,organizationId:s.organizationId,schoolId:s.schoolId,placedBy:s.userId}});
 });
 await audit(s,"governance.legal_hold.placed","DocumentLegalHold",row.id,{targetType:row.targetType,targetId:row.targetId});
 return res.status(201).json({data:row});
}));
governanceRouter.post("/:organizationId/:schoolId/governance/legal-holds/:holdId/release",wrap(async(req,res)=>{
 const s=await governanceScope(req,res);
 if(!s)return;
 const p=z.object({releaseReason:z.string().trim().min(5).max(1000)}).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:"A release reason is required"});
 const row=await withTenantContext(prisma,s,async(tx:any)=>{
  const current=await tx.documentLegalHold.findFirst({where:{id:req.params.holdId,organizationId:s.organizationId,schoolId:s.schoolId,releasedAt:null}});
  if(!current)return null;
  return tx.documentLegalHold.update({where:{id:current.id},data:{releasedAt:new Date(),releasedBy:s.userId,releaseReason:p.data.releaseReason}});
 });
 if(!row)return res.status(404).json({error:"Active legal hold not found"});
 await audit(s,"governance.legal_hold.released","DocumentLegalHold",row.id);
 return res.json({data:row});
}));

governanceRouter.get("/:organizationId/:schoolId/governance/retention-policies",wrap(async(req,res)=>{
 const s=await governanceScope(req,res);if(!s)return;
 const rows=await withTenantContext(prisma,s,(tx:any)=>tx.documentRetentionPolicy.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},orderBy:{recordType:"asc"}}));
 return res.json({data:rows});
}));
governanceRouter.post("/:organizationId/:schoolId/governance/retention-policies",wrap(async(req,res)=>{
 const s=await governanceScope(req,res);if(!s)return;
 const p=z.object({recordType:z.enum(["STUDENT_DOCUMENT","STAFF_DOCUMENT","HOMEWORK_ATTACHMENT"]),retentionDays:z.number().int().min(1).max(36500),enabled:z.boolean().default(true)}).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:"Invalid retention policy",details:p.error.flatten()});
 const row=await withTenantContext(prisma,s,(tx:any)=>tx.documentRetentionPolicy.upsert({where:{schoolId_recordType:{schoolId:s.schoolId,recordType:p.data.recordType}},create:{...p.data,organizationId:s.organizationId,schoolId:s.schoolId,updatedBy:s.userId},update:{retentionDays:p.data.retentionDays,enabled:p.data.enabled,updatedBy:s.userId}}));
 await audit(s,"governance.retention_policy.saved","DocumentRetentionPolicy",row.id,{recordType:row.recordType,retentionDays:row.retentionDays,enabled:row.enabled});
 return res.json({data:row});
}));
governanceRouter.get("/:organizationId/:schoolId/governance/retention-preview",wrap(async(req,res)=>{
 const s=await governanceScope(req,res);if(!s)return;
 const policies=await withTenantContext(prisma,s,(tx:any)=>tx.documentRetentionPolicy.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,enabled:true}}));
 const preview:any[]=[];
 for(const policy of policies){
  const cutoff=new Date(Date.now()-policy.retentionDays*86400000);
  const rows=await withTenantContext(prisma,s,(tx:any)=>{
   const where={organizationId:s.organizationId,schoolId:s.schoolId,createdAt:{lt:cutoff},securityStatus:"CLEAN"};
   if(policy.recordType==="STUDENT_DOCUMENT")return tx.studentDocument.findMany({where,select:{id:true,createdAt:true},take:100});
   if(policy.recordType==="STAFF_DOCUMENT")return tx.staffDocument.findMany({where,select:{id:true,createdAt:true},take:100});
   return tx.homeworkSubmissionAttachment.findMany({where,select:{id:true,createdAt:true},take:100});
  });
  for(const row of rows){
   const held=await withTenantContext(prisma,s,(tx:any)=>tx.documentLegalHold.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,targetType:policy.recordType,targetId:row.id,releasedAt:null},select:{id:true}}));
   preview.push({recordType:policy.recordType,id:row.id,createdAt:row.createdAt,eligibleForReview:!held,blockedByLegalHold:Boolean(held)});
  }
 }
 return res.json({data:{items:preview,automaticDeletion:false,note:"This is a review-only preview. No document is deleted by this endpoint."}});
}));
