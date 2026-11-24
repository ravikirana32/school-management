# P228 — Applicant Document History Timeline

## Delivered (source implementation)
- Replaced the applicant portal's flat uploaded-document list with a chronological upload/replacement timeline.
- Displays document type, upload timestamp, version label, replacement parent when applicable, current review status, and current security status.
- Derives version sequence from replacement-child relationships (original v1, replacement v2, etc.) without changing persisted records.
- Adds applicant guidance for rejected documents and verified/clean documents.
- Keeps reviewer identities and internal reviewer notes out of the public timeline.
- Retains existing upload/replacement selector and secure upload workflow.

## Source verification
Static assertions were checked against the portal component and CSS. No build, typecheck, runtime, database migration, API integration, mobile, or E2E test was executed (deferred per project instruction).

## Remaining gaps
- Persisted historical scan-state transitions and exact scan-event timestamps.
- Applicant notification/inbox when a scan or school review changes status.
- Staff Mobile document workflow parity.
- Runtime end-to-end upload, scan callback, review, replacement, and timeline validation.
