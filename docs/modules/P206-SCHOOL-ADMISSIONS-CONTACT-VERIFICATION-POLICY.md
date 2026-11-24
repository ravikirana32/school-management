# P206 — School-level contact verification policy

## Source changes
- Added authenticated `GET /api/v1/:organizationId/:schoolId/admissions/contact-verification-policy` with `admissions.read` authorization.
- Added `PUT` for policy updates with `admissions.manage` authorization.
- Persisted policy using existing `schoolPolicy` record key `admissions_contact_verification`; values are `requirePhoneVerification` and `requireEmailVerification` booleans.
- Public application submission reads the same school policy and enforces configured phone/email verification.
- Policy values override legacy `ADMISSIONS_REQUIRE_VERIFIED_CONTACT` environment fallback. If no school policy exists, legacy environment behavior is retained.
- Added School Admin Web controls for configuring required phone and email verification.

## Compatibility
- If no school policy has been saved, policy defaults remain false unless legacy environment enforcement is enabled.
- If email verification is required, email must exist and be verified; otherwise submission returns `ADMISSIONS_EMAIL_VERIFICATION_REQUIRED`.
- If phone verification is required, submission returns `ADMISSIONS_PHONE_VERIFICATION_REQUIRED` unless verified.

## Remaining
- Policy change audit history, staff-mobile policy UI, production delivery provider setup and build/typecheck/API/E2E/security/runtime validation remain open/deferred.
