# P225 — Applicant Portal Follow-up Chain Visibility

## Implemented (source-level)
- Public applicant information-request endpoint now returns the `followUpToId` relationship for each scoped request.
- Applicant portal renders requests in chronological order rather than newest-first.
- Timeline entries distinguish original requests from follow-up requests and display lifecycle state (`OPEN`, `RESPONDED`, `RESOLVED`).
- Follow-up entries reference the parent request text when the parent is present in the fetched list.
- Applicant responses are shown inline with response timestamp; resolved requests display resolution timestamp when available.
- Existing OPEN-only response control and response API remain in place.

## Files changed
- `backend/api/src/modules/admissions/admission.public.routes.ts`
- `apps/public-portal/src/main.tsx`
- `apps/public-portal/src/style.css`

## Validation
- Source-level assertions and archive integrity only.
- No build/typecheck, database migration/runtime, API integration tests, mobile build, E2E, security, or deployment validation performed (deferred by project direction).
