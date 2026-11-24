import { describe, expect, it } from "vitest";
import { buildNotificationOperationalEvent } from "./notification-operational-event.js";

describe("safe notification operational events", () => {
  it("keeps only allowlisted operational fields", () => {
    const event = buildNotificationOperationalEvent({ event: "notification.delivery.delivered", outboxId: "outbox_123", status: "DELIVERED", attempt: 2, durationMs: 250, reasonCode: "school_suppression", email: "parent@example.com", emailHash: "secret-hash", token: "private" } as never);
    expect(event).toEqual({ event: "notification.delivery.delivered", outboxId: "outbox_123", status: "DELIVERED", attempt: 2, durationMs: 250 });
    expect(JSON.stringify(event)).not.toContain("parent@example.com");
    expect(JSON.stringify(event)).not.toContain("secret-hash");
  });
  it("bounds invalid identifiers, status and duration", () => {
    expect(buildNotificationOperationalEvent({ event: "notification.delivery.skipped", outboxId: "email@example.com", status: "Delivered with PII", durationMs: 99_999_999 })).toEqual({ event: "notification.delivery.skipped", outboxId: "redacted", status: "UNKNOWN", durationMs: 3_600_000 });
  });
  it("accepts only fixed reason codes", () => {
    expect(buildNotificationOperationalEvent({ event: "notification.delivery.cancelled", outboxId: "outbox_1", status: "CANCELLED", reasonCode: "school_suppression" }).reasonCode).toBeUndefined();
    expect(buildNotificationOperationalEvent({ event: "notification.delivery.cancelled", outboxId: "outbox_1", status: "CANCELLED", reasonCode: "no_consented_recipient" }).reasonCode).toBe("no_consented_recipient");
  });
});
