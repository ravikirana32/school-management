# P03 Platform API

All endpoints require a valid P02 bearer token belonging to an active `isPlatformAdmin` user. Base path `/api/v1/platform`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/dashboard` | Aggregate platform counts |
| GET | `/organizations` | Paginated organization search/list |
| POST | `/organizations` | Create organization |
| GET | `/organizations/:organizationId` | Organization detail |
| PATCH | `/organizations/:organizationId/status` | Lifecycle state update with reason |
| POST | `/organizations/:organizationId/schools` | Create school in organization |
| POST | `/support-access-grants` | Create limited support grant record |
| GET | `/settings` | Read non-secret platform settings |
| PUT | `/settings/:key` | Upsert JSON platform setting |

Use idempotency keys for retryable write operations before production rollout. Apply rate limits, admin MFA and approval controls before exposing privileged operations.
