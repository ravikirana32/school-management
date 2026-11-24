# P576 Feature Contract — Financial & Notification Provider E2E

## Implemented source contract
- Payment webhook signature header: `t=<unix-seconds>,v1=<hex HMAC-SHA256>`.
- HMAC input: decimal timestamp, a literal period, then exact raw HTTP body bytes.
- Default replay tolerance: 300 seconds.
- Reject duplicate/unknown header fields, malformed timestamp/digest, secrets shorter than 32 characters and raw payloads larger than 64 KiB.
- Constant-time digest comparison.
- Payment provider path segment is constrained before deriving its environment variable name.
- Existing immutable provider event ID + payload-hash replay classification remains in place.
- Existing notification delivery webhook contract retains timestamped signature verification, event idempotency, monotonic delivery-state reconciliation and bounce/complaint suppression.

## Deliberately not implemented/claimed
- No concrete payment gateway SDK or provider account is configured.
- No provider-specific payment event mapper is activated. Verified payment events remain stored as unreconciled; invoices are not marked paid from untrusted or unmapped event data.
- No SMS or push provider is activated.
- No live email/payment provider sandbox callbacks, PostgreSQL integration, accounting reconciliation or UI E2E evidence is available.

## Compatibility note
The generic payment webhook endpoint now requires a timestamped signature header. Any future provider adapter must implement its official signing contract and normalize verified events at the adapter boundary. Do not configure a provider that cannot supply the required documented verification behavior.

## Acceptance
P576 is source-contract delivered only. Provider/database acceptance remains BLOCKED until P573/P574 toolchain and database gates pass and approved provider sandbox credentials/fixtures are available.
