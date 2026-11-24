# P141 Delivery Report

P141 adds searchable selection of the operational payment slice that a historical refund allocation targets. The API resolves the selected historical PAYMENT row within the active organization and school, requires the row's batch to be POSTED, and returns only operational payment IDs linked to that row. Search matches payment ID, reference or method and is bounded to 100 results.

For each result, the API calculates paid, active-refund and available-refundable amounts in integer minor units. Active refund amounts include REQUESTED, APPROVED_PENDING_SETTLEMENT and SETTLED records, consistent with the existing operational refund cap. The Finance UI displays those balances and refund state, auto-selects the sole linked slice when only one exists, and requires explicit selection for multi-slice targets before submitting through the existing immutable allocation workflow.

This phase does not settle refunds, modify existing refund caps, or change journal posting. PostgreSQL/runtime verification remains pending. Unit/API/browser/mobile test creation and execution remain deferred.
