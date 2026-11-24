import { prisma } from "../../lib/prisma.js";
import { withTenantContext } from "./tenant-context.js";

export function matchesSchoolPermission(keys: Iterable<string>, permission: string): boolean {
  const values = new Set(keys);
  const module = permission.split(".")[0];
  return values.has("*") || values.has(permission) || values.has(`${module}.*`);
}

export async function getSchoolPermissions(userId:string,organizationId:string,schoolId:string):Promise<Set<string>> {
 return withTenantContext(prisma,{organizationId,schoolId,userId},async tx=>{
  const membership=await tx.schoolMembership.findFirst({where:{userId,organizationId,schoolId,status:"ACTIVE"},select:{id:true}});
  if(!membership)return new Set<string>();
  const assignments=await tx.userRoleAssignment.findMany({where:{userId,organizationId,schoolId,scopeType:"SCHOOL"}});
  if(!assignments.length)return new Set<string>();
  const links=await tx.rolePermission.findMany({where:{roleId:{in:assignments.map(a=>a.roleId)}},include:{permission:true}});
  return new Set(links.map(x=>x.permission.key));
 });
}
export async function hasSchoolPermission(userId:string,organizationId:string,schoolId:string,permission:string):Promise<boolean>{
 const keys=await getSchoolPermissions(userId,organizationId,schoolId);
 return matchesSchoolPermission(keys, permission);
}
