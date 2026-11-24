export type AssessmentMark = { studentId: string; score: number; remarks?: string };

export function calculateExamResult(mark: AssessmentMark, maxMarks: number, passMarks = 0) {
  const safeMax = Number(maxMarks);
  const safeScore = Number(mark.score);
  if (!Number.isFinite(safeMax) || safeMax <= 0) throw new Error("Maximum marks must be positive");
  if (!Number.isFinite(safeScore) || safeScore < 0 || safeScore > safeMax) throw new Error("Score is outside the valid range");
  const percentage = Math.round((safeScore / safeMax) * 10000) / 100;
  const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : percentage >= 50 ? "D" : percentage >= 40 ? "E" : "F";
  return { studentId: mark.studentId, score: safeScore, maxMarks: safeMax, percentage, grade, pass: safeScore >= Number(passMarks), remarks: mark.remarks || null };
}


export function summarizeExamResults(marks: AssessmentMark[], maxMarks: number, passMarks = 0) {
  const results = marks.map(mark => calculateExamResult(mark, maxMarks, passMarks));
  const passed = results.filter(result => result.pass).length;
  const failed = results.length - passed;
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  return { results, summary: { studentCount: results.length, passed, failed, passPercentage: results.length ? Math.round((passed / results.length) * 10000) / 100 : 0, averagePercentage: results.length ? Math.round((results.reduce((sum, result) => sum + result.percentage, 0) / results.length) * 100) / 100 : 0, totalScore, maxPossibleScore: results.length * Number(maxMarks) } };
}
