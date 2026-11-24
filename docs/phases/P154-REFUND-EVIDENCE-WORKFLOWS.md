# P154 — Refund Evidence Web Workflow

- Added the School Admin Finance upload action for reconciliation evidence.
- The browser accepts PDF/JPEG/PNG only, rejects empty files and files above 10 MiB, and submits metadata to the tenant-scoped P152 upload-initiation endpoint.
- Uploads use the returned S3-compatible presigned POST fields; the browser then calls the returned completion path. Evidence remains quarantined pending scanner approval.
- Evidence lists show scan state. Secure download is offered only for `CLEAN` storage-backed evidence and uses the short-lived URL returned by the API.
- Upload progress is represented by the existing busy state; API/storage errors are surfaced in the Finance workspace.
- Native mobile finance upload is not added: the existing mobile applications are Parent and Teacher apps, neither has the `accounting.reconcile` staff capability. Do not expose reconciliation evidence or privileged upload APIs to parent/teacher sessions. A dedicated staff mobile client remains an open product gap.
- Runtime S3, scanner, browser and device verification remains outstanding.
