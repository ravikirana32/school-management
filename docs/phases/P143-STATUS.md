# P143 Status — Parent-Visible Refund Status Timeline

**Status:** Cross-layer source implementation delivered; PostgreSQL/runtime acceptance pending.

## Completed source work
- Added `parentVisibleAt` and `parentVisibleBy` to `StudentFeeRefund`, with a tenant/student/status lookup index and additive PostgreSQL migration.
- Added School Admin refund queue API and publish/hide action protected by `fees.refunds.approve`.
- Recorded publication and revocation as append-only refund events and audit-log actions.
- Added parent portal refund timeline API protected by active parent consent, `parent.fees.read`, verified guardian-to-student communication link, and explicit publication state.
- Parent API returns safe status fields and lifecycle timestamps only; it omits staff identities and internal event notes.
- Added School Admin Finance publication controls.
- Added Parent Mobile API integration, refund status timeline, and secure offline cache use through the existing parent cache.
- Cleared refund data from in-memory state on logout, session invalidation and consent withdrawal.

## Verification boundary
- Static cross-layer source verifier is used.
- Unit/API/browser/mobile test creation and execution remain deferred per project instruction.
- Prisma migration deployment, generated-client validation, live API authorization, web interaction and iOS/Android runtime acceptance have not been run in this environment.
- No gap is closed solely on static verification.
