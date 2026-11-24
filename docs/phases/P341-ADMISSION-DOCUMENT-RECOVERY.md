# P341 — Admission Document Recovery

Baseline audit confirms that applicant document recovery was already implemented in the public portal in P340. The existing flow lets applicants view checklist statuses and upload replacements for rejected documents. It authorizes an upload, posts to private storage, completes the upload, refreshes the checklist, and shows a chronological version timeline. Only documents marked VERIFIED and security CLEAN count as checklist completion. P341 intentionally avoids duplicating these capabilities.


Remaining: runtime integration with storage and malware scanning, interrupted-upload recovery validation, staff/mobile review E2E.
