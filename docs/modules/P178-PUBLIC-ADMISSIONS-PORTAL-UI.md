# P178 — Public Admissions Portal UI

## Implemented
- Reworked the existing `apps/public-portal` landing experience into a tabbed admissions portal while preserving tenant branding.
- Enquiry form submits to the P177 public enquiry endpoint.
- Application draft form submits to the P177 public application endpoint and displays the generated application number and tracking token.
- Tracking view calls the P177 status endpoint and shows only returned public status fields.
- Organization and school identifiers are entered manually because the current tenant-context response does not provide a school identifier.
- Responsive layout and form validation feedback added.

## Open gaps
- School selection/domain mapping should automatically provide organization and school context; manual ID entry is temporary and not appropriate for public production use.
- Public document upload, upload completion and checklist rendering remain open.
- Public eligibility check and final submit-to-SUBMITTED remain open; current application form creates drafts only.
- Shared Redis/gateway rate limiting, CAPTCHA, email/phone verification, tracking-token expiry/revocation, monitoring, and runtime/security acceptance remain open.

## Verification
- Source edits reviewed.
- Typecheck attempted but blocked because dependencies are absent in the workspace (`react` and `react-dom` declarations/modules unavailable).
- No build or runtime acceptance claimed.
