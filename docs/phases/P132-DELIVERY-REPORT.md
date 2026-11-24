# P132 Delivery Report

P132 adds operator-declared source control totals to historical transaction import batches and compares them with the staged row amounts. Import creation checks all three totals in paise; independent approval repeats the check. The Finance workspace exposes the totals and their verification state.

A second report compares each student's historical net receivable with approved/posted opening-balance allocations by currency. This intentionally reports possible overlap rather than asserting duplication: an opening schedule's as-of date and historical import coverage may not align. No balances are changed automatically.

The migration is additive and does not rewrite existing transaction rows or journals. Source declarations are not cryptographically signed. P132 adds P132-G001 through P132-G003 and changes P131-G002 to PARTIALLY_IMPLEMENTED. Existing gap IDs are retained.

See `P132-TEST-REPORT.md` and `P132-ARCHIVE-VERIFICATION.txt` for verification and cumulative archive audit.
