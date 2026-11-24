import { describe, expect, it } from "vitest";
import { validateReportCardSubjects } from "./report-card-validation.js";
const schema = { subjects: [{ code: "MATH", components: [{ key: "written", maxMarks: 80 }, { key: "oral", maxMarks: 20 }] }] };
describe("validateReportCardSubjects", () => {
  it("accepts scores within the configured component bounds", () => expect(validateReportCardSubjects(schema, [{ code: "MATH", components: { written: 70, oral: 18 } }])).toBe("OK"));
  it("rejects an unknown subject or component", () => {
    expect(validateReportCardSubjects(schema, [{ code: "SCI", components: { written: 10 } }])).toBe("SUBJECT");
    expect(validateReportCardSubjects(schema, [{ code: "MATH", components: { written: 10, oral: 5, project: 1 } }])).toBe("SCORE");
  });
  it("rejects missing, negative, non-finite and over-limit marks", () => {
    expect(validateReportCardSubjects(schema, [{ code: "MATH", components: { written: 70 } }])).toBe("SCORE");
    expect(validateReportCardSubjects(schema, [{ code: "MATH", components: { written: -1, oral: 2 } }])).toBe("SCORE");
    expect(validateReportCardSubjects(schema, [{ code: "MATH", components: { written: 81, oral: 2 } }])).toBe("SCORE");
    expect(validateReportCardSubjects(schema, [{ code: "MATH", components: { written: Number.NaN, oral: 2 } }])).toBe("SCORE");
  });
  it("rejects malformed schema data", () => expect(validateReportCardSubjects({}, [])).toBe("SCHEMA"));
});
