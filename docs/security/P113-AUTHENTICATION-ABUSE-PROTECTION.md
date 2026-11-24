# P113 Authentication Abuse Protection

## Endpoint policy

| Endpoint | Dimensions | Default limit | Window |
|---|---|---:|---:|
| POST /auth/login | IP and normalized account | 30/IP; 10/account | 15 minutes |
| POST /auth/register | IP | 8 | 60 minutes |
| POST /auth/refresh | IP | 90 | 15 minutes |
| POST /auth/password/forgot | IP and normalized account | 5/IP; 3/account | 60 minutes |
| POST /auth/password/reset | IP | 10 | 60 minutes |

## Behavior

- Redis Lua script increments and applies expiry atomically.
- Redis keys include a SHA-256 digest of the identity value; raw email/IP values are not stored in the key.
- Rejected requests return HTTP 429, a generic message and `Retry-After` seconds.
- Redis errors return HTTP 503 (fail closed).
- The forgot-password route returns the same 202 response regardless of account existence. It does not send mail until a delivery provider is implemented.

## Operational cautions

- Validate Express `trust proxy` configuration before relying on `req.ip` behind ingress/load balancers.
- Tune thresholds using real traffic and abuse telemetry; defaults are initial safeguards, not a compliance or capacity guarantee.
- Redis must be highly available and its failure behavior must be exercised before production.
- Add alert routing, progressive account controls, and safe recovery for false positives.
- Never log raw credentials, reset tokens, or rate-limit account identifiers.
