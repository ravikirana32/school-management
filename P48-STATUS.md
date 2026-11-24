# P48 Status — Versioned suppression HMAC key rollover

**Status:** Source implementation complete; runtime acceptance pending. **Production approval: NOT GRANTED.**

- Added `hashVersion` to `NotificationEmailSuppression`; existing rows migrate as `v1`.
- API writes new rows with the configured current key/version and checks current plus optional previous key when detecting duplicates.
- Notification worker checks current plus previous key versions immediately before sending; absent current key fails startup closed.
- Legacy `NOTIFICATION_SUPPRESSION_HASH_SECRET` remains supported as the current key when the new current secret is absent.
- No plaintext emails are introduced or stored. Existing HMAC values cannot be transformed into a new key's HMAC because the source email is intentionally not stored. Keep the old key configured as previous until every active row using that version is legitimately released/expired under an approved retention policy. Do not remove a previous key merely because a new key has been deployed.
- Provider selection, provider-global complaint handling, retention/legal hold, Arabic shaping/tagged PDF remain unresolved.
