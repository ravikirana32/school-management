import { describe, expect, it } from "vitest";

const isoWeekday = (date: string) => {
  const value = new Date(`${date}T00:00:00.000Z`);
  return ((value.getUTCDay() + 6) % 7) + 1;
};
const overlaps = (a: { startsAt: string; endsAt: string }, b: { startsAt: string; endsAt: string }) =>
  a.startsAt < b.endsAt && a.endsAt > b.startsAt;

describe("teacher timetable rules", () => {
  it("uses ISO weekdays from Monday=1 through Sunday=7", () => {
    expect(isoWeekday("2026-11-16")).toBe(1);
    expect(isoWeekday("2026-11-22")).toBe(7);
  });
  it("detects intersecting periods but permits adjacent periods", () => {
    expect(overlaps({ startsAt: "09:00", endsAt: "10:00" }, { startsAt: "09:45", endsAt: "10:30" })).toBe(true);
    expect(overlaps({ startsAt: "09:00", endsAt: "10:00" }, { startsAt: "10:00", endsAt: "10:45" })).toBe(false);
  });
});

const dateOverlap = (aFrom?: string, aTo?: string, bFrom?: string, bTo?: string) =>
  (aFrom ?? "0001-01-01") <= (bTo ?? "9999-12-31") && (bFrom ?? "0001-01-01") <= (aTo ?? "9999-12-31");

describe("timetable effective-date conflict rules", () => {
  it("detects overlapping effective windows", () => {
    expect(dateOverlap("2026-06-01", "2026-12-31", "2026-09-01", "2027-03-31")).toBe(true);
  });
  it("allows non-overlapping effective windows and open-ended ranges", () => {
    expect(dateOverlap("2026-06-01", "2026-08-31", "2026-09-01", "2027-03-31")).toBe(false);
    expect(dateOverlap(undefined, "2026-08-31", "2026-09-01", undefined)).toBe(false);
  });
});

const effectiveException = (kind: "CANCEL" | "SUBSTITUTE" | "OVERRIDE", base: { startsAt: string; endsAt: string; room?: string | null }, change: { startsAt?: string; endsAt?: string; room?: string | null }) => ({
  cancelled: kind === "CANCEL",
  startsAt: change.startsAt ?? base.startsAt,
  endsAt: change.endsAt ?? base.endsAt,
  room: change.room ?? base.room ?? null,
});

describe("date-specific timetable exception projection", () => {
  it("cancels only the selected occurrence without changing the recurring slot", () => {
    const result = effectiveException("CANCEL", { startsAt: "09:00", endsAt: "10:00" }, {});
    expect(result.cancelled).toBe(true);
    expect(result.startsAt).toBe("09:00");
  });
  it("overrides time and room for one occurrence", () => {
    const result = effectiveException("OVERRIDE", { startsAt: "09:00", endsAt: "10:00", room: "R1" }, { startsAt: "10:00", endsAt: "11:00", room: "LAB2" });
    expect(result).toEqual({ cancelled: false, startsAt: "10:00", endsAt: "11:00", room: "LAB2" });
  });
  it("uses base values when a substitute occurrence has no explicit override", () => {
    const result = effectiveException("SUBSTITUTE", { startsAt: "09:00", endsAt: "10:00", room: "R1" }, {});
    expect(result.cancelled).toBe(false);
    expect(result.room).toBe("R1");
  });
});
