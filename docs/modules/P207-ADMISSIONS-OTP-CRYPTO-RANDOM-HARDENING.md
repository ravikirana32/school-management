# P207 — OTP cryptographic random generation hardening

- Replaced admissions contact verification six-digit OTP generation via `Math.random()` with Node `crypto.randomInt(0, 1_000_000`), preserving zero-padding and the six-digit range.
- Challenge IDs remain generated using cryptographic `randomBytes`.
- No OTP delivery/provider changes in this phase.
- Validation/build/tests/runtime acceptance remain deferred.
