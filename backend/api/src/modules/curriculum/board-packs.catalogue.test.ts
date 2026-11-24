import { describe, expect, it } from "vitest";
import { boardCurriculumPacks, getBoardCurriculumPack } from "./board-packs.catalogue.js";

describe("P411 board curriculum starter packs", () => {
  it("includes one starter metadata pack for each supported board family", () => {
    expect(boardCurriculumPacks.map(pack => pack.boardKey)).toEqual(["CBSE", "CISCE_ICSE", "CISCE_ISC", "STATE", "IB", "IGCSE", "CUSTOM"]);
  });
  it("labels packs as starter metadata with non-official provenance", () => {
    for (const pack of boardCurriculumPacks) {
      expect(pack.contentStatus).toBe("STARTER_METADATA");
      expect(pack.provenance.toLowerCase()).toContain("not official");
      expect(pack.stageKeys.length).toBeGreaterThan(0);
      expect(pack.competencyDomains.length).toBeGreaterThan(0);
    }
  });
  it("supports case-insensitive pack lookup and returns null for unsupported keys", () => {
    expect(getBoardCurriculumPack("cbse")?.packId).toBe("IN-CBSE-STARTER");
    expect(getBoardCurriculumPack("no-such-board")).toBeNull();
  });
});
