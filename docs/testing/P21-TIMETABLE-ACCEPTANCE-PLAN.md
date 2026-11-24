# P21 Timetable Acceptance Plan

## CSV parser unit scenarios

- Exact ordered headers accepted; reordered, missing or extra headers rejected.
- Quoted comma, escaped quote, embedded newline and CRLF round-trip.
- Unclosed quotes, unexpected quote placement and characters after closing quote rejected.
- Header-only file rejected; 501 data rows and payloads over 1 MB rejected.
- Empty required cells and incorrect column counts produce row numbers.
- Export quotes commas, quotes and line breaks and keeps empty optional fields.

## API integration scenarios (must run against PostgreSQL)

1. School Admin can list only assignments/rooms from the active organization and school.
2. Teacher/non-admin receives 403 on options, template, CSV and editor write endpoints.
3. Room code from another school, inactive room and arbitrary free-text room are rejected on every new write route.
4. Existing legacy room labels remain readable and are not silently rewritten.
5. CSV preview is non-mutating; import revalidates all assignments, rooms and conflicts.
6. Any invalid CSV row or conflict results in zero inserted rows.
7. Two simultaneous imports using the same school/year lock serialize; second import sees first commit and returns conflict.
8. A failed template apply rolls back every attempted slot.
9. Template application rejects assignment IDs from another tenant/year and caps generated rows at 500.
10. Forced RLS blocks template reads/writes when tenant settings are absent or mismatched, using a non-owner DB role.
11. Verify all timetable writes take the advisory lock; direct SQL write policy must be enforced through restricted DB privileges or a shared database write function.

## UI/device E2E scenarios

- Load assignments and rooms, create/edit/deactivate a slot and verify persistence after reload.
- Save and apply a bell template; show conflict response without partial writes.
- Paste CSV, preview row-level errors, import valid CSV, export and re-import.
- Teacher app previous/next day/week navigation reloads the correct school-local date.
- Verify date behavior for Asia/Kolkata, UTC and DST-observing school timezones.

## Execution status

Only source syntax transpilation and isolated CSV parser/serializer smoke checks were executed in this phase. The database/API/browser/device scenarios above remain pending.
