import { describe, expect, it } from "vitest";
import { dayBefore, isStrictlyAfter } from "./employment-history.js";

describe("append-only employment periods", () => {
  it("requires a new period to start after the previous period", () => {
    expect(isStrictlyAfter(new Date("2026-01-01T00:00:00Z"), new Date("2026-01-02T00:00:00Z"))).toBe(true);
    expect(isStrictlyAfter(new Date("2026-01-01T00:00:00Z"), new Date("2026-01-01T00:00:00Z"))).toBe(false);
  });
  it("ends the previous period on the day before the new effective date", () => {
    expect(dayBefore(new Date("2026-02-01T00:00:00Z")).toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });
});
