import { prisma } from "../lib/prisma.js";
import { withPlatformContext, withTenantContext } from "../modules/auth/tenant-context.js";
import { createWorkerShutdown } from "./graceful-shutdown.js";

const WORKER_NAME = "admissions-notification-reconciliation-worker";
const INTERVAL_MS = Number(process.env.ADMISSIONS_NOTIFICATION_RECONCILIATION_INTERVAL_MS || 60_000);
const BATCH_SIZE = 100;
let running = false;

/** Repairs missed in-app notifications for recently submitted public applications.
 * Notification batch IDs are deterministic, and outbox rows are insert-only/idempotent.
 */
async function reconcile() {
  if (running) return;
  running = true;
  try {
    const candidates = await withPlatformContext(prisma, tx => tx.admissionApplication.findMany({
      where: { status: "SUBMITTED", submittedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { id: true, organizationId: true, schoolId: true, applicationNumber: true, childFirstName: true, submittedAt: true },
      orderBy: { submittedAt: "asc" }, take: BATCH_SIZE,
    }));
    let repaired = 0;
    for (const app of candidates) {
      const batchId = `admission-submitted:${app.id}`;
      const didRepair = await withTenantContext(prisma, { organizationId: app.organizationId, schoolId: app.schoolId, userId: "ADMISSIONS_NOTIFICATION_RECONCILIATION" }, async tx => {
        const assignments = await tx.userRoleAssignment.findMany({ where: { organizationId: app.organizationId, schoolId: app.schoolId, role: { rolePermissions: { some: { permission: { key: "admissions.manage" } } } } }, select: { userId: true } });
        const ids = [...new Set(assignments.map(a => a.userId))];
        if (!ids.length) return false;
        const memberships = await tx.schoolMembership.findMany({ where: { organizationId: app.organizationId, schoolId: app.schoolId, userId: { in: ids }, status: "ACTIVE" }, select: { userId: true } });
        const users = await tx.user.findMany({ where: { id: { in: memberships.map(m => m.userId) }, isActive: true }, select: { id: true } });
        if (!users.length) return false;
        await tx.notificationBatch.upsert({ where: { id: batchId }, create: { id: batchId, organizationId: app.organizationId, schoolId: app.schoolId, category: "ADMISSION_APPLICATION", title: "New admission application", createdBy: "ADMISSIONS_NOTIFICATION_RECONCILIATION", recipientCount: users.length }, update: {} });
        const created = await tx.notificationOutbox.createMany({ data: users.map(user => ({ id: `${batchId}:${user.id}`, organizationId: app.organizationId, schoolId: app.schoolId, batchId, recipientUserId: user.id, category: "ADMISSION_APPLICATION", channel: "IN_APP", status: "DELIVERED", payload: { title: "New admission application", body: `${app.childFirstName} submitted application ${app.applicationNumber}.`, applicationId: app.id, applicationNumber: app.applicationNumber }, attempts: 1, deliveredAt: app.submittedAt ?? new Date() })), skipDuplicates: true });
        return created.count > 0;
      });
      if (didRepair) repaired++;
    }
    if (repaired) console.info(`[${WORKER_NAME}] repaired ${repaired} application notification batch(es)`);
  } catch (error) {
    console.error(`[${WORKER_NAME}] reconciliation failed`, error instanceof Error ? error.message : "UnknownError");
  } finally { running = false; }
}
await reconcile();
const timer = setInterval(() => { void reconcile(); }, INTERVAL_MS);
const shutdown = createWorkerShutdown({ clearTimers: () => clearInterval(timer), closeWorker: async () => undefined, closeQueues: async () => undefined, disconnectDatabase: () => prisma.$disconnect() });
process.once("SIGINT", () => { void shutdown().catch(error => { console.error(`${WORKER_NAME} shutdown failed`, error); process.exitCode = 1; }); });
process.once("SIGTERM", () => { void shutdown().catch(error => { console.error(`${WORKER_NAME} shutdown failed`, error); process.exitCode = 1; }); });
