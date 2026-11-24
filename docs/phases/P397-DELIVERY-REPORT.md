# P397 Delivery Report

## Feature
Academic year and term configuration transfer added to School Configuration JSON transfer.

## Changes
- Academic tab now exposes versioned JSON export and import preview/apply.
- Export collects every academic year and fetches its terms from the school API.
- Import validator enforces payload scope, supported types, duplicate identifiers/sequences, date order and term-within-year boundaries.
- Preview blocks codes that already exist in the selected school.
- Apply uses the `academics.manage` permission and creates years followed by nested terms. Imported years are not promoted to current.
- Non-transactional partial creation is explicitly disclosed; user is advised to reload/reconcile before retrying.
- P396 verifier updated for specific permission.

## Verification
P397 20/20, P396 15/15, 28 P370–P397 phase verifiers pass, syntax scan 248 files/0 errors, package JSON parse PASS, ZIP integrity PASS, P396 baseline preservation 100%.

No full build, runtime API/DB, browser/mobile or E2E testing is claimed.
