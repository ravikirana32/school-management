# P21 Entry Criteria — Timetable CSV, Templates & School Admin Editor

1. Add timetable CSV import/export with strict header/schema validation, preview, row-level error reports and safe all-or-nothing import.
2. Add reusable bell schedule/period templates and apply them transactionally.
3. Build a persisted School Admin timetable editor with class, teacher, room and period pickers.
4. Enforce canonical `SchoolRoom` codes on new timetable writes and plan a safe migration for historical free-text room labels.
5. Add API and database concurrency tests proving advisory-lock behavior and define the policy for direct SQL writes.
6. Add date-exception notifications and teacher/parent visibility rules.
7. Add teacher mobile week navigation and date selection UX.
8. Run Prisma validation, migration deployment, full typecheck, Vitest, API integration, RLS and browser/device E2E in CI.
