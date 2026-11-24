# P227 — Admissions Document Version & Review Timeline

## Implemented
- Added a source-derived document timeline to School Admin application details.
- Timeline includes upload events, scan-request/security state, reviewer decision events with review notes, and replacement lineage events. Current security status is explicitly labeled as current rather than timestamped as a historical transition, because the record does not retain security-state change timestamps.
- Replacement versions are numbered from their `replacesDocumentId` ancestry, with cycle-safe traversal.
- Events are chronologically sorted and show timestamps when present.
- Existing document records remain unchanged; timeline is derived from fields already returned by the scoped documents API.

## Validation
- Static source assertions only; no build/typecheck/runtime/database migration/API/E2E/mobile/security tests executed (deferred by project instruction).
- ZIP archive integrity checked.
