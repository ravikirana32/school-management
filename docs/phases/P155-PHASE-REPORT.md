# P155 — Staff Mobile Refund Evidence Workflow

## Delivered
- Added a dedicated Expo `apps/staff-mobile` application; did not grant accounting permissions to Parent or Teacher apps.
- Reused the established mobile authentication/session implementation with a dedicated `school.staff.*` secure-storage namespace to prevent Parent/Teacher session collisions.
- Added tenant, school, refund and reconciliation-note context selection.
- Added evidence listing with security status.
- Added native document picker for PDF, JPEG and PNG files with a 10 MB limit.
- Added presigned storage POST and authenticated upload-completion flow.
- Added CLEAN-only secure download-link retrieval and native link opening.
- Added root `dev:staff-mobile` workspace command.
- Updated the root and docs master open-gap registers in parity.

## Verification boundary
- Source-level checks and archive integrity are performed for this phase.
- Expo dependency installation, TypeScript typecheck, iOS/Android device execution, live API authorization, S3-compatible storage and malware scanner behavior have not been run here.
- P155-G001 remains PARTIALLY_IMPLEMENTED until those checks are evidenced.

## Deferred by project instruction
- Unit, API and end-to-end test case creation/execution.
