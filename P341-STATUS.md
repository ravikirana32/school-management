# P341 — Admission Document Recovery

## Baseline audit
The public applicant portal already supports required-document checklist visibility, status interpretation (uploaded/quarantined/scan-clean/rejected/verified), version timeline, replacement upload for rejected documents, upload authorization, private storage form-post, completion API, and refresh after successful completion.

## P341 outcome
Completed by source-audit and evidence documentation: the Cycle 1 document-recovery flow is present in the P340 cumulative baseline. No duplicate API/UI was added. Rejected document replacement is linked through `replacesDocumentId`; only verified and scan-clean documents count as complete.

## Remaining gaps
- Live storage provider, malware scanner and API/database integration tests.
- Failure recovery for interrupted private-storage upload / completion call under runtime.
- Mobile staff review and applicant replacement verification in device/browser E2E.
