# P429 — Coordinator Reminder Policy UI & Notification Settings Dashboard

## Scope delivered
- Added a School Admin coordinator workspace card for school-wide follow-up task reminders.
- Displays policy summary and provides due-soon enable/disable, overdue enable/disable, and overdue recurrence selector (12–168 hours).
- Added save, refresh, and persisted reset-to-school-defaults actions (due-soon enabled, overdue enabled, 24-hour cadence).
- UI is gated by `academics.manage` and uses the existing tenant/school-scoped policy API.
- Integrated into the Curriculum Outcomes workspace beside reflection review/task workspaces.
- Discloses that individual teacher settings are not displayed; the API currently exposes individual preference reads/writes to each teacher only.

## Verification
- P429 focused verifier: 16/16 PASS.
- P428 reminder preferences verifier: 21/21 PASS.
- P427 automated notification scheduler verifier: 18/18 PASS.
- P426 notification verifier: 26/26 PASS.
- P425 task monitoring verifier: 20/20 PASS.
- TypeScript transpile syntax diagnostics: 0 for new component and integration file.
- Full dependency build/typecheck, live DB/API/RLS, migration/runtime, browser and mobile E2E not run in this environment.

## Remaining gaps
- Teacher-level preference visibility/aggregate dashboard is intentionally not implemented because no coordinator API exposes roster-level teacher preferences; privacy and backend access model need a deliberate design.
- Push/email channels, provider delivery receipts/retries, and live operational validation remain open.
