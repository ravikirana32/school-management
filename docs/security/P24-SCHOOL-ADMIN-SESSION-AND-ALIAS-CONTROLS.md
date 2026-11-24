# P24 Security — School Admin Session & Alias Controls

- Login/refresh/logout use existing auth endpoints; no credentials or tokens are persisted by the browser.
- Access token is memory-only and refresh token is memory-only. Reload requires fresh login.
- Shared request helper uses a single-flight refresh promise on 401 and retries once; failed refresh is surfaced to the user. Explicit clearing on all refresh failure paths remains a browser acceptance item.
- School selection comes only from active memberships returned by the API. Server-side checks remain mandatory.
- Membership discovery runs identity-scoped membership lookup and resolves organization/school data inside tenant context.
- Academic-year retrieval reuses the existing membership-guarded API.
- Alias preview is read-only and tenant-scoped; no raw tenant data is accepted from the browser except route scope selected from membership.
- Maker-checker prevents creator self-approval. Audit records include actor, organization, school, action, resource and operation metadata.
- Audit log table hardening against direct UPDATE/DELETE is not implemented in P24; do not describe it as cryptographically or database immutable.
- Apply recomputes its updates under the school advisory lock. A dry-run is informational and is not a reservation.
