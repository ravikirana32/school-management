# School Management SaaS - Consolidated Documentation

**Purpose:** This is the single entry point for product, architecture, feature, roadmap, gap and operations documentation.

## Product definition

Build an original, enterprise-grade, multi-organization School Management SaaS for individual schools, education trusts and school groups. The platform uses an India-first but internationally scalable model, shared multi-tenancy and white-label branding.

### Primary applications

| Surface | Form | Workspace |
|---|---|---|
| SaaS Super Admin | Web | `apps/super-admin` |
| Organization Admin | Web | `apps/organization-admin` |
| School Admin | Web | `apps/school-admin` |
| Public Portal | Web | `apps/public-portal` |
| Parent | Mobile | `apps/parent-mobile` |
| Teacher | Mobile | `apps/teacher-mobile` |
| Student | Mobile | `apps/student-mobile` |
| Staff | Mobile | `apps/staff-mobile` |
| Driver | Mobile | `apps/driver-mobile` |
| API | Backend | `backend/api` |

### Core capability groups

- Platform SaaS, organizations, schools, subscriptions, entitlements and white-label configuration
- Authentication, global identity, memberships, MFA, sessions, RBAC and tenant authorization
- Admissions, student records, guardians, academic configuration and multi-board education
- Timetables, attendance, teaching, homework, examinations, grading and report cards
- Fees, payments, refunds, accounting, procurement, inventory and payroll
- Transport, library, hostel, canteen, health, facilities, visitors and specialist operations
- Notifications, communications, document governance, reporting and integrations
- Audit, security, privacy, observability, disaster recovery and production operations

## Architecture and data model

- Shared PostgreSQL database with organization and school tenant scopes
- Modular monolith for the initial delivery stage
- React and Vite for web applications
- React Native and Expo for mobile applications
- Node.js, Express and TypeScript for the API
- Prisma for database access
- Redis and BullMQ for cache and jobs
- S3-compatible private object storage
- OpenAPI, OpenTelemetry-compatible instrumentation and centralized logs
- Docker and Docker Compose for local and production deployments

Every tenant-owned record must carry the required organization scope; school-owned records must also carry the school scope. Authorization, tenant isolation and subscription entitlements must be enforced on API routes and background jobs. PostgreSQL RLS, composite foreign keys and scoped unique constraints provide database-level protection. Financial, academic and audit history must remain immutable or preserve a controlled correction history.

The logical database design, API contract and module boundaries are authoritative implementation references:

- [Database design](docs/database/DATABASE-DESIGN.md)
- [API standards](docs/api/API-STANDARDS-AND-INVENTORY.md)
- [Module inventory](docs/modules/MODULE-INVENTORY.md)
- [Architecture index](docs/architecture/)
- [Deployment documentation](docs/deployment/)
- [Operations documentation](docs/operations/)

## Canonical documents

Use these documents instead of historical report copies:

1. [Feature Catalogue](SCHOOL-SaaS-FEATURE-CATALOG.md) - current feature and application inventory
2. [Roadmap](SCHOOL-SaaS-ROADMAP.md) - delivery cycles and remaining implementation work
3. [Gap Register](SCHOOL-SaaS-FEATURE-GAPS.md) - consolidated open and tracked gaps
4. [Missed Functionality Backlog](MISSED-FUNCTIONALITY-BACKLOG.md) - additional missed functionality
5. [Product Analysis and Plan](SCHOOL-MANAGEMENT-SAAS-PRODUCT-ANALYSIS-AND-PLAN.md) - original product and architecture baseline
6. [Docker Quick Start](DOCKER-LOCAL-QUICKSTART.md) - local runtime setup
7. [Demo Runbook](DEMO-DATA-TEST-RUNBOOK.md) - demo data and test credentials

Historical `Pnnn-*`, `C2-*`, `MASTER-*` and verification files are evidence and compatibility artifacts. They remain under [docs/phases/](docs/phases/) and [docs/legacy/](docs/legacy/) and should not be used as the current project definition.

## Current delivery position

The repository contains substantial source and phase evidence, but implementation presence is not equivalent to runtime acceptance. A feature should be considered accepted only after implementation, migration/build, role and tenant authorization, integration or end-to-end, security and relevant operational evidence exist.

The P579 production decision remains NO-GO until build, frozen dependency, Prisma/PostgreSQL, runtime, migration, RLS, provider, mobile, web, accessibility, disaster recovery and independent acceptance gates are completed. P580 consolidated documentation and Docker runtime foundations, while P581 targets reproducible workspace and dependency closure.

## Consolidation and duplicate policy

- Exact duplicate files are retained once at the canonical or shortest representative path.
- Compatibility mirrors are not status authorities.
- Root files contain project entry points and canonical planning documents only.
- Historical reports and evidence belong under `docs/phases/<phase>/` or `docs/legacy/`.
- Source code, package manifests and configuration files are not documentation duplicates and remain in their owning workspace.
- A gap is closed only with implementation and appropriate executable evidence; documentation consolidation does not close a gap.

