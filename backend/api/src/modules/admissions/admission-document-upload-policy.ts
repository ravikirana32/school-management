/** P530: centralized admission document upload policy shared by route validation and UI contract. */
export const ADMISSION_DOCUMENT_ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const ADMISSION_DOCUMENT_MAX_BYTES = 25 * 1024 * 1024;
export const ADMISSION_DOCUMENT_UPLOAD_EXPIRY_SECONDS = 300;
export const ADMISSION_DOCUMENT_DOWNLOAD_EXPIRY_SECONDS = 60;

export function normalizeAdmissionDocumentDisplayName(value: string): string {
  return value.trim().replace(/[\\/\\\\\u0000-\u001f\u007f]/g, "-").replace(/\s+/g, " ").slice(0, 150);
}

export function admissionDocumentUploadPolicy() {
  return {
    allowedMimeTypes: [...ADMISSION_DOCUMENT_ALLOWED_MIME_TYPES],
    maxBytes: ADMISSION_DOCUMENT_MAX_BYTES,
    uploadUrlExpirySeconds: ADMISSION_DOCUMENT_UPLOAD_EXPIRY_SECONDS,
    downloadUrlExpirySeconds: ADMISSION_DOCUMENT_DOWNLOAD_EXPIRY_SECONDS,
    replacementAllowedOnlyForRejectedSameType: true,
    quarantineRequired: true,
    cleanScanRequiredBeforeDownload: true,
  };
}
