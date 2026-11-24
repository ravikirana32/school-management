# P525 Finance Lifecycle Fixture Matrix & Remediation Close-out

This matrix is a **runtime fixture specification**, not evidence that PostgreSQL-backed tests have run. It establishes expected diagnostic behavior to guide later integration validation.

## Fixture scenarios

| ID | Payment status | Refund status | Payment date in range? | Refund settlement date | Expected lifecycle visibility | Expected reconciliation source treatment |
|---|---|---|---|---|---|
| F01 | RECORDED | — | Yes | Payment group includes amount/count under RECORDED | Recorded payment source contributes unless REVERSED |
| F02 | REVERSED | — | Yes | Payment lifecycle includes REVERSED | Reversed payment excluded from payment source reconciliation |
| F03 | RECORDED | REQUESTED | Yes | Payment and REQUESTED refund visible in lifecycle | Unsettled refund excluded from settled-refund reconciliation |
| F04 | RECORDED | APPROVED_PENDING_SETTLEMENT | Yes | Pending refund visible in lifecycle | Excluded until SETTLED |
| F05 | RECORDED | SETTLED | Yes | SETTLED refund visible in lifecycle | Settled refund source contributes when settlement date is in range |
| F06 | RECORDED | REJECTED | Yes | REJECTED refund visible in lifecycle | Rejected refund excluded from settled-refund source totals |
| F07 | RECORDED | SETTLED | Payment date in range; refund settlement date outside | Both status groups visible (lifecycle is unbounded by date) | Payment included; refund excluded by settlement-date window |
| F08 | RECORDED | SETTLED | Payment date outside; refund settlement date in range | Both status groups visible | Payment excluded; refund included by settlement date |
| F09 | RECORDED | SETTLED | No date filter | Both status groups visible | Both payment and settled-refund source totals are unfiltered |
| F10 | RECORDED | — | Same currency, distinct school/organization | Lifecycle aggregates only the requesting tenant/school fixture | Cross-tenant/school rows must not appear |
| F11 | RECORDED | — | Same source amounts, differing posting dates | Source and journal date windows can yield timing variance | No auto-adjustment or journal posting is expected |
| F12 | RECORDED | — | Payment/refund lifecycle amounts contain decimals | Values are represented in integer minor units (cents/paise) | Totals compare independently; lifecycle is diagnostic only |


## Interpretation notes

- The lifecycle matrix intentionally has **no date filter** and displays all statuses. It is the diagnostic visibility surface for unsettled and reversed records.
- Reconciliation source totals use operational source rules: payments exclude `REVERSED` and use `paidAt` for date-window filtering; refunds include only `SETTLED` and use `settledAt` for date-window filtering.
- Journal comparison uses `postingDate`, which can differ from source payment/refund dates and create timing variances.
- Detail collections are capped and must not be interpreted as exhaustive export datasets.
- Tenant and school scoping must be applied to every aggregation and detail query.
- Lifecycle diagnostics do not post, reverse, mutate, or reconcile accounting journals.

## Close-out decision

P525 closes the **specification and source-review remediation layer** only. PostgreSQL runtime fixtures, transaction-level tenant-negative tests, real query-plan/performance checks, build/typecheck, and browser/mobile/E2E acceptance remain open. No gap is closed solely based on this document.
