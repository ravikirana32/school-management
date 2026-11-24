# P506 Next Phase Task List — Shared Packages & Workspace Integration

1. Inventory all workspace packages and their consuming apps/services.
2. Verify workspace protocol declarations and package exports.
3. Audit shared-types package exports and generated declarations.
4. Audit api-client package entrypoints, imports and app usage.
5. Audit validation and domain-rules package imports and contracts.
6. Check package build/typecheck scripts and dependency ordering.
7. Inspect workspace-level TS config and Metro/Vite alias consistency.
8. Identify and fix confirmed shared-package integration blockers.
9. Add dependency-free P506 verifier and register it.
10. Run P491–P505 regression verifiers.
11. Update root/docs mirrored gap register and phase reports.
12. Create cumulative ZIP, SHA-256, archive verification and manifest.

Exit criteria: source/config/workspace audit evidence passes; dependency-backed install/build/runtime remains separately tracked until the registry bootstrap blocker is resolved.
