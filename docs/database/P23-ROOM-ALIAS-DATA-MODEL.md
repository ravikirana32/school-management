# P23 Room Alias Data Model

`SchoolRoomAlias` stores a reviewed mapping from one historical free-text room label to a canonical active `SchoolRoom.code`.

| Field | Purpose |
|---|---|
| `organizationId`, `schoolId` | Tenant and school scope |
| `aliasLabel` | Human-readable source label |
| `normalizedLabel` | Trimmed, lower-case matching key |
| `canonicalRoomCode` | Target canonical room code |
| `status` | `PENDING`, `APPROVED` or `APPLIED` |
| `createdBy` | User who proposed mapping |
| `approvedBy` | User who approved mapping |
| `appliedAt` | Migration completion timestamp |

A unique constraint prevents duplicate normalized aliases within a school. Composite school foreign keys and forced RLS protect tenant isolation. The migration has an FK to the canonical room `(schoolId, code)` so aliases cannot target a room outside their school or a nonexistent room.
