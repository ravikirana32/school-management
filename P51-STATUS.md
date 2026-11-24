# P51 Status — Webhook route-level regression tests

**Status:** Route test source and static verification complete; Vitest/runtime acceptance pending. **Production approval: NOT GRANTED.**

- Added route-level tests using mocked persistence for missing configuration, provider allowlist, invalid signature, valid event persistence, duplicate replay, missing outbox and out-of-order event handling.
- Successful signed request exercises the actual Express JSON `verify` hook and exact raw-body signature path.
- Added static checks for middleware ordering and route validation sequence.
- Static verifier 10/10 PASS; TypeScript syntax transpilation 1 changed test file, 0 diagnostics.
- Vitest, PostgreSQL concurrency/transaction, provider sandbox, full build and browser/mobile E2E NOT RUN.
