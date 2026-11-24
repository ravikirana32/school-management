import { describe, expect, it } from "vitest";
import { boardCatalogue } from "./curriculum.catalogue.js";
import { boardProfileSchema, curriculumSubjectSchema, curriculumVersionSchema, gradeSchema } from "./curriculum.schemas.js";

describe("P07 board and curriculum validation", () => {
  it("exposes the supported board families", () => {
    expect(boardCatalogue.map(x => x.key)).toEqual(["CBSE","CISCE_ICSE","CISCE_ISC","STATE","IB","IGCSE","CUSTOM"]);
  });
  it("rejects invalid board effective date ranges", () => {
    expect(boardProfileSchema.safeParse({ boardKey: "CBSE", effectiveFrom: "2027-04-01", effectiveTo: "2027-03-31" }).success).toBe(false);
  });
  it("rejects grade age ranges where maximum is below minimum", () => {
    expect(gradeSchema.safeParse({ code: "G1", name: "Grade 1", sequence: 1, ageMin: 8, ageMax: 6 }).success).toBe(false);
  });
  it("rejects curriculum version date ranges in reverse order", () => {
    expect(curriculumVersionSchema.safeParse({ name: "2027 syllabus", code: "SYL27", boardKey: "CBSE", effectiveFrom: "2027-04-01", effectiveTo: "2027-03-31" }).success).toBe(false);
  });
  it("rejects pass marks greater than maximum marks", () => {
    expect(curriculumSubjectSchema.safeParse({ gradeLevelId: "grade-id", code: "MATH", name: "Mathematics", maxMarks: 80, passMarks: 90 }).success).toBe(false);
  });
});
