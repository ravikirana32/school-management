# P121 Cumulative Archive Manifest

Baseline: P120 cumulative archive.

This archive retains the complete P01–P120 source and documentation tree and adds P121 parent-resource authorization implementation and evidence documentation.

Key P121 paths:
- `backend/api/src/modules/documents/document.routes.ts`
- `scripts/verify-p121-parent-resource-ownership.mjs`
- `docs/api/P121-PARENT-RESOURCE-OWNERSHIP.md`
- `P121-STATUS.md`
- `P121-DELIVERY-REPORT.md`
- `P121-TEST-REPORT.md`
- `MASTER-OPEN-GAPS-REGISTER.md`
- `docs/MASTER-OPEN-GAPS-REGISTER.md`
- `MASTER-RESOLVED-GAPS-HISTORY.md`
- `docs/MASTER-RESOLVED-GAPS-HISTORY.md`

Verification command: `node scripts/verify-p121-parent-resource-ownership.mjs` (also exposed as `pnpm verify:p121`).
