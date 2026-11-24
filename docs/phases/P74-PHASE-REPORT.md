# P74 — Parent Mobile Secure Read-Only Offline Cache

## Delivered
- SecureStore-backed, account/tenant/school/student/resource scoped cache.
- Six-hour TTL, 10,000-character item cap and bounded 80-key index.
- Offline fallback for attendance first page, fees, homework, report cards and notification first page.
- Logout/session-expiry and consent-withdrawal cache cleanup.
- Cursor pagination and all mutations remain online-only.

## Acceptance still required
- Build Expo app and run iOS/Android device tests.
- Verify user A data never appears after user B login on same device.
- Verify cache clears after logout, session expiry and consent withdrawal.
- Verify expired/corrupt/oversized entries are ignored and online refresh replaces cache.
- Review SecureStore platform backup behavior and parent-data retention policy.
