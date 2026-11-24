# P224 — Admissions Follow-up Information Requests

## Scope
Create a new follow-up request linked to a previously responded or resolved information request, without overwriting the original request-response-resolution history.

## Implementation
- Added `followUpToId` to `AdmissionReviewNote` and a Prisma migration/index.
- Review-note creation accepts optional `followUpToId`; it is valid only for REQUEST_INFORMATION notes.
- API validates that the referenced parent request belongs to the same organization, school and application, is a REQUEST_INFORMATION note, and is RESPONDED or RESOLVED. Invalid linkage returns a conflict.
- Admin UI adds an Issue follow-up request action on non-OPEN request notes, sets the follow-up context, and identifies the parent request in the submission form.
- Review-note history includes linkage; follow-up is a new note so prior response/resolution fields remain intact.

## Source-level checks
- Confirmed schema field and index.
- Confirmed migration SQL.
- Confirmed POST route validation and tenant/school/application parent lookup.
- Confirmed UI follow-up action, payload, linked-parent display, and button state.
- Confirmed root/docs master register and resolved history mirror byte-identically.
- ZIP integrity checked.

## Deferred validation
No build/typecheck, migration execution, runtime, API, formal tests, mobile build, deployment, E2E, or security validation was run, per current project instruction.

## Remaining gaps
Applicant notification/inbox delivery, applicant-side follow-up display improvements, same-request reopen semantics, broader correction/document workflow, mobile parity and final validation remain open.
