# P337 Delivery Report — Applicant Withdrawal Lifecycle

## Implemented
- Token-authenticated public withdrawal route, with school/org scope.
- Withdrawal reason validation (3–1000 characters) and public rate limiting.
- Restricted stage eligibility; terminal or converted records cannot be withdrawn.
- Transaction advisory lock and fresh-state recheck to protect concurrent stage changes.
- Status becomes `WITHDRAWN`; tracking token is revoked to prevent further public edits/submissions.
- Stage history captures the reason and actor.
- Active seat reservations are released with capacity counter decrement and release metadata; associated offered offer is withdrawn. Any remaining offered offers for the application are withdrawn.
- Idempotent applicant notification key.

## Known limitations / open gaps
- Applicant-account dashboard withdrawal UI is not yet connected; this phase provides the secured token route only.
- Staff-side withdrawal reason/reporting UX is not added in this phase.
- Refund or admission-fee reconciliation is intentionally deferred to dedicated finance/refund phases; withdrawal does not automatically refund paid funds.
- Runtime DB/API, concurrency, browser, device and end-to-end testing remain deferred to Cycle 2.
