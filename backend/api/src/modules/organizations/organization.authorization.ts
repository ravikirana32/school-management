import { prisma } from "../../lib/prisma.js";
import { withTenantContext } from "../auth/tenant-context.js";

export async function hasOrganizationAdminAccess(userId: string, organizationId: string): Promise<boolean> {
  return withTenantContext(prisma, { organizationId, userId }, async tx => {
    const membership = await tx.organizationMembership.findFirst({
      where: { userId, organizationId, status: "ACTIVE" }, select: { id: true }
    });
    if (!membership) return false;
    const role = await tx.role.findFirst({ where: { key: "ORG_OWNER" } });
    const adminRole = await tx.role.findFirst({ where: { key: "ORG_ADMIN" } });
    if (!role && !adminRole) return false;
    const assignment = await tx.userRoleAssignment.findFirst({
      where: { userId, organizationId, scopeType: "ORGANIZATION", roleId: { in: [role?.id, adminRole?.id].filter(Boolean) as string[] } },
      select: { id: true }
    });
    return Boolean(assignment);
  });
}

export async function hasSchoolAdminAccess(userId: string, organizationId: string, schoolId: string): Promise<boolean> {
  return withTenantContext(prisma, { organizationId, schoolId, userId }, async tx => {
    const membership = await tx.schoolMembership.findFirst({
      where: { userId, organizationId, schoolId, status: "ACTIVE" }, select: { id: true }
    });
    if (!membership) return false;
    const role = await tx.role.findFirst({ where: { key: "SCHOOL_ADMIN" } });
    if (!role) return false;
    const assignment = await tx.userRoleAssignment.findFirst({
      where: { userId, organizationId, schoolId, scopeType: "SCHOOL", roleId: role.id },
      select: { id: true }
    });
    return Boolean(assignment);
  });
}
