# P135 API — Historical Operationalization Dependency Plan

`GET /api/v1/:organizationId/:schoolId/parents/accounting/historical-imports/operationalization-plan`

Permission: `accounting.reconcile`. Optional query: `batchIds` as a comma-separated list (maximum 200). When omitted, all posted batches in the bounded planner set are considered.

The endpoint is read-only. It expands prerequisite batches reachable through persisted historical allocations, calculates a deterministic topological order, and returns `cycleBatchIds` for nodes that cannot be ordered. Each plan entry includes sequence, batch ID/number, row count, linked rows, dependency batch IDs, allocation relationship summaries, readiness and blocking prerequisites.

Limits: 2,000 posted batches and 10,000 allocation edges per request. A requested batch not found in the current tenant returns 404. A request with more than 200 IDs returns 400.

The plan does not execute operationalization. Operators must still run the existing batch endpoint in the returned order. Split/partial allocation materialization remains unsupported until the operational-link schema and materializer are migrated.
