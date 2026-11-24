# P97 Status — Inventory stock invariant

Status: SOURCE IMPLEMENTED; END-TO-END ACCEPTANCE PENDING.

Added stock adjustment guard preventing negative inventory and invalid integer quantities. Stock ledger and facility UI remain open.

The shared domain-rules package contains the deterministic policy primitive for this phase and a corresponding Node.js built-in test. This is not evidence of complete database/API/UI/worker/device integration. Existing unresolved register items remain open or in progress until the applicable end-to-end evidence is retained.
