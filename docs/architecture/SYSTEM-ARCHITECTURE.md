# System Architecture

## Context
A shared, white-label School Management SaaS serving multiple organizations, each with multiple schools. Separate Teacher and Parent mobile apps connect to the same versioned backend APIs as the web applications.

## Architecture style
Start with a modular monolith. Domains are independently structured but deployed as a cohesive backend. Use explicit module contracts and domain events. Extract services only when measured scaling, team ownership or reliability requirements justify the additional distributed-systems complexity.

## Main components
1. Web clients: Super Admin, Organization Admin, School Admin, Public Portal.
2. Mobile clients: Teacher App and Parent App.
3. Edge: NGINX/TLS, routing, request limits and request IDs.
4. API: Node.js/Express/TypeScript, versioned REST.
5. Domains: identity, tenancy, subscriptions, education, students, staff, academics, attendance, finance, examinations, communication, transport, operations, reporting and integrations.
6. Data: PostgreSQL, Redis, private object storage.
7. Async: BullMQ workers, transactional outbox and webhook processing.
8. Observability: structured logs, metrics, traces, alerts and audit events.

## Domain boundaries
- Platform: organizations, schools, plans, entitlements, usage and platform support.
- Identity: users, persons, credentials, sessions, memberships, roles and permissions.
- Education: boards, programmes, curricula, grade levels, subjects, assessments and grading.
- Student: admissions, profiles, guardians, enrollment and lifecycle.
- Academic operations: timetable, lesson planning, homework, attendance and exams.
- Finance: fee structures, invoices, payments, allocations, refunds, ledgers and expenses.
- People: employees, HR, leave and payroll.
- Campus: transport, GPS, library, hostel, inventory, facilities and visitors.
- Engagement: messages, announcements, notifications, complaints and events.
- Platform services: files, imports, exports, integrations, audit and reporting.

## Data flow rules
- All tenant-owned operations resolve tenant context from authenticated memberships and server-side authorization.
- Organization/school IDs from request payloads are untrusted until validated.
- Cross-domain events use stable event contracts and idempotent consumers.
- Critical database mutation plus event publication uses transactional outbox.
- Payment callbacks are signature verified, deduplicated and idempotent.
- Files are private by default and accessed through authorized short-lived links.

## Architecture decision records required
P01 must create ADRs for monorepo tooling, tenant context/RLS, identity model, ORM/migration workflow, API error contract, event/outbox pattern and deployment topology.
