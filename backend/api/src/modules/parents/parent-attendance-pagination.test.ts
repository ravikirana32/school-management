import { describe, expect, it } from "vitest";
import { parentAttendanceDateFilter, parentAttendanceQuerySchema, sliceParentAttendancePage } from "./parent-attendance-pagination.js";

describe("parent attendance pagination", () => {
  it("bounds page size and rejects malformed cursors and reversed dates", () => {
    expect(parentAttendanceQuerySchema.safeParse({ limit: "30" }).success).toBe(true);
    expect(parentAttendanceQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
    expect(parentAttendanceQuerySchema.safeParse({ cursor: "" }).success).toBe(false);
    expect(parentAttendanceQuerySchema.safeParse({ from: "2026-04-02", to: "2026-04-01" }).success).toBe(false);
  });

  it("includes the entire final calendar day using an exclusive upper bound", () => {
    const range = parentAttendanceDateFilter({ from: "2026-04-01", to: "2026-04-30" });
    expect(range.gte?.toISOString()).toBe("2026-04-01T00:00:00.000Z");
    expect(range.lt?.toISOString()).toBe("2026-05-01T00:00:00.000Z");
  });

  it("returns a stable next cursor only when another page exists", () => {
    const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(sliceParentAttendancePage(rows, 2)).toEqual({ data: [{ id: "a" }, { id: "b" }], nextCursor: "b", hasMore: true });
    expect(sliceParentAttendancePage(rows.slice(0, 2), 2)).toEqual({ data: [{ id: "a" }, { id: "b" }], nextCursor: null, hasMore: false });
  });
});
