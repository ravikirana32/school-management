# P22 acceptance plan

## Source checks completed
- Room metadata PATCH schema and endpoint present.
- Inactive room listing supported.
- Room deactivation checks active slot and exception references.
- Legacy room usage report is read-only and school-scoped.
- PostgreSQL trigger covers code mutation and active-reference deactivation.
- Teacher week view fetches seven dates and renders per-day periods.
- SecureStore cache is bounded to 14 dates, 40 periods/date, 14-day TTL and cleared on sign-out.
- Offline mode disables attendance mutations.

## Required runtime tests
1. Apply P22 migration to clean and upgraded PostgreSQL databases.
2. Verify trigger blocks room code mutation when referenced, permits when unreferenced.
3. Verify trigger blocks deactivation with active slot/exception, permits after references are moved/deactivated.
4. Verify slot/exception insert and room update triggers serialize on the same school lock; verify inactive/missing room references are rejected.
5. Verify same operations under non-owner app DB role with tenant RLS context and cross-tenant denial.
6. API tests for edit, reactivate, duplicate scope, in-use conflict, legacy report and includeInactive listing.
7. Device tests for week grid, airplane mode, stale cache expiry, max date/slot retention and sign-out cache purge on iOS and Android.
8. Verify attendance mutation controls are disabled while cached/offline and recover when connectivity returns.
9. Run Prisma validation, typecheck, Vitest, API integration, Expo builds and browser/device E2E.
