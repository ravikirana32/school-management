# P579 Risk Acceptance Log

**Status:** No risks accepted; no authorized acceptance evidence supplied.

| Risk | Disposition | Owner | Evidence required |
|---|---|---|---|
| Tenant data disclosure / cross-tenant access | OPEN — unacceptable for release | Security + database owner (to be assigned) | Restricted-role RLS and adversarial integration tests |
| Incorrect fees, payments, refunds or accounting balances | OPEN — unacceptable for release | Finance product owner (to be assigned) | Provider E2E and balanced ledger reconciliation |
| Child/student data privacy and safeguarding | OPEN — unacceptable for release | DPO/legal + safeguarding lead (to be assigned) | Jurisdictional review, retention/deletion evidence and safeguarding sign-off |
| Data loss / unrecoverable service outage | OPEN — unacceptable for release | SRE/DBA (to be assigned) | Restore/PITR/failover drill and measured RPO/RTO |
| Accessibility exclusion | OPEN | Accessibility lead (to be assigned) | Manual WCAG/assistive-tech review and remediation |
| Vulnerable dependency or exposed secret | OPEN | AppSec/platform owner (to be assigned) | Complete SBOM, vulnerability report and independent secrets scan |

No risk is marked accepted. Owners are role placeholders, not named approvals.
