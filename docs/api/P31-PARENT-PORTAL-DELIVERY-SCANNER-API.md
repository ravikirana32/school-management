# P31 Parent Portal, Invitation Delivery & Scanner API

## Parent invitation admin
- `POST /api/v1/:organizationId/:schoolId/parents/guardians/:guardianId/invitations` — requires `students.pii.read` and `students.update`; body includes `consentVersion` and `consentNoticeText` (50–4000 chars). Returns no raw token.
- `GET /api/v1/:organizationId/:schoolId/parents/invitations/:invitationId` — returns delivery state, attempt count, expiry and consent notice to authorized school staff.
- `POST /api/v1/:organizationId/:schoolId/parents/invitations/:invitationId/revoke` — revokes a pending invitation.
- `POST /api/v1/parents/invitations/preview` — accepts token in JSON body; returns consent notice/version and masked email for pending, unexpired token only.
- `POST /api/v1/parents/invitations/accept` — requires token, password, `consentAccepted: true` and exact consent version. Existing accounts must prove their password; new accounts are created. Membership and PARENT role are provisioned in the same transaction.

## Parent portal
- `GET /api/v1/parents/me/schools` — returns only schools with accepted, non-withdrawn consent and verified guardian links.
- `GET /api/v1/:organizationId/:schoolId/portal/children` — returns only students linked to the authenticated guardian with communication permission.
- `GET /api/v1/:organizationId/:schoolId/portal/children/:studentId/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD` — returns attendance only for SUBMITTED/LOCKED sessions, maximum 180 records.
- `POST /api/v1/:organizationId/:schoolId/portal/consent/withdraw` — revokes school-scoped parent access and records audit.

Parent APIs require active organization and school membership, `PARENT` role assignment, the corresponding `parent.portal.read` or `parent.attendance.read` permission, accepted invitation, unwithdrawn consent, verified active guardian and a visible StudentGuardian link. School membership alone is never sufficient.

## Delivery provider adapter
The worker posts JSON to `PARENT_EMAIL_PROVIDER_URL` with bearer token and `Idempotency-Key`. Payload contains `from`, `to`, `subject`, `template`, `variables` (`invitationUrl`, expiry, consent version/text) and invitation metadata. Provider must treat the idempotency key as unique and must not log invitation URL/token.

## Scanner provider adapter
The worker posts JSON to `DOCUMENT_SCANNER_PROVIDER_URL` with a short-lived `downloadUrl`, declared MIME, object key, document ID/kind, callback URL and callback signature contract. Provider must inspect the actual bytes and submit:
- `kind`: student or staff
- `verdict`: CLEAN or REJECTED
- `objectKey`
- `detectedMimeType`
- `scanReference`

Callback headers: `x-document-scan-timestamp` (Unix seconds) and `x-document-scan-signature` (hex HMAC-SHA256 over timestamp, dot, exact raw request body). Maximum timestamp skew is five minutes. Scanner and API must share a secret through a secure secret manager; never send it in the dispatch payload.
