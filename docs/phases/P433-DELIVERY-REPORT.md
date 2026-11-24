# P433 Delivery Report

P433 adds filtering, pagination, and export to the coordinator reminder-policy audit history.

- Filter by actor user ID substring, action type, and date range.
- Cursor-based pagination; default 25, maximum 100 records per page.
- CSV export of the filtered result set, capped at 1,000 rows.
- Coordinator access remains permission-gated (`academics.manage`) and tenant/school scoped.
- Audit records continue to show actor, action, timestamp, and before/after reminder values.

Full runtime validation remains pending. CSV export can be truncated at the 1,000-record cap; this limitation is documented in the UI.
