# P21 Timetable Security

- School Admin authorization and active membership are checked on all new management endpoints.
- All data queries are tenant-scoped and execute under `withTenantContext`; `BellScheduleTemplate` has forced PostgreSQL RLS and a school/organization composite FK.
- CSV parser limits input to 1 MB and 500 data rows, requires exact headers, handles quoted cells and reports row numbers. Import validates assignment and canonical room membership and uses a transaction plus the school/year advisory lock.
- New timetable room writes accept only active room codes from the same school. Historical room labels are deliberately not rewritten.
- Template application checks assignment ownership, room validity and timetable collisions before `createMany`.
- Advisory locks only serialize API writers that use the protocol; direct SQL writes can bypass it. Production must restrict direct table write privileges or move writes behind a mandatory database function/trigger protocol.
- CSV preview is non-mutating; the import endpoint revalidates all authoritative constraints to prevent time-of-check/time-of-use reliance on preview.
