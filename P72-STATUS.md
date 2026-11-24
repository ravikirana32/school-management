# P72 Status — Payment Webhook Replay Integrity

**Status: SOURCE FOUNDATION DELIVERED; PROVIDER RECONCILIATION BLOCKED EXTERNAL**

- Payment webhook event IDs now bind to the SHA-256 hash of the signed raw request payload.
- Same-ID/same-payload retries can resume unprocessed events; processed events are acknowledged as duplicates.
- Same-ID/different-payload events return HTTP 409, including the concurrent unique-key race path.
- Added helper-level tests and a static verifier.

Provider-specific payment attempt/invoice reconciliation remains intentionally unimplemented until a payment provider and canonical event mapping are selected. No payment is simulated.
