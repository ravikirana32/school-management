# Testing and Acceptance Strategy

## Tooling baseline
- Unit: Vitest/Jest.
- API integration: Supertest.
- Web E2E: Playwright.
- Mobile E2E: Maestro or Detox.
- Performance: k6.
- Database: migration, constraint, transaction and RLS tests.
- Security: authorization, tenant isolation, webhook, file and abuse tests.

## Required test layers
1. Unit tests for domain rules and calculations.
2. Integration tests for repositories, transactions and events.
3. API tests for schema, auth, permission, tenant scope and errors.
4. Web E2E for complete administrative workflows.
5. Mobile E2E for teacher and parent journeys.
6. Contract tests for providers and OpenAPI.
7. Regression tests for every previously completed phase.
8. Load, soak and recovery tests before production.

## Release-blocking scenarios
- Organization A cannot read or mutate Organization B records.
- School A cannot read or mutate School B records without explicit authorization.
- Parent can only access linked children and allowed fields.
- Teacher can only access assigned classes/subjects and authorized students.
- Student admission through enrollment, attendance, assessments and promotion.
- Fee invoice, partial payment, webhook retry, receipt, refund and reconciliation.
- Exam scheduling, marks, grading, approval and publication.
- Offline attendance sync, duplicate prevention and conflict handling.
- Entitlement expiry prevents restricted new operations without corrupting existing data.
- Organization consolidated reports reconcile to school-level source records.
- Backup restore meets approved RPO/RTO.

## Evidence rule
A test is “passed” only when executed. Each phase report records command, environment, date, result, skipped tests, known failures and evidence location. Do not claim unexecuted tests passed.
