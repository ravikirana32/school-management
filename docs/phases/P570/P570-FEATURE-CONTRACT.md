# P570 Feature Contract

## Fee plans and invoices
- All reads/writes are scoped by organization and school.
- Fee plan effective window must be valid; invoice plan must cover the requested period and match the allocation academic year/building/hostel type.
- Proration uses calendar-day overlap between invoice period and allocation active dates. Calculation inputs and outputs are stored as JSON for auditability.
- Concession cannot exceed the prorated base fee.
- Invoice number is unique per school. Payment amount cannot exceed outstanding invoice amount. Invoice payment writes are serialized with a transaction advisory lock.
- Payment events are append-only records; no update/delete API is exposed.

## Deposits
- One deposit account per school/allocation.
- Collection and deduction events are immutable ledger entries.
- Refund request, approval and execution are distinct states.
- Pending and approved refund amounts reserve available balance. Deductions and refund execution cannot exceed uncommitted/current balance.
- Deposit mutations are serialized with a transaction advisory lock.

## Duty roster
- Shift end must be after shift start.
- A staff user cannot have overlapping active assignments within the school.
- Cancellation/completion/absence and handover notes are captured through a controlled status update.

## Maintenance
- Ticket records include priority, SLA due time, assignment, cost/parts metadata and closure evidence.
- Occupied/reserved beds cannot be taken out of service. An available bed linked to a maintenance ticket moves to MAINTENANCE.
- A bed is restored to AVAILABLE only after no active maintenance ticket remains and a ticket is closed with evidence.

## Safeguarding
- Separate `hostel.safeguarding.read` and `hostel.safeguarding.manage` permissions.
- Summary list omits restricted details. Case details require read permission and are audited.
- Creation/review/closure requires manage permission; student reference is validated within tenant/school.
- Full legal/privacy/retention validation remains a release gate.

## Parent visibility
- Parent fee visibility uses parent portal access and verified linked guardian/student communication relationship.
- Only the linked student's invoices and recorded payment statuses are returned. Payment initiation is not offered.
