# P29 API additions

All routes are under `/api/v1/:organizationId/:schoolId` and require authentication plus active school membership.

## Guardian endpoints

| Method | Endpoint | Required permissions | Behavior |
|---|---|---|---|
| GET | `/students/:studentId/guardians` | `students.read`, `students.pii.read` | Returns linked guardians and relationship flags; logs PII read |
| POST | `/students/:studentId/guardians` | `students.update`, `students.pii.read` | Links an existing guardian or creates one; possible contact duplicate returns 409 for human review |
| PATCH | `/students/:studentId/guardians/:guardianId` | `students.update`, `students.pii.read` | Updates guardian contact details and relationship flags |

`POST` accepts either `guardianId` or new guardian contact details. The server never merges duplicate records. A possible match returns `409` with `code: GUARDIAN_MATCH_FOUND`; the caller must select the existing guardian and retry with `guardianId`.

## Staff employment endpoints

| Method | Endpoint | Required permissions | Behavior |
|---|---|---|---|
| GET | `/staff/members/:staffId/employment-history` | `staff.read` | Returns the staff member's school-scoped employment periods |
| POST | `/staff/members/:staffId/employment-history` | `staff.update` | Closes the current open period and creates a new effective period |

POST validates department/designation ownership, effective start date and employment type. It rejects separated staff records.

## Curriculum activation

Existing `PATCH /curriculum/versions/:versionId/status` now serializes activation by school/year using a transaction advisory lock. P29 adds database partial unique indexes as a final invariant. Migration preflight aborts when existing duplicates are present.


### Staff profile update (P255)

- `PATCH /staff/members/:staffId` — requires `staff.update` and `staff.pii.read`; accepts validated profile fields (first/last name, email/phones, DOB, gender, nationality, address, department/designation, employment type, joining date, emergency contact, notes). References must belong to the same school. Profile changes create a staff audit event.
