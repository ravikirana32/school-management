# P60 Status — Webhook payload and media-type guards

**Status:** Source implementation and route-test source complete; runtime ingress acceptance pending. **Production approval: NOT GRANTED.**

- Webhook route requires `application/json` and returns 415 otherwise.
- Webhook raw payload is capped at 64 KB and returns 413 when exceeded.
- Existing Express JSON parser has a 1 MB global limit; raw body is captured before webhook router and used for signature verification.
- Added route tests for wrong content type and oversized webhook body.
- Static verifier 8/8 PASS; TypeScript syntax 2 files, 0 diagnostics; Vitest, reverse-proxy ingress and production body-size tests NOT RUN.
