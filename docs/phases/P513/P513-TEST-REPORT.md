# P513 Test Report

## Focused checks — 27/27 PASS

- Schema model and charge relation presence
- Compound tenant-scoped FK, migration constraints, and enforced tenant RLS
- API routes and permission scopes
- Requester self-approval protection
- Draft-only lifecycle
- Pending duplicate protection
- Gross charge immutability
- UI request/decision controls and gross/net display
- Fixed and percentage calculations
- Cent rounding
- Existing-approved budget calculation
- Excess concession rejection
- Percentage >100 rejection
- Full 100% waiver calculation
- Zero-after-rounding rejection
- Non-finite input rejection
- TypeScript parser diagnostics 0 for backend route and FinanceWorkspace TSX

## Regression scripts
- P509: 23/23 PASS
- P510: 23/23 PASS; TypeScript parser diagnostics 0
- P511: 16/16 PASS
- P512: 13/13 PASS; arithmetic edge checks 6/6 PASS
- P513: 27/27 PASS

**All five scripts exited 0.** Runtime and full project validations are not claimed.
