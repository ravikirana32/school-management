# P438 Delivery Report

P438 implements bounded candidate scanning and a process-local school rotation preference in the reminder-policy audit export worker. Queue selection avoids the last successfully claimed school when an alternate school is present in the candidate window, while preserving FIFO fallback. Polling and candidate window size are environment-configurable and bounded.

Cumulative release only; phase-only ZIP intentionally not produced.
