# P194 — Public Admissions Tracking Token Lifecycle

- Public tracking tokens now expire after 30 days.
- Public status/document/submit resolver rejects expired tokens and revoked tokens.
- A token rotation endpoint allows a valid token to be exchanged for a new token; the prior token becomes invalid immediately because only the new hash is retained.
- Rotation is limited to applications in active applicant stages (DRAFT, DOCUMENTS_PENDING, SUBMITTED, UNDER_REVIEW).
- Raw token values are not persisted; only SHA-256 token hashes are stored.
- The public endpoints retain process-local request throttling. A shared distributed limiter, CAPTCHA, guardian verification and runtime abuse testing remain open.
