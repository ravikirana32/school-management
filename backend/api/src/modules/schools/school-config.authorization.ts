import { prisma } from "../../lib/prisma.js";
import { withTenantContext } from "../auth/tenant-context.js";

export async function hasActiveSchoolMembership(userId: string, organizationId: string, schoolId: string): Promise<boolean> {
  return withTenantContext(prisma, { organizationId, schoolId, userId }, async tx => {
    const membership = await tx.schoolMembership.findFirst({
      where: { userId, organizationId, schoolId, status: "ACTIVE" },
      select: { id: true }
    });
    return Boolean(membership);
  });
}
