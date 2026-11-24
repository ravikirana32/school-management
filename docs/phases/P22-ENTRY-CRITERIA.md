# P22 Entry Criteria — Timetable Quality, Room Migration & Integration

1. Add migration dry-run/report tooling for legacy room labels and an administrator alias/mapping workflow.
2. Add database-backed tests for forced RLS, advisory-lock serialization, conflict races and rollback on failed imports/templates.
3. Add browser E2E for School Admin timetable create/edit/deactivate, CSV preview/import/export and template application.
4. Integrate timetable workspace with the School Admin global authentication and active tenant context; remove manual token/tenant entry.
5. Add queued import for large files with progress, idempotency keys, retries and downloadable error report.
6. Add teacher week grid rather than date navigation only; test school timezone and DST boundaries.
7. Add teacher/parent visibility policy and notification delivery for timetable exceptions.
8. Add room edit/reactivation/alias management and prevent deactivation while active slots/exceptions reference a room code.
9. Run Prisma validation, migration deploy, full typecheck, Vitest, API integration, RLS and browser/device E2E in CI.
