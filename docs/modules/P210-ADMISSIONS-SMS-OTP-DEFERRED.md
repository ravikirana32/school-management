# P210 — Admissions SMS/Phone OTP Deferred

## Decision
SMS/phone OTP is disabled temporarily. It must not block admissions submissions. Phone number remains collected as a guardian contact field, but phone verification is not claimed or required.

## Changes
- Public contact-verification request endpoint rejects SMS requests with HTTP 410 and stable code `ADMISSIONS_SMS_OTP_DEFERRED`.
- Public contact-verification verify endpoint rejects SMS challenges with HTTP 410 and the same stable code.
- Applicant portal offers email verification only and clearly states phone OTP is deferred.
- Application submission no longer checks guardian phone verification timestamps, including legacy/global require-contact settings.
- School Admin policy editor now exposes email verification only; API compatibility accepts legacy phone flag but stores and returns it as false.
- Applicant status UI labels phone verification as deferred instead of misleadingly unverified.

## Still dependent/deferred
- SMS provider, SMS templates, provider credentials, delivery telemetry, contract tests and operational validation.
- Full Admissions completion: review queues/assignment, workflow transition hardening, applicant draft editing and account linking, guardian merge/invitations, document version/re-upload workflow, offer/reservation policy, finance/payments/refunds/reconciliation, notification delivery retry/dead-letter, mobile parity, CAPTCHA and security/runtime acceptance.
- Email OTP enforcement remains optional and dependent on configured provider. Schools must not require email verification unless the provider is configured and operational.

## Validation
Static source checks are performed for this phase. Full install/build/typecheck/API/E2E/runtime acceptance remains deferred per project validation plan.
