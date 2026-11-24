# P40 acceptance plan

1. `prisma validate` and `prisma generate`; deploy migration on disposable PostgreSQL, rollback using a tested backup/restore procedure, and reapply.
2. Run forced-RLS tests as a non-owner role for each new table, including wrong organization and wrong school settings.
3. Test lookup API isolation, empty board profile, inactive grades and academic-year ordering.
4. Test schema designer validation: duplicate subject/component keys, missing year/grade/board, invalid maximum/pass marks and unauthorized roles.
5. Test PDF parser with one-page and multi-page documents, page count, footer, verification code, special characters and object cleanup on failed publication.
6. Test notification recipient matrix: no consent, withdrawn consent, disabled communications, inactive guardian, shared parent account, duplicate links and opted-out preference.
7. Verify report publication and all in-app notifications/outbox rows commit or roll back atomically.
8. Verify parent preference API cannot read or write another user's preferences and cannot cross school boundaries.
9. Run Vitest, full TypeScript build/typecheck, Playwright schema designer and approval workflow, and Expo parent notification/PDF flows.
10. External EMAIL/PUSH delivery is not in P40 acceptance because no provider has been selected/configured.
