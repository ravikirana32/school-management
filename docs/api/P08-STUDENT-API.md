# P08 Student API

All endpoints require authentication, active school membership and SCHOOL_ADMIN. Student entitlement is checked when creating a student. Use `/api/v1/:organizationId/:schoolId` as the base prefix.

| Method | Path | Purpose |
|---|---|---|
| GET | `/students` | Search/list students; page and pageSize supported |
| POST | `/students` | Create student and initial guardian contacts |
| GET | `/students/:studentId` | Read student, guardian links, enrollment, pickup contacts and document metadata |
| POST | `/students/:studentId/enrollments` | Enroll student into academic year and grade |
| POST | `/students/:studentId/pickup-contacts` | Add authorized pickup contact |
| POST | `/students/:studentId/documents` | Register metadata for private object |

Date-only fields use `YYYY-MM-DD`. Student creation accepts up to six guardian contacts. Document `objectKey` must be a private storage key, not a URL. Upload authorization and signed URL delivery are not part of P08.

## Student lifecycle endpoints (P73/P100)

| Method | Path | Purpose |
|---|---|---|
| GET | `/students/:studentId/status-history` | Read the latest 100 lifecycle transitions, newest effective date first; requires `students.read` and active school membership |
| POST | `/students/:studentId/status` | Transition a student using `{ toStatus, reason, effectiveAt }`; requires `students.update`, validates a real `YYYY-MM-DD` calendar date, applies the allowed lifecycle transition policy, and writes status history plus audit data atomically |

The School Admin Students workspace provides a lifecycle transition form and status-history view. The Parent Mobile app displays the current school status returned by the consent-scoped children endpoint and provides an explicit refresh action. Parent Mobile does not expose internal transition reasons or actor IDs.
