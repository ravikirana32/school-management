# P16 — Teacher mobile authentication and secure sessions

## Scope
Replace P15's manually pasted bearer token with the existing backend authentication contract and platform secure storage.

## Implemented source
- Teacher app sign-in posts email/password to `POST /api/v1/auth/login`.
- The app stores the opaque refresh token and configured API base URL using `expo-secure-store`; the short-lived access token remains in React memory.
- App startup attempts to restore a session by reading the secure refresh token and calling `POST /api/v1/auth/refresh`.
- Refresh rotation is persisted before the new access token is returned to callers.
- Concurrent 401 responses share one in-flight refresh operation to avoid presenting the same rotating refresh token multiple times.
- API requests retry once after a 401 and refresh. Failed refresh clears local credentials and returns the user to sign-in.
- Sign-out calls `POST /api/v1/auth/logout` and clears local secure storage even if the network request fails.
- API URL validation requires HTTPS except for localhost/127.0.0.1 development URLs.

## Existing backend contract used
- `POST /api/v1/auth/login` accepts `{ email, password }` and returns `{ accessToken, refreshToken, tokenType, expiresIn }`.
- `POST /api/v1/auth/refresh` accepts `{ refreshToken }`, revokes the old session and returns a rotated token pair.
- `POST /api/v1/auth/logout` accepts `{ refreshToken }` and revokes the matching active session.

## Explicit limitations
- Organization ID and school ID are still entered manually. A teacher-specific membership discovery/selection endpoint and UI are not part of P16.
- Password reset delivery, MFA, device management, remote session listing/revocation and biometric re-authentication are not implemented.
- Refresh rotation and secure-storage behavior have not been exercised on physical iOS/Android devices.
- SecureStore is added as a dependency but dependency installation and native builds remain pending.
- The API backend's refresh-token reuse response, rate limits and session-family revocation behavior need security integration testing.

## Security notes
- Passwords are not persisted.
- Access tokens are not persisted and are never logged.
- Refresh tokens are stored through Expo SecureStore and removed on logout/refresh failure.
- Production API endpoints must use HTTPS. Localhost HTTP is permitted for simulator development only.
