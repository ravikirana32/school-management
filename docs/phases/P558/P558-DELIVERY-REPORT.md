# P558 Delivery Report — Library Parent/Student Journeys, Notifications, Exports & Acceptance Improvements

**Status:** Source implementation complete. Focused verification 38/38 passed. Cumulative baseline: verified P557.

## Implemented
- Student portal endpoint for linked, active student account circulation history, reservation visibility, due-soon/overdue reminders.
- Parent portal endpoint for consented guardian-linked children, protected by existing parent portal role, membership and consent checks.
- Parent and student mobile library screens integrated into their respective app shells; refresh, loan history, due/overdue reminder display, reservation status, pickup deadline and FIFO queue position.
- Admin circulation report endpoint with aggregate summary and loan detail JSON; CSV loan export.
- Admin due/overdue reminder preview and bounded horizon (0–30 days).
- Admin reminder dispatch creates a daily school-scoped notification batch and IN_APP NotificationOutbox records for linked student accounts and verified, active guardian recipients with communications permission. Disabled LIBRARY IN_APP preferences are honored; recipient reminders are aggregated to avoid last-loan overwrite.
- Admin reports/reminders panel integrated into LibraryWorkspace; CSV export uses authenticated fetch and blob download.
- Focused verifier and phase evidence added.

## API endpoints
- `GET /students/me/:organizationId/:schoolId/library`
- `GET /:organizationId/:schoolId/parents/portal/library`
- `GET /:organizationId/:schoolId/library/reports/circulation`
- `GET /:organizationId/:schoolId/library/notifications/loan-reminders?daysAhead=3`
- `POST /:organizationId/:schoolId/library/notifications/loan-reminders/dispatch`

## Verification
- P558 focused static/source assertions: 38/38 PASS.
- Prior library focused verifiers: P553 34/34; P554 23/23; P555 23/23; P556 28/28; P557 22/22.
- P553–P558 combined focused assertions: 168/168.
- TypeScript transpilation of all modified API route files, Admin React files and parent/student mobile files: 0 syntax/transpilation diagnostics.
- Full dependency-backed typecheck/build, Prisma validation/generation, DB migration/runtime, browser/device/mobile interaction, notification delivery worker runtime, concurrency, accessibility and E2E are NOT RUN (dependencies/database/runtime are unavailable in this workspace).

## Open gaps retained
- Scheduled/automated reminder dispatch is not wired to a background scheduler; dispatch remains admin-triggered.
- Email/push provider delivery for LIBRARY notifications is not connected; in-app outbox records are created only.
- Parent/student screens are read-only; self-service renewal, reservation create/cancel and fine settlement are not in this phase.
- Queue-position calculation is limited to the active queue query cap (5,000 rows); large-scale pagination/optimization remains.
- Parent view does not yet render a child-name label on each loan row; reminders carry studentId.
- Reservation CSV export and full catalog/finance reconciliation reporting remain open.
- Full Prisma, DB, runtime, build/typecheck, accessibility, concurrency and E2E acceptance remain open.

## Documentation mirrors
- Master open-gap register: 47/47 copies synchronized.
- C2-10 progress: 12/12 copies synchronized.
- C2-10 roadmap: 11/11 copies synchronized.

## Archive
Cumulative archive includes the P557 baseline and P558 changes. Verified cumulative ZIP: **4,578 manifest-tracked files, 4,580 archive entries**. Compared with P557: 18 new tracked paths, 74 changed baseline paths, 0 missing baseline paths, 0 duplicate entries, 0 manifest hash failures, ZIP CRC PASS. Final size and SHA-256 are provided with the release delivery.
