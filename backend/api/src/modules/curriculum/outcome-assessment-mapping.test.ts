import { describe, expect, it } from "vitest";
import { validateOutcomeExamAlignment } from "./outcome-assessment-mapping.js";

describe("P416 outcome-to-exam alignment validation", () => {
  it("accepts matching grade and subject names case-insensitively", () => {
    expect(validateOutcomeExamAlignment({ outcomeGradeLevelId: "g1", examGradeLevelId: "g1", outcomeSubjectName: "Mathematics", examSubjectName: " mathematics " })).toEqual({ valid: true });
  });
  it("accepts exam subject matching the outcome subject code", () => {
    expect(validateOutcomeExamAlignment({ outcomeGradeLevelId: "g1", examGradeLevelId: "g1", outcomeSubjectName: "Mathematics", outcomeSubjectCode: "MATH", examSubjectName: "math" })).toEqual({ valid: true });
  });
  it("rejects grade mismatches", () => {
    expect(validateOutcomeExamAlignment({ outcomeGradeLevelId: "g1", examGradeLevelId: "g2", examSubjectName: "Science" }).valid).toBe(false);
  });
  it("rejects subject mismatch for subject-scoped outcomes", () => {
    expect(validateOutcomeExamAlignment({ outcomeGradeLevelId: "g1", examGradeLevelId: "g1", outcomeSubjectName: "Math", examSubjectName: "Science" }).valid).toBe(false);
  });
  it("allows grade-scoped outcomes to map to any exam subject", () => {
    expect(validateOutcomeExamAlignment({ outcomeGradeLevelId: "g1", examGradeLevelId: "g1", examSubjectName: "Science" })).toEqual({ valid: true });
  });
});
