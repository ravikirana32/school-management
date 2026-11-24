# P01 Entry Criteria and Acceptance Plan

## Objective
Create the reproducible engineering foundation for the School Management SaaS monorepo.

## Scope
1. Initialize monorepo and workspace tooling.
2. Create React/Vite/TypeScript web app shells.
3. Create Expo/React Native Teacher and Parent app shells.
4. Create Node.js/Express/TypeScript backend.
5. Configure PostgreSQL and Prisma.
6. Configure Redis and BullMQ foundation.
7. Add Docker Compose for local development.
8. Add environment validation and `.env.example` files.
9. Add lint, formatting, typecheck, unit test and build scripts.
10. Add CI workflow.
11. Add health/readiness endpoints.
12. Add structured logging and request IDs.
13. Add OpenAPI bootstrap.
14. Add initial database migration and seed strategy.
15. Add developer setup documentation.

## Acceptance criteria
- Clean clone can be installed using documented commands.
- Docker services start reliably and health checks work.
- API connects to PostgreSQL and Redis.
- Prisma migration deploy and rollback/recovery approach is documented and tested.
- Web apps build.
- Mobile apps start in documented Expo development mode.
- CI runs lint, typecheck, tests and builds.
- No secrets committed.
- Environment variables are validated at startup.
- Health and readiness endpoints distinguish application and dependency health.
- Baseline smoke tests pass.

## Carry-forward requirements
Update `IMPLEMENTATION-STATUS.md`, `CHANGELOG.md`, `MASTER-OPEN-GAPS-REGISTER.md`, and add `docs/phases/P01-PHASE-REPORT.md`. Produce P01 phase ZIP and cumulative ZIP. Do not silently change P00 architecture decisions.
