# P329 — Parent Homework Attachment Access

## Scope
Cycle 1 parent-mobile access to scan-cleared attachments from a student's homework submission, using the existing authenticated secure-download API.

## Delivered
- Parent homework submission attachment metadata is rendered as individual attachment rows rather than a concatenated text label.
- Security status is visible for each attachment.
- Only `CLEAN` attachments expose the **Open** action. Pending, quarantined, rejected, or unknown statuses remain blocked with explanatory text.
- Open action requests a short-lived download URL from the existing parent-authorized endpoint (`kind=homework`) and opens it using Expo Linking.
- Per-attachment loading state prevents duplicate taps and provides accessible button labels.
- Offline mode blocks opening because secure download URLs require an online authenticated request.
- Existing parent/guardian authorization, consent, school/child scope, scan gate, and audit path remain delegated to the API.

## Verification
- Static source verifier: 12/12 PASS.
- Parent mobile TSX transpilation: 0 diagnostics.
- Corrected a pre-existing missing closing parenthesis in a parent-mobile notification-preference effect, found by the transpile check.
- Runtime API, device, Expo full build, secure-link expiry, authorization-negative, and end-to-end tests: NOT RUN.

## Open limitations
- Download link opening is platform-handled via Linking; inline PDF/image preview is not implemented.
- Signed URL behavior and storage/scanner configuration need runtime acceptance.
- Existing P326/P37 consent, RLS, provider, and mobile-validation gaps remain open.

## Gap updates
- P326-G003: implementation status moves to READY_FOR_VERIFICATION; runtime acceptance remains required.
- P329-G001: runtime download-link, guardian scope, and security-state negative testing remains READY_FOR_VERIFICATION.
- P329-G002: inline preview, attachment metadata completeness, and device UX remain OPEN (Cycle 2 / refinement).
