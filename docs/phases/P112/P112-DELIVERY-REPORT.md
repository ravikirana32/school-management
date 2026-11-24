# P112 Delivery Report

## API contracts
- `GET /api/v1/auth/sessions` — returns only the authenticated user's active, unexpired sessions with safe metadata and an `isCurrent` flag.
- `DELETE /api/v1/auth/sessions/:sessionId` — revokes an active session owned by the authenticated user.
- `POST /api/v1/auth/sessions/revoke-others` — revokes all active sessions except the caller's current session.
- `POST /api/v1/auth/refresh` — rotates within a token family, records predecessor linkage, and revokes active family members when a rotated token is reused.

## Security notes
Refresh tokens remain stored as hashes. Session inventory omits refresh-token hashes and other secrets. All management routes require authentication and scope by authenticated user ID. Reuse detection is audited without logging token material.

## Gap reconciliation
No historical gap was fully closed because runtime and database verification remain deferred. P16-G006 was narrowed to its remaining MFA, password-reset delivery and biometric scope; P112-G002 tracks the newly implemented session-management slice pending runtime verification. Root and docs gap registers are identical.
