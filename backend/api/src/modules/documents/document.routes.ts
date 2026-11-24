import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext } from "../auth/tenant-context.js";
import { hasSchoolPermission } from "../auth/school-permissions.js";
import { hasActiveSchoolMembership } from "../schools/school-config.authorization.js";
import { createUploadUrl, verifyUploadedObject, createDownloadUrl, promoteCleanObject, deleteObject } from "./document-storage.js";
import { isDocumentDownloadable, verifyDocumentScanSignature, validDocumentObjectMetadata } from "./document-security.js";
import { enqueueDocumentScan } from "./document-scan-queue.js";
import { canTeacherAccessStudent } from "../students/teacher-student-access.js";

export const documentRouter = Router();
export const documentScanRouter = Router();
const wrap = (fn: (req: any, res: any) => Promise<any>) => (req: any, res: any, next: any) => Promise.resolve(fn(req,res)).catch(next);
async function scope(req:any,res:any,permission:string) {
  const organizationId=String(req.params.organizationId||""), schoolId=String(req.params.schoolId||""), userId=req.auth!.userId;
  if(!await hasActiveSchoolMembership(userId,organizationId,schoolId)){res.status(403).json({error:"Active school membership required"});return null;}
  if(!await hasSchoolPermission(userId,organizationId,schoolId,permission)){res.status(403).json({error:`Missing required permission: ${permission}`});return null;}
  return {organizationId,schoolId,userId};
}
const date=(v?:string)=>v?new Date(`${v}T00:00:00.000Z`):undefined;

// Parent access to a homework attachment is bound to the exact authenticated
// account that accepted the consent notice, a verified active guardian, and
// the guardian-to-student communication link for this school.
async function hasConsentedGuardianStudentLink(tx:any,userId:string,organizationId:string,schoolId:string,studentId:string) {
  const invitations=await tx.parentInvitation.findMany({where:{organizationId,schoolId,status:"ACCEPTED",acceptedByUserId:userId,consentAcceptedAt:{not:null},consentWithdrawnAt:null},select:{guardianId:true}});
  const guardianIds=[...new Set(invitations.map((row:any)=>row.guardianId))];
  if(!guardianIds.length)return false;
  const guardian=await tx.guardian.findFirst({where:{id:{in:guardianIds},userId,organizationId,schoolId,isActive:true,emailVerifiedAt:{not:null},studentLinks:{some:{organizationId,schoolId,studentId,canReceiveCommunications:true}}},select:{id:true}});
  return Boolean(guardian);
}

