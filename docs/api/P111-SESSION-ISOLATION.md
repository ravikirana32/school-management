# P111 Session Isolation Contract

## Refresh concurrency

Each mobile app maintains an in-process map of refresh promises keyed by API origin and a non-reversible FNV-derived fingerprint of the presented refresh token. Calls sharing that key await the same operation. Different accounts or API origins do not share one global refresh promise.

## Stale-operation protection

After the refresh endpoint returns, the client compares the currently persisted refresh token with the token used for the request. If another sign-in or refresh has changed it, the stale operation does not overwrite the active token. `/auth/me` identity persistence also checks the expected newly persisted refresh token before writing the server user ID and email.

## Account data boundaries

Teacher offline attendance mutations and snapshots retain their existing email-derived account scope plus organization/school scope. Parent cache retains its email-derived account scope plus organization/school/student scope. P111 adds the server user ID as an authenticated account marker but does not yet migrate every cache key to user ID.

## Limits

The in-memory lock coordinates only calls inside one JavaScript runtime. It does not coordinate separate devices or processes. Backend refresh-token family rotation, reuse detection and revocation remain server responsibilities and require runtime acceptance. No claim of cross-device serialization is made.
