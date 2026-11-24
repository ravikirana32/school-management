# P31 Parent Portal Acceptance Plan

## Unit/source tests
- Parent portal access requires every independent condition: active membership, PARENT role, required permission, verified guardian, accepted invitation, unwithdrawn consent and visible student link.
- Student link visibility requires accepted invitation, active guardian and communication permission.
- Scanner callback HMAC validates timestamp + raw body; stale timestamps and altered signatures are rejected.

## PostgreSQL integration
- Apply P30 then P31 migrations on clean and P30 fixture databases.
- Confirm P31 migration rollback/reapply and RLS worker policies under non-owner API/worker roles.
- Test invitation acceptance races, duplicate acceptance, expiry, revoke, consent-version mismatch, existing-account password mismatch and account disabled state.
- Test membership/role provisioning and rollback if role seed is absent.
- Test consent withdrawal removes role/membership access, preserves school communication flags, removes portal role/membership and retains audit evidence.
- Test cross-tenant student IDs, guardian IDs, school switches and multiple guardian records.

## Worker integration
- Email provider success, timeout, 4xx/5xx retry, idempotent retry, expired invitation, dead-letter and outbox reconciliation.
- Ensure token is not logged, returned or persisted in plaintext.
- Scanner provider success, timeout, retries, short URL expiry, file signature/magic-byte verdict, timestamp skew, altered body, replay and quarantine-to-clean/rejected transitions.

## Mobile E2E
- Accept invitation and view exact consent notice before accepting.
- Existing account password proof and new account creation.
- Sign in, restore refresh token from SecureStore, select school, view linked children and published attendance.
- Attempt unlinked student, other-school student, unconsented guardian, withdrawn consent and unauthorized attendance access.
- Withdraw consent and verify school disappears from picker.

## Runtime status
No PostgreSQL, Redis, S3, email provider, scanner provider, Expo build or Playwright tests were run for P31 in this environment.
