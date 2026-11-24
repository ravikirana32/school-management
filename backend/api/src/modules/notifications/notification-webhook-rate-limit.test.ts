import { describe, expect, it } from "vitest";
import { buildNotificationRateLimitKey } from "./notification-rate-limit-key.js";

describe("notification rate-limit key", () => {
  it("hashes identity and does not place raw identity in Redis key", () => {
    const identity = "org-1:school-2:user@example.com";
    const key = buildNotificationRateLimitKey("suppression-create", identity);
    expect(key).toMatch(/^notification:rate:[a-f0-9]{64}$/);
    expect(key).not.toContain(identity);
    expect(key).not.toContain("user@example.com");
  });
  it("separates scopes and identities", () => {
    expect(buildNotificationRateLimitKey("webhook:vendor", "127.0.0.1")).not.toBe(buildNotificationRateLimitKey("suppression-create", "127.0.0.1"));
    expect(buildNotificationRateLimitKey("webhook:vendor", "127.0.0.1")).not.toBe(buildNotificationRateLimitKey("webhook:vendor", "127.0.0.2"));
  });
  it("rejects invalid scope characters", () => expect(() => buildNotificationRateLimitKey("webhook vendor", "ip")).toThrow());
});
