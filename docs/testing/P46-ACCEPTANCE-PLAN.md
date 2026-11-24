# P46 acceptance plan

1. Unit test email normalization, keyed hashing, secret separation and invalid address rejection.
2. Prisma validate/generate and apply migration to disposable PostgreSQL.
3. Test school A suppression does not affect school B even for same email; tenant RLS denies cross-school reads/writes.
4. Test duplicate active suppression race and unique index.
5. Verify worker cancels before send for active suppression and proceeds after audited release.
6. Verify missing secret prevents worker startup and APIs return 503 for create.
7. Verify only `school.settings.manage` can manage; ensure email/hash never appear in response/logs.
8. Run provider sandbox delivery/complaint tests after provider selection.

Runtime tests not run in this phase.
