# P110 Mobile Authenticated Identity Contract

Teacher Mobile and Parent Mobile use the existing authenticated endpoint:

`GET /api/v1/auth/me`

Request header: `Authorization: Bearer <accessToken>`.

The API returns the authenticated account in `user` and membership/role information in `memberships` and `roles`. Mobile clients validate the returned `user.id` and `user.email`; the normalized server-returned email is stored in Expo SecureStore as the account cache namespace. The email typed into the login form is never used as proof of identity.

Login, refresh, session restore and reconnect all pass through this validation. A 401/403 during reconnect is treated as a revoked/invalid session and clears local authenticated state. Transient connectivity/server failures preserve the rotated refresh token and keep cached views read-only.

School/organization access remains separately enforced by membership-specific API endpoints. `/auth/me` identity validation does not itself grant access to any school.
