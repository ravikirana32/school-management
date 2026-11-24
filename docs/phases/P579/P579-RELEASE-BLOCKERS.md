# P579 Release Blocker Register

| ID | Severity | Blocker | Required evidence |
|---|---|---|---|
| RB-01 | Critical | Missing authentic pnpm lockfile/frozen install | Generated lockfile, successful pnpm 9.15.0 frozen install, archived logs |
| RB-02 | Critical | Prisma and PostgreSQL acceptance absent | Validate/generate, clean and upgrade migration, seed, rollback and drift evidence |
| RB-03 | Critical | Tenant isolation runtime unverified | Restricted DB role, missing-context denial, cross-tenant denial and pool reuse tests |
| RB-04 | Critical | Data integrity and financial provider flows unverified | Provider sandbox, reconciliation/refund ledger, webhook replay and concurrency E2E |
| RB-05 | High | Builds and semantic typechecks not run | All 14 package typecheck/build outputs |
| RB-06 | High | Browser/mobile/accessibility acceptance absent | Playwright/axe, five mobile apps, offline and manual assistive-tech reports |
| RB-07 | Critical | Backup/restore and DR unproven | Encrypted backup restore, PITR, failover, measured approved RPO/RTO |
| RB-08 | High | Independent reviews and operational controls absent | Signed security/privacy/legal/safeguarding/accessibility/operations reviews |
| RB-09 | High | SBOM and secrets review incomplete | Dependency-resolved SBOM, vulnerability/license report, independent secrets scan |
| RB-10 | High | Deployment/rollback rehearsal absent | Production-like change rehearsal, rollback and data compatibility evidence |

All blockers remain OPEN. No release exception or risk acceptance has been signed by an authorized stakeholder.
