# P17 Teacher Membership Discovery API

## `GET /api/v1/teacher/me/schools`

Authentication: Bearer access token. No request body or tenant path parameters.

### Success
`200 OK`

```json
{
  "data": [
    {
      "organization": { "id": "…", "name": "…", "slug": "…" },
      "school": { "id": "…", "name": "…", "code": "…", "timezone": "Asia/Kolkata" },
      "staff": { "id": "…", "displayName": "…", "employeeNumber": "…" },
      "roles": [{ "key": "SCHOOL_TEACHER", "name": "Teacher" }],
      "assignments": [{ "id": "…", "academicYearId": "…", "gradeLevelId": "…", "sectionName": "…", "isClassTeacher": false }]
    }
  ]
}
```

Only active school memberships with an active organization, active school and linked active staff record are returned. Assignments are active teacher assignments for that staff member in the exact school. The response is capped at 100 memberships.

### Errors
- `401` missing, expired or revoked bearer session.
- `500` unexpected server error (generic API error envelope).

### Privacy and isolation
The endpoint derives the user ID from the verified access token. It never accepts an arbitrary user ID, organization ID or school ID. Membership rows are read in identity context; school-specific records are read in tenant context. Response fields are intentionally minimal and omit staff contact details and student data.

Migration: `20261116210000_p17_teacher_membership_discovery` adds the SELECT-only `school_membership_self_read` policy. Existing tenant policy remains in place.
