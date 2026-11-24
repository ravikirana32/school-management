import { describe, expect, it } from "vitest";
import { buildParentListPage, createParentListCursor, parseParentListPage } from "./parent-list-pagination.js";

describe("school parent operations keyset pagination", () => {
  it("uses a bounded default page size", () => {
    expect(parseParentListPage({})).toEqual({ limit: 30 });
  });
  it("accepts limits from 1 through 100", () => {
    expect(parseParentListPage({ limit: "1" })).toEqual({ limit: 1 });
    expect(parseParentListPage({ limit: "100" })).toEqual({ limit: 100 });
    expect(parseParentListPage({ limit: "101" })).toBeNull();
    expect(parseParentListPage({ limit: "0" })).toBeNull();
  });
  it("round trips a versioned opaque cursor", () => {
    const cursor = createParentListCursor("record_123");
    expect(parseParentListPage({ cursor })).toEqual({ limit: 30, cursorId: "record_123" });
  });
  it("rejects malformed, oversized and unsupported cursors", () => {
    expect(parseParentListPage({ cursor: "not-json" })).toBeNull();
    expect(parseParentListPage({ cursor: Buffer.from(JSON.stringify({ v: 2, id: "x" })).toString("base64url") })).toBeNull();
    expect(parseParentListPage({ cursor: "x".repeat(513) })).toBeNull();
  });
  it("returns a stable continuation cursor only when another row exists", () => {
    expect(buildParentListPage([{ id: "a" }, { id: "b" }], 2)).toEqual({ items: [{ id: "a" }, { id: "b" }], hasMore: false, nextCursor: null });
    const page = buildParentListPage([{ id: "a" }, { id: "b" }, { id: "c" }], 2);
    expect(page.items.map(x => x.id)).toEqual(["a", "b"]);
    expect(page.hasMore).toBe(true);
    expect(parseParentListPage({ cursor: page.nextCursor })).toEqual({ limit: 30, cursorId: "b" });
  });
});
