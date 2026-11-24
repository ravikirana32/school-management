# P577 Browser, Mobile & Accessibility Acceptance

## Scope
P577 adds browser smoke/accessibility test foundations for four web entry points and a device acceptance matrix for Parent, Teacher, Student and Driver mobile apps. Authenticated business journeys and device execution are not claimed.

## Browser automation
Install root dev dependencies with approved pnpm 9.15.0, then set `E2E_SUPER_ADMIN_URL`, `E2E_ORGANIZATION_ADMIN_URL`, `E2E_SCHOOL_ADMIN_URL`, `E2E_PUBLIC_PORTAL_URL`. Run `pnpm test:e2e:web` and `pnpm test:e2e:a11y`. Unconfigured targets are skipped; a skip is not a pass. axe checks WCAG 2.0/2.1/2.2 A/AA tags and fails serious/critical violations; this is not manual accessibility certification.

## Manual accessibility review
- Keyboard-only operation, visible focus, logical focus order.
- Dialog focus trap, Escape handling, focus restoration.
- Screen-reader names/roles/states, validation errors and live announcements.
- 200% zoom/reflow and 320 CSS-pixel viewport.
- Contrast, non-colour cues, target size and reduced motion.
- Kannada/English labels, date/number formats, font rendering and text expansion.
- VoiceOver/TalkBack labels, hints, traversal and dynamic type.

## Offline/recovery
For each supported workflow: disable network before submit; verify queued state; restore network; verify exactly-once server effect; test duplicate tap, process restart, stale-version conflict and retry; revalidate tenant/user context after reconnect. Local queue acknowledgement is not server commit.

## Security/data
Use disposable tenant data and synthetic PII. No production credentials/provider secrets/real student records in fixtures. Test cross-school denial after login, role switch and session expiry. Redact traces/screenshots before archiving.

## Entry gates
Authentic pnpm lockfile/frozen install; Prisma validate/generate and clean/upgraded PostgreSQL migrations; semantic typechecks/builds; P575 restricted-role RLS/cross-tenant API acceptance; provisioned browsers, simulators/devices and test identities.

## Current status
Static foundation only. Playwright/axe dependencies are declared but not installed/executed because toolchain/lockfile and registry prerequisites remain blocked. No browser, mobile, offline or manual accessibility pass is claimed.
