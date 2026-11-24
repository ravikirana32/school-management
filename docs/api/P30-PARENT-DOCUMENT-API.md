# P30 Parent Identity & Document API

All tenant routes require authentication, active school membership and the listed permission checks.

## Parent invitations
- `POST /api/v1/:organizationId/:schoolId/parents/guardians/:guardianId/invitations` — requires `students.update` and `students.pii.read`; body `{ consentVersion }`; queues encrypted delivery payload; returns no raw token.
- `POST /api/v1/invitations/accept` — public possession challenge; body `{ token, password, consentAccepted: true, consentVersion }`; expires after 48 hours and is single-use.
- `POST /api/v1/:organizationId/:schoolId/parents/invitations/:invitationId/revoke` — revoke pending invitation.
- `GET /api/v1/:organizationId/:schoolId/parents/guardians/:guardianId/merge-preview?targetGuardianId=...` — read-only merge preview.
- `POST /api/v1/:organizationId/:schoolId/parents/guardians/:guardianId/merge` — body `{ targetGuardianId, confirmation: "MERGE_GUARDIAN_RECORDS" }`; explicit transaction.

## Private documents
- `POST /api/v1/:organizationId/:schoolId/documents/student/:studentId/upload`
- `POST /api/v1/:organizationId/:schoolId/documents/staff/:staffId/upload`
- `POST /api/v1/:organizationId/:schoolId/documents/:documentId/complete` — body `{ kind: "student" | "staff" }`.
- `GET /api/v1/:organizationId/:schoolId/documents/:documentId/download?kind=student|staff` — CLEAN status only.
- `POST /api/v1/internal/documents/:documentId/scan-result` — external scanner callback; `x-document-scan-signature` is HMAC-SHA256 of the exact raw JSON body. Body `{ kind, verdict, objectKey, detectedMimeType, scanReference }`.

Upload request body: `{ documentType, displayName, mimeType, sizeBytes, issuedAt?, expiresAt? }`. MIME types are limited to `application/pdf`, `image/jpeg`, `image/png`; size is 1–25 MiB. Upload URLs expire after 300 seconds and download URLs after 60 seconds.

The invitation endpoint queues encrypted delivery material but does not send email. The scanner callback is a contract for an external scanner; no malware-scanning engine is bundled.
