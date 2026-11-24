# P121 — Parent Resource Ownership and Document Access

## Scope
P121 tightens parent access to homework submission attachments. The upload, upload-completion and download paths now share one ownership predicate.

## Required ownership chain
A parent request is allowed only when all conditions hold:
1. An invitation exists for the exact organization and school.
2. The invitation is `ACCEPTED`, accepted by the current authenticated user, has a consent timestamp and has not been withdrawn.
3. The guardian belongs to the same organization and school, is active, is linked to the current user and has a verified email.
4. The guardian has an active communication link to the exact student in the same school.

The shared helper is `hasConsentedGuardianStudentLink` in `backend/api/src/modules/documents/document.routes.ts`. It is used by homework attachment upload, completion and parent download.

## Existing parent portal boundaries reviewed
The parent portal derives guardian IDs from accepted, non-withdrawn invitations accepted by the current user, then requires an active verified guardian and exact organization/school/student links. Attendance, fees, homework, homework submissions and report-card reads are scoped to the requested linked student.

## Existing teacher boundary reviewed
Homework attachment downloads for staff require active staff membership and a current teacher assignment matching the student's enrolled academic year, grade and section, unless the user has `academics.manage`. This phase does not claim that all teacher-facing modules have equivalent enforcement; that remains P121-G003.

## Verification boundary
Static source verification only. No API, database, Redis, mobile or browser runtime tests were run. Unit and end-to-end test work remains deferred per project instruction.
