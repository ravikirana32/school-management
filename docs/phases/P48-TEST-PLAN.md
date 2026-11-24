# P48 Test Plan

1. Unit-test normalization and HMAC determinism for each key version.
2. Test helper rejection for missing/short current secret and invalid duplicate key versions.
3. With a v1 row present, configure current=v2 and previous=v1; API duplicate detection must find v1 and worker must block sending.
4. Create a new suppression during overlap; assert it stores only v2 hash/version and never plaintext email.
5. Remove previous key only after querying that zero active rows reference v1; prove worker/API remain correct for all active v2 rows.
6. Run two-school isolation, concurrent duplicate create/release, P45 webhook replay/order, worker pre-send and audit transaction tests using a non-owner PostgreSQL role.
7. Run Prisma validate/generate, migrations, Vitest, builds and browser/mobile E2E.

Do not run destructive key retirement against production until legal retention policy and backup/rollback plan are approved.
