# P31 Phase Report — Parent Portal, Delivery Workers & Consent Controls

**Status:** source implementation complete; runtime acceptance NOT VERIFIED.

## Delivered

### Parent identity, membership and consent
- Added exact versioned consent notice text to ParentInvitation. The public preview endpoint accepts the opaque token in a POST body and returns the notice/version plus masked email.
- Invitation acceptance verifies token hash, pending state, expiry and exact consent version. New users are created; existing users must prove their current password. Disabled accounts and conflicting guardian links are rejected.
- In the same tenant transaction, accepted invitations link the verified guardian, activate OrganizationMembership and SchoolMembership, assign the least-privilege PARENT role and permission set, record consent, clear encrypted delivery payload and write audit history.
- Legacy P30 pending invitations are revoked during P31 migration because the exact consent notice was not stored. New invitation creation supports re-consent for older already-linked guardians that lack active parent membership/role.
- Added consent withdrawal timestamp and endpoint. Withdrawal removes the school PARENT role assignment, marks the school membership LEFT, updates organization membership only when no active school membership remains, and writes audit. School-managed guardian communication preferences are preserved.

### Parent portal API and mobile app
- Added authenticated parent school discovery.
- Added linked-child listing limited to the accepted guardian, same organization/school and `canReceiveCommunications` links.
- Added published attendance history limited to SUBMITTED/LOCKED sessions, maximum 180 records, without exposing teacher remarks.
- Added Parent Expo app invitation token preview, exact consent notice display, explicit acceptance, sign-in, refresh-token rotation and SecureStore persistence, school switcher, linked children, attendance and consent withdrawal.
- Parent authorization requires active school membership, PARENT role with required permission, verified active guardian, accepted non-withdrawn consent and a visible student link. School membership alone is insufficient.

### Parent invitation delivery worker
- Added BullMQ `parent-invitation-delivery` queue and standalone worker script.
- Added HTTPS provider adapter, bearer auth, provider idempotency key, bounded timeout, five attempts with exponential backoff, dead-letter queue and database outbox reconciliation.
- Worker decrypts token payload only at delivery time. Token is not logged or returned by staff APIs; invitation URL places token in fragment rather than request query.
- Added invitation delivery-status API for authorized school staff.

### Malware scanner dispatch adapter
- Added BullMQ `document-malware-scan` queue and standalone worker script.
- Worker creates 120-second signed object URL and dispatches it to a configured HTTPS scanner provider with required malware, file-signature, MIME and malformed-file checks.
- Added scan request timestamp/reconciliation and scanner dispatch dead-letter queue.
- Hardened scanner callback to HMAC-SHA256 over timestamp + exact raw request body, with five-minute timestamp tolerance. Callback remains single-use because only QUARANTINED documents can transition.
- The malware scanning engine/provider remains external; this project contains the dispatch adapter and callback contract, not a bundled antivirus engine.

### Database and documentation
- Added P31 migration for consent notice, consent withdrawal, scan request timestamps, worker RLS policies and parent lookup indexes.
- Added idempotent PARENT role and `parent.portal.read` / `parent.attendance.read` permission seed.
- Added parent access and scanner HMAC unit-test source.
- Updated root/docs gap register, README, changelog, implementation status and P32 entry criteria.

## Verification performed
- TypeScript/TSX syntax transpilation: **PASS 16/16 changed source/test files**.
- Targeted static source assertions: **PASS 20/20**.
- JSON configuration/manifest parsing: **PASS**.
- Root/docs master gap register byte parity: **PASS**.
- P31 migration source assertions: **PASS**.
- Cumulative ZIP integrity: verified after archive creation.

## Not run — runtime acceptance remains unverified
- Prisma validate/generate and full TypeScript typecheck/build.
- PostgreSQL migration apply/rollback, RLS under non-owner API/worker roles, invitation races, consent withdrawal and cross-tenant tests.
- Redis/BullMQ worker integration, dead-letter replay and provider idempotency.
- S3 presigned URL integration and actual scanner provider/malware engine.
- Actual email provider delivery, bounce handling and callback verification.
- Vitest execution, API integration, Playwright, Expo build and iOS/Android device E2E.

The environment has no installed project dependencies, pnpm, Docker, PostgreSQL, Redis, S3 or configured external providers. A direct API `tsc --noEmit` attempt stopped because `@types/node` is not installed; no full typecheck is claimed.

## Known limitations
- Email and scanner provider adapters are generic HTTPS contracts; a real provider and malware engine must be configured and verified.
- Worker RLS policies use transaction-local service GUCs. Deploy workers as isolated processes with dedicated least-privilege database credentials; GUC policies alone are not a service identity boundary.
- Parent portal currently includes school selection, linked children and published attendance only. Fees, homework, report cards, messaging, notifications and transport are not included.
- Attendance history is capped at 180 records without cursor pagination.
- Invitation preview rate limiting, provider-specific delivery receipts/bounces, key rotation and account MFA/recovery remain open.
- Historical accepted P30 invitations do not have the exact notice text; P31 backfills a generic placeholder. Re-consent/legal review may be required.

No production-readiness claim is made.
