/** P531: guarded document review transitions. */
export type AdmissionDocumentReviewStatus = "VERIFIED" | "REJECTED";
export type AdmissionDocumentCurrentStatus = "PENDING" | "RECEIVED" | "VERIFIED" | "REJECTED";
export interface AdmissionDocumentReviewInput { target: AdmissionDocumentReviewStatus; current: AdmissionDocumentCurrentStatus; securityStatus: string; reviewNotes?: string | null; }
export function validateAdmissionDocumentReview(input: AdmissionDocumentReviewInput): { valid: true } | { valid: false; code: string; message: string } {
  if (input.current !== "RECEIVED") return { valid: false, code: "ADMISSION_DOCUMENT_REVIEW_STATE_CONFLICT", message: "Only received documents can be reviewed. Refresh the document list and retry." };
  if (input.securityStatus !== "CLEAN") return { valid: false, code: "ADMISSION_DOCUMENT_SCAN_REQUIRED", message: "Document must pass malware scanning before review." };
  if (input.target === "REJECTED" && !(input.reviewNotes || "").trim()) return { valid: false, code: "ADMISSION_DOCUMENT_REJECTION_REASON_REQUIRED", message: "Provide a correction reason before rejecting the document." };
  return { valid: true };
}
export function admissionDocumentReviewUpdateWhere(id: string, current: AdmissionDocumentCurrentStatus) { return { id, status: current, securityStatus: "CLEAN" as const }; }
