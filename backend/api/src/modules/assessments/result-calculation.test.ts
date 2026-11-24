import { describe, expect, it } from "vitest";
import { calculateExamResult, summarizeExamResults } from "./result-calculation.js";

describe("exam result calculations", () => {
  it("calculates percentage and grade boundaries", () => {
    expect(calculateExamResult({ studentId: "s1", score: 90 }, 100, 35)).toMatchObject({ percentage: 90, grade: "A+", pass: true });
    expect(calculateExamResult({ studentId: "s2", score: 79.5 }, 100, 35)).toMatchObject({ percentage: 79.5, grade: "B", pass: true });
    expect(calculateExamResult({ studentId: "s3", score: 39.99 }, 100, 40)).toMatchObject({ percentage: 39.99, grade: "F", pass: false });
  });
  it("aggregates class results without changing the input marks", () => {
    const marks = [{ studentId: "s1", score: 80 }, { studentId: "s2", score: 30 }];
    const summary = summarizeExamResults(marks, 100, 35);
    expect(summary.summary).toMatchObject({ studentCount: 2, passed: 1, failed: 1, passPercentage: 50, averagePercentage: 55 });
    expect(marks).toEqual([{ studentId: "s1", score: 80 }, { studentId: "s2", score: 30 }]);
  });
  it("rejects invalid maximum marks and scores", () => {
    expect(() => calculateExamResult({ studentId: "s1", score: 5 }, 0)).toThrow();
    expect(() => calculateExamResult({ studentId: "s1", score: 101 }, 100)).toThrow();
  });
});
