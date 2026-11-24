# P91 Status — Fee/payment amount invariant

Status: SOURCE IMPLEMENTED; END-TO-END ACCEPTANCE PENDING.

Added amount, paid and refunded bounds to prevent overpayment/refund state. Provider checkout and settlement reconciliation remain open.

The shared domain-rules package contains the deterministic policy primitive for this phase and a corresponding Node.js built-in test. This is not evidence of complete database/API/UI/worker/device integration. Existing unresolved register items remain open or in progress until the applicable end-to-end evidence is retained.
