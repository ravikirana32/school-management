import { describe, expect, it } from "vitest";
import { buildNotificationOutboxClaimWhere, isNotificationOutboxLeaseClaimable, isNotificationOutboxTerminal } from "./notification-outbox-lease.js";

describe("notification outbox lease and terminal states", () => {
  const now = new Date("2026-11-17T12:00:00.000Z");
  it.each(["DELIVERED", "CANCELLED", "DEAD_LETTER", "BOUNCED", "COMPLAINED"])("treats %s as terminal", status => expect(isNotificationOutboxTerminal(status)).toBe(true));
  it("does not treat pending or retry as terminal", () => {
    expect(isNotificationOutboxTerminal("PENDING")).toBe(false);
    expect(isNotificationOutboxTerminal("RETRY")).toBe(false);
  });
  it.each(["PENDING", "RETRY"])("claims %s immediately", status => expect(isNotificationOutboxLeaseClaimable(status, null, now)).toBe(true));
  it("reclaims an expired processing lease", () => expect(isNotificationOutboxLeaseClaimable("PROCESSING", new Date(now.getTime() - 1), now)).toBe(true));
  it("does not reclaim a live or equal-time lease", () => {
    expect(isNotificationOutboxLeaseClaimable("PROCESSING", new Date(now.getTime() + 1), now)).toBe(false);
    expect(isNotificationOutboxLeaseClaimable("PROCESSING", now, now)).toBe(false);
  });
  it("does not claim terminal or unsupported states", () => {
    expect(isNotificationOutboxLeaseClaimable("BOUNCED", null, now)).toBe(false);
    expect(isNotificationOutboxLeaseClaimable("DELIVERED", null, now)).toBe(false);
    expect(isNotificationOutboxLeaseClaimable("UNKNOWN", null, now)).toBe(false);
  });
  it("builds a conditional database claim filter", () => expect(buildNotificationOutboxClaimWhere("outbox-1", now)).toEqual({ id: "outbox-1", channel: "EMAIL", OR: [{ status: { in: ["PENDING", "RETRY"] } }, { status: "PROCESSING", leaseUntil: { lt: now } }] }));
});
