# P566 Delivery Report — Hostel Roll-call, Curfew, Attendance & Night Checks

## Phase outcome
P566 source implementation is delivered on top of the verified P565 cumulative baseline. Existing P358 hostel building, room, bed, allocation, checkout and incident workflows are preserved.

## Implemented
- Tenant/school-scoped attendance session model with building, date and session-type uniqueness.
- Roll-call sessions for MORNING, EVENING and NIGHT.
- Active resident roster lookup scoped to a hostel building.
- Per-resident PRESENT, ABSENT, LATE, ON_LEAVE and NOT_VERIFIED status capture.
- Idempotent session creation and per-session/resident record upsert.
- Absence verification requires a staff verification note. Closing a session is blocked while a resident is unmarked or an absence remains unverified.
- Curfew policies with building scope, effective dates, weekdays, curfew time and grace minutes.
- Late-return records with expected/actual return times, late-minute calculation after configured grace and resolution lifecycle.
- Night-check rounds with assigned staff, resident entries and completion guard for unchecked residents.
- A NOT_IN_ROOM observation creates a VERIFYING safety escalation. This is an investigation task, not an automatic declaration that a student is missing.
- Safety escalation creation from a verified roll-call absence, verification and resolution actions.
- Audit events for session creation/marking/closure, curfew policy and event changes, night-check changes and safety escalation lifecycle.
- School Admin Hostel Workspace extension for roll-call, curfew, late-return, night-check and safety verification workflows.

## API contracts
Base path: `/:organizationId/:schoolId/hostel`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/attendance/sessions?date=YYYY-MM-DD` | List roll-call sessions for a date |
| GET | `/attendance/roster?buildingId=...` | Active residents for a building |
| POST | `/attendance/sessions` | Open/load a building/date/session roll-call |
| POST | `/attendance/sessions/:sessionId/records` | Mark resident attendance |
| POST | `/attendance/records/:recordId/verify-absence` | Verify an absence with a note |
| POST | `/attendance/sessions/:sessionId/close` | Close after all statuses/absences are verified |
| GET/POST | `/curfew/policies` | Read/create curfew policies |
| GET/POST | `/curfew/events` | List/record late returns |
| POST | `/curfew/events/:eventId/resolve` | Confirm actual return |
| GET/POST | `/night-checks` | List/start night-check rounds |
| POST | `/night-checks/:roundId/entries` | Record resident check observations |
| POST | `/night-checks/:roundId/complete` | Complete a fully checked round |
| GET/POST | `/safety/escalations` | List/create safety verification tasks |
| POST | `/safety/escalations/:escalationId/verify` | Record location verification |
| POST | `/safety/escalations/:escalationId/resolve` | Resolve a safety task |

Mutations require the existing `hostel.manage` permission or School Admin access. Reads require active school membership and `hostel.read` or School Admin access. All P566 database operations run inside the existing tenant context.

## Data and migration
- Seven Prisma models added: HostelAttendanceSession, HostelRollCallRecord, HostelCurfewPolicy, HostelCurfewEvent, HostelNightCheckRound, HostelNightCheckEntry and HostelSafetyEscalation.
- Migration: `20261124090000_p566_hostel_roll_call_curfew_night_checks`.
- Unique constraints prevent duplicate building/date/session sessions, resident marks per session and resident entries per night round.
- Tenant/school indexes support scoped operational reads.

## Verification
- P566 focused source verifier: **44/44 PASS**.
- P358 hostel baseline regression: **43/43 PASS**.
- P562 transport GPS regression: **19/19 PASS**.
- P564 transport incident regression: **25/25 PASS**.
- P565 transport fees regression: **34/34 PASS**.
- API route and School Admin TSX syntax transpilation: **0 diagnostics** using TypeScript transpileModule.

## Explicitly not verified / open
- Prisma CLI format/validate/generate and generated-client compatibility.
- Live PostgreSQL migration on clean and upgraded databases, rollback/recovery and runtime DB/API integration.
- Dependency-backed API/Admin builds and full typechecks.
- RLS and cross-school authorization-negative tests using a production-like non-owner database role.
- Browser/device interaction, native warden mobile app, offline behavior and accessibility.
- Concurrent session creation, bulk marks, night-check writes and escalation race behavior under load.
- Automated curfew scheduler, escalation timers and guardian email/SMS/push provider delivery.
- Parent/student hostel mobile views, guardian consent and notification preferences.
- Privacy-safe resident name lookup/field masking and independent security review.

Static source assertions and transpilation do not establish runtime correctness. These items remain open in the master gap register.
