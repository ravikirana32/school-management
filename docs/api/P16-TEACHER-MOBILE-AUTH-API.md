# P16 Teacher mobile authentication API contract

The mobile client consumes the existing `/api/v1/auth` routes; no new backend auth endpoint was introduced.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/login` | Authenticate teacher credentials and create a server session |
| POST | `/api/v1/auth/refresh` | Rotate refresh token and issue a new short-lived access token |
| POST | `/api/v1/auth/logout` | Revoke the active refresh-token session |

Login and refresh return a top-level token pair (not the normal `{ data: ... }` API envelope). Logout returns HTTP 204. The mobile client handles these response shapes explicitly.

After authentication, attendance APIs continue to use `Authorization: Bearer <accessToken>` and the existing organization/school-scoped paths. Current org/school IDs remain manually configured pending a membership discovery endpoint.

## Error handling
- 401 from a scoped API triggers one refresh attempt and one retry.
- A failed refresh clears local credentials and requires interactive sign-in.
- Other HTTP errors are surfaced without retry.
