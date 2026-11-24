# P575 Risk Summary

## High risks
1. **Unknown deployed RLS completeness.** 235 Prisma models contain organizationId and/or schoolId, while direct migration text scan finds 75 exact ENABLE/FORCE references and 80 exact policy references. Dynamic DO/FOREACH SQL can add coverage, so static counts are not definitive. Run the catalog acceptance against the actual migrated PostgreSQL database.
2. **Database role posture unverified.** Production API must use a role that is not owner, superuser or BYPASSRLS. Migration owner credentials must remain separate.
3. **Cross-tenant behavioral proof missing.** No PostgreSQL runtime, fixtures or restricted-role API integration environment was available.
4. **Workspace/database prerequisites still block P573/P574.** Missing authentic pnpm lockfile and frozen install, Prisma client generation, semantic builds and PostgreSQL migrations remain upstream blockers.

## Mitigation delivered
- All eight transaction-local selectors are reset before each context is applied.
- New mock tests assert unrelated service/platform privilege flags remain false.
- New SQL acceptance checks catalog state and fail-closed no-context visibility.
- All gaps remain open pending runtime evidence.

## Release decision
P575 source artifact is delivered. Do not approve production tenant-isolation/security readiness until restricted-role catalog and cross-tenant negative tests pass.