documentRouter.use(authenticate);
async function createUpload(req:any,res:any,kind:"student"|"staff") {
  const permission=kind==="student"?"students.pii.read":"staff.pii.read";
  const s=await scope(req,res,permission); if(!s)return;
  if(!await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,kind==="student"?"students.update":"staff.update"))return res.status(403).json({error:"Missing document upload permission"});
  const documentTypeSchema=kind==="student"?z.enum(["BIRTH_CERTIFICATE","TRANSFER_CERTIFICATE","PHOTO","ADDRESS_PROOF","IDENTITY_PROOF","MEDICAL","PREVIOUS_MARKSHEET","CONSENT","OTHER"]):z.enum(["IDENTITY_PROOF","ADDRESS_PROOF","EDUCATION_CERTIFICATE","EXPERIENCE_LETTER","CONTRACT","APPOINTMENT_LETTER","POLICE_VERIFICATION","MEDICAL","OTHER"]);
  const p=z.object({documentType:documentTypeSchema,displayName:z.string().trim().min(1).max(150),mimeType:z.enum(["application/pdf","image/jpeg","image/png"]),sizeBytes:z.number().int().positive().max(25*1024*1024),issuedAt:z.string().date().optional(),expiresAt:z.string().date().optional()}).refine(v=>!v.issuedAt||!v.expiresAt||v.expiresAt>=v.issuedAt).safeParse(req.body);
  if(!p.success)return res.status(400).json({error:"Invalid document upload request",details:p.error.flatten()});
  const id=randomUUID(); const key=`quarantine/${s.organizationId}/${s.schoolId}/${kind}/${id}`;
  const upload=await createUploadUrl(key,p.data.mimeType,id);
  const data=await withTenantContext(prisma,s,async tx=>{
    if(kind==="student"){
      const student=await tx.student.findFirst({where:{id:req.params.studentId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}}); if(!student)throw Object.assign(new Error("Student not found"),{status:404});
      if(!await canTeacherAccessStudent(tx,s.userId,s.organizationId,s.schoolId,student.id))throw Object.assign(new Error("Student document access is not permitted"),{status:404});
      const d=await tx.studentDocument.create({data:{id,organizationId:s.organizationId,schoolId:s.schoolId,studentId:student.id,documentType:p.data.documentType as any,displayName:p.data.displayName,objectKey:key,mimeType:p.data.mimeType,sizeBytes:BigInt(p.data.sizeBytes),issuedAt:date(p.data.issuedAt),expiresAt:date(p.data.expiresAt),uploadedBy:s.userId,securityStatus:"PENDING_UPLOAD"}}); return d;
    }
    const staff=await tx.staffMember.findFirst({where:{id:req.params.staffId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true}}); if(!staff)throw Object.assign(new Error("Staff member not found"),{status:404});
    return tx.staffDocument.create({data:{id,organizationId:s.organizationId,schoolId:s.schoolId,staffMemberId:staff.id,documentType:p.data.documentType as any,displayName:p.data.displayName,objectKey:key,mimeType:p.data.mimeType,sizeBytes:BigInt(p.data.sizeBytes),issuedAt:date(p.data.issuedAt),expiresAt:date(p.data.expiresAt),uploadedBy:s.userId,securityStatus:"PENDING_UPLOAD"}});
  });
  await withTenantContext(prisma,s,tx=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:`${kind}.document.upload.initiated`,resourceType:kind==="student"?"StudentDocument":"StaffDocument",resourceId:id,outcome:"SUCCESS"}}));
  return res.status(201).json({data:{id:data.id,objectKey:key,upload,expiresInSeconds:300,securityStatus:"PENDING_UPLOAD",maxBytes:25*1024*1024,uploadMethod:"POST"}});
}
// Student homework attachments: require an active verified student account link and own submission.
documentRouter.post("/:organizationId/:schoolId/documents/homework/student/:submissionId/upload",wrap(async(req,res)=>{
 const organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId),userId=req.auth!.userId;
 const p=z.object({displayName:z.string().trim().min(1).max(150),mimeType:z.enum(["application/pdf","image/jpeg","image/png"]),sizeBytes:z.number().int().positive().max(25*1024*1024)}).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:"Invalid homework attachment upload request"});
 const link=await withPlatformContext(prisma,tx=>tx.studentAccountLink.findFirst({where:{organizationId,schoolId,userId,isActive:true,student:{status:"ACTIVE"}},select:{studentId:true}}));
 if(!link)return res.status(403).json({error:"Active student account link required"});
 const id=randomUUID(),key=`quarantine/${organizationId}/${schoolId}/homework/${id}`;
 const result=await withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const submission=await tx.homeworkSubmission.findFirst({where:{id:req.params.submissionId,organizationId,schoolId,studentId:link.studentId,status:{not:"GRADED"},homeworkAssignment:{status:"PUBLISHED"}},select:{id:true,studentId:true}});
  if(!submission)return null;
  const upload=await createUploadUrl(key,p.data.mimeType,id);
  const row=await tx.homeworkSubmissionAttachment.create({data:{id,organizationId,schoolId,submissionId:submission.id,displayName:p.data.displayName,mimeType:p.data.mimeType,sizeBytes:BigInt(p.data.sizeBytes),objectKey:key,uploadedBy:userId,securityStatus:"PENDING_UPLOAD"}});
  return {row,upload};
 });
 if(!result)return res.status(404).json({error:"Own published homework submission not found or already graded"});
 return res.status(201).json({data:{id:result.row.id,upload:result.upload,uploadMethod:"POST",expiresInSeconds:300,maxBytes:25*1024*1024,securityStatus:"PENDING_UPLOAD"}});
}));

