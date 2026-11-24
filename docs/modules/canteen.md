# Canteen & Meals module (P352)

See `docs/phases/P352-CANTEEN-MEALS.md` for implementation status, workflow, verification and remaining gaps.

## Routes
- `/:organizationId/:schoolId/canteen/menu` GET/POST
- `/:organizationId/:schoolId/canteen/menu/:itemId` PATCH
- `/:organizationId/:schoolId/canteen/meal-plans` GET/POST
- `/:organizationId/:schoolId/canteen/allocations` GET/POST
- `/:organizationId/:schoolId/canteen/orders` GET/POST
- `/:organizationId/:schoolId/canteen/orders/:orderId/status` PATCH
- `/:organizationId/:schoolId/canteen/orders/:orderId/serve` POST
- `/:organizationId/:schoolId/canteen/orders/:orderId/payment` PATCH
- `/:organizationId/:schoolId/canteen/stock` GET/POST; `/:stockId` PATCH
- Student-linked `/students/me/:organizationId/:schoolId/canteen/menu|orders` GET; `/orders` POST
- Guardian-linked `/parents/me/:organizationId/:schoolId/canteen/menu|orders` GET; `/orders` POST

## Permissions
- `canteen.read`, `canteen.manage`, `canteen.serve`
- HR Manager and Principal roles receive read/manage/serve; Teacher receives read. Parent and Student mobile APIs rely on linked account ownership checks; Parent routes additionally require verified guardian, accepted consent, active memberships and the parent canteen permission.

## Static source verifier
- `node scripts/phase-verifiers/verify-p352-canteen.mjs`
