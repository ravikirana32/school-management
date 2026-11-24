# P02 Authentication API

Base path: `/api/v1/auth`

| Method | Path | Purpose | Status |
|---|---|---|---|
| POST | `/register` | Create an unprivileged user identity | Implemented scaffold |
| POST | `/login` | Verify credentials and create session | Implemented scaffold |
| POST | `/refresh` | Rotate opaque refresh token | Implemented scaffold |
| POST | `/logout` | Revoke supplied refresh token | Implemented scaffold |
| POST | `/password/forgot` | Non-enumerating reset request response | Placeholder only |
| POST | `/password/reset` | Complete reset | Not implemented |
| GET | `/me` | Current user and memberships | Not implemented |

All routes require TLS in deployed environments. Apply per-IP and per-account rate limits before public exposure. Do not expose Prisma or cryptographic errors to clients.
