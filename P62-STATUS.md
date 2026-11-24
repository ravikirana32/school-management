# P62 Status — Webhook replay payload integrity

**Status:** Source implementation and route-test source complete; PostgreSQL concurrency acceptance pending. **Production approval: NOT GRANTED.**

- Webhook idempotency now compares the stored raw-body SHA-256 for an existing `(provider, providerEventId)`.
- Same ID/same bytes returns duplicate success; same ID/different bytes returns 409 `EVENT_ID_CONFLICT`.
- Concurrent unique-key conflicts re-read the persisted payload hash and return duplicate only when it matches; conflicting payloads return 409.
- Event insertion and outbox reconciliation remain in the same tenant worker transaction.
- Static verifier 10/10 PASS; TypeScript syntax 2 files, 0 diagnostics; Vitest/PostgreSQL concurrency and rollback tests NOT RUN.
