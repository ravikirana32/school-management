import { describe, expect, it } from "vitest";
import { buildRoomAliasMigrationSummary, normalizeRoomAliasLabel } from "./room-lifecycle.js";

describe("room alias migration", () => {
  it("normalizes whitespace and case deterministically", () => {
    expect(normalizeRoomAliasLabel("  Science Lab ")).toBe("science lab");
  });
  it("counts exact normalized legacy references without changing source rows", () => {
    const slots = [{ room: "Lab-1", isActive: true }, { room: " lab-1 ", isActive: false }, { room: "Lab 2", isActive: true }];
    const exceptions = [{ room: "LAB-1", isActive: true }, { room: null, isActive: true }];
    const result = buildRoomAliasMigrationSummary({ aliasLabel: "lab-1", canonicalRoomCode: "SCI-01" }, slots, exceptions);
    expect(result).toMatchObject({ slotReferences: 2, activeSlotReferences: 1, exceptionReferences: 1, activeExceptionReferences: 1 });
    expect(slots[0].room).toBe("Lab-1");
  });
});
