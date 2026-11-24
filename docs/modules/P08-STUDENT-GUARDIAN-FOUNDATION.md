# P08 — Student and Guardian Foundation

## Delivered source
- Student profile with school-scoped admission number, names, date of birth, demographic/contact/address fields, admission/leaving dates and lifecycle status.
- Guardian contact records and student-to-guardian relationship links.
- Relationship, primary contact, emergency contact, pickup permission and communication preference flags.
- Student enrollment into P06 academic years and P07 grade levels, with section/roll number and enrollment lifecycle.
- Authorized pickup contact records with validity windows.
- Student document metadata with private object key, type, MIME type, size and issue/expiry dates.
- Composite tenant foreign keys and forced RLS for all six P08 tables.
- Student entitlement check and school-admin-only API boundary.
- School Admin local student/guardian preview.

## Privacy and access
All P08 API routes currently require active school membership and SCHOOL_ADMIN. This deliberately restricts access until granular student permissions and teacher class/section assignments are available. Guardian contacts are not login identities. No parent portal access is created or implied by storing a guardian record. Document metadata stores private object keys only; signed URLs and file upload are not implemented.

## API
Base prefix `/api/v1/:organizationId/:schoolId`:
- `GET /students` — paginated/searchable student list
- `POST /students` — create student and initial guardian contacts transactionally
- `GET /students/:studentId` — student details, guardian links, enrollments, pickup contacts and document metadata
- `POST /students/:studentId/enrollments` — enroll into school academic year and grade
- `POST /students/:studentId/pickup-contacts` — add authorized pickup contact
- `POST /students/:studentId/documents` — register document metadata for a previously uploaded private object

## Known limitations
- Guardian portal identity verification, invitations, consent and access scopes are not implemented.
- Actual object upload, malware scanning, encryption policy, retention and signed download URLs are pending.
- Duplicate detection is limited to unique admission number; fuzzy identity matching and duplicate merge are pending.
- Student lifecycle transitions and withdrawal/transfer workflows are not fully enforced.
- No bulk admission/import workflow or application-to-admission pipeline yet.
- Student data retention and jurisdiction-specific child privacy review are pending.
