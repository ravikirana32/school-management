# P574 Deliverables Checklist

- [x] Add a fail-closed, dependency-free preflight for the exact build/integration prerequisites.
- [x] Register the P574 preflight command in the root package manifest.
- [x] Re-run the workspace package-manifest audit and source syntax scan.
- [x] Re-run P501/P502 historical verifiers after restoring their required register mirrors.
- [ ] Obtain registry-enabled pnpm 9.15.0 and generate the real lockfile.
- [ ] Complete frozen install for all 14 packages.
- [ ] Run Prisma format/validate/client generation.
- [ ] Run all 14 package typechecks and production builds.
- [ ] Run clean/upgraded PostgreSQL lifecycle and API/database integration tests.
- [ ] Complete cross-module end-to-end and negative authorization tests.
