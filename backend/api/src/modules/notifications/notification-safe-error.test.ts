import { describe, expect, it } from "vitest";
import { safeNotificationFailureSummary } from "./notification-safe-error.js";

describe("safe notification failure summaries", () => {
  it("preserves only a validated provider HTTP status", () => expect(safeNotificationFailureSummary(new Error("Notification provider returned HTTP 429"))).toBe("Notification provider HTTP 429"));
  it("does not persist arbitrary provider/network error messages", () => {
    const secret = "Bearer private-token parent@example.com";
    const result = safeNotificationFailureSummary(new Error(`request failed ${secret}`));
    expect(result).toBe("Notification provider transport failure");
    expect(result).not.toContain(secret);
    expect(result).not.toContain("parent@example.com");
  });
  it("handles non-Error values", () => expect(safeNotificationFailureSummary({ token: "secret" })).toBe("Notification provider transport failure"));
});
