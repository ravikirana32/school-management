# P20 migration

Migration: `20261116240000_p20_timetable_exceptions_rooms`

Creates enum `TimetableExceptionType`, adds a composite unique key to `TeacherTimetableSlot`, creates `SchoolRoom` and `TeacherTimetableException`, adds tenant-scoped composite foreign keys, checks, indexes and forced RLS policies.

Apply after P19 using `pnpm --filter @school-saas/api prisma:deploy` after dependency installation and generated Prisma client setup. Validate from a clean PostgreSQL database and run cross-tenant tests with the application's non-owner DB role. This migration has not been executed in the current phase environment.
