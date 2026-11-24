import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext } from "../auth/tenant-context.js";
import { hasSchoolPermission } from "../auth/school-permissions.js";
import { hasActiveSchoolMembership } from "../schools/school-config.authorization.js";

export const securityOperationsRouter = Router();
securityOperationsRouter.use(authenticate);
const wrap=(fn:(req:any,res:any)=>Promise<any>)=>(req:any,res:any,next:any)=>Promise.resolve(fn(req,res)).catch(next);
const categories=["SECURITY_RISK","INCIDENT","COMPLIANCE_EVIDENCE","DR_RECOVERY"] as const;
const statuses=["OPEN","IN_PROGRESS","MITIGATED","RESOLVED","ACCEPTED","VERIFIED"] as const;
async function scope(req:any,res:any){
 const organizationId=String(req.params.organizationId||""),schoolId=String(req.params.schoolId||""),userId=req.auth!.userId;
 if(!await hasActiveSchoolMembership(userId,organizationId,schoolId)){res.status(403).json({error:"Active school membership required"});return null;}
 if(!await hasSchoolPermission(userId,organizationId,schoolId,"school.settings.manage")){res.status(403).json({error:"Security operations permission required"});return null;}
 return {organizationId,schoolId,userId};
}
securityOperationsRouter.get("/:organizationId/:schoolId/security-operations",wrap(async(req,res)=>{
 const s=await scope(req,res);if(!s)return;
 const category=typeof req.query.category==="string"?req.query.category:undefined;
 if(category&&!categories.includes(category as any))return res.status(400).json({error:"Unknown security operations category"});
 const data=await withTenantContext(prisma,s,(tx:any)=>tx.securityOperationsRecord.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,...(category?{category}:{})},orderBy:[{createdAt:"desc"}],take:250}));
 return res.json({data});
}));
securityOperationsRouter.post("/:organizationId/:schoolId/security-operations",wrap(async(req,res)=>{
 const s=await scope(req,res);if(!s)return;
 const parsed=z.object({category:z.enum(categories),title:z.string().trim().min(3).max(200),description:z.string().trim().min(5).max(4000),severity:z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]).default("MEDIUM"),status:z.enum(statuses).default("OPEN"),ownerUserId:z.string().max(100).optional(),dueAt:z.string().datetime().optional(),evidenceReference:z.string().trim().max(500).optional(),metadata:z.record(z.unknown()).optional()}).safeParse(req.body);
 if(!parsed.success)return res.status(400).json({error:"Invalid security operations record",details:parsed.error.flatten()});
 const row=await withTenantContext(prisma,s,(tx:any)=>tx.securityOperationsRecord.create({data:{...parsed.data,dueAt:parsed.data.dueAt?new Date(parsed.data.dueAt):undefined,organizationId:s.organizationId,schoolId:s.schoolId,createdBy:s.userId,updatedBy:s.userId}}));
 await withTenantContext(prisma,s,(tx:any)=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"security_operations.record.created",resourceType:"SecurityOperationsRecord",resourceId:row.id,outcome:"SUCCESS",metadata:{category:row.category,severity:row.severity}}}));
 return res.status(201).json({data:row});
}));
securityOperationsRouter.patch("/:organizationId/:schoolId/security-operations/:recordId",wrap(async(req,res)=>{
 const s=await scope(req,res);if(!s)return;
 const parsed=z.object({status:z.enum(statuses).optional(),severity:z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]).optional(),ownerUserId:z.string().max(100).nullable().optional(),dueAt:z.string().datetime().nullable().optional(),evidenceReference:z.string().trim().max(500).nullable().optional(),description:z.string().trim().min(5).max(4000).optional()}).refine(v=>Object.keys(v).length>0).safeParse(req.body);
 if(!parsed.success)return res.status(400).json({error:"Invalid security operations update"});
 const row=await withTenantContext(prisma,s,async(tx:any)=>{const current=await tx.securityOperationsRecord.findFirst({where:{id:req.params.recordId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!current)return null;return tx.securityOperationsRecord.update({where:{id:current.id},data:{...parsed.data,dueAt:parsed.data.dueAt===null?null:parsed.data.dueAt?new Date(parsed.data.dueAt):undefined,updatedBy:s.userId}});});
 if(!row)return res.status(404).json({error:"Security operations record not found"});
 await withTenantContext(prisma,s,(tx:any)=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"security_operations.record.updated",resourceType:"SecurityOperationsRecord",resourceId:row.id,outcome:"SUCCESS",metadata:{status:row.status,category:row.category}}}));
 return res.json({data:row});
}));
