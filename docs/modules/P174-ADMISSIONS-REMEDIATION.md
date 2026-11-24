# P174 Delivery Report — Admissions Remediation

## Scope
Continue P173 admissions closure. Source-only delivery; API/web/mobile builds and runtime validation deferred.

## Implemented
- Enrollment API now accepts an optional admission number. If omitted, generates `ADM-<enrollment year>-<5 digit sequence` under a PostgreSQL advisory transaction lock scoped to the school, avoiding concurrent generation collisions within the school lock scope.
- Enrollment conversion reuses an existing guardian record in the same organization/school when phone matches, or when normalized email matches case-insensitively; otherwise creates a guardian. Guardian/student link remains created transactionally.
- Admission offers can include an optional admission fee amount in INR from School Admin Web and Staff Mobile.
- Added tenant-scoped `GET /fee-handoffs` and database-unique idempotent `POST /offers/:offerId/fee-handoff` to create a pending fee handoff from an offer's positive fee amount. Both web and staff mobile expose the action.
- Enrollment UI now allows the admission number to be blank and displays the server-generated number in the result message.

## Not completed / open
- Parent/public self-service enquiry and application workflow.
- Guardian merge, identity/account linking, collision review UI, uniqueness migration and runtime concurrency validation.
- Offer-time seat reservations and expiry/decline reservation release.
- Fee handoff to fee-ledger charge/invoice/payment/reconciliation; P174 only creates a pending handoff record.
- Configurable age eligibility, board/grade rules, document checklist.
- API/UI builds, DB migration/runtime, tenant isolation and mobile acceptance.

## Database change
- Added composite uniqueness for fee-handoff offer linkage and migration `20261119192000_p174_fee_handoff_offer_idempotency`.

## Verification
- Source was edited and archive created. No builds, API tests, UI tests, or runtime acceptance were run per instruction.
