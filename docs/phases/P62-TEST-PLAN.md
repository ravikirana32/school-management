# P62 Test Plan

1. Run notification webhook route tests.
2. Submit identical provider/event ID and exact raw body twice; assert one ledger row and duplicate response.
3. Reuse same provider/event ID with a different valid signed raw body; assert 409 conflict and no outbox state mutation.
4. Race two identical deliveries; assert P2002 re-read returns duplicate only when payload hash matches.
5. Race two different payloads for the same event ID; assert one winner and one 409 conflict.
6. Inject outbox update failure and verify transaction rollback leaves no event row.
7. Validate provider retries preserve byte-exact body; do not change hash semantics without explicit audit policy.