// Homework submission attachments use the same private quarantine/scan/promote pipeline.
documentRouter.post("/:organizationId/:schoolId/documents/homework/:submissionId/upload",wrap(async(req,res)=>{
 const s=await scope(req,res,"parent.homework.read");if(!s)return;
 const p=z.object({displayName:z.string().trim().min(1).max(150),mimeType:z.enum(["application/pdf","image/jpeg","image/png"]),sizeBytes:z.number().int().positive().max(25*1024*1024)}).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:"Invalid homework attachment upload request"});
 const id=randomUUID(),key=`quarantine/${s.organizationId}/${s.schoolId}/homework/${id}`;
 const result=await withTenantContext(prisma,s,async tx=>{
  const submission=await tx.homeworkSubmission.findFirst({where:{id:req.params.submissionId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,studentId:true,status:true,homeworkAssignment:{select:{status:true}}}});
  if(!submission||submission.homeworkAssignment.status!=="PUBLISHED"||submission.status==="GRADED")return null;
  if(!await hasConsentedGuardianStudentLink(tx,s.userId,s.organizationId,s.schoolId,submission.studentId))return null;
  const upload=await createUploadUrl(key,p.data.mimeType,id);
  const row=await tx.homeworkSubmissionAttachment.create({data:{id,organizationId:s.organizationId,schoolId:s.schoolId,submissionId:submission.id,displayName:p.data.displayName,mimeType:p.data.mimeType,sizeBytes:BigInt(p.data.sizeBytes),objectKey:key,uploadedBy:s.userId,securityStatus:"PENDING_UPLOAD"}});
  return {row,upload};
 });
 if(!result)return res.status(404).json({error:"Submission unavailable or parent consent/link is inactive"});
 return res.status(201).json({data:{id:result.row.id,upload:result.upload,uploadMethod:"POST",expiresInSeconds:300,maxBytes:25*1024*1024,securityStatus:"PENDING_UPLOAD"}});
}));

documentRouter.post("/:organizationId/:schoolId/documents/student/:studentId/upload",wrap((req,res)=>createUpload(req,res,"student")));
documentRouter.post("/:organizationId/:schoolId/documents/staff/:staffId/upload",wrap((req,res)=>createUpload(req,res,"staff")));

documentRouter.post("/:organizationId/:schoolId/documents/:documentId/complete",wrap(async(req,res)=>{
  const kind=req.body?.kind; if(!["student","staff","homework","homework-student"].includes(kind))return res.status(400).json({error:"kind must be student, staff, homework or homework-student"}); const organizationId=String(req.params.organizationId||""),schoolId=String(req.params.schoolId||""),userId=req.auth!.userId; let s:any;if(kind==="homework-student"){const link=await withPlatformContext(prisma,tx=>tx.studentAccountLink.findFirst({where:{organizationId,schoolId,userId,isActive:true,student:{status:"ACTIVE"}},select:{studentId:true}}));if(!link)return res.status(403).json({error:"Active student account link required"});s={organizationId,schoolId,userId};}else{s=await scope(req,res,kind==="staff"?"staff.pii.read":kind==="homework"?"parent.homework.read":"students.pii.read");if(!s)return;}if(kind!=="homework"&&kind!=="homework-student"&&!await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,kind==="staff"?"staff.update":"students.update"))return res.status(403).json({error:"Missing document completion permission"});
  const result=await withTenantContext(prisma,s,async tx=>{
    const doc=kind==="student"?await tx.studentDocument.findFirst({where:{id:req.params.documentId,organizationId:s.organizationId,schoolId:s.schoolId}}):kind==="staff"?await tx.staffDocument.findFirst({where:{id:req.params.documentId,organizationId:s.organizationId,schoolId:s.schoolId}}):await tx.homeworkSubmissionAttachment.findFirst({where:{id:req.params.documentId,organizationId:s.organizationId,schoolId:s.schoolId},include:{submission:{select:{studentId:true,homeworkAssignment:{select:{status:true}}}}}});
    if(!doc)return null;
    if(kind==="student"&&!await canTeacherAccessStudent(tx,s.userId,s.organizationId,s.schoolId,(doc as any).studentId))return null;
    if(kind==="homework") {if(!await hasConsentedGuardianStudentLink(tx,s.userId,s.organizationId,s.schoolId,(doc as any).submission.studentId)||(doc as any).submission.homeworkAssignment.status!=="PUBLISHED")return null;}
    if(kind==="homework-student") {const link=await withPlatformContext(prisma,ctx=>ctx.studentAccountLink.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,userId:s.userId,isActive:true,student:{status:"ACTIVE"}},select:{studentId:true}}));if(!link||(doc as any).submission.studentId!==link.studentId||(doc as any).submission.homeworkAssignment.status!=="PUBLISHED")return null;}
    if(doc.securityStatus!=="PENDING_UPLOAD")throw Object.assign(new Error("Document is not awaiting upload completion"),{status:409});
    const head=await verifyUploadedObject(doc.objectKey);
    if(!validDocumentObjectMetadata({expectedId:doc.id,expectedSize:Number(doc.sizeBytes),expectedMime:doc.mimeType||"",actualId:head.documentId,actualSize:head.sizeBytes,actualMime:head.mimeType})){await deleteObject(doc.objectKey);throw Object.assign(new Error("Uploaded object metadata does not match the authorized upload"),{status:400});}
    if(kind==="student")return tx.studentDocument.update({where:{id:doc.id},data:{securityStatus:"QUARANTINED"}});
    if(kind==="staff")return tx.staffDocument.update({where:{id:doc.id},data:{securityStatus:"QUARANTINED"}});
    return tx.homeworkSubmissionAttachment.update({where:{id:doc.id},data:{securityStatus:"QUARANTINED"}});
  });
  if(!result)return res.status(404).json({error:"Document not found"});
  await withTenantContext(prisma,s,tx=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"document.upload.quarantined",resourceType:"Document",resourceId:req.params.documentId,outcome:"SUCCESS"}}));
  try { await enqueueDocumentScan(kind==="homework-student"?"homework":kind,req.params.documentId); } catch { /* worker reconciles QUARANTINED rows */ }
  return res.json({data:{id:result.id,securityStatus:"QUARANTINED",message:"Upload received; download remains blocked until malware scanning approves it."}});
}));

