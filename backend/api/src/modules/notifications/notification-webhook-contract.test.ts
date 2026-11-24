import { describe, expect, it } from "vitest";
import { notificationDeliveryEventSchema, toNotificationDeliveryEventType } from "./notification-webhook-contract.js";

describe("canonical notification delivery webhook contract", () => {
  const valid = { id: "evt_123", type: "email.delivered", occurredAt: "2026-11-17T09:00:00.000Z", data: { outboxId: "outbox_123", messageId: "msg_123" } };
  it("accepts the canonical delivered event and defaults contract version to v1", () => {
    const parsed = notificationDeliveryEventSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.contractVersion).toBe("v1");
  });
  it("accepts explicit v1 and rejects unsupported contract versions", () => {
    expect(notificationDeliveryEventSchema.safeParse({ ...valid, contractVersion: "v1" }).success).toBe(true);
    expect(notificationDeliveryEventSchema.safeParse({ ...valid, contractVersion: "v2" }).success).toBe(false);
  });
  it("requires an event identifier", () => expect(notificationDeliveryEventSchema.safeParse({ ...valid, id: "" }).success).toBe(false));
  it("rejects unsupported event types", () => expect(notificationDeliveryEventSchema.safeParse({ ...valid, type: "email.opened" }).success).toBe(false));
  it("requires timezone-aware occurrence timestamps", () => expect(notificationDeliveryEventSchema.safeParse({ ...valid, occurredAt: "2026-11-17T09:00:00" }).success).toBe(false));
  it("rejects unknown top-level and nested fields", () => expect(notificationDeliveryEventSchema.safeParse({ ...valid, unexpected: true }).success).toBe(false));
  it("requires a scoped outbox reference", () => expect(notificationDeliveryEventSchema.safeParse({ ...valid, data: { messageId: "msg_1" } }).success).toBe(false));
  it.each([["email.delivered", "DELIVERED"], ["email.bounced", "BOUNCED"], ["email.complained", "COMPLAINED"]] as const)("maps %s to %s", (input, expected) => expect(toNotificationDeliveryEventType(input)).toBe(expected));
});
