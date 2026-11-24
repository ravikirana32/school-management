# P179 — Token-authorized applicant document workflow

## Implemented
- Public tracking-token authorization for applicant document checklist retrieval.
- Checklist retrieval uses board-specific eligibility rules with `ANY` fallback.
- Public upload requests require document codes from the configured checklist.
- File types restricted to PDF, JPEG and PNG; metadata maximum 25 MB.
- Presigned private-storage upload; object metadata checked at completion.
- Upload completion moves document to quarantine and queues malware scanning.
- Public portal tracking view displays checklist/document security states and upload controls.
- Internal review notes are excluded from public status and document list responses.

## Open gaps
- Final public application submission with eligibility validation and required clean/verified documents.
- Public school-context resolution and removal of manual org/school ID entry.
- Shared/distributed rate limiting, anti-bot/CAPTCHA, email/phone verification, tracking-token expiry/rotation/revocation.
- Full runtime and security acceptance, deferred by instruction.

## Verification
- Source-level review only. Dependencies are not installed in this workspace, so typecheck/build cannot be confirmed. ZIP integrity is checked.
