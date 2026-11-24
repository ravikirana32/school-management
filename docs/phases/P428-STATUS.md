# P428 — Notification Preferences & Reminder Controls

**Status:** Source implementation complete; runtime acceptance pending.

## Delivered
- Teacher-specific in-app preference toggles for due-soon and overdue task alerts, backed by existing NotificationPreference records.
- Teacher Mobile controls and API GET/PATCH endpoints; preferences are scoped to authenticated teacher user, organization and school.
- School coordinator defaults via persisted TeacherTaskReminderPolicy, academics.manage-only API GET/PATCH.
- School defaults: due-soon enabled, overdue enabled, overdue recurrence 24 hours. Overdue recurrence validation allows 12–168 hours.
- Scheduler now honors school-level category defaults and teacher-level overrides (disabled overrides suppress generation; absent preference inherits school default).
- Overdue deduplication keys support configurable reminder slots; due-soon remains once per local school date.
- Migration includes tenant composite FK, RLS and bounded-frequency CHECK constraint.

## Verification
Focused P428 source verifier: 21/21 PASS. P426 notification verifier: 26/26 PASS. P427 verifier: 18/18 PASS (updated dedupe expectation for cadence slots). TypeScript transpilation diagnostics: API routes 0, scheduler worker 0, Teacher Mobile TSX 0.

Runtime build/typecheck, Prisma validation/generation, database migration apply, live RLS/API authorization, mobile/browser runtime and E2E remain pending.
