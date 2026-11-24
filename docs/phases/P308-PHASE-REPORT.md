# P308 — Rollover Execution Revalidation & Failure Recovery

- Fresh enrollment detail and target capacity are fetched immediately before execution.
- Rows invalidated by refreshed source status, duplicate target enrollment or capacity are blocked.
- Already-created matching target enrollments are reconciled and not duplicated.
- Sequential per-row status reporting includes Created, Failed, Blocked and Reconciled.
- P308 verifier 7/7; P307 7/7; P306 12/12; P305 9/9; P304 15/15 PASS.
- Dependency-backed build/typecheck and live API/browser/mobile runtime tests were not run.
- Server-side atomic seat reservation, transaction/rollback, source enrollment changes, full directory, approvals, audit/reporting remain open.
