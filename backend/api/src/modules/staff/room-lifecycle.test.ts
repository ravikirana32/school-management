import { describe, expect, it } from "vitest";
import { buildLegacyRoomUsageReport } from "./room-lifecycle.js";

describe("legacy room usage report", () => {
  it("aggregates active and historical references without losing counts", () => {
    const result = buildLegacyRoomUsageReport(
      [{ room: "R101", isActive: true }, { room: "Lab old", isActive: false }],
      [{ room: "R101", isActive: false }, { room: "LAB OLD", isActive: true }],
      [{ code: "R101", isActive: true }],
    );
    expect(result.totalDistinctLabels).toBe(3);
    expect(result.labels.find((row) => row.label === "R101")).toMatchObject({ slotReferences: 1, exceptionReferences: 1, activeSlotReferences: 1, canonicalRoomCode: "R101", requiresReview: false });
    expect(result.unmappedLabels).toBe(2);
  });
  it("flags case-normalized labels for review rather than rewriting them", () => {
    const result = buildLegacyRoomUsageReport([{ room: "r101", isActive: true }], [], [{ code: "R101", isActive: true }]);
    expect(result.labels[0]).toMatchObject({ canonicalRoomCode: "R101", requiresReview: true });
  });
  it("ignores null and blank room labels", () => {
    const result = buildLegacyRoomUsageReport([{ room: null, isActive: true }, { room: "  ", isActive: true }], [], []);
    expect(result.totalDistinctLabels).toBe(0);
  });
});
