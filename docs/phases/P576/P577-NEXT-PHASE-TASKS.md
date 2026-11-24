# P577 Next-Phase Tasks — Browser/Mobile Journeys & Accessibility (C2-11)

**Baseline:** P576 cumulative. **P576 status:** source contract delivered; provider/database acceptance blocked.

## Entry gates
1. Resolve authentic pnpm 9.15.0 lockfile and frozen install.
2. Pass Prisma validate/generate and clean/upgraded PostgreSQL migrations.
3. Pass all app/API/shared package semantic typechecks and production builds.
4. Pass P575 restricted-role RLS and cross-tenant API tests.
5. Provision browser automation and supported iOS/Android simulators/devices.

## P577 workstream
1. Build Playwright journeys for school admin, teacher, parent, student, admissions, finance, library, transport and hostel flows.
2. Build mobile journeys for parent, teacher, student and driver apps; include login/session expiry, push permission and deep links.
3. Verify offline queueing, reconnect, duplicate submission protection and conflict recovery for supported mobile workflows.
4. Run accessibility automation and manual keyboard/screen-reader checks against WCAG 2.2 AA targets; document exceptions.
5. Verify responsive layouts, localization (including Kannada), form errors, focus management, labels and contrast.
6. Test payment and notification journeys only against approved sandbox providers after P576 acceptance prerequisites pass.
7. Archive browser/device versions, test data setup, screenshots/traces, failures and reproducible rerun commands.
8. Keep all accessibility/device/E2E gaps OPEN until execution evidence exists; update all register mirrors and cumulative/phase archives.

**Exit criteria:** all supported app journeys pass in browser/device automation, critical accessibility blockers are resolved or formally risk-accepted, offline recovery and cross-tenant negative journeys pass. If toolchain/database prerequisites remain blocked, P577 must remain BLOCKED and may only deliver test foundations/static review.
