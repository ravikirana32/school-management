import { describe, expect, it } from "vitest";
import { decodeNotificationCursor, encodeNotificationCursor, notificationPageSize, notificationSnapshotWhere } from "./parent-notification-pagination.js";

describe("parent notification keyset pagination", () => {
  const cursor = { v: 1 as const, lastCreatedAt: "2026-11-17T04:00:00.000Z", lastId: "notice_20", watermarkCreatedAt: "2026-11-17T05:00:00.000Z", watermarkId: "notice_30" };
  it("round trips a snapshot cursor", () => expect(decodeNotificationCursor(encodeNotificationCursor(cursor))).toEqual(cursor));
  it("rejects malformed and unsupported cursors", () => { expect(decodeNotificationCursor("not-a-cursor")).toBeNull(); expect(decodeNotificationCursor(Buffer.from(JSON.stringify({ ...cursor, v: 2 })).toString("base64url"))).toBeNull(); });
  it("bounds page size", () => { expect(notificationPageSize("1")).toBe(1); expect(notificationPageSize("100")).toBe(100); expect(notificationPageSize("101")).toBe(30); expect(notificationPageSize("-1")).toBe(30); });
  it("builds both watermark and after-anchor predicates", () => { const where = notificationSnapshotWhere(cursor); expect(where.AND).toHaveLength(2); });
});
