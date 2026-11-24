# P337 — Applicant Withdrawal Lifecycle

Status: **SOURCE IMPLEMENTED**

Applicant withdrawal is now available through the public application tracking-token endpoint. It requires a withdrawal reason, applies only to non-terminal pre-conversion stages, atomically changes status and revokes the tracking token, records stage history, notifies the applicant, and releases active seat reservations / offered offers where present.

Endpoint: `POST /api/v1/public/:organizationId/:schoolId/admissions/status/:trackingToken/withdraw`
Body: `{ "reason": "..." }`

Responses include validation (400), invalid/expired token (404), stage conflict (409), and successful withdrawal details. Public withdrawal is rate-limited.

Verification: focused source-contract checks passed; route TS transpilation emitted no diagnostics. Full runtime DB/API/browser/mobile/E2E tests remain deferred to Cycle 2.
