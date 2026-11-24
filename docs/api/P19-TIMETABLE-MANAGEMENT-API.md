# P19 Timetable Management API

## Bulk validation/import
`POST /api/v1/{organizationId}/{schoolId}/timetable/slots/bulk`

```json
{
  "mode": "VALIDATE",
  "slots": [
    {
      "teacherAssignmentId": "assignment-id",
      "academicYearId": "academic-year-id",
      "dayOfWeek": 1,
      "periodNumber": 1,
      "startsAt": "09:00",
      "endsAt": "09:45",
      "subjectName": "Mathematics",
      "room": "A-101",
      "effectiveFrom": "2026-06-01",
      "effectiveTo": "2027-03-31"
    }
  ]
}
```

Use `mode: IMPORT` only after reviewing a successful validation response. A successful import returns the inserted row count. A conflict returns 409 and inserts no rows. Maximum batch size: 500.

## Update
PATCH accepts any non-empty subset of the slot fields. Send `null` for `room`, `effectiveFrom` or `effectiveTo` to clear those optional values. The API revalidates the merged slot.

## Export
GET `.../timetable/slots/export` returns up to 5,000 active slots as JSON. `meta.truncated` signals that the cap was reached.

## Error semantics
- 400: invalid payload, time or date range.
- 403: no active membership or School Admin access.
- 404: slot not found in the scoped school.
- 409: teacher/room overlap or batch duplicate.
