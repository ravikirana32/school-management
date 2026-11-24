# P406 Test Report

- P406 focused verifier: **17/17 PASS**.
- P400 regression: **16/16 PASS**.
- P401 regression: **16/16 PASS**.
- P402 regression: **16/16 PASS**.
- P403 regression: **15/15 PASS**.
- P404 regression: **13/13 PASS**.
- P405 regression: **16/16 PASS**.
- Package JSON parse: PASS.

Verifier includes source-contract checks and helper behavior fixtures for nested object merge, policy overlay, unchanged base collection behavior, and array replacement semantics. These are source/verifier checks, not live API tests.

Not run: full build/typecheck, Prisma validation/migrations, live API, database/RLS integration, browser/mobile, or E2E.
