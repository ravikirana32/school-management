import { createHash, randomUUID } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { withNotificationWorkerContext, withTenantContext } from "../auth/tenant-context.js";
import { verifyNotificationWebhookSignature } from "./notification-webhook-signature.js";
import { notificationDeliveryEventSchema, toNotificationDeliveryEventType } from "./notification-webhook-contract.js";
import { shouldApplyNotificationDeliveryEvent } from "./notification-event-reconciliation.js";
import { consumeNotificationRateLimit } from "./notification-webhook-rate-limit.js";
import { shouldCreateProviderSuppression } from "./provider-suppression-policy.js";

export const notificationDeliveryWebhookRouter = Router();



notificationDeliveryWebhookRouter.post("/:provider", async (req: Request, res: Response) => {
  const secret = env.NOTIFICATION_EMAIL_WEBHOOK_SECRET;
  if (!secret || !env.NOTIFICATION_EMAIL_WEBHOOK_PROVIDER) return res.status(503).json({ success: false, error: { code: "WEBHOOK_NOT_CONFIGURED", message: "Email delivery webhook is not configured" } });
  const provider = String(req.params.provider || "");
  if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(provider)) return res.status(400).json({ success: false, error: { code: "INVALID_PROVIDER", message: "Invalid provider identifier" } });
  if (provider !== env.NOTIFICATION_EMAIL_WEBHOOK_PROVIDER) return res.status(404).json({ success: false, error: { code: "UNKNOWN_PROVIDER", message: "Webhook provider is not configured" } });
  if (!req.is("application/json")) return res.status(415).json({ success: false, error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Webhook requests must use application/json" } });
  let rate: Awaited<ReturnType<typeof consumeNotificationRateLimit>>;
  try { rate = await consumeNotificationRateLimit(`webhook:${provider}`, req.ip || "unknown", 120, 60_000); }
  catch { return res.status(503).json({ success: false, error: { code: "RATE_LIMIT_UNAVAILABLE", message: "Webhook service temporarily unavailable" } }); }
  res.setHeader("RateLimit-Limit", "120");
  res.setHeader("RateLimit-Remaining", String(rate.remaining));
  res.setHeader("RateLimit-Reset", String(rate.retryAfterSeconds));
  if (!rate.allowed) { res.setHeader("Retry-After", String(rate.retryAfterSeconds)); return res.status(429).json({ success: false, error: { code: "RATE_LIMITED", message: "Webhook rate limit exceeded" } }); }
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  const signature = req.header("x-school-email-signature") || "";
  if (rawBody && rawBody.length > 64 * 1024) return res.status(413).json({ success: false, error: { code: "PAYLOAD_TOO_LARGE", message: "Webhook payload exceeds the 64 KB limit" } });
  if (!rawBody || !verifyNotificationWebhookSignature(rawBody, signature, secret)) return res.status(401).json({ success: false, error: { code: "INVALID_SIGNATURE", message: "Webhook signature is invalid or expired" } });
  const parsed = notificationDeliveryEventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: { code: "INVALID_EVENT", message: "Webhook event does not match the canonical delivery contract" } });
  const event = parsed.data;
  const eventType = toNotificationDeliveryEventType(event.type);
  try {
    const payloadSha256 = createHash("sha256").update(rawBody).digest("hex");
    const preflight = await withNotificationWorkerContext(prisma, async tx => {
      const existing = await tx.notificationDeliveryEvent.findUnique({ where: { provider_providerEventId: { provider, providerEventId: event.id } }, select: { payloadSha256: true } });
      if (existing) return existing.payloadSha256 === payloadSha256 ? { duplicate: true as const } : { conflict: true as const };
      const outbox = await tx.notificationOutbox.findUnique({ where: { id: event.data.outboxId }, select: { id: true, organizationId: true, schoolId: true, channel: true, status: true, lastProviderEventAt: true, recipientEmailHash: true, recipientEmailHashVersion: true } });
      if (!outbox || outbox.channel !== "EMAIL") return { missing: true as const };
      return { outbox };
    });
    if ("duplicate" in preflight) return res.status(200).json({ success: true, data: { duplicate: true } });
    if ("conflict" in preflight) return res.status(409).json({ success: false, error: { code: "EVENT_ID_CONFLICT", message: "Provider event identifier was reused with a different payload" } });
    if ("missing" in preflight) return res.status(404).json({ success: false, error: { code: "OUTBOX_NOT_FOUND", message: "Notification delivery record was not found" } });

    const outbox = preflight.outbox;
    const result = await withTenantContext(prisma, { organizationId: outbox.organizationId, schoolId: outbox.schoolId }, async tx => {
      const existing = await tx.notificationDeliveryEvent.findUnique({ where: { provider_providerEventId: { provider, providerEventId: event.id } }, select: { payloadSha256: true } });
      if (existing) return existing.payloadSha256 === payloadSha256 ? { duplicate: true as const } : { conflict: true as const };
      await tx.notificationDeliveryEvent.create({ data: { provider, providerEventId: event.id, contractVersion: event.contractVersion, eventType, outboxId: outbox.id, organizationId: outbox.organizationId, schoolId: outbox.schoolId, providerMessageId: event.data.messageId, occurredAt: new Date(event.occurredAt), payloadSha256 } });
      if (shouldApplyNotificationDeliveryEvent(outbox.status, outbox.lastProviderEventAt, eventType, new Date(event.occurredAt))) {
        await tx.notificationOutbox.update({ where: { id: outbox.id }, data: { status: eventType, providerMessageId: event.data.messageId, lastProviderEventAt: new Date(event.occurredAt), ...(eventType === "DELIVERED" ? { deliveredAt: new Date(event.occurredAt) } : {}) } });
        await tx.hostelLeaveNotificationEvent.updateMany({ where: { notificationOutboxId: outbox.id }, data: { status: eventType, ...(eventType === "DELIVERED" ? { deliveredAt: new Date(event.occurredAt), lastError: null } : { lastError: `Email provider event: ${eventType}` }) } });
      }
      let suppressionCreated = false;
      if ((eventType === "BOUNCED" || eventType === "COMPLAINED") && outbox.recipientEmailHash && outbox.recipientEmailHashVersion) {
        const occurredAt = new Date(event.occurredAt);
        const latestSuppression = await tx.notificationEmailSuppression.findFirst({ where: { organizationId: outbox.organizationId, schoolId: outbox.schoolId, emailHash: outbox.recipientEmailHash, hashVersion: outbox.recipientEmailHashVersion }, orderBy: { createdAt: "desc" }, select: { status: true, releasedAt: true } });
        if (shouldCreateProviderSuppression(latestSuppression?.status ?? null, latestSuppression?.releasedAt ?? null, occurredAt)) {
          const existingAlias = await tx.notificationEmailSuppressionHashAlias.findFirst({ where: { organizationId: outbox.organizationId, schoolId: outbox.schoolId, hashVersion: outbox.recipientEmailHashVersion, emailHash: outbox.recipientEmailHash, status: "ACTIVE" }, select: { id: true } });
          if (!existingAlias) {
            const reason = eventType === "BOUNCED" ? "BOUNCE" : "COMPLAINT";
            const inserted = await tx.$queryRaw<Array<{ id: string }>>`INSERT INTO "NotificationEmailSuppression" ("id", "organizationId", "schoolId", "emailHash", "hashVersion", "reason", "status", "sourceEventId", "createdBy") VALUES (${randomUUID()}, ${outbox.organizationId}, ${outbox.schoolId}, ${outbox.recipientEmailHash}, ${outbox.recipientEmailHashVersion}, ${reason}, 'ACTIVE', ${event.id}, 'SYSTEM_NOTIFICATION_PROVIDER') ON CONFLICT ("organizationId", "schoolId", "emailHash") WHERE "status" = 'ACTIVE' DO NOTHING RETURNING "id"`;
            if (inserted.length) {
              suppressionCreated = true;
              await tx.notificationEmailSuppressionHashAlias.create({ data: { id: randomUUID(), organizationId: outbox.organizationId, schoolId: outbox.schoolId, suppressionId: inserted[0].id, hashVersion: outbox.recipientEmailHashVersion, emailHash: outbox.recipientEmailHash, status: "ACTIVE" } });
              await tx.notificationEmailSuppressionAudit.create({ data: { id: randomUUID(), organizationId: outbox.organizationId, schoolId: outbox.schoolId, suppressionId: inserted[0].id, actorUserId: null, action: "CREATED", reason: `Provider ${eventType.toLowerCase()} event ${event.id}` } });
            }
          }
        }
      }
      return { accepted: true, suppressionCreated };
    });
    if ("duplicate" in result) return res.status(200).json({ success: true, data: { duplicate: true } });
    if ("conflict" in result) return res.status(409).json({ success: false, error: { code: "EVENT_ID_CONFLICT", message: "Provider event identifier was reused with a different payload" } });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") {
      try {
        const payloadSha256 = createHash("sha256").update(rawBody).digest("hex");
        const existing = await withNotificationWorkerContext(prisma, tx => tx.notificationDeliveryEvent.findUnique({ where: { provider_providerEventId: { provider, providerEventId: event.id } }, select: { payloadSha256: true } }));
        if (existing?.payloadSha256 === payloadSha256) return res.status(200).json({ success: true, data: { duplicate: true } });
        if (existing) return res.status(409).json({ success: false, error: { code: "EVENT_ID_CONFLICT", message: "Provider event identifier was reused with a different payload" } });
      } catch { return res.status(500).json({ success: false, error: { code: "WEBHOOK_PROCESSING_FAILED", message: "Webhook event could not be processed" } }); }
    }
    return res.status(500).json({ success: false, error: { code: "WEBHOOK_PROCESSING_FAILED", message: "Webhook event could not be processed" } });
  }
});
