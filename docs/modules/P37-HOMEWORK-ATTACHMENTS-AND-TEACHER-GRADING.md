# P37 — Homework attachments and teacher grading

## Delivered source

- Homework submission attachment metadata is owned by a submission and tenant; attachment records have composite tenant FKs, a bounded size, declared MIME type, and a private object key.
- Parent upload uses a short-lived S3-compatible presigned POST, validates guardian/student link plus accepted non-withdrawn consent, and accepts only PDF/JPEG/PNG up to 25 MiB.
- Upload completion verifies S3 object size, content type and document ID metadata, moves the record to QUARANTINED, and enqueues the existing malware-scan worker.
- The existing scanner worker now discovers homework attachments, obtains a short-lived quarantine download URL, dispatches the scanner callback, verifies callback HMAC/timestamp/raw body, rejects MIME mismatch, promotes clean objects from quarantine to private storage, and deletes rejected objects.
- Signed download is allowed only for the consented linked parent or an authorized school operator/teacher assigned to the student's active grade/section/year. Non-clean objects cannot be downloaded.
- Teacher homework list is filtered to the linked staff member's active class assignments. The SCHOOL_TEACHER role receives separate `homework.read` and `homework.grade` permissions. Submission listing, grading, history and reopen operations check teacher class assignment; school operators retain the `academics.manage` path.
- Teacher mobile app includes homework list, submission review, score and feedback entry, using its existing authenticated/refresh-token API client.
- Rubric results are stored as bounded JSON criteria with score/max-score validation. Grade/reopen events are append-only at the database trigger level.

## Deliberate limits

- Homework assignment remains student-targeted. Teacher assignment authorization maps the student's active enrollment to teacher year/grade/section; subject-level authorization is not yet possible because HomeworkAssignment does not store a curriculum subject ID.
- Rubric JSON is not yet a school-managed, versioned rubric catalogue and does not automatically calculate weighted totals.
- Parent app attachment preview/download UI is not added; parent portal API returns attachment metadata and the signed-download API is available.
- Offline teacher grading, draft autosave and rubric editor UI are not included.
- Report-card schema versioning, approval and private PDF generation remain deferred to a dedicated phase.
- External scanner/S3 configuration is required; source integration is not evidence of a live scan.

See P37 phase report, API/security docs and master gap register.
