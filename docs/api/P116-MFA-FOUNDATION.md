# P116 MFA API

All endpoints require a valid bearer session.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/mfa/totp/enroll` | Create or replace a pending TOTP enrollment; returns the secret and `otpauthUri` once |
| POST | `/api/v1/auth/mfa/verify` | Verify a six-digit TOTP or consume one recovery code; marks only the current session MFA-verified |
| GET | `/api/v1/auth/mfa/status` | Return enrollment state, unused recovery-code count and current-session MFA timestamp |
| DELETE | `/api/v1/auth/mfa/totp` | Disable the TOTP factor after a valid TOTP code; deletes remaining recovery codes and clears MFA timestamps |

## Security behavior
- TOTP secret is AES-256-GCM encrypted using `MFA_ENCRYPTION_KEY`.
- `MFA_ENCRYPTION_KEY` must decode from base64 to exactly 32 bytes and must be identical across API instances.
- Pending enrollment expires after ten minutes.
- TOTP uses SHA-1, six digits, 30-second periods and ±1 time-step tolerance; accepted time steps are atomically recorded to prevent replay.
- Ten recovery codes are displayed once; only SHA-256 hashes are persisted. Consumption is atomic and one-time.
- Platform administrator middleware requires an enrolled TOTP factor and a current-session MFA timestamp within the previous five minutes.
- Enrollment/challenge endpoints have Redis-backed IP and user rate limits; failed challenges feed fixed-label privacy-safe abuse counters.
- The enrollment secret and URI must never be logged and must be delivered only over HTTPS.

## Explicit limitations
No universal MFA-at-login policy, WebAuthn/passkeys, email/SMS factor, biometric factor, admin recovery, or external MFA delivery is included in P116.
