# P572 Feature Contract — C2-11 Wave 1

P572 is a verification/remediation phase, not a new product feature phase.

## Scope
- Reconcile historical static verifiers with the actual current P571 cumulative source.
- Preserve meaningful assertions while updating stale assumptions about current API envelopes, UI copy, field names and integrated student services.
- Audit all 14 workspace package manifests and dependency/script references.
- Re-run the full static verifier suite and TypeScript syntax scan.
- Maintain synchronized root/docs/docs-phases gap registers and define C2-11 remediation sequence.

## Acceptance
- 356/357 repository static verifiers pass; remaining failure is the real missing `pnpm-lock.yaml` workspace gate.
- 315 TypeScript/TSX source files parse without syntax errors.
- 14 workspace package manifests have unique names and no detected dependency/script-target errors.
- Six updated historical verifiers pass and continue to test meaningful source behavior.
- Eight P572 gaps remain explicitly open.

## Explicit exclusions
No claim of pnpm frozen install, Prisma validation/client generation, PostgreSQL migration/runtime, dependency-backed semantic build, database integration, RLS, cross-tenant negative tests, provider E2E, browser/device E2E, load testing or production readiness.
