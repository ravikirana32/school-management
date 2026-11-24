# P72 Delivery Report

P72 closes a source-level integrity hole in payment webhook idempotency: a provider event ID can no longer be silently reused with different signed payload bytes. Actual provider reconciliation remains blocked pending provider selection.
