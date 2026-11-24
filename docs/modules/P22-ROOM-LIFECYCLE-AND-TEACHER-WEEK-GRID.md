# P22 — Room lifecycle and teacher week grid

## Scope
P22 closes several timetable usability gaps without rewriting historical timetable data.

## Room inventory lifecycle
- `GET /:organizationId/:schoolId/timetable/rooms?includeInactive=true` returns active and inactive rooms for administrators.
- `PATCH /:organizationId/:schoolId/timetable/rooms/:roomId` edits name, type, capacity, floor and active state. Room code is immutable through the API.
- Reactivation is supported with `isActive: true`.
- Deactivation is rejected while an active timetable slot or exception refers to the room code.
- `GET /:organizationId/:schoolId/timetable/rooms/legacy-usage` provides a non-destructive report of historical labels, reference counts, canonical matches and review-needed labels.

## Database guard
Migration `20261116260000_p22_room_lifecycle_guards` adds a PostgreSQL trigger to prevent changing a referenced room code and prevent deactivating a room with active timetable references. This closes the API-only bypass for these two room lifecycle invariants. It does not create a relational FK from timetable scalar room fields to SchoolRoom.

## Teacher mobile
- Seven-day Monday–Sunday timetable grid around the selected date.
- Each day shows periods, subjects, class/section, room and closure state.
- Daily and weekly timetable responses are cached in Expo SecureStore.
- Cache is school-scoped, capped at 40 slots per day and 14 dates, expires after 14 days, and is cleared on sign-out for all schools discovered in the current signed-in session.
- Cached data is read-only; attendance creation/marking/submission controls are disabled while offline.

## Explicit limitations
- Historical room labels are not rewritten. The report is a review aid, not an automated migration.
- No room alias table or approved mapping workflow yet.
- Timetable room columns remain scalar text; database trigger guards only code change/deactivation.
- Offline attendance queue is not implemented.
- Runtime acceptance is pending.
