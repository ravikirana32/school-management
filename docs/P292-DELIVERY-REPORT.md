# P292 Delivery Report — Parent Notification Foreground Readiness Refresh

## Scope
Implement automatic refresh of school-scoped notification channel readiness when Parent Mobile returns to the foreground, complementing the manual refresh delivered in P291.

## Implementation
- Imported React Native `AppState`.
- Memoized the existing school-scoped readiness refresh handler using `useCallback`.
- Registered an AppState change listener and refreshes only when state becomes `active`, a school is selected, and the session is online.
- Cleans up the AppState listener on effect teardown.
- Retains existing manual refresh, loading guard, offline guard, and school-scoped endpoint.

## Verification
- P291 regression verifier: 6/6 PASS.
- P292 static verifier: 7/7 PASS.
- Root package JSON parse: PASS.
- Runtime API test/typecheck/mobile build/device E2E: NOT RUN.
- No gap closed based solely on static checks.

## Gaps
- P290-G001: PARTIAL; foreground lifecycle refresh now implemented, config-change/automatic readiness refresh and robust lifecycle runtime verification remain open.
- P292-VAL01: Parent Mobile API/typecheck/build/runtime/device acceptance OPEN.
- Email provider live send/receipt/opt-out verification and Push provider/device-token lifecycle OPEN.
