import { describe, expect, it } from "vitest";
import { parseNotificationPageOptions } from "./notification-pagination.js";

describe("notification page options", () => {
  it("defaults to 50 rows", () => expect(parseNotificationPageOptions({})).toEqual({ limit: 50, invalidCursor: false }));
  it("clamps page size to 1..100", () => {
    expect(parseNotificationPageOptions({ limit: "500" }).limit).toBe(100);
    expect(parseNotificationPageOptions({ limit: "0" }).limit).toBe(1);
  });
  it("falls back to default for invalid limit", () => expect(parseNotificationPageOptions({ limit: "many" }).limit).toBe(50));
  it("accepts bounded cursor strings", () => expect(parseNotificationPageOptions({ cursor: "suppression_123" })).toEqual({ limit: 50, cursor: "suppression_123", invalidCursor: false }));
  it("rejects empty, oversized and non-string cursors", () => {
    expect(parseNotificationPageOptions({ cursor: "" }).invalidCursor).toBe(true);
    expect(parseNotificationPageOptions({ cursor: "x".repeat(129) }).invalidCursor).toBe(true);
    expect(parseNotificationPageOptions({ cursor: ["a", "b"] }).invalidCursor).toBe(true);
  });
});
