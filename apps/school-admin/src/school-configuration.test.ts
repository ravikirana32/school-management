import { describe, expect, it } from "vitest";

const isRealDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const validDateRange = (start: string, end: string) => isRealDate(start) && isRealDate(end) && end >= start;
const validTimeRange = (open: string, close: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(open) && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(close) && close > open;

describe("school configuration form guards", () => {
  it("accepts a valid academic year range", () => expect(validDateRange("2027-04-01", "2028-03-31")).toBe(true));
  it("rejects a reversed academic year range", () => expect(validDateRange("2028-04-01", "2027-03-31")).toBe(false));
  it("rejects impossible calendar dates", () => expect(validDateRange("2027-02-30", "2028-03-31")).toBe(false));
  it("accepts a valid working-day time range", () => expect(validTimeRange("08:00", "15:00")).toBe(true));
  it("rejects equal or reversed working-day times", () => { expect(validTimeRange("08:00", "08:00")).toBe(false); expect(validTimeRange("16:00", "08:00")).toBe(false); });
});
