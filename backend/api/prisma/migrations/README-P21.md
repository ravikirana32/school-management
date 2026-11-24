# P21 migration

Run `pnpm --filter @school-saas/api prisma:deploy` after reviewing the generated Prisma schema and applying to a staging database first. The migration creates `BellScheduleTemplate` with forced tenant RLS. Existing `TeacherTimetableSlot.room` values are not rewritten: they may be legacy display labels and require a reviewed alias/mapping exercise before canonicalization.
