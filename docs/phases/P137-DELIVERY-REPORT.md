# P137 Delivery Report

P137 adds a source-level allocation coverage preview to the School Admin Finance workspace. It groups the loaded immutable allocation records by source historical row, sums amounts in integer minor units, compares the total against the historical source amount, and shows the allocated amount and remainder. Rows are classified as fully allocated, partially allocated or over-allocated.

This provides a review surface before operational materialization. It does not create operational payments/refunds, change historical allocations, execute dependency batches, or transfer money. The existing API allocation list is capped at 1,000 records; pagination and live PostgreSQL verification remain open. No unit/API/browser/mobile test creation or execution was performed, per project instruction.
