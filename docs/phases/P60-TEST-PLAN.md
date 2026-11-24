# P60 Test Plan

1. Run webhook route tests.
2. Verify valid application/json with optional charset is accepted; text/plain, form-urlencoded and missing content type are rejected.
3. Verify exactly 64 KB and 64 KB + 1 byte boundaries.
4. Verify malformed JSON returns safe 400 and >1 MB request is rejected by Express parser before route.
5. Verify reverse proxy enforces a compatible request size and timeout.
6. Confirm raw-body HMAC signature still validates exact received bytes.
