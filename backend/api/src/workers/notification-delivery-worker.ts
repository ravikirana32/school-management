import { Queue, Worker } from "bullmq";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { prisma } from "../lib/prisma.js";
import { withNotificationWorkerContext } from "../modules/auth/tenant-context.js";
import { getSuppressionHashKeys, hashSuppressionEmail } from "../modules/notifications/email-suppression.js";
import { classifyNotificationProviderFailure } from "../modules/notifications/notification-provider-response.js";
import { buildNotificationOutboxClaimWhere, isNotificationOutboxTerminal } from "../modules/notifications/notification-outbox-lease.js";
import { safeNotificationFailureSummary } from "../modules/notifications/notification-safe-error.js";
import { hasActiveSuppressionHashAlias } from "../modules/notifications/suppression-hash-alias.js";
import { buildNotificationOperationalEvent } from "../modules/notifications/notification-operational-event.js";
import { createWorkerShutdown } from "./graceful-shutdown.js";

const QUEUE = "parent-notification-delivery";
function redisConnection() {
  const url = new URL(env.REDIS_URL);
  return { host: url.hostname, port: Number(url.port || 6379), ...(url.username ? { username: decodeURIComponent(url.username) } : {}), ...(url.password ? { password: decodeURIComponent(url.password) } : {}), ...(url.protocol === "rediss:" ? { tls: {} } : {}), ...(url.pathname.length > 1 ? { db: Number(url.pathname.slice(1)) } : {}), maxRetriesPerRequest: null as null };
}
const suppressionHashKeys = getSuppressionHashKeys({ currentSecret: env.NOTIFICATION_SUPPRESSION_HASH_CURRENT_SECRET, currentVersion: env.NOTIFICATION_SUPPRESSION_HASH_CURRENT_VERSION, previousSecret: env.NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_SECRET, previousVersion: env.NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_VERSION, legacySecret: env.NOTIFICATION_SUPPRESSION_HASH_SECRET });
if (!env.NOTIFICATION_EMAIL_PROVIDER_URL || !env.NOTIFICATION_EMAIL_PROVIDER_TOKEN || !env.NOTIFICATION_EMAIL_FROM) {
  throw new Error("Notification worker requires provider URL/token/from and a current suppression hash secret");
}
if (!env.NOTIFICATION_EMAIL_PROVIDER_URL.startsWith("https://")) throw new Error("Notification email provider must use HTTPS");
const connection = redisConnection();
const queue = new Queue(QUEUE, { connection });
const deadLetters = new Queue(`${QUEUE}-dead-letter`, { connection });

