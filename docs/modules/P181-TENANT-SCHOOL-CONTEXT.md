# P181 — Public tenant-to-school context resolution

## Implemented
- Custom-domain tenant-context endpoint now includes active schools scoped to the resolved organization.
- Returned school fields are limited to ID, name and code.
- Public portal automatically sets the organization ID from tenant context and renders a school selector from the returned school list.
- Manual school ID entry remains only as fallback when the tenant-context endpoint returns no schools.

## Open gaps
- Validate custom-domain tenant context and school availability against actual deployments.
- School selection can be refined to URL path/tenant-specific landing page or query-free canonical selection.
- No runtime/build acceptance due dependency/runtime validation being deferred.
