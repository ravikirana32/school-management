# P74 Status — Parent Mobile Secure Read-Only Offline Cache

**Status: SOURCE FOUNDATION DELIVERED; DEVICE ACCEPTANCE PENDING**

- Added encrypted SecureStore cache for parent attendance, fees, homework, report cards and first-page notifications.
- Cache is scoped by normalized account email, organization, school, student and resource type.
- Cache expires after six hours, individual entries are size-bounded and index is capped at 80 entries.
- Parent UI falls back to cached first-page data when the network request fails and explicitly labels it read-only/offline.
- Cache is cleared on logout/session expiry and consent withdrawal for the selected school. Offline fallback is limited to network/abort failures; HTTP authorization and application errors do not fall back to cached content.
- Cursor pagination remains online-only; no offline writes or queued mutations are attempted.

Not claimed: device-level SecureStore behavior, multi-account collision testing, backup/restore policy, accessibility, or React Native build.
