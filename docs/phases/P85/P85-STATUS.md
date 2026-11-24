# P85 Status — Admissions capacity invariant

Status: SOURCE IMPLEMENTED; END-TO-END ACCEPTANCE PENDING.

Added integer-safe seat capacity calculation accounting for enrolled and reserved seats. Transactional reservation and applicant UI remain open.

The shared domain-rules package contains the deterministic policy primitive for this phase and a corresponding Node.js built-in test. This is not evidence of complete database/API/UI/worker/device integration. Existing unresolved register items remain open or in progress until the applicable end-to-end evidence is retained.