documentRouter.get("/:organizationId/:schoolId/documents/:documentId/download",wrap(async(req,res)=>{
  const kind=req.query.kind==="staff"?"staff":req.query.kind==="homework"?"homework":"student";
  const permission=kind==="staff"?"staff.pii.read":kind==="homework"?"parent.homework.read":kind==="homework-student"?"students.read":"students.pii.read";
  let s:any;
  if(kind==="homework") {const organizationId=String(req.params.organizationId||""),schoolId=String(req.params.schoolId||""),userId=req.auth!.userId;if(!await hasActiveSchoolMembership(userId,organizationId,schoolId)){res.status(403).json({error:"Active school membership required"});return;}if(!await hasSchoolPermission(userId,organizationId,schoolId,"parent.homework.read")&&!await hasSchoolPermission(userId,organizationId,schoolId,"homework.read")&&!await hasSchoolPermission(userId,organizationId,schoolId,"academics.manage")){res.status(403).json({error:"Homework permission required"});return;}s={organizationId,schoolId,userId};}
  else {s=await scope(req,res,permission);if(!s)return;}
  const doc=await withTenantContext(prisma,s,async tx=>{
    if(kind==="student") {
      const document = await tx.studentDocument.findFirst({where:{id:req.params.documentId,organizationId:s.organizationId,schoolId:s.schoolId}});
      if(!document || !await canTeacherAccessStudent(tx,s.userId,s.organizationId,s.schoolId,document.studentId))return null;
      return document;
    }
    if(kind==="staff")return tx.staffDocument.findFirst({where:{id:req.params.documentId,organizationId:s.organizationId,schoolId:s.schoolId}});
    const attachment=await tx.homeworkSubmissionAttachment.findFirst({where:{id:req.params.documentId,organizationId:s.organizationId,schoolId:s.schoolId},include:{submission:{select:{studentId:true,homeworkAssignment:{select:{status:true}}}}}});
    if(!attachment||attachment.submission.homeworkAssignment.status!=="PUBLISHED")return null;
    if(await hasConsentedGuardianStudentLink(tx,s.userId,s.organizationId,s.schoolId,attachment.submission.studentId))return attachment;
    if(!await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"academics.manage")&&!await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"homework.read"))return null;
    const operatorAccess=await hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"academics.manage");
    if(!operatorAccess){const staff=await tx.staffMember.findFirst({where:{userId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId},select:{id:true,status:true}});
    if(!staff||staff.status!=="ACTIVE")return null;
    {const enrollments=await tx.studentEnrollment.findMany({where:{studentId:attachment.submission.studentId,organizationId:s.organizationId,schoolId:s.schoolId,status:"ENROLLED"},select:{academicYearId:true,gradeLevelId:true,sectionName:true},take:5});let assigned=false;const today=new Date();today.setHours(0,0,0,0);for(const enrollment of enrollments){const match=await tx.teacherAssignment.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,staffMemberId:staff.id,isActive:true,academicYearId:enrollment.academicYearId,gradeLevelId:enrollment.gradeLevelId,sectionName:enrollment.sectionName||"",OR:[{startsOn:null},{startsOn:{lte:today}}],AND:[{OR:[{endsOn:null},{endsOn:{gte:today}}]}]},select:{id:true}});if(match){assigned=true;break;}}if(!assigned)return null;}}
    return attachment;
  });
  if(!doc)return res.status(404).json({error:"Document not found or access is not permitted"});if(!isDocumentDownloadable(doc.securityStatus))return res.status(423).json({error:"Document is not cleared for download"});
  const downloadUrl=await createDownloadUrl(doc.objectKey);
  await withTenantContext(prisma,s,tx=>tx.auditLog.create({data:{actorUserId:s.userId,organizationId:s.organizationId,schoolId:s.schoolId,action:"document.download.signed",resourceType:kind==="homework"?"HomeworkSubmissionAttachment":"Document",resourceId:doc.id,outcome:"SUCCESS"}}));
  return res.json({data:{downloadUrl,expiresInSeconds:60}});
}));


