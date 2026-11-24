# P133 Historical Allocations and Exceptions

## APIs
- `POST /accounting/historical-imports/allocations` — create immutable cross-batch allocation.
- `GET /accounting/historical-imports/allocations` — list allocation evidence.
- `POST /accounting/historical-imports/exceptions/scan` — scan posted rows for incomplete relationships.
- `GET /accounting/historical-imports/exceptions?status=OPEN` — list exception cases.
- `POST /accounting/historical-imports/exceptions/:exceptionId/resolve` — resolve with a 10–1000 character finance note.

## Allocation rules
`PAYMENT_TO_CHARGE` requires PAYMENT source and CHARGE target. `REFUND_TO_PAYMENT` requires REFUND source and PAYMENT target. Both rows must be POSTED, belong to the same school/student/currency, and the target transaction date cannot be later than the source transaction date. Amount must be positive and not exceed either source remainder or target remainder. Allocations are append-only.

## Permissions
- `accounting.reconcile`: read and scan.
- `accounting.historical-allocation.manage`: create allocations.
- `accounting.historical-exception.resolve`: resolve exceptions.

## Boundaries
P133 allocations are not yet consumed by P131 operationalization. Exception resolution stores a decision and audit event but does not alter source rows or post journals.
