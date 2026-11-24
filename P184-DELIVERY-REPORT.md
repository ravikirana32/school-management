# P184 — Admission Fee Ledger Handoff

## Implemented (source)
- Student conversion now looks for a pending admission fee handoff for the same school/application.
- When found, creates a `StudentFeeCharge` for the newly created student with an admission fee title/category and the handoff amount/currency.
- Charge is created in `DRAFT` / `DRAFT` approval state for finance review; this phase does not automatically publish a charge or initiate payment.
- Handoff is marked `LEDGER_CREATED` and its externalReference stores the created fee charge id.
- The operation occurs inside the conversion transaction so student/enrollment conversion and fee charge creation roll back together if conversion fails.

## Open
- Finance approval/publication workflow integration UI for admission charges.
- Invoice/receipt communication and payment gateway linkage for student admission fee.
- Reconciliation evidence and end-to-end runtime acceptance.

## Verification
- Source patch applied and inspected.
- No builds, tests, migrations, or runtime acceptance performed (deferred by instruction).
