# P561 Delivery Report

P561 implements trip/stop pickup-drop attendance and handover controls in API, School Admin and Driver Mobile.

## Outcomes
- Attendance statuses and handover recipient persisted.
- Admin and mobile roster reads are tenant- and assignment-scoped.
- Admin write protected by `transport.manage`; mobile writes require verified assigned driver/attendant.
- Student must have active allocation to route; stop must belong to route.
- Attendance upsert prevents duplicate records for a trip/student/stop.
- Admin daily attendance status summary UI/API.

## Verification
Focused verifier 16/16; P559 24/24; P560 17/17; P357 45/45; transpile diagnostics 0. Runtime acceptance not executed.

## Next phase
P562 — GPS provider abstraction, consent, retention and configuration.
