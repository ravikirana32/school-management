# P47 test plan and evidence

## Static source verifier

Run `node scripts/verify-p47-email-suppression-ui.mjs`.

## Required automated tests

- React component: permission denied, active/released tabs, load/error/empty states, add, release minimum reason, no hash/email disclosure, audit history.
- API: active membership and permission allow/deny, school A cannot read/release school B, list never selects/serializes emailHash, audit event scope, duplicate create race, release race.
- Worker: active suppression blocks send; released suppression allows normal policy evaluation; missing hash secret fails closed.
- Database: clean install, upgrade, rollback/reapply, forced RLS under non-owner role, uniqueness and transaction atomicity.
- Browser: responsive, keyboard, screen-reader status, refresh-token rotation, school switching, empty/loading/error states.
- Provider: only after explicit provider selection; native signature and event mapping must be sandbox tested.

## Current execution

- Static verifier: recorded in P47 delivery report after packaging.
- Runtime dependencies are absent in the supplied archive workspace; Vitest, Prisma, PostgreSQL, worker, browser and mobile tests are NOT RUN.
- No runtime acceptance is implied by source checks.
