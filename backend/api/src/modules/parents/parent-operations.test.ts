import { describe, expect, it } from "vitest";
import { isDraftPublishable, isValidResultSummary } from "./parent-operations.js";

describe("parent operational publication rules", () => {
  it("allows only DRAFT records to be published", () => {
    expect(isDraftPublishable("DRAFT")).toBe(true);
    for (const status of ["PUBLISHED", "PAID", "PARTIALLY_PAID", "OVERDUE", "ARCHIVED", ""]) {
      expect(isDraftPublishable(status)).toBe(false);
    }
  });
  it("accepts non-empty bounded generic result objects", () => {
    expect(isValidResultSummary({ Mathematics: { marks: 85, grade: "A" } })).toBe(true);
    expect(isValidResultSummary({})).toBe(false);
    expect(isValidResultSummary([])).toBe(false);
    expect(isValidResultSummary(null)).toBe(false);
    expect(isValidResultSummary({ [" "]: 1 })).toBe(false);
  });
});
