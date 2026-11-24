# P122 Delivery Report — Teacher-to-Student Resource Authorization

## Implemented

`backend/api/src/modules/report-cards/report-card.routes.ts` now derives a teacher's student scope from: (1) an active staff member linked to the authenticated user in the exact organization and school, (2) active teacher assignments whose start/end dates include the current date, and (3) currently enrolled students matching the assignment's academic year, grade and section.

The scope is applied to:
- `GET /:organizationId/:schoolId/report-cards`
- `GET /:organizationId/:schoolId/report-cards/:reportCardId/artifact`
- `GET /:organizationId/:schoolId/report-cards/:reportCardId/pdf`

The artifact and PDF endpoints return not-found when the report belongs to a student outside the teacher's assigned set, preventing disclosure of artifact metadata or signed download URLs. The list endpoint returns only assigned students' report cards.

## Gap reconciliation
- Updated P119-G002 and P121-G003 without deleting their IDs.
- Added P122-G001 (READY_FOR_VERIFICATION), P122-G002 (OPEN), P122-G003 (OPEN).
- No gap closed because runtime and cross-tenant evidence has not been produced.
- Root/docs open-gap registers and resolved-gap history are mirrored byte-for-byte.

## Limitations
This is a targeted report-card remediation, not a complete teacher authorization audit. Student PII, guardian data, fees, historical record access, substitute teachers and worker/service paths remain outstanding.
