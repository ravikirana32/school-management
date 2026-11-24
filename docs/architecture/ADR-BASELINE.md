# Architecture Decision Baseline

| ADR | Decision | Status |
|---|---|---|
| ADR-001 | Modular monolith initially; avoid premature microservices | Accepted |
| ADR-002 | Shared PostgreSQL database/schema with tenant-scoped rows and RLS defence in depth | Accepted, detailed policy pending |
| ADR-003 | Global identity with organization/school memberships and scoped role assignments | Accepted, detailed linking rules pending |
| ADR-004 | React/TypeScript web and React Native/Expo mobile | Accepted |
| ADR-005 | Node.js/Express/TypeScript backend | Accepted |
| ADR-006 | PostgreSQL with Prisma ORM | Accepted |
| ADR-007 | Versioned REST APIs documented through OpenAPI | Accepted |
| ADR-008 | Redis/BullMQ for cache and background jobs | Accepted |
| ADR-009 | Transactional outbox for reliable domain event publication | Accepted |
| ADR-010 | S3-compatible private object storage | Accepted |

Any change to an accepted decision requires a dated ADR with context, alternatives, decision, consequences, migration impact and approval.
