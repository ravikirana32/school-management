# P505 — Mobile Build Stabilization: Next-Phase Tasks

1. Inventory Expo configs, package scripts and SDK alignment across Teacher, Parent, Student and Staff apps.
2. Audit Metro/Babel/Expo config and asset paths.
3. Audit native modules and Expo compatibility declarations.
4. Inspect mobile TypeScript project settings and shared-package imports.
5. Fix confirmed source/config/asset blockers only; preserve existing features.
6. Add dependency-free P505 focused verifier and regression checks.
7. Run available source checks; document blocked Expo export/build/device acceptance.
8. Update master gap-register mirrors and phase reports.
9. Deliver cumulative ZIP, SHA-256 checksum, archive verification and manifest.

## Exit criteria
- Config/source issues identified and remediated where verified.
- Focused checks pass.
- Expo builds/device acceptance are only marked PASS when actually executed.
