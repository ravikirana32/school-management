# P63 Test Plan

1. Run webhook route tests and worker tests with mocked tenant/worker contexts.
2. Run PostgreSQL integration: send worker message, assert only HMAC/version stored on outbox, then process signed BOUNCED/COMPLAINED webhook.
3. Verify suppression and audit rows are created in same transaction and visible only to matching school.
4. Replay identical event; assert no duplicate suppression/audit. Race two different bounce/complaint events for same hash; assert one active suppression row.
5. Force audit insertion failure and assert event ledger, outbox state and suppression insertion all roll back.
6. Verify historical rows without recipient hash do not infer a guardian email or create suppression.
7. Test key rotation versions, delayed events after manual release and event ordering before enabling this workflow in production.
