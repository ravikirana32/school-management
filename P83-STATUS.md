# P83 Status — Subscription lifecycle policy

Status: SOURCE IMPLEMENTED; END-TO-END ACCEPTANCE PENDING.

Added an explicit allowed-transition policy for pending, trial, active, past-due, paused, canceled and expired subscriptions. Billing provider and reconciliation remain external/integration gaps.

The shared domain-rules package contains the deterministic policy primitive for this phase and a corresponding Node.js built-in test. This is not evidence of complete database/API/UI/worker/device integration. Existing unresolved register items remain open or in progress until the applicable end-to-end evidence is retained.
