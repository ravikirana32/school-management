# P45 acceptance plan

1. Unit test valid HMAC, modified raw body, malformed header and stale timestamp.
2. Validate Prisma schema and generate client.
3. Apply migration to disposable PostgreSQL; assert unique provider/event key, composite outbox FK, tenant RLS and worker-only event access.
4. Send same event concurrently; assert one event row and idempotent 200 responses.
5. Send DELIVERED then older BOUNCED; verify state remains DELIVERED while both audit events remain.
6. Send newer BOUNCED/COMPLAINED; verify terminal state and worker will not reclaim.
7. Verify wrong provider, invalid signature, expired timestamp, unknown outbox and malformed body.
8. Run provider-native adapter contract tests only after vendor selection.

Runtime tests have not been executed in this phase.
