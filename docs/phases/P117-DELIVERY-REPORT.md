# P117 Delivery Report

## Changed areas
- `backend/api/src/modules/auth/auth.routes.ts` — policy evaluation added to MFA status.
- `apps/school-admin/src/SchoolAdminSession.tsx` — policy status, TOTP enrollment and challenge controls.
- `apps/teacher-mobile/src/auth/session.ts` and `apps/parent-mobile/src/auth/session.ts` — MFA policy bootstrap on login/refresh and shared challenge/enrollment API helpers.
- `apps/teacher-mobile/App.tsx` and `apps/parent-mobile/App.tsx` — challenge/enrollment gate during login and restored sessions.
- Root and docs gap registers updated; P116-G003 narrowed and P117 gaps appended.

## Configuration
Set `MFA_REQUIRED_ROLE_KEYS` to comma-separated role keys requiring MFA, for example `SCHOOL_ADMIN,ORG_ADMIN`. Platform administrators are required regardless of this setting. Do not place display names in this variable; use persisted role keys.

## Not delivered
Central server-side MFA middleware for all protected APIs, WebAuthn/passkeys, external factors, administrative recovery, and runtime validation remain open.
