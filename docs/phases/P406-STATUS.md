# P406 Status — Campus Effective Configuration Read View

**Status:** COMPLETE (source slice)

P406 adds a permission-protected read-only effective configuration endpoint for a campus. It combines tenant/school-scoped persisted school configuration with the previously resolved campus inheritance overrides.

Endpoint: `GET /:organizationId/:schoolId/campus-config/effective/:campusId`

The response includes campus ID and resolved chain, profile, working-days, and policy values. Existing baseline values are retained when a scope has no override. Nested object overrides are merged; array/primitive override behavior remains replacement semantics. Invalid inheritance resolution returns HTTP 422.

**F03:** IN_PROGRESS. **F04:** BLOCKED until F03 is completed and validated.
