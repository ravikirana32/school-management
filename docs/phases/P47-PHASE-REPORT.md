# P47 phase report — School email suppression operations

**Baseline:** P46 cumulative  
**Version:** 0.47.0-dev  
**Status:** Source implementation delivered; runtime acceptance NOT VERIFIED.

## Delivered

- Added a dedicated School Admin **Email suppression** workspace.
- Added permission-aware navigation and a second UI-level permission check using `school.settings.manage`; API authorization remains authoritative.
- Connected the existing school-scoped list/create/release APIs using the shared authenticated session and refresh-token request helper.
- Added active/released views, bounded-record disclosure, source event display, release-reason workflow and append-only audit-event timeline.
- The UI never displays email hashes or stored email addresses. The address is accepted only in the create form and is not persisted by the API as cleartext.
- Extended the list API to return the matching school-scoped audit events for the bounded set of records, without exposing hashes or actor identifiers.
- Added explicit UI copy distinguishing school-local suppression from provider-global complaint suppression.
- Added P47 entry/acceptance documentation and cumulative gap-register updates.

## Verification and evidence boundary

- Source-level verifier: see `scripts/verify-p47-email-suppression-ui.mjs`.
- TypeScript syntax/build, Vitest, Prisma validation, PostgreSQL/RLS, API integration, worker suppression, browser and mobile runtime tests were not executed because dependencies and runtime services are not present in this workspace.
- No runtime acceptance is claimed.
- P45/P46 provider-native webhook adapter remains deferred because no provider has been selected.
- Arabic RTL shaping and tagged/accessibility PDF work remains open. The existing PDF generator explicitly does not claim correct Arabic shaping; P47 does not disguise glyph coverage as shaping support.

## Safety and privacy boundaries

- Suppression remains school-local and tenant-scoped.
- Provider-global suppression is not represented as implemented.
- No provider-specific event mapping or outbound provider integration was invented.
- No email address or HMAC hash is returned by the list API.
- Existing fail-closed worker behavior is unchanged.

## Required runtime acceptance

1. Apply P46 migrations to a clean and upgraded PostgreSQL database; verify rollback/reapply policy.
2. Test RLS with a dedicated non-owner, non-BYPASSRLS role across two schools.
3. Verify create/list/release and audit history through authenticated API tests; prove no email/hash disclosure.
4. Exercise concurrent duplicate create and release races.
5. Run notification worker tests for active suppression, released suppression, missing hash secret, provider failure and retry.
6. Run School Admin browser E2E for permissions, empty/loading/error states, active/released filters, add, release validation and audit timeline.
7. Select a provider before implementing provider-native signature/event adapters and provider-global suppression.
8. Select and validate a real Arabic bidi/shaping and tagged-PDF approach with script-specific extraction and visual regression before closing RTL/accessibility gaps.

**Release decision:** Developer preview only; production readiness is not established.