async function deliver(outboxId: string, leaseOwner: string) {
  const record = await withNotificationWorkerContext(prisma, tx => tx.notificationOutbox.findFirst({ where: { id: outboxId, leaseOwner, status: "PROCESSING" } }));
  if (!record || isNotificationOutboxTerminal(record.status)) return { skipped: true };
  if (record.channel !== "EMAIL" || !record.studentId) {
    await withNotificationWorkerContext(prisma, tx => tx.notificationOutbox.updateMany({ where: { id: record.id, leaseOwner }, data: { status: "CANCELLED", lastError: "Unsupported channel or missing student scope", leaseOwner: null, leaseUntil: null } }));
    logger.info(buildNotificationOperationalEvent({ event: "notification.delivery.cancelled", outboxId: record.id, status: "CANCELLED", attempt: record.attempts, reasonCode: "unsupported_channel" }));
    return { cancelled: true };
  }
  const recipient = await withNotificationWorkerContext(prisma, async tx => {
    const preference = await tx.notificationPreference.findFirst({ where: { organizationId: record.organizationId, schoolId: record.schoolId, userId: record.recipientUserId, category: record.category, channel: "EMAIL", enabled: false }, select: { id: true } });
    if (preference) return null;
    const guardians = await tx.guardian.findMany({ where: { organizationId: record.organizationId, schoolId: record.schoolId, userId: record.recipientUserId, isActive: true, email: { not: null }, emailVerifiedAt: { not: null }, studentLinks: { some: { studentId: record.studentId!, canReceiveCommunications: true } } }, select: { id: true, email: true } });
    if (!guardians.length) return null;
    const consents = await tx.parentInvitation.findMany({ where: { organizationId: record.organizationId, schoolId: record.schoolId, guardianId: { in: guardians.map(g => g.id) }, status: "ACCEPTED", consentAcceptedAt: { not: null }, consentWithdrawnAt: null }, select: { guardianId: true } });
    const accepted = new Set(consents.map(x => x.guardianId));
    if (record.category === "HOSTEL_LEAVE") {
      const hostelConsents = await tx.hostelGuardianConsent.findMany({
        where: { organizationId: record.organizationId, schoolId: record.schoolId, studentId: record.studentId!, guardianId: { in: guardians.map(g => g.id) }, leaveUpdatesEnabled: true, emailEnabled: true, revokedAt: null },
        select: { guardianId: true },
      });
      const allowed = new Set(hostelConsents.map((x: any) => x.guardianId));
      return guardians.find(g => accepted.has(g.id) && allowed.has(g.id))?.email || null;
    }
    return guardians.find(g => accepted.has(g.id))?.email || null;
  });
  if (!recipient) {
    await withNotificationWorkerContext(prisma, tx => tx.notificationOutbox.updateMany({ where: { id: record.id, leaseOwner }, data: { status: "CANCELLED", lastError: "No active, consented and verified guardian email or recipient opted out", leaseOwner: null, leaseUntil: null } }));
    await withNotificationWorkerContext(prisma, tx => tx.hostelLeaveNotificationEvent.updateMany({ where: { notificationOutboxId: record.id }, data: { status: "CANCELLED", lastError: "No active, consented and verified guardian email or recipient opted out" } }));
    logger.info(buildNotificationOperationalEvent({ event: "notification.delivery.cancelled", outboxId: record.id, status: "CANCELLED", attempt: record.attempts, reasonCode: "no_consented_recipient" }));
    return { cancelled: true };
  }
  const suppressionHashes = suppressionHashKeys.map(key => ({ hashVersion: key.version, emailHash: hashSuppressionEmail(recipient, key.secret) }));
  const suppression = await withNotificationWorkerContext(prisma, async tx => {
    const [direct, alias] = await Promise.all([
      tx.notificationEmailSuppression.findFirst({ where: { organizationId: record.organizationId, schoolId: record.schoolId, status: "ACTIVE", OR: suppressionHashes }, select: { id: true } }),
      tx.notificationEmailSuppressionHashAlias.findMany({ where: { organizationId: record.organizationId, schoolId: record.schoolId, status: "ACTIVE", OR: suppressionHashes }, select: { hashVersion: true, emailHash: true, status: true } }),
    ]);
    return Boolean(direct || hasActiveSuppressionHashAlias(suppressionHashes, alias));
  });
  if (suppression) {
    await withNotificationWorkerContext(prisma, tx => tx.notificationOutbox.updateMany({ where: { id: record.id, leaseOwner }, data: { status: "CANCELLED", lastError: "Recipient is suppressed for this school", leaseOwner: null, leaseUntil: null } }));
    await withNotificationWorkerContext(prisma, tx => tx.hostelLeaveNotificationEvent.updateMany({ where: { notificationOutboxId: record.id }, data: { status: "CANCELLED", lastError: "Recipient is suppressed for this school" } }));
    logger.info(buildNotificationOperationalEvent({ event: "notification.delivery.cancelled", outboxId: record.id, status: "CANCELLED", attempt: record.attempts, reasonCode: "school_suppression" }));
    return { cancelled: true, reason: "school_email_suppression" };
  }
  const currentRecipientHash = suppressionHashes[0];
  const hashRecorded = await withNotificationWorkerContext(prisma, tx => tx.notificationOutbox.updateMany({ where: { id: record.id, status: "PROCESSING", leaseOwner }, data: { recipientEmailHash: currentRecipientHash.emailHash, recipientEmailHashVersion: currentRecipientHash.hashVersion } }));
  if (hashRecorded.count !== 1) return { skipped: true, reason: "lease_lost_before_recipient_hash_record" };
  const payload = record.payload as { title?: string; body?: string; reportCardId?: string; verificationCode?: string };
  const response = await fetch(env.NOTIFICATION_EMAIL_PROVIDER_URL!, {
    method: "POST", signal: AbortSignal.timeout(20_000),
    headers: { "content-type": "application/json", authorization: `Bearer ${env.NOTIFICATION_EMAIL_PROVIDER_TOKEN}`, "idempotency-key": record.id },
    body: JSON.stringify({ from: env.NOTIFICATION_EMAIL_FROM, to: recipient, subject: payload.title || "School notification", template: "school-notification", variables: { title: payload.title || "School notification", message: payload.body || "You have a new school notification.", reportCardId: payload.reportCardId, verificationCode: payload.verificationCode }, metadata: { outboxId: record.id, batchId: record.batchId, category: record.category } })
  });
  if (!response.ok) {
    const providerError = `Notification provider returned HTTP ${response.status}`;
    if (classifyNotificationProviderFailure(response.status) === "PERMANENT") {
      const settled = await withNotificationWorkerContext(prisma, tx => tx.notificationOutbox.updateMany({ where: { id: record.id, status: "PROCESSING", leaseOwner }, data: { status: "DEAD_LETTER", lastError: providerError, leaseOwner: null, leaseUntil: null } }));
      if (settled.count !== 1) return { skipped: true, reason: "lease_lost_before_permanent_failure_settlement" };
      await withNotificationWorkerContext(prisma, tx => tx.hostelLeaveNotificationEvent.updateMany({ where: { notificationOutboxId: record.id }, data: { status: "DEAD_LETTER", lastError: providerError } }));
      await deadLetters.add("notification-dead-letter", { outboxId: record.id, errorCode: "PermanentProviderResponse", httpStatus: response.status }, { removeOnComplete: false });
      logger.warn(buildNotificationOperationalEvent({ event: "notification.delivery.dead_lettered", outboxId: record.id, status: "DEAD_LETTER", attempt: record.attempts, reasonCode: "permanent_provider_response" }));
      return { deadLetter: true, reason: "permanent_provider_response", httpStatus: response.status };
    }
    throw new Error(providerError);
  }
  const settled = await withNotificationWorkerContext(prisma, tx => tx.notificationOutbox.updateMany({ where: { id: record.id, status: "PROCESSING", leaseOwner }, data: { status: "DELIVERED", deliveredAt: new Date(), lastError: null, leaseOwner: null, leaseUntil: null } }));
  if (settled.count !== 1) throw new Error("Notification lease expired before delivery could be committed; provider idempotency will protect retry");
  await withNotificationWorkerContext(prisma, tx => tx.hostelLeaveNotificationEvent.updateMany({ where: { notificationOutboxId: record.id }, data: { status: "ACCEPTED_BY_PROVIDER", lastError: null } }));
  logger.info(buildNotificationOperationalEvent({ event: "notification.delivery.delivered", outboxId: record.id, status: "DELIVERED", attempt: record.attempts }));
  return { delivered: true };
}

