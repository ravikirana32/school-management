# P420 Test Report

## Focused source verification
27 checks: model and scope, primary flag, unique constraint, migration/table/FKs/RLS, tenant context keys, candidate and assignment endpoints, permission and entitlement guards, completed/archived lock, max-20 and primary teacher validations, active teaching staff/school scope, Admin UI states and controls, and P419 planner/edit retention. **27/27 PASS**.

## Regression source verifiers
P411 15/15; P412 17/17; P413 PASS; P414 PASS; P415 CSV source 23/23; P416 26/26; P417 24/24; P418 24/24; P419 23/23.

## Syntax and limitations
Syntax-only transpile passed. Full `tsc` produced no syntax diagnostics after correction, but typechecking is blocked by missing project dependencies and existing unrelated type diagnostics. Prisma, live API/DB/RLS, browser/mobile and E2E checks were not executed.
