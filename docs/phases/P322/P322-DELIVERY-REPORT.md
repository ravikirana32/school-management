# P322 — Homework Class/Section Targeting (Cycle 1)

## Delivered
- Homework targeting mode: individual, whole grade, or grade + section.
- Target roster is derived from the currently loaded school student list.
- Target preview count is displayed before creation.
- Bulk target requests create one student-scoped homework draft per student through the existing authenticated tenant-scoped API.
- Each student request is attempted independently; partial failures are surfaced with identifiers and count.
- Existing individual-targeted creation, submissions, attachments, review, grading, and approval/publish workflow remain in place.
- Bulk targeting is blocked when the loaded roster reaches the 100-record limit to avoid silently targeting an incomplete roster.
- Bulk-created records remain drafts; publishing continues to require the existing approval workflow.

## Limitations / open gaps
- Targeting is based on the loaded list, not a server-side roster query; bulk targeting is disabled at the 100-record cap.
- Grade/section matching uses available student fields (`gradeLevelId`/`grade`, `sectionName`/`section`) and needs runtime data-contract confirmation.
- No transaction across multiple students: partial success is possible and reported.
- Duplicate homework creation is not prevented by a backend bulk-idempotency key.
- Runtime, API integration, browser, mobile and full build validation were not performed.
