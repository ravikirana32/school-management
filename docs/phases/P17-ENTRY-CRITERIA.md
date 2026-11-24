# P17 Entry Criteria — Teacher membership discovery and school selection

1. Add authenticated endpoint returning only the caller's active organization/school memberships.
2. Apply identity/tenant context and RLS-safe queries; prove no cross-user membership leakage.
3. Add organization/school picker to Teacher app; remove manual identifier entry.
4. Handle users with zero, one or multiple school memberships.
5. Persist only non-sensitive selected scope (or revalidate it at startup); do not treat client selection as authorization.
6. Keep every attendance request protected by server-side membership and assignment checks.
7. Add API integration tests for membership isolation, inactive memberships and school lifecycle changes.
8. Add mobile sign-in → membership selection → attendance workflow E2E.
9. Run Expo typecheck/build and backend typecheck/tests in a dependency-installed environment.
10. Verify secure refresh rotation and logout on iOS and Android devices.
