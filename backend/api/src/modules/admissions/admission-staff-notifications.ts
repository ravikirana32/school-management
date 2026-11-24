/** P345: idempotent school-scoped staff notifications for admission lifecycle events. */
export async function notifyAdmissionStaffEvent(tx: any, input: {
  organizationId: string;
  schoolId: string;
  applicationId: string;
  eventKey: string;
  title: string;
  body: string;
  applicationNumber?: string;
}) {
  const batchId = `admission-event:${input.eventKey}`;
  const assignments = await tx.userRoleAssignment.findMany({
    where: { organizationId: input.organizationId, schoolId: input.schoolId, role: { rolePermissions: { some: { permission: { key: "admissions.manage" } } } } },
    select: { userId: true },
  });
  const candidateIds = [...new Set(assignments.map((a: any) => a.userId))];
  const memberships = candidateIds.length ? await tx.schoolMembership.findMany({
    where: { organizationId: input.organizationId, schoolId: input.schoolId, userId: { in: candidateIds }, status: "ACTIVE" },
    select: { userId: true },
  }) : [];
  const users = memberships.length ? await tx.user.findMany({ where: { id: { in: memberships.map((m: any) => m.userId) }, isActive: true }, select: { id: true } }) : [];
  const batch = await tx.notificationBatch.findUnique({ where: { id: batchId }, select: { id: true } });
  if (!batch) await tx.notificationBatch.create({ data: { id: batchId, organizationId: input.organizationId, schoolId: input.schoolId, category: "ADMISSION_APPLICATION", title: input.title, createdBy: "ADMISSIONS_SYSTEM", recipientCount: users.length } });
  if (!users.length) return { recipients: 0, created: 0 };
  const created = await tx.notificationOutbox.createMany({
    data: users.map((user: any) => ({ id: `${batchId}:${user.id}`, organizationId: input.organizationId, schoolId: input.schoolId, batchId, recipientUserId: user.id, category: "ADMISSION_APPLICATION", channel: "IN_APP", status: "DELIVERED", payload: { title: input.title, body: input.body, applicationId: input.applicationId, ...(input.applicationNumber ? { applicationNumber: input.applicationNumber } : {}) }, attempts: 1, deliveredAt: new Date() })),
    skipDuplicates: true,
  });
  return { recipients: users.length, created: created.count };
}
