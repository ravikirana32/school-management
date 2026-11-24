# P557 Delivery Report — Library Lost/Damaged Lifecycle, Replacement Charges & Write-off

## Status
Implemented in the cumulative source tree based on P556.

## Delivered
- `LibraryCopy` lifecycle audit fields: `lifecycleReason`, `lifecycleUpdatedAt`, and `writtenOffAt`.
- Migration adds lifecycle fields and a supporting status/time index.
- School-scoped, `library.manage` protected endpoint for copy lifecycle updates: mark LOST, DAMAGED, or restore AVAILABLE with a required reason.
- Lifecycle changes are blocked for copies currently ON_LOAN or ON_HOLD.
- Optional replacement charge posts a `REPLACEMENT_CHARGE` ledger entry; borrower ID is required when a positive charge is requested.
- Write-off endpoint only accepts copies in LOST or DAMAGED status and transitions them to WRITTEN_OFF with timestamp and reason.
- Admin Library workspace controls for selecting copy, status, reason, borrower type/ID, replacement charge, and write-off actions for lost/damaged copies.
- Phase verifier and documentation/progress/roadmap/master-gap mirrors updated.

## Validation performed
- P557 focused source assertions: 22/22 PASS.
- API library route transpilation: 0 diagnostics.
- Admin LibraryWorkspace TSX transpilation: 0 diagnostics.
- P556 baseline verifier: 28/28 PASS.
- P553–P555 regression verifiers: 80/80 PASS.
- Archive integrity, baseline retention, duplicate and manifest checks completed; see P557 archive verification.

## Limitations / open gaps retained
- Write-off currently requires library-manage permission but no separate dual-approval workflow.
- Replacement charge is a ledger entry; no payment provider/reconciliation is connected.
- Replacement physical copy is added through existing accession flow; no automatic link to the lost/damaged original.
- No live database migration/runtime, full typecheck/build, browser/mobile/accessibility, concurrency or E2E testing was run.

## Cumulative release package
- ZIP entries: 4,562
- Manifest tracked files: 4,560
- New tracked files vs P556: 16
- Modified tracked files vs P556: 69
- Missing P556 baseline paths: 0
- Duplicate entries: 0
- Manifest hash failures: 0
- ZIP CRC: PASS
- Cumulative archive SHA-256 is provided in the external checksum sidecar.
