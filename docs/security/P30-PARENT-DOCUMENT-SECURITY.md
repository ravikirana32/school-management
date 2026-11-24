# P30 Security Controls & Limitations

- Parent invite token is 48 random bytes; only SHA-256 hash is indexed. Delivery payload is AES-256-GCM encrypted at rest using `PARENT_INVITE_ENCRYPTION_KEY` (32-byte base64). Raw token is never returned by admin API or logged.
- Guardian consent is recorded only at token acceptance, and consent notice version must match.
- Invitation acceptance is single-use, expires in 48 hours and is revocable. A valid single-use invitation token proves control of the invited email and can verify an existing account; disabled accounts cannot be linked.
- Parent account linking does not create a school membership or portal role; portal data access is not enabled by this phase.
- Private document POST policies last 5 minutes and enforce 1–25 MiB content length; GET URLs last 60 seconds. Objects use a quarantine prefix until a signed scanner callback reports CLEAN. Downloads are denied for every other state.
- Scanner callbacks require HMAC-SHA256 over exact raw request bytes. Scanner supplies detected MIME; it must match the declared MIME. The scanner engine is external and must inspect actual file signatures and malware.
- No public ACL is set by the API. Deployment must enforce bucket public-access block, encryption at rest, lifecycle/retention, versioning policy and least-privilege bucket IAM.
- Upload metadata and signed-download issuance are audited. Scanner callback events should be forwarded to a protected audit sink in a later phase.
- Guardian merge is explicit, same-school only, transaction-locked and audited. Account conflicts block the operation.
- Employment period overlaps are prevented by a database exclusion constraint after a fail-fast migration preflight.
