# P156 — Staff Mobile Evidence Upload Reliability

## Delivered
- Added a native upload progress indicator backed by XMLHttpRequest upload progress events.
- Retained the selected document and upload-initiation response in an in-memory pending-upload reference when storage transfer fails, allowing an explicit retry without selecting the file again or creating another evidence initiation record.
- Added a per-attempt idempotency key to upload initiation metadata and the request header so compatible API implementations can deduplicate repeated initiation requests.
- Prevented concurrent upload actions and disabled upload controls while a transfer is active.
- Added an explicit evidence-status refresh action so staff can refresh malware scan state after upload completion.
- Preserved PDF/JPEG/PNG allow-list, non-empty-file check, 10 MiB cap, authenticated completion, and CLEAN-only download gate.

## Verification boundary
- Static source checks and ZIP integrity are performed for this phase.
- Retry behavior depends on the storage presigned POST remaining valid; if it expires, staff must start a fresh upload. Pending file references are intentionally in-memory only and do not survive app termination.
- The API must honor the supplied idempotency key for server-side deduplication; this phase passes the key but does not claim server enforcement without API/runtime evidence.
- Expo typecheck/build, iOS/Android device execution, API idempotency, upload progress, storage retry, scanner refresh and signed-download acceptance remain outstanding.

## Deferred by project instruction
- Unit, API and end-to-end test case authoring/execution.
