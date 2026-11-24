# P180 — Public Application Submission & Eligibility Enforcement

## Implemented
- Added applicant token-authorized submission endpoint.
- Only DRAFT and DOCUMENTS_PENDING applications can be submitted.
- Board-specific eligibility rule is preferred, with ANY fallback.
- Configured required documents must be uploaded, scanner-clean and staff-verified before public submission.
- Configured age range is enforced at the rule cutoff date; date of birth is required when age limits are configured.
- Application status changes to SUBMITTED, submittedAt is set, and stage history is recorded with PUBLIC_ADMISSIONS actor.
- Public portal tracking UI includes final submission action.

## Open gaps
- Board/catalog eligibility rule absence currently permits submission without configured age/document restrictions; schools must configure rule sets and product policy should decide whether missing rule configuration blocks submission.
- CAPTCHA, contact verification, shared rate limiting, token expiry/revocation, automated monitoring, tenant domain-to-school context mapping, and runtime acceptance remain open.
- Parent/Public UX needs error-detail presentation and confirmation notifications.

## Verification
- Source review and archive integrity only. Frontend typecheck/build blocked by missing dependencies; runtime/API acceptance deferred.
