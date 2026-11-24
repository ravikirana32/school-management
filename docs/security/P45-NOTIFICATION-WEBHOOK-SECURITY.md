# P45 webhook security

Exact raw-body HMAC, five-minute timestamp tolerance, constant-time signature comparison, configured provider allowlist, strict Zod schema, provider-event uniqueness, transactionally scoped outbox lookup and worker-only RLS policy. Tenant identifiers are never accepted from webhook payloads. Deploy only behind TLS and provider-native signature verification adapter. The canonical HMAC envelope is an internal adapter contract, not a substitute for a selected provider's native webhook authentication.
