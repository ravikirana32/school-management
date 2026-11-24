# P208 — Admissions OTP timing-safe verification

## Implementation
- Replaced direct string comparison of stored and submitted OTP SHA-256 hashes with Node `crypto.timingSafeEqual` through a fixed-size digest helper.
- Hash helper rejects malformed/non-64-character hex digests and fails closed.
- Preserved challenge binding, expiry, one-time consumption, five-attempt conditional increment, resend cooldown, and public tracking-token binding.
- Added unit coverage for equal hashes, mismatched hashes, malformed and wrong-length digests.

## Validation
- Source-level checks performed. Build/typecheck/test execution remains deferred pending local dependency/runtime setup.

## Gaps carried forward
- Production SMS/email provider configuration and secrets.
- CAPTCHA/anti-bot and proxy trust review.
- Full API/E2E/mobile runtime acceptance.