async function claimOutbox(outboxId: string, leaseOwner: string) {
  const now = new Date();
  const claimed = await withNotificationWorkerContext(prisma, tx => tx.notificationOutbox.updateMany({
    where: buildNotificationOutboxClaimWhere(outboxId, now),
    data: { status: "PROCESSING", attempts: { increment: 1 }, lastError: null, leaseOwner, leaseUntil: new Date(now.getTime() + 90_000) }
  }));
  return claimed.count === 1;
}
const worker = new Worker(QUEUE, async job => {
  const leaseOwner = randomUUID();
  if (!await claimOutbox(job.data.outboxId, leaseOwner)) return { skipped: true, reason: "already claimed or terminal" };
  try { return await deliver(job.data.outboxId, leaseOwner); }
  catch (error) {
    await withNotificationWorkerContext(prisma, tx => tx.notificationOutbox.updateMany({ where: { id: job.data.outboxId, status: "PROCESSING", leaseOwner }, data: { status: "RETRY", leaseOwner: null, leaseUntil: null, lastError: safeNotificationFailureSummary(error) } }));
    await withNotificationWorkerContext(prisma, tx => tx.hostelLeaveNotificationEvent.updateMany({ where: { notificationOutboxId: job.data.outboxId }, data: { status: "RETRY", lastError: safeNotificationFailureSummary(error) } }));
    logger.warn(buildNotificationOperationalEvent({ event: "notification.delivery.skipped", outboxId: job.data.outboxId, status: "RETRY", reasonCode: "lease_lost" }));
    throw error;
  }
}, { connection, concurrency: 5, limiter: { max: 20, duration: 60_000 } });

worker.on("failed", (job, error) => {
  if (!job || job.attemptsMade < Number(job.opts.attempts || 1)) return;
  void (async () => {
    await withNotificationWorkerContext(prisma, tx => tx.notificationOutbox.updateMany({ where: { id: job.data.outboxId, status: "RETRY" }, data: { status: "DEAD_LETTER", leaseOwner: null, leaseUntil: null, lastError: safeNotificationFailureSummary(error) } }));
    await withNotificationWorkerContext(prisma, tx => tx.hostelLeaveNotificationEvent.updateMany({ where: { notificationOutboxId: job.data.outboxId }, data: { status: "DEAD_LETTER", lastError: safeNotificationFailureSummary(error) } }));
    await deadLetters.add("notification-dead-letter", { outboxId: job.data.outboxId, errorCode: "NotificationDeliveryFailed", attempts: job.attemptsMade }, { removeOnComplete: false });
  })().catch(() => undefined);
});

async function reconcile() {
  const pending = await withNotificationWorkerContext(prisma, tx => tx.notificationOutbox.findMany({ where: { channel: "EMAIL", OR: [{ status: { in: ["PENDING", "RETRY"] } }, { status: "PROCESSING", leaseUntil: { lt: new Date() } }] }, select: { id: true }, take: 100, orderBy: { createdAt: "asc" } }));
  for (const row of pending) await queue.add("deliver", { outboxId: row.id }, { jobId: `${row.id}-${Math.floor(Date.now() / 60_000)}`, attempts: 5, backoff: { type: "exponential", delay: 30_000 }, removeOnComplete: { age: 7 * 24 * 60 * 60, count: 5000 }, removeOnFail: false });
}
await reconcile();
const timer = setInterval(() => { void reconcile().catch(() => undefined); }, 30_000);
const shutdown = createWorkerShutdown({
  clearTimers: () => clearInterval(timer),
  closeWorker: () => worker.close(),
  closeQueues: async () => { await Promise.all([queue.close(), deadLetters.close()]); },
  disconnectDatabase: () => prisma.$disconnect(),
});
process.once("SIGINT", () => { void shutdown().catch(error => { logger.error({ err: error }, "Notification worker shutdown failed"); process.exitCode = 1; }); });
process.once("SIGTERM", () => { void shutdown().catch(error => { logger.error({ err: error }, "Notification worker shutdown failed"); process.exitCode = 1; }); });
