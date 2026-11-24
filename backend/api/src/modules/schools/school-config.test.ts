import { describe, expect, it } from "vitest";
import {
  academicTermSchema, academicYearSchema, calendarEventSchema,
  dayConfigurationSchema, schoolPolicySchema, schoolProfileSchema
} from "./school-config.schemas.js";

describe("P06 school configuration validation", () => {
  it("accepts profile defaults and required display name", () => {
    const result = schoolProfileSchema.parse({ displayName: "Example School" });
    expect(result.countryCode).toBe("IN");
    expect(result.timezone).toBe("Asia/Kolkata");
  });
  it("rejects academic year end before start", () => {
    expect(academicYearSchema.safeParse({
      name: "2026-27", code: "2026-27", startsOn: "2027-04-01", endsOn: "2027-03-31"
    }).success).toBe(false);
  });
  it("rejects impossible calendar dates", () => {
    expect(academicYearSchema.safeParse({
      name: "Invalid year", code: "INVALID", startsOn: "2027-02-30", endsOn: "2028-03-31"
    }).success).toBe(false);
  });
  it("rejects term with invalid date range", () => {
    expect(academicTermSchema.safeParse({
      name: "Term 1", code: "T1", sequence: 1, startsOn: "2026-10-01", endsOn: "2026-09-30"
    }).success).toBe(false);
  });
  it("rejects duplicate weekdays", () => {
    expect(dayConfigurationSchema.safeParse([
      { dayOfWeek: 1, isWorkingDay: true }, { dayOfWeek: 1, isWorkingDay: false }
    ]).success).toBe(false);
  });
  it("rejects calendar event end before start", () => {
    expect(calendarEventSchema.safeParse({
      title: "Holiday", eventType: "HOLIDAY",
      startsAt: "2026-12-20T00:00:00Z", endsAt: "2026-12-19T00:00:00Z"
    }).success).toBe(false);
  });
  it("validates grading policy bounds", () => {
    expect(schoolPolicySchema.safeParse({
      grading: { gradingScale: "PERCENTAGE", passingPercentage: 120 }
    }).success).toBe(false);
  });
});
