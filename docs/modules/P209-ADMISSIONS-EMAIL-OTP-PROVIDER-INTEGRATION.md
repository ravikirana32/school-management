# P209 — Admissions email OTP provider integration

- Integrated the admission email verification channel with the existing HTTPS parent email provider configuration.
- Uses a dedicated `admissions-contact-verification` template, challenge ID idempotency key, 20-second timeout, and a 10-minute expiry value in template variables.
- Provider failure/unconfigured state is returned as controlled 503 errors; failed challenges are consumed by the existing cleanup logic.
- SMS remains explicitly unavailable until a dedicated SMS provider configuration is implemented.
- Local console OTP delivery remains opt-in and development-only.

Validation is deferred: build/typecheck, API/provider contract tests, delivery integration, and runtime acceptance.
