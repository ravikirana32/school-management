/**
 * Restricts users carrying the built-in teacher role to students in their
 * currently active class/section assignments. Elevated school operators keep
 * their separately permissioned access. All lookups are tenant-scoped and
 * intended to run inside withTenantContext.
 */
export async function canTeacherAccessStudent(
  tx: any,
  userId: string,
  organizationId: string,
  schoolId: string,
  studentId: string,
): Promise<boolean> {
  const teacherRole = await tx.userRoleAssignment.findFirst({
    where: { userId, organizationId, schoolId, scopeType: "SCHOOL", role: { key: "SCHOOL_TEACHER" } },
    select: { id: true },
  });
  if (!teacherRole) return true;

  const elevated = await tx.userRoleAssignment.findFirst({
    where: {
      userId, organizationId, schoolId, scopeType: "SCHOOL",
      role: { rolePermissions: { some: { permission: { key: { in: ["students.update", "academics.manage"] } } } } },
    },
    select: { id: true },
  });
  if (elevated) return true;

  const staff = await tx.staffMember.findFirst({
    where: { userId, organizationId, schoolId, status: "ACTIVE" },
    select: { id: true },
  });
  if (!staff) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const enrollments = await tx.studentEnrollment.findMany({
    where: { studentId, organizationId, schoolId, status: "ENROLLED" },
    select: { academicYearId: true, gradeLevelId: true, sectionName: true },
    take: 20,
  });
  if (!enrollments.length) return false;
  const assignments = await tx.teacherAssignment.findMany({
    where: {
      organizationId, schoolId, staffMemberId: staff.id, isActive: true,
      OR: [{ startsOn: null }, { startsOn: { lte: today } }],
      AND: [{ OR: [{ endsOn: null }, { endsOn: { gte: today } }] }],
    },
    select: { academicYearId: true, gradeLevelId: true, sectionName: true },
    take: 200,
  });
  return enrollments.some(enrollment => assignments.some((assignment: any) =>
    assignment.academicYearId === enrollment.academicYearId &&
    assignment.gradeLevelId === enrollment.gradeLevelId &&
    assignment.sectionName === (enrollment.sectionName || "")
  ));
}
