# P138 Delivery Report

P138 connects the P136 one-to-many operational allocation mapping to the historical batch operationalizer. A historical payment or refund can now have multiple immutable allocation slices, with each slice materialized as its own operational payment/refund and mapped to its own operational record. The sum of allocation slices must exactly equal the source row amount, and target balance checks are performed per slice. Legacy same-batch links remain supported. Historical batch APIs, reconciliation summaries, dependency-plan readiness and School Admin Finance now recognize split allocation-link coverage.

Refund slices preserve the external settlement reference and use allocation-specific idempotency keys. The migration changes the settlement-reference index to allow one externally settled transaction to be represented by multiple allocation slices.

A refund targeting a historical payment that itself has multiple operational payment slices is explicitly blocked: current allocation evidence identifies the historical payment row, not the specific operational payment slice. Multi-batch execution remains advisory. No historical accounting journals are reposted. PostgreSQL/runtime verification remains outstanding. Unit/API/browser/mobile test creation/execution remains deferred.

## Operational contract

- Allocation amounts are summed in integer minor units and must exactly match the historical source amount.
- Every allocation creates exactly one operational payment or refund and one `AccountingHistoricalOperationalAllocationLink`.
- Payment slices increment the target charge balance individually; refund slices decrement the charge and update payment/refund state individually.
- A refund against a split historical payment target is rejected until the allocation model can name the intended operational payment slice.
- The existing historical journal is never reposted.
