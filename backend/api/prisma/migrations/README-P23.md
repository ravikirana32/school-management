# P23 Migration

Migration: `20261117080000_p23_room_alias_registry`

Creates `SchoolRoomAlias` with school-scoped normalized-label uniqueness, a composite FK to the canonical `SchoolRoom(schoolId, code)`, a status check and forced tenant RLS. Apply only after the prior P00–P22 migrations have been validated and applied in order.

Runtime migration and RLS verification have not yet been performed. The application DB role must use the transaction-local tenant context helper for all reads/writes. Test the alias migration trigger path under the intended non-owner role before production rollout.
