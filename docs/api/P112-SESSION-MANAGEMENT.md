# P112 Session Management API

All routes below are mounted under `/api/v1/auth` and require a valid bearer access token, except refresh which uses the refresh token body.

| Method | Path | Behavior |
|---|---|---|
| GET | `/sessions` | List own active, unexpired sessions; safe device/network metadata only |
| DELETE | `/sessions/:sessionId` | Revoke an owned active session |
| POST | `/sessions/revoke-others` | Revoke every other active session for the authenticated user |
| POST | `/refresh` | Rotate refresh token; reuse of a revoked token revokes active sessions in its family |

Refresh tokens are hashed at rest. `tokenFamilyId` groups rotations; `replacedBySessionId` links each predecessor to its successor. Existing rows are migrated with a nullable family field and are assigned a family on first successful rotation. Apply the migration and regenerate Prisma Client before deployment.
