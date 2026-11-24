# P116 — MFA Enrollment, Verification and Recovery Foundation

**Status:** Source implementation complete; runtime and migration acceptance pending.

## Implemented
- Authenticated TOTP enrollment with pending-factor confirmation and ten-minute pending enrollment expiry.
- TOTP secrets encrypted at rest using AES-256-GCM; `MFA_ENCRYPTION_KEY` must be a base64-encoded 32-byte key.
- TOTP verification using RFC 6238-compatible SHA-1, six digits, 30-second steps and ±1-step clock tolerance, with atomic last-step tracking to prevent code replay.
- Ten one-time recovery codes generated at first successful enrollment; only SHA-256 hashes are persisted, and consumption is atomic.
- Session-bound MFA verification timestamp with five-minute freshness policy.
- Platform-admin middleware now requires an enrolled TOTP factor and fresh MFA verification.
- MFA status, factor disable and audit events.
- Distributed IP/user rate limits for enrollment and challenge attempts; MFA failure counters feed privacy-safe abuse telemetry.
- Atomic TOTP time-step claims prevent replay of a code within the accepted time window.

## API
- `POST /api/v1/auth/mfa/totp/enroll`
- `POST /api/v1/auth/mfa/verify`
- `GET /api/v1/auth/mfa/status`
- `DELETE /api/v1/auth/mfa/totp`

## Configuration and operations
Generate a key using `openssl rand -base64 32` and configure `MFA_ENCRYPTION_KEY` consistently across API instances. Do not rotate it without a planned re-encryption process; losing it makes existing TOTP seeds undecryptable. Deliver the `otpauthUri` only over HTTPS and do not log it. Recovery codes are shown only once.

## Limitations
- No MFA challenge is required at ordinary password login for all users; this phase gates platform-admin routes and provides session step-up verification.
- No email/SMS factor, WebAuthn/passkeys, biometric re-authentication or administrator recovery process is included.
- API integration, Prisma validation/generation, migration execution, Redis/database runtime, semantic typecheck, device/browser testing and security review have not been run. Unit/API/browser/mobile test creation and execution remain deferred per project instruction.

## Gap reconciliation snapshot

The actual cumulative register contains 748 unique IDs. The latest explicit status per ID is OPEN 430, IN_PROGRESS 2, PARTIALLY_IMPLEMENTED 109, READY_FOR_VERIFICATION 184, BLOCKED_EXTERNAL 14 and CLOSED 0. Nine older checkbox-only entries do not declare an explicit status. P16-G006, P112-G003 and P115-G003 were updated; no gap was closed.