// Scanner callback is mounted separately from user-authenticated routes and protected by HMAC.
documentScanRouter.post("/internal/documents/:documentId/scan-result",wrap(async(req,res)=>{
  if(!env.DOCUMENT_SCAN_WEBHOOK_SECRET)return res.status(503).json({error:"Document scanner callback is not configured"});
  const signature=String(req.get("x-document-scan-signature")||"");const timestamp=String(req.get("x-document-scan-timestamp")||"");const raw=(req as any).rawBody as Buffer|undefined;
  if(!raw)return res.status(400).json({error:"Raw request body required"});
  if(!verifyDocumentScanSignature(raw,signature,env.DOCUMENT_SCAN_WEBHOOK_SECRET,timestamp))return res.status(401).json({error:"Invalid scanner signature"});
  const p=z.object({kind:z.enum(["student","staff","homework","school-logo","refund-evidence","admission"]),verdict:z.enum(["CLEAN","REJECTED"]),objectKey:z.string().min(1),detectedMimeType:z.string().min(1).max(120),scanReference:z.string().min(1).max(200)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:"Invalid scan result"});
  const tenant=await prisma.$transaction(async tx=>{await tx.$executeRaw`SELECT set_config('app.document_scan_id',${req.params.documentId},true)`;await tx.$executeRaw`SELECT set_config('app.document_scan_object_key',${p.data.objectKey},true)`;const row=p.data.kind==="student"?await tx.studentDocument.findUnique({where:{id:req.params.documentId},select:{organizationId:true,schoolId:true}}):p.data.kind==="staff"?await tx.staffDocument.findUnique({where:{id:req.params.documentId},select:{organizationId:true,schoolId:true}}):p.data.kind==="homework"?await tx.homeworkSubmissionAttachment.findUnique({where:{id:req.params.documentId},select:{organizationId:true,schoolId:true}}):p.data.kind==="school-logo"?await tx.schoolBrandAsset.findUnique({where:{id:req.params.documentId},select:{organizationId:true,schoolId:true}}):p.data.kind==="admission"?await tx.admissionApplicationDocument.findUnique({where:{id:req.params.documentId},select:{organizationId:true,schoolId:true}}):await tx.studentFeeRefundReconciliationEvidence.findUnique({where:{id:req.params.documentId},select:{organizationId:true,schoolId:true}});return row;});
  if(!tenant)return res.status(409).json({error:"Document scan state or object key mismatch"});
  const model=p.data.kind==="student"?"studentDocument":p.data.kind==="staff"?"staffDocument":p.data.kind==="homework"?"homeworkSubmissionAttachment":p.data.kind==="school-logo"?"schoolBrandAsset":p.data.kind==="admission"?"admissionApplicationDocument":"studentFeeRefundReconciliationEvidence";
  const scanResult=await withTenantContext(prisma,tenant,async tx=>{await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`document-scan:${req.params.documentId}`);const current=model==="studentDocument"?await tx.studentDocument.findFirst({where:{id:req.params.documentId,organizationId:tenant.organizationId,schoolId:tenant.schoolId,securityStatus:"QUARANTINED"}}):model==="staffDocument"?await tx.staffDocument.findFirst({where:{id:req.params.documentId,organizationId:tenant.organizationId,schoolId:tenant.schoolId,securityStatus:"QUARANTINED"}}):model==="homeworkSubmissionAttachment"?await tx.homeworkSubmissionAttachment.findFirst({where:{id:req.params.documentId,organizationId:tenant.organizationId,schoolId:tenant.schoolId,securityStatus:"QUARANTINED"}}):model==="schoolBrandAsset"?await tx.schoolBrandAsset.findFirst({where:{id:req.params.documentId,organizationId:tenant.organizationId,schoolId:tenant.schoolId,securityStatus:"QUARANTINED"}}):model==="admissionApplicationDocument"?await tx.admissionApplicationDocument.findFirst({where:{id:req.params.documentId,organizationId:tenant.organizationId,schoolId:tenant.schoolId,securityStatus:"QUARANTINED"}}):await tx.studentFeeRefundReconciliationEvidence.findFirst({where:{id:req.params.documentId,organizationId:tenant.organizationId,schoolId:tenant.schoolId,securityStatus:"QUARANTINED"}}).then(row=>row?{...row,objectKey:row.referenceValue}:null);if(!current)return null;if(current.mimeType!==p.data.detectedMimeType){await deleteObject(current.objectKey);const rejected=model==="studentDocument"?await tx.studentDocument.update({where:{id:current.id},data:{securityStatus:"REJECTED"}}):model==="staffDocument"?await tx.staffDocument.update({where:{id:current.id},data:{securityStatus:"REJECTED"}}):model==="homeworkSubmissionAttachment"?await tx.homeworkSubmissionAttachment.update({where:{id:current.id},data:{securityStatus:"REJECTED"}}):model==="schoolBrandAsset"?await tx.schoolBrandAsset.update({where:{id:current.id},data:{securityStatus:"REJECTED"}}):model==="admissionApplicationDocument"?await tx.admissionApplicationDocument.update({where:{id:current.id},data:{securityStatus:"REJECTED",status:"REJECTED"}}):await tx.studentFeeRefundReconciliationEvidence.update({where:{id:current.id},data:{securityStatus:"REJECTED"}});return {doc:rejected,mimeMismatch:true};}let nextKey=current.objectKey;if(p.data.verdict==="CLEAN"){nextKey=current.objectKey.replace(/^quarantine\//,"private/");await promoteCleanObject(current.objectKey,nextKey);}else await deleteObject(current.objectKey);const updated=model==="studentDocument"?await tx.studentDocument.update({where:{id:current.id},data:{objectKey:nextKey,securityStatus:p.data.verdict}}):model==="staffDocument"?await tx.staffDocument.update({where:{id:current.id},data:{objectKey:nextKey,securityStatus:p.data.verdict}}):model==="homeworkSubmissionAttachment"?await tx.homeworkSubmissionAttachment.update({where:{id:current.id},data:{objectKey:nextKey,securityStatus:p.data.verdict}}):model==="schoolBrandAsset"?await tx.schoolBrandAsset.update({where:{id:current.id},data:{objectKey:nextKey,securityStatus:p.data.verdict}}):model==="admissionApplicationDocument"?await tx.admissionApplicationDocument.update({where:{id:current.id},data:{objectKey:nextKey,securityStatus:p.data.verdict,status:p.data.verdict==="REJECTED"?"REJECTED":"RECEIVED"}}):await tx.studentFeeRefundReconciliationEvidence.update({where:{id:current.id},data:{referenceValue:nextKey,securityStatus:p.data.verdict}});if(model==="schoolBrandAsset"&&p.data.verdict==="CLEAN")await tx.schoolProfile.updateMany({where:{organizationId:tenant.organizationId,schoolId:tenant.schoolId},data:{logoObjectKey:nextKey}});return {doc:updated,mimeMismatch:false};});
  if(!scanResult)return res.status(409).json({error:"Document is no longer awaiting scan"});
  await withTenantContext(prisma,tenant,tx=>tx.auditLog.create({data:{organizationId:tenant.organizationId,schoolId:tenant.schoolId,action:"document.scan.completed",resourceType:"Document",resourceId:scanResult.doc.id,outcome:scanResult.mimeMismatch?"REJECTED":p.data.verdict,metadata:{scanReference:p.data.scanReference,detectedMimeType:p.data.detectedMimeType,mimeMismatch:scanResult.mimeMismatch}}}));
  if(scanResult.mimeMismatch)return res.status(422).json({error:"Scanner-detected file type did not match the declared type; document was rejected"});
  return res.json({data:{id:scanResult.doc.id,securityStatus:p.data.verdict,scanReference:p.data.scanReference}});
}));
