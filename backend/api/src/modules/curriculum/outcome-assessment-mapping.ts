export type OutcomeExamAlignmentInput = {
  outcomeGradeLevelId: string;
  examGradeLevelId: string;
  outcomeSubjectName?: string | null;
  outcomeSubjectCode?: string | null;
  examSubjectName: string;
};

/** Validates grade/subject compatibility before a persisted mapping is created. */
export function validateOutcomeExamAlignment(input: OutcomeExamAlignmentInput): { valid: true } | { valid: false; reason: string } {
  if (input.outcomeGradeLevelId !== input.examGradeLevelId) {
    return { valid: false, reason: "Outcome and exam must target the same grade" };
  }
  const subjectName = input.outcomeSubjectName?.trim().toLocaleLowerCase();
  const subjectCode = input.outcomeSubjectCode?.trim().toLocaleLowerCase();
  if (subjectName || subjectCode) {
    const examSubject = input.examSubjectName.trim().toLocaleLowerCase();
    if (!examSubject || (examSubject !== subjectName && examSubject !== subjectCode)) {
      return { valid: false, reason: "Outcome subject must match the exam subject name or code" };
    }
  }
  return { valid: true };
}
