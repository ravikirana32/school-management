export type CurriculumOutcomeReviewStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "ARCHIVED";
const allowedTransitions: Record<CurriculumOutcomeReviewStatus, CurriculumOutcomeReviewStatus[]> = {
  DRAFT: ["IN_REVIEW", "ARCHIVED"],
  IN_REVIEW: ["DRAFT", "APPROVED", "ARCHIVED"],
  APPROVED: ["IN_REVIEW", "ARCHIVED"],
  ARCHIVED: ["DRAFT"]
};
export function outcomeReviewTransitionAllowed(from: string, to: string): boolean {
  if (!(from in allowedTransitions) || !(to in allowedTransitions)) return false;
  return from === to || allowedTransitions[from as CurriculumOutcomeReviewStatus].includes(to as CurriculumOutcomeReviewStatus);
}
