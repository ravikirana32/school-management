# P203 — Admission Contact Verification Enforcement

## Implemented
- Public tracking-token-bound request and verify endpoints for guardian email/phone.
- Codes use cryptographically secure random generation; only target/code hashes are persisted.
- 6-digit code, 10-minute expiry, 60-second resend cooldown, 5-attempt ceiling.
- Verification challenge creation and verification scoped to organization, school, application, channel and normalized target hash.
- Verification is one-time; successful records set `verifiedAt` and `consumedAt`, and the application contact verification timestamp is updated.
- Optional submit gate controlled by `ADMISSIONS_REQUIRE_VERIFIED_CONTACT=true`; requires guardian phone and, when provided, email verification.
- Development console delivery is opt-in via `ADMISSIONS_OTP_DEV_CONSOLE=true` and disabled in production.

## Endpoints
- `POST /api/v1/public/:organizationId/:schoolId/admissions/status/:trackingToken/contact-verification/request` body: `{ channel: \"EMAIL\" | \"SMS\" }`.
- `POST /api/v1/public/:organizationId/:schoolId/admissions/status/:trackingToken/contact-verification/verify` body: `{ challengeId, channel, code }`.

## Not production-ready yet
Production email/SMS provider delivery is not wired. Requests return provider-unavailable when dev console delivery is disabled and provider integration is absent. Applicant UI, CAPTCHA/challenge, dedicated delivery audit, full tests, build/typecheck, security review and runtime acceptance remain open.
