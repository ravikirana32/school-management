# P384 Status — Onboarding assignment save feedback (C2-04/F03)

## Implemented
- Added task-scoped assignment save feedback in the Guided School Onboarding task list.
- Shows `Saving…` while the request is pending and `Assignment saved.` after a successful API response.
- Uses accessible `role=status` live status semantics for both pending and success states.
- Clears prior success feedback before a new save and on request failure, avoiding stale success messages.
- Existing assignment map update remains response-confirmed; failures continue to show the shared error message.
- Added P384 source-contract verifier and package script.

## Limitations
- Feedback is source-verified only; runtime request behavior remains unverified.
- Does not add server-side notification or workflow lifecycle.
- F03 remains IN_PROGRESS; F04 has not started.

## Verification
- P384 verifier: 10/10 PASS.
- P370–P383 regression verifiers: all PASS.
- TypeScript syntax scan: 247 files, 0 parse errors.
- API build, DB migration, browser/E2E remain unverified.
