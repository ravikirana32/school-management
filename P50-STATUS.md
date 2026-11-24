# P50 Status — Hardened notification webhook contract

**Status:** Source implementation and regression test source complete; runtime acceptance pending. **Production approval: NOT GRANTED.**

- Extracted canonical provider-neutral event schema and event-state mapper into a dedicated module.
- Hardened signature parsing to require exactly one decimal timestamp and one v1 HMAC field, reject duplicate/unknown/missing fields, enforce a 5-minute window and minimum secret length, and use timing-safe comparison.
- Added unit test source for canonical event shape, unknown fields, timestamp format, event mapping and malformed signature headers.
- Static verifier 12/12 PASS; TypeScript syntax transpilation 5 files, 0 diagnostics.
- Vitest, route/PostgreSQL integration, provider sandbox, full build and browser/mobile tests NOT RUN.
