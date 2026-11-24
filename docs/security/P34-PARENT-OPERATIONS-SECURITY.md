# P34 — Parent Operations Security

- Every new operator list and publish route uses the shared `scope()` guard, which checks active school membership and an explicit permission.
- Fee operations require `fees.read` or `fees.manage`.
- Homework requires `academics.manage`.
- Report-card operations require `reports.manage`.
- Parent notification management requires `parent.notifications.manage`.
- Every query is executed inside `withTenantContext` with organization, school and actor identity.
- Publish routes only allow a DRAFT-to-PUBLISHED transition and record an audit event.
- Notification recipient derivation remains server-side. It requires a verified active guardian, accepted non-withdrawn invitation consent and a communications-enabled student-guardian link. The UI cannot choose arbitrary recipient user IDs.
- Payment records are manual reconciliation only. Existing backend checks unique reference, outstanding balance and transaction-scoped charge locking; runtime concurrency tests remain pending.
- Parent-facing reads continue to return published data only and enforce parent consent/link authorization.

## Not yet production-accepted
No PostgreSQL/RLS, API integration, concurrent payment, full PII, Playwright or device tests were run in this phase. Operator notification lists deliberately omit recipient user IDs; the workspace displays a generic linked-parent-account label. Runtime response-shape verification remains pending. School-side list pagination, rate limits, retention and provider delivery remain open.
