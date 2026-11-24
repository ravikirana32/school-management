# P63 Status — Provider bounce/complaint to school suppression

**Status:** Source implementation and route-test source complete; database/worker runtime acceptance pending. **Production approval: NOT GRANTED.**

- Notification worker persists the recipient's current-key HMAC and key version to the outbox under the active lease before provider send; plaintext email is not stored.
- Webhook preflight resolves the outbox and recipient hash under worker read context, then performs event ledger, outbox and suppression/audit changes in the tenant-scoped transaction.
- BOUNCED maps to BOUNCE suppression; COMPLAINED maps to COMPLAINT suppression.
- Suppression insertion uses the existing partial active unique index with `ON CONFLICT DO NOTHING`; audit is written only for a newly inserted suppression, atomically with event ingestion.
- Historical outbox rows without a recipient hash are not auto-suppressed; this is explicitly tracked.
- Static verifier 11/11 PASS; TypeScript syntax 3 files, 0 diagnostics; Prisma/PostgreSQL/worker/provider runtime tests NOT RUN.
