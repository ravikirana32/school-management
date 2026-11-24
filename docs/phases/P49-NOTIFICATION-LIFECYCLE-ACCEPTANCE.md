# P49 Notification Lifecycle Integration Acceptance Plan

This plan defines runtime checks that cannot be proven by source inspection alone. Execute against disposable PostgreSQL and Redis, with API/worker database roles that are not table owners and do not have BYPASSRLS.

## Migration and schema
1. Apply migrations P45, P46 and P48 in order to a clean database and to a representative P44 snapshot.
2. Run `prisma validate` and `prisma generate`; compare generated client model fields with `hashVersion`.
3. Confirm tenant RLS is enabled and forced on delivery-event, suppression and suppression-audit tables.
4. Confirm worker role can only access intended rows through the explicit worker policies and tenant scope context.

## Webhook contract
1. Reject missing configuration, unknown provider, malformed provider ID, absent raw body, invalid signature and expired timestamp.
2. Accept a valid signed canonical event; verify exact raw-body signature and payload hash.
3. Replay the same provider/event ID concurrently; exactly one event row must persist and all successful responses must be idempotent.
4. Deliver a newer event followed by an older event; retain both ledger rows while the older event cannot overwrite newer outbox state.
5. Verify cross-school outbox references cannot be forged by request fields; tenant scope is derived from the matched outbox row.
6. Verify transaction rollback leaves neither a partial event row nor an inconsistent outbox status.

## Suppression and audit
1. Create a suppression in School A and prove School B cannot list, release or observe it.
2. Configure current=v2 and previous=v1; an active v1 row must still block delivery and duplicate creation.
3. New suppression writes use v2. Removing previous key while active v1 rows remain must be prohibited operationally.
4. Verify create/release audit events commit atomically with state changes and contain no email/hash values.
5. Race duplicate creates and release attempts; confirm one active row and coherent audit history.

## Worker
1. Verify missing current secret prevents worker startup.
2. Verify the worker computes all configured version hashes and checks suppression immediately before provider send.
3. Verify a suppression added before send cancels the outbox item without calling the provider.
4. Exercise lease expiry, duplicate jobs, provider idempotency and terminal BOUNCED/COMPLAINED states.

## Evidence
Retain migration logs, Prisma output, SQL assertions, test results, API traces with PII redacted, worker logs with secrets/hashes redacted, and browser screenshots. No test is considered passed based only on this plan or a static source verifier.
