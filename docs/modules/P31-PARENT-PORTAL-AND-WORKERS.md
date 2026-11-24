# P31 — Parent Portal, Delivery Workers & Consent Controls

Status: source implementation complete; runtime acceptance NOT VERIFIED.

## Parent identity and membership
- Parent invitation acceptance now verifies the existing account password when an account already exists, or creates a new account with the submitted password.
- The acceptance transaction records explicit consent, links the verified guardian, activates organization/school membership and assigns the least-privilege `PARENT` school role.
- The idempotent seed adds `parent.portal.read`, `parent.attendance.read` and the `PARENT` role.
- The invitation stores a versioned consent notice. The mobile app supports `school-parent://accept-invitation` deep links, loads the notice using a POST preview request, displays it, and requires explicit acceptance.
- Consent withdrawal records `consentWithdrawnAt`, preserves school-managed communication flags, marks school membership LEFT, removes the parent role assignment and audits the action.

## Parent portal APIs
- `GET /api/v1/parents/me/schools`
- `GET /api/v1/:organizationId/:schoolId/portal/children`
- `GET /api/v1/:organizationId/:schoolId/portal/children/:studentId/attendance`
- `POST /api/v1/:organizationId/:schoolId/portal/consent/withdraw`
- `POST /api/v1/parents/invitations/preview`
- Existing `POST /api/v1/parents/invitations/accept`

Every student/attendance response is filtered by an active school membership, `PARENT` role permission, verified active guardian, accepted invitation with unwithdrawn consent, and `canReceiveCommunications` link. Attendance returns only SUBMITTED/LOCKED sessions and caps the response at 180 records. It does not expose teacher remarks.

## Parent invitation delivery
- BullMQ queue: `parent-invitation-delivery`.
- Worker: `src/workers/parent-invitation-worker.ts`.
- Five attempts with exponential backoff; failed jobs go to a dead-letter queue.
- Worker reconciles encrypted pending invitation outbox rows every 30 seconds.
- Email provider adapter uses HTTPS, bearer auth, provider idempotency key and 20-second timeout.
- Raw invitation token is decrypted only in the worker and passed to the email provider over HTTPS. It is not logged or returned from admin APIs. The web fallback link places the token in the URL fragment so it is not sent in HTTP request logs; a separate `school-parent://` deep link is included for installed mobile apps.

## Malware scanner dispatch
- BullMQ queue: `document-malware-scan`.
- Worker: `src/workers/document-scan-worker.ts`.
- Worker obtains a 120-second signed URL for the quarantined object and dispatches it to the configured scanner provider over HTTPS.
- Scanner provider is expected to inspect malware, file signature/magic bytes, MIME and malformed/polyglot content, then call the existing callback.
- Callback signature now includes a timestamp: HMAC-SHA256(`timestamp + '.' + rawRequestBody`), accepted only within a five-minute clock-skew window. State transition from QUARANTINED is single-use, providing replay resistance after successful processing.
- The scanner engine/provider is external; this repository includes the queue adapter and callback contract, not a bundled antivirus engine.

## Run workers
From `backend/api`:
- `pnpm worker:parent-delivery`
- `pnpm worker:document-scan`

Configure Redis, S3, parent email provider variables and scanner provider variables before running. Use separate worker processes and dedicated least-privilege database credentials. The custom RLS worker GUCs are defense in depth and do not replace credential separation.
