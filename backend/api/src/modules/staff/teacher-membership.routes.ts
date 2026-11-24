import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withIdentityContext, withTenantContext } from "../auth/tenant-context.js";

/** Self-service school discovery for the signed-in teacher; never accepts tenant IDs. */
export const teacherMembershipRouter = Router();
teacherMembershipRouter.use(authenticate);

teacherMembershipRouter.get("/teacher/me/schools", async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const memberships = await withIdentityContext(prisma, userId, tx => tx.schoolMembership.findMany({
      where: { userId, status: "ACTIVE" },
      select: { organizationId: true, schoolId: true, joinedAt: true },
      orderBy: { createdAt: "asc" },
      take: 100
    }));

    const schools = [];
    for (const membership of memberships) {
      const result = await withTenantContext(prisma, {
        organizationId: membership.organizationId,
        schoolId: membership.schoolId,
        userId
      }, async tx => {
        const [organization, school, staff, roleAssignments] = await Promise.all([
          tx.organization.findFirst({ where: { id: membership.organizationId, isActive: true }, select: { id: true, name: true, slug: true, country: true, timezone: true } }),
          tx.school.findFirst({ where: { id: membership.schoolId, organizationId: membership.organizationId, isActive: true, lifecycleStatus: "ACTIVE" }, select: { id: true, name: true, code: true, timezone: true } }),
          tx.staffMember.findFirst({ where: { userId, organizationId: membership.organizationId, schoolId: membership.schoolId, status: "ACTIVE" }, select: { id: true, firstName: true, lastName: true, preferredName: true, employeeNumber: true } }),
          tx.userRoleAssignment.findMany({ where: { userId, organizationId: membership.organizationId, schoolId: membership.schoolId, scopeType: "SCHOOL" }, select: { role: { select: { key: true, name: true } } } })
        ]);
        if (!organization || !school || !staff) return null;
        const assignments = await tx.teacherAssignment.findMany({
          where: { organizationId: membership.organizationId, schoolId: membership.schoolId, staffMemberId: staff.id, isActive: true },
          select: { id: true, academicYearId: true, gradeLevelId: true, sectionName: true, isClassTeacher: true }
        });
        return {
          organization,
          school,
          staff: { id: staff.id, displayName: staff.preferredName || [staff.firstName, staff.lastName].filter(Boolean).join(" "), employeeNumber: staff.employeeNumber },
          roles: roleAssignments.map(item => item.role),
          assignments
        };
      });
      if (result) schools.push(result);
    }
    return res.json({ data: schools });
  } catch (error) {
    return next(error);
  }
});
