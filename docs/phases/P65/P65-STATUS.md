# P65 Status — Versioned suppression hash aliases

**Status:** Source implementation and additive migration complete; runtime acceptance pending. **Production approval: NOT GRANTED.**

- Added `NotificationEmailSuppressionHashAlias`, allowing one suppression record to hold active HMAC aliases for current and previous key versions without plaintext email.
- Migration backfills each existing suppression row's known hash/version and applies tenant RLS plus worker read policy.
- School Admin create checks all configured aliases and writes aliases for every configured key version; release marks all aliases RELEASED in the same transaction.
- Worker checks both primary suppression records and active aliases before sending.
- Provider bounce/complaint webhook checks active aliases, creates a new alias for newly created suppression, and audits in the tenant transaction.
- P63-G003 moves to READY_FOR_VERIFICATION pending PostgreSQL/Prisma tests.
- Static verifier 10/10 PASS; TypeScript syntax 4 files, 0 diagnostics; Prisma/PostgreSQL/RLS/Vitest NOT RUN.
