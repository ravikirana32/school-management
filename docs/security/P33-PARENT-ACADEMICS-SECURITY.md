# P33 security controls

- Parent endpoints revalidate active organization/school membership, PARENT role permission, verified guardian, accepted non-withdrawn invitation consent and communications-enabled student link.
- Notification read updates are recipient-scoped. Notification fan-out derives recipients from accepted invitation rows; client cannot supply recipient IDs.
- Draft fee charges, homework and report cards are excluded from parent queries.
- Fee payment recording is a school-side manual reconciliation with transaction advisory lock, unique reference and overpayment rejection. It does not contact a gateway.
- All five new tables use ENABLE + FORCE ROW LEVEL SECURITY and tenant context policies.
- Result summaries and remarks are returned only after publication. No raw document URLs are exposed.

Runtime RLS, concurrency and API tests remain required before production.
