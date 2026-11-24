# P125 — Fees, Payments and Financial Resource Authorization

## Scope

P125 separates fee-charge visibility from payment-detail visibility and manual payment recording. It does not introduce a payment gateway, refund workflow, credit-note model, or accounting ledger.

## Permission catalogue

| Permission | Purpose |
|---|---|
| `fees.read` | Read fee charge and balance summaries within the active school |
| `fees.manage` | Create and publish fee charges using the existing approval workflow |
| `fees.payments.read` | Read payment method, reference, amount and paid-date details in the School Admin fee list |
| `fees.payments.record` | Record a manual payment against an existing published charge |
| `parent.fees.read` | Read published fee statements for a consent-linked child in the parent portal |

The seeded `SCHOOL_FINANCE` role receives `fees.read`, `fees.payments.read`, and `fees.payments.record`. It does not receive `fees.manage`, student PII, or unrelated academic permissions. `SCHOOL_ADMIN` receives the complete school permission catalogue through the existing seed behavior.

## API behavior

- `GET /:organizationId/:schoolId/parents/fees` requires active school membership and `fees.read`.
- The response includes `payments` only when the caller additionally has `fees.payments.read`. The response includes `paymentDetailsIncluded` so clients can distinguish a summary-only result from a payment-detail result.
- `POST /:organizationId/:schoolId/parents/fees/:chargeId/payments` requires active school membership and `fees.payments.record`; it retains school/organization predicates, transaction-scoped advisory locking, duplicate-reference rejection, overpayment prevention and audit logging.
- Parent fee statements remain a separate path requiring `parent.fees.read`, accepted consent and an exact guardian/student link.
- Fee charge creation and publication continue to require `fees.manage` and the existing approval state.

## Finance role provisioning

The Prisma seed adds the `SCHOOL_FINANCE` system role and its least-privilege permissions. Run the normal idempotent seed after deploying this version, then assign the role to the intended finance users through the existing role-assignment workflow. Existing custom roles do not automatically receive the new payment permissions.

## Explicit limitations

- Payment records are manual reconciliation records; they do not initiate a gateway transaction.
- Refunds, partial refunds, payment reversals, credit notes, settlement reconciliation and balanced accounting journal posting are not implemented by P125.
- No payment provider is selected or configured in this phase.
- Source-level verification does not establish database runtime, API authorization or concurrency acceptance.
