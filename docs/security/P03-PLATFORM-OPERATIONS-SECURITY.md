# P03 Platform Operations Security

- Platform routes are protected by authentication plus a database-backed `isPlatformAdmin` check.
- Mutating tenant operations require a reason where they change lifecycle state.
- Organization creation, school creation, status changes, settings updates and support grant creation emit audit log records.
- Support grants are time-bounded and limited to four hours in the route policy.
- Support grant creation is self-scoped in this phase; it does not grant access or implement impersonation.
- Secret platform settings are excluded from the read API. Encryption at rest and secret manager integration remain open.
- Production requirements: MFA for all platform administrators, dual approval for tenant suspension/deletion and support access, immutable audit export, IP allowlisting or risk-based access, rate limiting, alerting, and periodic access review.
