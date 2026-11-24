# P59 Test Plan

1. Run `pnpm --filter @school-saas/api test -- src/modules/notifications/notification-webhook-rate-limit.test.ts src/modules/notifications/delivery-webhook.routes.test.ts`.
2. With disposable Redis, issue concurrent requests across two API processes; verify atomic count, expiry and per-scope separation.
3. Stop Redis and verify webhook/suppression mutations return generic 503 without invoking database work.
4. Verify 429 and Retry-After after threshold; verify key values contain only SHA-256 digest, never IP/user/email raw values.
5. Configure trusted proxy chain and verify spoofed X-Forwarded-For cannot evade or poison limiter identity.
6. Validate limits against actual provider delivery burst/retry behavior before production activation.
