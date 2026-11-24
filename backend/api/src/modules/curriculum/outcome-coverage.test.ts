import { describe, expect, it } from "vitest";
import { buildOutcomeCoverageDashboard } from "./outcome-coverage.js";
const outcomes = [
  { id: "o1", gradeLevelId: "g1", curriculumSubjectId: "s1", reviewStatus: "APPROVED", code: "M1", title: "Counting" },
  { id: "o2", gradeLevelId: "g1", curriculumSubjectId: "s1", reviewStatus: "DRAFT", code: "M2", title: "Addition" },
  { id: "o3", gradeLevelId: "g1", curriculumSubjectId: null, reviewStatus: "IN_REVIEW", code: "G1", title: "Learning habits" },
  { id: "o4", gradeLevelId: "g2", curriculumSubjectId: "s2", reviewStatus: "APPROVED", code: "E1", title: "Plants" },
];
const mappings = [{ outcomeId: "o1", examId: "e1" }, { outcomeId: "o1", examId: "e2" }, { outcomeId: "o3", examId: "e1" }, { outcomeId: "o4", examId: "e3" }, { outcomeId: "orphan", examId: "e1" }];
const exams = [{ id: "e1", gradeLevelId: "g1", subjectName: "Mathematics", examName: "Math Midterm", status: "DRAFT" }, { id: "e2", gradeLevelId: "g1", subjectName: "Math", examName: "Math Final", status: "PUBLISHED" }, { id: "e3", gradeLevelId: "g2", subjectName: "Science", examName: "Science Quiz", status: "DRAFT" }, { id: "e4", gradeLevelId: "g1", subjectName: "Mathematics", examName: "Math Practice", status: "DRAFT" }];
const subjects = [{ id: "s1", gradeLevelId: "g1", name: "Mathematics", code: "MATH" }, { id: "s2", gradeLevelId: "g2", name: "Science", code: "SCI" }];
const grades = [{ id: "g1", name: "Grade 1", sequence: 1 }, { id: "g2", name: "Grade 2", sequence: 2 }];
describe("curriculum outcome coverage dashboard", () => {
  it("calculates mapped, unmapped, multiple-mapped and overall coverage summary", () => { const d = buildOutcomeCoverageDashboard(outcomes, mappings, exams, subjects, grades); expect(d.summary).toEqual({ totalOutcomes: 4, mappedOutcomes: 3, unmappedOutcomes: 1, multiMappedOutcomes: 1, totalMappings: 4, mappedExams: 3, coveragePercent: 75 }); });
  it("calculates grade coverage", () => { const d = buildOutcomeCoverageDashboard(outcomes, mappings, exams, subjects, grades); expect(d.byGrade.find(g => g.gradeLevelId === "g1")).toMatchObject({ totalOutcomes: 3, mappedOutcomes: 2, unmappedOutcomes: 1, coveragePercent: 67, mappedExamCount: 2 }); });
  it("calculates subject coverage for curriculum-scoped outcomes", () => { const d = buildOutcomeCoverageDashboard(outcomes, mappings, exams, subjects, grades); expect(d.bySubject.find(s => s.curriculumSubjectId === "s1")).toMatchObject({ totalOutcomes: 2, mappedOutcomes: 1, coveragePercent: 50 }); });
  it("calculates exam coverage against grade and subject eligible outcomes", () => { const d = buildOutcomeCoverageDashboard(outcomes, mappings, exams, subjects, grades); expect(d.byExam.find(e => e.examId === "e1")).toMatchObject({ mappedOutcomeCount: 2, eligibleOutcomeCount: 3, coveragePercent: 67 }); });
  it("includes exams with no mappings as zero coverage rows", () => { const d = buildOutcomeCoverageDashboard(outcomes, mappings, exams, subjects, grades); expect(d.byExam.find(e => e.examId === "e4")).toMatchObject({ mappedOutcomeCount: 0, coveragePercent: 0 }); });
  it("lists unmapped and multiply mapped outcomes for action", () => { const d = buildOutcomeCoverageDashboard(outcomes, mappings, exams, subjects, grades); expect(d.unmapped[0]).toMatchObject({ code: "M2", title: "Addition" }); expect(d.multiMapped[0]).toMatchObject({ code: "M1", mappingCount: 2 }); });
  it("handles an empty outcome set without division errors", () => { const d = buildOutcomeCoverageDashboard([], [], [], [], []); expect(d.summary.coveragePercent).toBe(0); expect(d.summary.totalOutcomes).toBe(0); expect(d.byExam).toEqual([]); });
});
