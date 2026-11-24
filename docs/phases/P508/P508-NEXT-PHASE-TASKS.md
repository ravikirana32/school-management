# Next work after P508 — C2-01 Blocker Remediation

C2-01 phase sequence (P501–P508) is complete. Next work is gap-driven, not a new numbered phase unless the user assigns a phase.

1. Provision pnpm 9.15.0 in a registry-enabled environment.
2. Generate and commit `pnpm-lock.yaml`.
3. Run clean frozen install and repeat for reproducibility.
4. Typecheck/lint/build all web apps and backend API.
5. Typecheck/export/build Parent, Student, Teacher and Staff Expo apps.
6. Integrate and validate shared packages (api-client, domain-rules, shared-types, validation) where appropriate.
7. Start PostgreSQL/Redis/API; run health/readiness, migration, integration and tenant-isolation negative tests.
8. Validate real production environment/secrets, TLS, Docker Compose and integrations.
9. Execute device/emulator accessibility, navigation, lifecycle, deep-link and offline/online acceptance.
10. Complete E2E and security acceptance; close register items only with evidence.
