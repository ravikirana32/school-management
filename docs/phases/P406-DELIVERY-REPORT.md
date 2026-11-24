# P406 Delivery Report

## Delivered
- Added campus-aware effective configuration read endpoint at `GET /:organizationId/:schoolId/campus-config/effective/:campusId`.
- Reads base profile, working-day configuration, and policy records inside tenant context.
- Resolves persisted campus inheritance and returns 422 for invalid/cyclic/missing inheritance chains.
- Combines override scopes with base values, preserving base values when no override exists.
- Requires active school membership and `school.settings.manage` permission.
- Added `verify:p406` package script and source-slice verifier.

## Scope limitation
This is a read-only effective view. Existing standard configuration GET/PUT endpoints are unchanged, so inheritance is not yet automatically applied to all consuming screens/workflows. Campus entity registry validation, UI, transactional concurrency protection, full runtime/API/DB/browser/mobile/E2E acceptance remain open.

## Cumulative archive
- P406 ZIP: 5,002,690 bytes (5.00 MB), 3,140 entries.
- P405 baseline: 2,911 entries; 0 baseline paths missing.
- Duplicate archive entries: 0; ZIP integrity passed.
- SHA-256: `70a1f8d642bf25cab6580062758681e7bade487ade2b49dca8510e6cf99adb97`.
