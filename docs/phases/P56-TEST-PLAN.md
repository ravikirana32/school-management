# P56 Test Plan

1. Run `pnpm --filter @school-saas/api test -- src/modules/notifications/notification-operational-event.test.ts`.
2. Capture Pino output for delivered/cancelled/retry/dead-letter paths with sentinel recipient email, HMAC, verification code, body and provider token in upstream objects; assert none appear.
3. Verify only allowlisted event names/status/reason codes are emitted and cardinality is bounded.
4. Inspect production-like log collector transformations and retention.
5. Add metrics only after backend selection; avoid labels containing school/user/email/outbox IDs.
