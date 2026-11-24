# P65 entry criteria

1. Continue from P64 cumulative baseline.
2. Review notification suppression HMAC version coexistence and uniqueness guarantees; close the current/previous-version duplicate active suppression gap without storing plaintext email.
3. Consider a dedicated suppression hash alias table keyed by tenant, version and HMAC, or another reviewed safe design.
4. Preserve existing suppression IDs/audit history and ensure worker lookup checks all active versions.
5. Carry unresolved P00–P64 gaps forward; require PostgreSQL concurrency tests before closing uniqueness gaps.
