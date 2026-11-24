# P13 Entry Criteria

1. Run Prisma validate/generate and fix schema or migration drift.
2. Apply P12 migration on clean and upgrade databases; test RLS under app and non-owner roles.
3. Complete entitlement checks for every attendance mutation and seed/grant `attendance.mark` to approved teacher role.
4. Verify TeacherAssignment grade/section fields and teacher scoping.
5. Add concurrency-safe bulk mark and correction review tests.
6. Connect School Admin attendance UI to APIs; add teacher attendance UI.
7. Integrate P06 AttendancePolicy, school calendar and timezone rules.
8. Add guardian read-only attendance access and notification outbox with consent/preferences.
9. Add API integration and browser E2E for full lifecycle and cross-tenant denial.
10. Close P12 gaps only with evidence.
