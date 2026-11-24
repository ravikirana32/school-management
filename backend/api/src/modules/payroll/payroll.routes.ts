import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext } from "../auth/tenant-context.js";
import { hasSchoolPermission } from "../auth/school-permissions.js";
import { hasSchoolAdminAccess } from "../organizations/organization.authorization.js";
import { hasActiveSchoolMembership } from "../schools/school-config.authorization.js";
export const payrollRouter=Router(); payrollRouter.use(authenticate);
const wrap=(fn:(req:any,res:any)=>Promise<any>)=>(req:any,res:any,next:any)=>Promise.resolve(fn(req,res)).catch(next);
async function scope(req:any,res:any,permission="payroll.read"){const organizationId=String(req.params.organizationId||""),schoolId=String(req.params.schoolId||""),userId=req.auth!.userId;if(!await hasActiveSchoolMembership(userId,organizationId,schoolId)){res.status(403).json({error:"Active school membership required"});return null;}if(!await hasSchoolAdminAccess(userId,organizationId,schoolId)&&!await hasSchoolPermission(userId,organizationId,schoolId,permission)){res.status(403).json({error:`Missing required permission: ${permission}`});return null;}return {organizationId,schoolId,userId};}
const base="/:organizationId/:schoolId/payroll";
const componentSchema=z.object({name:z.string().trim().min(1).max(80),kind:z.enum(["earning","deduction"]),calculation:z.enum(["fixed","percent"]),value:z.number().nonnegative().max(1000000)});
const structureSchema=z.object({name:z.string().trim().min(1).max(100),baseSalary:z.number().nonnegative().max(10000000),components:z.array(componentSchema).max(50)});
payrollRouter.get(base+"/dashboard",wrap(async(req,res)=>{const s=await scope(req,res);if(!s)return;const [activeStaff,activeStructures,recentRuns]=await withTenantContext(prisma,s,tx=>Promise.all([tx.staffMember.count({where:{organizationId:s.organizationId,schoolId:s.schoolId,status:"ACTIVE"}}),tx.payrollSalaryStructure.count({where:{organizationId:s.organizationId,schoolId:s.schoolId,isActive:true}}),tx.payrollRun.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},orderBy:[{periodYear:"desc"},{periodMonth:"desc"}],take:6})]));return res.json({data:{activeStaff,activeStructures,recentRuns}});}));
payrollRouter.get(base+"/structures",wrap(async(req,res)=>{const s=await scope(req,res);if(!s)return;const data=await withTenantContext(prisma,s,tx=>tx.payrollSalaryStructure.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},orderBy:{name:"asc"}}));return res.json({data});}));
payrollRouter.post(base+"/structures",wrap(async(req,res)=>{const s=await scope(req,res,"payroll.manage");if(!s)return;const p=structureSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:"Invalid salary structure",details:p.error.flatten()});const data=await withTenantContext(prisma,s,tx=>tx.payrollSalaryStructure.create({data:{...p.data,organizationId:s.organizationId,schoolId:s.schoolId,createdBy:s.userId}}));return res.status(201).json({data});}));
payrollRouter.get(base+"/assignments",wrap(async(req,res)=>{const s=await scope(req,res);if(!s)return;const data=await withTenantContext(prisma,s,tx=>tx.payrollStaffAssignment.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,isActive:true},orderBy:{createdAt:"desc"}}));return res.json({data});}));
payrollRouter.post(base+"/assignments",wrap(async(req,res)=>{const s=await scope(req,res,"payroll.manage");if(!s)return;const p=z.object({staffMemberId:z.string().min(1),structureId:z.string().min(1),effectiveFrom:z.string().datetime()}).safeParse(req.body);if(!p.success)return res.status(400).json({error:"Invalid assignment"});const data=await withTenantContext(prisma,s,async tx=>{const staff=await tx.staffMember.findFirst({where:{id:p.data.staffMemberId,organizationId:s.organizationId,schoolId:s.schoolId,status:"ACTIVE"},select:{id:true}});if(!staff)throw Object.assign(new Error("Active staff member not found"),{status:404});const structure=await tx.payrollSalaryStructure.findFirst({where:{id:p.data.structureId,organizationId:s.organizationId,schoolId:s.schoolId,isActive:true},select:{id:true}});if(!structure)throw Object.assign(new Error("Active salary structure not found"),{status:404});await tx.payrollStaffAssignment.updateMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,staffMemberId:staff.id,isActive:true},data:{isActive:false,effectiveTo:new Date(p.data.effectiveFrom)}});return tx.payrollStaffAssignment.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,staffMemberId:staff.id,structureId:structure.id,effectiveFrom:new Date(p.data.effectiveFrom),createdBy:s.userId}});});return res.status(201).json({data});}));
payrollRouter.get(base+"/runs",wrap(async(req,res)=>{const s=await scope(req,res);if(!s)return;const data=await withTenantContext(prisma,s,tx=>tx.payrollRun.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId},include:{items:true},orderBy:[{periodYear:"desc"},{periodMonth:"desc"}],take:24}));return res.json({data});}));
payrollRouter.post(base+"/runs",wrap(async(req,res)=>{
 const s=await scope(req,res,"payroll.manage"); if(!s)return;
 const p=z.object({periodYear:z.number().int().min(2000).max(2100),periodMonth:z.number().int().min(1).max(12)}).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:"Invalid payroll period"});
 const data=await withTenantContext(prisma,s,async tx=>{
  const exists=await tx.payrollRun.findFirst({where:{organizationId:s.organizationId,schoolId:s.schoolId,periodYear:p.data.periodYear,periodMonth:p.data.periodMonth},select:{id:true}});
  if(exists)throw Object.assign(new Error("Payroll run already exists for this period"),{status:409});
  const periodEnd=new Date(p.data.periodYear,p.data.periodMonth,0),periodStart=new Date(p.data.periodYear,p.data.periodMonth-1,1);
  const assignments=await tx.payrollStaffAssignment.findMany({where:{organizationId:s.organizationId,schoolId:s.schoolId,isActive:true,effectiveFrom:{lte:periodEnd},OR:[{effectiveTo:null},{effectiveTo:{gte:periodStart}}]}});
  const staff=await tx.staffMember.findMany({where:{id:{in:assignments.map(a=>a.staffMemberId)},organizationId:s.organizationId,schoolId:s.schoolId,status:"ACTIVE"}});
  const structures=await tx.payrollSalaryStructure.findMany({where:{id:{in:assignments.map(a=>a.structureId)},organizationId:s.organizationId,schoolId:s.schoolId,isActive:true}});
  const calculated=staff.flatMap(m=>{
   const assignment=assignments.find(a=>a.staffMemberId===m.id),structure=structures.find(x=>x.id===assignment?.structureId);
   if(!structure)return [];
   const base=Number(structure.baseSalary),components=Array.isArray(structure.components)?structure.components as any[]:[];
   let earnings=0,deductions=0;
   const snapshot=components.map(c=>{const amount=Number((c.calculation==="percent"?base*Number(c.value)/100:Number(c.value)).toFixed(2));if(c.kind==="earning")earnings+=amount;else deductions+=amount;return {...c,amount};});
   const gross=base+earnings; return [{staff:m,base,earnings,deductions,net:Math.max(0,gross-deductions),gross,snapshot}];
  });
  const totals={totalGross:calculated.reduce((a,x)=>a+x.gross,0),totalDeductions:calculated.reduce((a,x)=>a+x.deductions,0),totalNet:calculated.reduce((a,x)=>a+x.net,0)};
  const itemRows=calculated.map(x=>({
   organizationId:s.organizationId,schoolId:s.schoolId,staffMemberId:x.staff.id,
   employeeNumberSnapshot:x.staff.employeeNumber,
   staffNameSnapshot:[x.staff.firstName,x.staff.middleName,x.staff.lastName].filter(Boolean).join(" "),
   baseSalary:x.base,earnings:x.earnings,deductions:x.deductions,netPay:x.net,componentsSnapshot:x.snapshot
  }));
  return tx.payrollRun.create({data:{organizationId:s.organizationId,schoolId:s.schoolId,periodYear:p.data.periodYear,periodMonth:p.data.periodMonth,createdBy:s.userId,...totals,items:{create:itemRows}}});
 });
 return res.status(201).json({data});
}));
payrollRouter.post(base+"/runs/:runId/approve",wrap(async(req,res)=>{const s=await scope(req,res,"payroll.approve");if(!s)return;const data=await withTenantContext(prisma,s,async tx=>{const run=await tx.payrollRun.findFirst({where:{id:req.params.runId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!run)return null;if(run.status!=="DRAFT")throw Object.assign(new Error("Only draft runs can be approved"),{status:409});return tx.payrollRun.update({where:{id:run.id},data:{status:"APPROVED",approvedBy:s.userId,approvedAt:new Date()}});});if(!data)return res.status(404).json({error:"Payroll run not found"});return res.json({data});}));
payrollRouter.post(base+"/runs/:runId/pay",wrap(async(req,res)=>{const s=await scope(req,res,"payroll.pay");if(!s)return;const data=await withTenantContext(prisma,s,async tx=>{const run=await tx.payrollRun.findFirst({where:{id:req.params.runId,organizationId:s.organizationId,schoolId:s.schoolId}});if(!run)return null;if(run.status!=="APPROVED")throw Object.assign(new Error("Only approved runs can be marked paid"),{status:409});const paidAt=new Date();await tx.payrollRunItem.updateMany({where:{runId:run.id,organizationId:s.organizationId,schoolId:s.schoolId},data:{paidAt}});return tx.payrollRun.update({where:{id:run.id},data:{status:"PAID",paidBy:s.userId,paidAt}});});if(!data)return res.status(404).json({error:"Payroll run not found"});return res.json({data});}));
payrollRouter.get("/staff/me/:organizationId/:schoolId/payroll/payslips",wrap(async(req,res)=>{const userId=req.auth!.userId,organizationId=String(req.params.organizationId),schoolId=String(req.params.schoolId);const staff=await withTenantContext(prisma,{organizationId,schoolId,userId},tx=>tx.staffMember.findFirst({where:{organizationId,schoolId,userId,status:"ACTIVE"},select:{id:true}}));if(!staff)return res.status(403).json({error:"Active linked staff account required"});const data=await withTenantContext(prisma,{organizationId,schoolId,userId},tx=>tx.payrollRunItem.findMany({where:{organizationId,schoolId,staffMemberId:staff.id,run:{status:{in:["APPROVED","PAID"]}}},include:{run:{select:{periodYear:true,periodMonth:true,status:true,paidAt:true}}},orderBy:{createdAt:"desc"},take:24}));return res.json({data});}));
