# P338 — Admission Offer Lifecycle

Added tracking-token-authenticated applicant offer listing and response API. Applicants can accept or decline offers; responses are protected by tenant/application scoping, transaction locking and state rechecks. Expired responses are rejected while expiry and active reservation/capacity cleanup are persisted. Successful decisions write admission stage history and applicant notifications. Public portal UX and Cycle 2 runtime/E2E validation remain open. See `P338-STATUS.md`, `P338-DELIVERY-REPORT.md`, and `P338-VERIFICATION.txt`.
