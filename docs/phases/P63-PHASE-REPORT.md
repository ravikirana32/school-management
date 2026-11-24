# P63 — Provider bounce/complaint to school suppression

## Delivered
- Persisted current-key recipient HMAC/version on outbox before provider send.
- Connected verified provider BOUNCED/COMPLAINED events to school-local suppression creation and audit.
- Uses tenant-scoped transaction and partial-unique idempotent insertion; no plaintext email added.
- Added route tests for bounce, complaint and historical rows without hashes.

## Validation
P63 static verifier 11/11 PASS; P62 verifier 10/10 PASS; TypeScript syntax 3 files, 0 diagnostics. Runtime acceptance remains NOT RUN.
