import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";
import { withNotificationWorkerContext } from "../modules/auth/tenant-context.js";
import { createWorkerShutdown } from "./graceful-shutdown.js";

const INTERVAL_MS = 15 * 60 * 1000;
const DUE_SOON_HOURS = 24;
const DUE_SOON_CATEGORY = "TEACHER_TASK_DUE_SOON";
const OVERDUE_CATEGORY = "TEACHER_TASK_OVERDUE";
const PAGE_SIZE = 250;


function localDayKey(date: Date, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
    const get = (type: string) => parts.find(part => part.type === type)?.value || "00";
    return `${get("year")}-${get("month")}-${get("day")}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}


async function scanAndCreate(): Promise<{ schools: number; scanned: number; created: number }> {
  const schools = await withNotificationWorkerContext(prisma, async tx => { const activeOrganizations = await tx.organization.findMany({ where: { isActive: true }, select: { id: true } }); const orgIds = activeOrganizations.map(org => org.id); return tx.school.findMany({ where: { isActive: true, organizationId: { in: orgIds } }, select: { id: true, organizationId: true, timezone: true }, orderBy: { id: "asc" } }); });
  const now = new Date();
  const dueSoon = new Date(now.getTime() + DUE_SOON_HOURS * 60 * 60 * 1000);
  let scanned = 0;
  let created = 0;
  for (const school of schools) {
    let offset = 0;
    const dayKey = localDayKey(now, school.timezone || "Asia/Kolkata");
    const policy = await withNotificationWorkerContext(prisma, tx => tx.teacherTaskReminderPolicy.findUnique({ where: { organizationId_schoolId: { organizationId: school.organizationId, schoolId: school.id } } }));
    const dueSoonEnabled = policy?.dueSoonEnabled ?? true;
    const overdueEnabled = policy?.overdueEnabled ?? true;
    const overdueFrequencyHours = policy?.overdueFrequencyHours ?? 24;
    const overdueSlotKey = `${dayKey}:${Math.floor(now.getTime() / (overdueFrequencyHours * 60 * 60 * 1000))}`;
    while (true) {
      const tasks = await withNotificationWorkerContext(prisma, tx => tx.curriculumLessonReflectionTask.findMany({
        where: { organizationId: school.organizationId, schoolId: school.id, status: { not: "COMPLETED" }, dueAt: { not: null, lte: dueSoon } },
        select: { id: true, title: true, dueAt: true, assignedToStaffMemberId: true }, orderBy: [{ dueAt: "asc" }, { id: "asc" }], take: PAGE_SIZE, skip: offset,
      }));
      scanned += tasks.length;
      if (!tasks.length) break;
      for (const task of tasks) {
      if (!task.dueAt) continue;
      const overdue = task.dueAt < now;
      const type = overdue ? "OVERDUE" : "DUE_SOON";
      if ((overdue && !overdueEnabled) || (!overdue && !dueSoonEnabled)) continue;
      const staffUser = await withNotificationWorkerContext(prisma, tx => tx.staffMember.findFirst({ where: { id: task.assignedToStaffMemberId, organizationId: school.organizationId, schoolId: school.id, status: "ACTIVE" }, select: { userId: true } }));
      if (!staffUser?.userId) continue;
      const category = overdue ? OVERDUE_CATEGORY : DUE_SOON_CATEGORY;
      const preference = await withNotificationWorkerContext(prisma, tx => tx.notificationPreference.findUnique({ where: { organizationId_schoolId_userId_category_channel: { organizationId: school.organizationId, schoolId: school.id, userId: staffUser.userId!, category, channel: "IN_APP" } }, select: { enabled: true } }));
      if (preference?.enabled === false) continue;
      const dedupeWindow = overdue ? overdueSlotKey : dayKey;
      const dedupeKey = `${school.organizationId}:${school.id}:${task.id}:${type}:${dedupeWindow}`;
      const title = overdue ? "Follow-up task overdue" : "Follow-up task due soon";
      const body = overdue ? `${task.title} is overdue. Please review and update it.` : `${task.title} is due within the next 24 hours.`;
      const result = await withNotificationWorkerContext(prisma, tx => tx.curriculumLessonReflectionTaskNotification.createMany({
        data: [{ organizationId: school.organizationId, schoolId: school.id, recipientStaffMemberId: task.assignedToStaffMemberId, taskId: task.id, notificationType: type, title, body, dedupeKey }], skipDuplicates: true,
      }));
      created += result.count;
      }
      offset += tasks.length;
      if (tasks.length < PAGE_SIZE) break;
    }
  }
  return { schools: schools.length, scanned, created };
}


async function runCycle() {
  try {
    const stats = await scanAndCreate();
    logger.info({ event: "teacher_task_notification_scheduler.cycle", ...stats }, "Teacher task notification scheduling cycle completed");
  } catch (error) {
    logger.error({ event: "teacher_task_notification_scheduler.failed", err: error }, "Teacher task notification scheduling cycle failed");
  }
}


void runCycle();
const timer = setInterval(() => void runCycle(), INTERVAL_MS);
const shutdown = createWorkerShutdown({ clearTimers: () => clearInterval(timer), closeWorker: async () => undefined, closeQueues: async () => undefined, disconnectDatabase: () => prisma.$disconnect() });
process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
