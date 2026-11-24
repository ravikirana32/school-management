# P62 — Webhook replay payload integrity

## Delivered
- Added payload-hash comparison to provider/event idempotency.
- Same-payload replay is duplicate success; same ID with different payload is conflict.
- Concurrent unique conflict is re-read and only acknowledged when payload hash matches.
- Added route test source for normal and concurrent replay paths.

## Validation
Static verifier 10/10 PASS. Vitest and PostgreSQL concurrency/transaction acceptance remain NOT RUN.

## Test result
- Static verifier 10/10 PASS.
- TypeScript syntax 2 files, 0 diagnostics.
- Vitest and PostgreSQL runtime acceptance NOT RUN.
