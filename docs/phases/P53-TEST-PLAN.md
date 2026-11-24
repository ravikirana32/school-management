# P53 Test Plan

1. Run `pnpm --filter @school-saas/api test -- src/modules/notifications/notification-provider-response.test.ts`.
2. Mock provider 408/425/429/5xx and prove retry/backoff; mock 400/401/403/404/422 and prove immediate DEAD_LETTER.
3. Verify a lost lease does not update state or enqueue duplicate dead-letter records.
4. Verify dead-letter payload contains no provider response body, recipient email, HMAC or secret.
5. Run BullMQ/Redis/PostgreSQL integration for retry exhaustion, worker restart, lease expiry and terminal outbox state.
6. Validate actual retry classifications with the selected provider's official API contract and sandbox.
