# P64 — Provider event versus manual release precedence

## Delivered
- Added pure event-time/manual-release policy.
- Webhook checks latest matching suppression before recreating on bounce/complaint.
- Delayed provider events cannot undo a later manual release; newer provider events may suppress again.
- Added tests and static verifier.

## Validation
Static verifier 8/8 PASS. Vitest and PostgreSQL runtime acceptance remain NOT RUN.

## Test result
- Static verifier 8/8 PASS.
- TypeScript syntax 4 files, 0 diagnostics.
- Vitest and PostgreSQL runtime acceptance NOT RUN.
