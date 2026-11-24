# P510 — C2-08-02 Fee Structure Enhancements

## Tasks
- P510-T01: Load school finance configuration from persisted API settings into Fee Structures workspace.
- P510-T02: Replace hard-coded fee component categories with configured active categories, while retaining historical category display.
- P510-T03: Default new structures to the configured school currency; allow explicit currency selection only if permitted by the finance policy.
- P510-T04: Validate fee component codes, names, amount, frequency, mandatory flags and effective dates at UI and API boundaries.
- P510-T05: Strengthen structure-code duplicate handling and scope/academic-year/grade constraints.
- P510-T06: Keep published structures immutable; draft editing and archiving remain intact.
- P510-T07: Ensure fee-structure preview/assignment uses the enhanced component contracts without duplicating charges.
- P510-T08: Add focused P510 static assertions and regression verifier.
- P510-T09: Carry P509-G001/P509-G005 forward; do not close without implementation evidence.
- P510-T10: Update master gap register mirrors, phase reports, archive manifest and cumulative ZIP verification.

## Exit criteria
- Fee structure UI/API consume the finance foundation configuration.
- Active category controls affect new structures; inactive categories do not appear for new entries but remain readable in existing records.
- Currency/category/component validation is consistent across UI and API.
- No baseline features removed.
- Focused and dependency-free regression checks pass.
- Local builds/runtime are performed by the user and not claimed as completed here.
