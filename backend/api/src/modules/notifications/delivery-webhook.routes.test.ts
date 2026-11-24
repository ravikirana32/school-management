import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import { createHmac, createHash } from "node:crypto";

const mocks = vi.hoisted(() => ({
  env: { NOTIFICATION_EMAIL_WEBHOOK_SECRET: "webhook-secret-with-at-least-32-characters", NOTIFICATION_EMAIL_WEBHOOK_PROVIDER: "test-provider" },
  consumeRateLimit: vi.fn(),
  tx: {
    notificationDeliveryEvent: { findUnique: vi.fn(), create: vi.fn() },
    notificationOutbox: { findUnique: vi.fn(), update: vi.fn() },
    notificationEmailSuppression: { findFirst: vi.fn() },
    notificationEmailSuppressionHashAlias: { findFirst: vi.fn(), create: vi.fn(), createMany: vi.fn(), updateMany: vi.fn() },
    notificationEmailSuppressionAudit: { create: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));
vi.mock("../../config/env.js", () => ({ env: mocks.env }));
vi.mock("../../lib/prisma.js", () => ({ prisma: {} }));
vi.mock("../auth/tenant-context.js", () => ({ withNotificationWorkerContext: (_prisma: unknown, callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx), withTenantContext: (_prisma: unknown, _scope: unknown, callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx) }));
vi.mock("./notification-webhook-rate-limit.js", () => ({ consumeNotificationRateLimit: mocks.consumeRateLimit }));

import { notificationDeliveryWebhookRouter } from "./delivery-webhook.routes.js";

const event = { id: "evt_test_1", type: "email.delivered", occurredAt: "2026-11-17T09:00:00.000Z", data: { outboxId: "outbox_test_1", messageId: "msg_test_1" } };
function signed(body: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const digest = createHmac("sha256", mocks.env.NOTIFICATION_EMAIL_WEBHOOK_SECRET).update(`${timestamp}.`).update(Buffer.from(body)).digest("hex");
  return `t=${timestamp},v1=${digest}`;
}
function makeApp() {
  const app = express();
  app.use(express.json({ limit: "1mb", verify: (req, _res, buffer) => { (req as typeof req & { rawBody?: Buffer }).rawBody = Buffer.from(buffer); } }));
  app.use("/webhooks", notificationDeliveryWebhookRouter);
  return app;
}

describe("notification delivery webhook route", () => {
  beforeEach(() => {
    mocks.env.NOTIFICATION_EMAIL_WEBHOOK_SECRET = "webhook-secret-with-at-least-32-characters";
    mocks.env.NOTIFICATION_EMAIL_WEBHOOK_PROVIDER = "test-provider";
    mocks.consumeRateLimit.mockReset().mockResolvedValue({ allowed: true, remaining: 119, retryAfterSeconds: 60 });
    mocks.tx.notificationDeliveryEvent.findUnique.mockReset().mockResolvedValue(null);
    mocks.tx.notificationDeliveryEvent.create.mockReset().mockResolvedValue({ id: "event-row" });
    mocks.tx.notificationOutbox.findUnique.mockReset().mockResolvedValue({ id: "outbox_test_1", organizationId: "org_1", schoolId: "school_1", channel: "EMAIL", status: "DELIVERED", lastProviderEventAt: null });
    mocks.tx.notificationOutbox.update.mockReset().mockResolvedValue({ count: 1 });
    mocks.tx.notificationEmailSuppression.findFirst.mockReset().mockResolvedValue(null);
    mocks.tx.notificationEmailSuppressionHashAlias.findFirst.mockReset().mockResolvedValue(null);
    mocks.tx.notificationEmailSuppressionHashAlias.create.mockReset().mockResolvedValue({ id: "alias-row" });
    mocks.tx.notificationEmailSuppressionAudit.create.mockReset().mockResolvedValue({ id: "audit-row" });
    mocks.tx.$queryRaw.mockReset().mockResolvedValue([]);
  });

  it("returns 503 when webhook configuration is missing", async () => {
    mocks.env.NOTIFICATION_EMAIL_WEBHOOK_SECRET = undefined as unknown as string;
    const response = await request(makeApp()).post("/webhooks/test-provider").send(event);
    expect(response.status).toBe(503);
  });
  it("rejects a provider outside the configured allowlist", async () => {
    const response = await request(makeApp()).post("/webhooks/other-provider").send(event);
    expect(response.status).toBe(404);
  });
  it("returns 429 when the provider/IP rate limit is exceeded", async () => {
    mocks.consumeRateLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfterSeconds: 30 });
    const response = await request(makeApp()).post("/webhooks/test-provider").send(event);
    expect(response.status).toBe(429);
    expect(response.headers["retry-after"]).toBe("30");
  });
  it("fails closed when Redis rate limiting is unavailable", async () => {
    mocks.consumeRateLimit.mockRejectedValue(new Error("Redis connection details must not leak"));
    const response = await request(makeApp()).post("/webhooks/test-provider").send(event);
    expect(response.status).toBe(503);
    expect(JSON.stringify(response.body)).not.toContain("Redis connection details");
  });
  it("rejects non-JSON content types", async () => {
    const response = await request(makeApp()).post("/webhooks/test-provider").set("content-type", "text/plain").send("not json");
    expect(response.status).toBe(415);
  });
  it("rejects webhook bodies larger than 64 KB", async () => {
    const body = JSON.stringify({ ...event, padding: "x".repeat(65 * 1024) });
    const response = await request(makeApp()).post("/webhooks/test-provider").set("content-type", "application/json").send(body);
    expect(response.status).toBe(413);
  });
  it("rejects invalid signatures before database access", async () => {
    const response = await request(makeApp()).post("/webhooks/test-provider").set("x-school-email-signature", "t=1,v1=bad").send(event);
    expect(response.status).toBe(401);
    expect(mocks.tx.notificationDeliveryEvent.findUnique).not.toHaveBeenCalled();
  });
  it("persists a valid signed event and reconciles the outbox", async () => {
    const body = JSON.stringify(event);
    const response = await request(makeApp()).post("/webhooks/test-provider").set("content-type", "application/json").set("x-school-email-signature", signed(body)).send(body);
    expect(response.status).toBe(200);
    expect(mocks.tx.notificationDeliveryEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ provider: "test-provider", providerEventId: event.id, eventType: "DELIVERED", organizationId: "org_1", schoolId: "school_1" }) }));
    expect(mocks.tx.notificationOutbox.update).toHaveBeenCalled();
  });
  it("returns idempotent success for an already recorded event with the same payload", async () => {
    const body = JSON.stringify(event);
    mocks.tx.notificationDeliveryEvent.findUnique.mockResolvedValue({ id: "existing", payloadSha256: createHash("sha256").update(body).digest("hex") });
    const response = await request(makeApp()).post("/webhooks/test-provider").set("x-school-email-signature", signed(body)).send(body);
    expect(response.status).toBe(200);
    expect(response.body.data.duplicate).toBe(true);
    expect(mocks.tx.notificationDeliveryEvent.create).not.toHaveBeenCalled();
  });
  it("rejects reuse of an event ID with a different payload", async () => {
    const body = JSON.stringify(event);
    mocks.tx.notificationDeliveryEvent.findUnique.mockResolvedValue({ id: "existing", payloadSha256: "0".repeat(64) });
    const response = await request(makeApp()).post("/webhooks/test-provider").set("x-school-email-signature", signed(body)).send(body);
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EVENT_ID_CONFLICT");
    expect(mocks.tx.notificationDeliveryEvent.create).not.toHaveBeenCalled();
  });
  it("treats a concurrent unique conflict as duplicate only when payload hash matches", async () => {
    const body = JSON.stringify(event);
    mocks.tx.notificationDeliveryEvent.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce({ payloadSha256: createHash("sha256").update(body).digest("hex") });
    mocks.tx.notificationDeliveryEvent.create.mockRejectedValue({ code: "P2002" });
    const response = await request(makeApp()).post("/webhooks/test-provider").set("x-school-email-signature", signed(body)).send(body);
    expect(response.status).toBe(200);
    expect(response.body.data.duplicate).toBe(true);
  });
  it("rejects a concurrent unique conflict when the persisted payload differs", async () => {
    const body = JSON.stringify(event);
    mocks.tx.notificationDeliveryEvent.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce({ payloadSha256: "f".repeat(64) });
    mocks.tx.notificationDeliveryEvent.create.mockRejectedValue({ code: "P2002" });
    const response = await request(makeApp()).post("/webhooks/test-provider").set("x-school-email-signature", signed(body)).send(body);
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EVENT_ID_CONFLICT");
  });
  it("creates a school-local suppression from a bounce using only the stored recipient hash", async () => {
    const bounced = { ...event, id: "evt_bounce_1", type: "email.bounced" };
    mocks.tx.notificationOutbox.findUnique.mockResolvedValue({ id: "outbox_test_1", organizationId: "org_1", schoolId: "school_1", channel: "EMAIL", status: "DELIVERED", lastProviderEventAt: null, recipientEmailHash: "a".repeat(64), recipientEmailHashVersion: "v2" });
    mocks.tx.$queryRaw.mockResolvedValue([{ id: "suppression-row" }]);
    const body = JSON.stringify(bounced);
    const response = await request(makeApp()).post("/webhooks/test-provider").set("x-school-email-signature", signed(body)).send(body);
    expect(response.status).toBe(200);
    expect(response.body.data.suppressionCreated).toBe(true);
    expect(mocks.tx.notificationEmailSuppressionHashAlias.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ suppressionId: "suppression-row", hashVersion: "v2", emailHash: "a".repeat(64) }) }));
    expect(mocks.tx.notificationEmailSuppressionAudit.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ suppressionId: "suppression-row", action: "CREATED", actorUserId: null }) }));
  });
  it("creates a school-local complaint suppression from the stored recipient hash", async () => {
    const complained = { ...event, id: "evt_complaint_1", type: "email.complained" };
    mocks.tx.notificationOutbox.findUnique.mockResolvedValue({ id: "outbox_test_1", organizationId: "org_1", schoolId: "school_1", channel: "EMAIL", status: "DELIVERED", lastProviderEventAt: null, recipientEmailHash: "b".repeat(64), recipientEmailHashVersion: "v2" });
    mocks.tx.$queryRaw.mockResolvedValue([{ id: "suppression-complaint" }]);
    const body = JSON.stringify(complained);
    const response = await request(makeApp()).post("/webhooks/test-provider").set("x-school-email-signature", signed(body)).send(body);
    expect(response.status).toBe(200);
    expect(mocks.tx.$queryRaw).toHaveBeenCalled();
    expect(mocks.tx.notificationEmailSuppressionAudit.create).toHaveBeenCalled();
  });
  it("does not re-suppress after a manual release that postdates the provider event", async () => {
    const bounced = { ...event, id: "evt_bounce_after_release", type: "email.bounced" };
    mocks.tx.notificationOutbox.findUnique.mockResolvedValue({ id: "outbox_test_1", organizationId: "org_1", schoolId: "school_1", channel: "EMAIL", status: "DELIVERED", lastProviderEventAt: null, recipientEmailHash: "c".repeat(64), recipientEmailHashVersion: "v2" });
    mocks.tx.notificationEmailSuppression.findFirst.mockResolvedValue({ status: "RELEASED", releasedAt: new Date("2026-11-18T09:00:00.000Z") });
    const body = JSON.stringify(bounced);
    const response = await request(makeApp()).post("/webhooks/test-provider").set("x-school-email-signature", signed(body)).send(body);
    expect(response.status).toBe(200);
    expect(mocks.tx.$queryRaw).not.toHaveBeenCalled();
    expect(mocks.tx.notificationEmailSuppressionAudit.create).not.toHaveBeenCalled();
  });
  it("does not create suppression when historical outbox has no recipient hash", async () => {
    const bounced = { ...event, id: "evt_bounce_legacy", type: "email.bounced" };
    const body = JSON.stringify(bounced);
    const response = await request(makeApp()).post("/webhooks/test-provider").set("x-school-email-signature", signed(body)).send(body);
    expect(response.status).toBe(200);
    expect(mocks.tx.$queryRaw).not.toHaveBeenCalled();
  });
  it("returns not found for a missing or non-email outbox", async () => {
    mocks.tx.notificationOutbox.findUnique.mockResolvedValue(null);
    const body = JSON.stringify(event);
    const response = await request(makeApp()).post("/webhooks/test-provider").set("x-school-email-signature", signed(body)).send(body);
    expect(response.status).toBe(404);
  });
  it("retains older events without overwriting newer outbox state", async () => {
    mocks.tx.notificationOutbox.findUnique.mockResolvedValue({ id: "outbox_test_1", organizationId: "org_1", schoolId: "school_1", channel: "EMAIL", status: "BOUNCED", lastProviderEventAt: new Date("2026-11-18T09:00:00.000Z") });
    const body = JSON.stringify(event);
    const response = await request(makeApp()).post("/webhooks/test-provider").set("x-school-email-signature", signed(body)).send(body);
    expect(response.status).toBe(200);
    expect(mocks.tx.notificationDeliveryEvent.create).toHaveBeenCalled();
    expect(mocks.tx.notificationOutbox.update).not.toHaveBeenCalled();
  });
});
