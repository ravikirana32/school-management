# P477 — Parent Finance Summary

## Scope
Parent mobile adds a finance overview above the existing fee statement, payment history and refund request/status surfaces.

## Summary behavior
- Aggregates billed, paid and outstanding amounts per currency.
- Caps paid at billed amount to avoid negative outstanding from inconsistent input.
- Normalizes non-finite/negative amounts to zero.
- Calculates overdue amount only for unpaid fee statements with a due date in the past.
- Counts fee statements separately per currency.
- Displays an empty state before published fee statements exist.
- Explicitly labels the summary read-only and does not imply gateway transaction initiation.

## Limitations
Payment initiation, invoice PDF download, gateway confirmation, and live database/device testing are not established by this phase. Existing fee, receipt and refund details remain in the parent app.
