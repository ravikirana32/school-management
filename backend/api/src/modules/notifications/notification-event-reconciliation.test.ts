import { describe, expect, it } from "vitest";
import { shouldApplyNotificationDeliveryEvent } from "./notification-event-reconciliation.js";

describe("notification delivery event reconciliation", () => {
  const newer = new Date("2026-11-18T09:00:00.000Z");
  const older = new Date("2026-11-17T09:00:00.000Z");
  it("applies the first provider event", () => expect(shouldApplyNotificationDeliveryEvent("PENDING", null, "DELIVERED", older)).toBe(true));
  it("ignores older events", () => expect(shouldApplyNotificationDeliveryEvent("BOUNCED", newer, "DELIVERED", older)).toBe(false));
  it("allows a newer bounce to supersede delivery", () => expect(shouldApplyNotificationDeliveryEvent("DELIVERED", older, "BOUNCED", newer)).toBe(true));
  it("does not let a later delivery erase a bounce", () => expect(shouldApplyNotificationDeliveryEvent("BOUNCED", older, "DELIVERED", newer)).toBe(false));
  it("does not let a later delivery erase a complaint", () => expect(shouldApplyNotificationDeliveryEvent("COMPLAINED", older, "DELIVERED", newer)).toBe(false));
  it("does not let a bounce erase a complaint", () => expect(shouldApplyNotificationDeliveryEvent("COMPLAINED", older, "BOUNCED", newer)).toBe(false));
  it("allows complaint feedback to supersede a bounce", () => expect(shouldApplyNotificationDeliveryEvent("BOUNCED", older, "COMPLAINED", newer)).toBe(true));
  it("rejects invalid event dates", () => expect(shouldApplyNotificationDeliveryEvent("PENDING", null, "DELIVERED", new Date("invalid"))).toBe(false));
});
