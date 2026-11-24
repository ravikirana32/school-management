# P204 — Admissions Applicant Contact Verification UI

## Implemented
- Added a public-portal contact verification panel to the existing application tracking workflow.
- Allows selection of SMS/phone or email channel and requests a token-bound verification challenge.
- Captures the challenge ID from the request response and submits the 6-digit code to the token-bound verify endpoint.
- Provides numeric OTP input, `one-time-code` autocomplete, resend cooldown UI, disabled states while requests are in progress, and accessible status messages.
- Shows locally confirmed state after the API returns success; this state is intentionally session-local and is not represented as persisted status from the tracking endpoint.
- Added styling for the verification panel.

## API paths used
- `POST /api/v1/public/:organizationId/:schoolId/admissions/status/:trackingToken/contact-verification/request` body `{ channel: "SMS" | "EMAIL" }`
- `POST /api/v1/public/:organizationId/:schoolId/admissions/status/:trackingToken/contact-verification/verify` body `{ challengeId, channel, code }`

## Known limitations / gaps
- The public status endpoint does not return contact verification status, so verified state is session-local in this UI.
- Requesting SMS/email depends on existing provider configuration; production provider delivery remains unresolved.
- School policy configuration UI and API to expose whether verification is required are not included in P204.
- Validation/build/tests/runtime acceptance remain deferred.
