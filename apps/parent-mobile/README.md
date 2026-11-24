# Parent App

P31 adds invitation acceptance, consent notice preview, parent sign-in/session restoration, school selection, linked children, published attendance and consent withdrawal.

## Run
From repository root:

```bash
pnpm install
pnpm --filter @school-saas/parent-mobile start
```

Configure the API base URL on the sign-in/acceptance screen. Use HTTPS except for localhost development. The app stores only the rotated refresh token and API base URL with Expo SecureStore; access tokens remain in memory.

The app accepts `school-parent://accept-invitation?token=...` links. It also supports manual token entry. The app loads the exact consent notice from the API before enabling the acceptance control.

Runtime Expo build and iOS/Android device acceptance have not yet been run.


## P103 offline read recovery
Parent attendance and notification pages already loaded online are cached in SecureStore by account, organization, school and student. Paginated pages are cached separately so a previously fetched page can be shown offline. These views remain read-only offline; consent withdrawal and notification changes require connectivity. Account email is persisted with the secure refresh token so restored sessions reopen the correct cache namespace. If refresh is temporarily unavailable, the app preserves the credential and opens a read-only cached session with a Reconnect action. Explicit sign-out clears parent cache snapshots.
