# P06 migration notes

Apply after P05. The migration assumes P04's composite unique key on `School(id, organizationId)` exists. It creates school configuration tables with composite foreign keys and forced RLS policies that require both organization and school context. API queries must use `withTenantContext` and the transaction client.

The partial unique indexes allow only one current academic year and one default calendar per school. Before applying to an existing database, inspect any pre-existing duplicate rows if these tables have been manually created outside migrations.
