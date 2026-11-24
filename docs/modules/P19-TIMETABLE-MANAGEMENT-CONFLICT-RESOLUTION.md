# P19 — Timetable Management & Conflict Resolution

## Scope
P19 extends the P18 timetable foundation with editable slots, batch validation/import and export. It does not introduce a second timetable data model; all operations use `TeacherTimetableSlot` and preserve organization/school scoping.

## API
All endpoints require an authenticated active school member. Mutations and exports additionally require School Admin access.

- `PATCH /api/v1/:organizationId/:schoolId/timetable/slots/:slotId` — partial update; validates merged time/date ranges and rechecks conflicts.
- `POST /api/v1/:organizationId/:schoolId/timetable/slots/bulk` — accepts `{ "mode": "VALIDATE" | "IMPORT", "slots": [...] }`; maximum 500 rows. VALIDATE is non-mutating. IMPORT is all-or-nothing and inserts only when every row passes validation.
- `GET /api/v1/:organizationId/:schoolId/timetable/slots/export?academicYearId=...` — scoped JSON export, maximum 5,000 rows with truncation metadata.
- Existing list/create/deactivate endpoints remain available.

## Conflict policy
- Teacher collision checks include all active teacher assignments for the same staff member and academic year, not just the exact assignment ID.
- Room collision compares normalized room labels within the same school, academic year and weekday.
- Time intervals use half-open overlap semantics (`existing.start < candidate.end` and `existing.end > candidate.start`), so adjacent periods are allowed.
- Effective-date windows are inclusive and open-ended when either bound is absent.
- Batch validation checks both persisted slots and duplicates within the submitted batch.
- Conflicts return HTTP 409 with row/slot context; invalid payloads return HTTP 400.

## Important limitations
The preflight conflict check and insert are not protected by a database exclusion constraint or a serialized school/day lock. Concurrent administrator imports can therefore race. A production rollout must add a concurrency-safe persistence constraint/locking strategy and test it under load. Room names are free text, so canonical room inventory and alias resolution remain future work. Bulk import is JSON API input; a CSV upload/parser and downloadable CSV are not included. Bell-schedule templates and exception/substitute workflows remain open.

## Tenant and authorization controls
The handlers first require active school membership, then School Admin access for write/export operations, and execute database reads/writes through `withTenantContext`. No endpoint accepts organization or school identifiers from row payloads; the route scope supplies them.
