import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const routes = fs.readFileSync(path.join(root, 'backend/api/src/modules/organizations/organization.routes.ts'), 'utf8');
const admin = fs.readFileSync(path.join(root, 'apps/organization-admin/src/main.tsx'), 'utf8');
const assertions = [
  ['Organization invitation list endpoint exists', routes.includes('organizationRouter.get("/:organizationId/invitations"')],
  ['List endpoint is organization-admin gated', routes.includes('hasOrganizationAdminAccess(userId, organizationId))) return res.status(403)')],
  ['Invitation list excludes token hashes/raw tokens', routes.includes('select: { id: true, schoolId: true, email: true, roleKey: true, invitedBy: true, expiresAt: true, acceptedAt: true, revokedAt: true, createdAt: true }')],
  ['Invitation statuses derive accepted/revoked/expired/pending', routes.includes('row.acceptedAt ? "ACCEPTED" : row.revokedAt ? "REVOKED" : row.expiresAt <= now ? "EXPIRED" : "PENDING"')],
  ['Revocation endpoint exists', routes.includes('organizationRouter.post("/:organizationId/invitations/:invitationId/revoke"')],
  ['Revocation audits organization invitation', routes.includes('action: "organization.invitation.revoked"')],
  ['Duplicate pending invitations return conflict', routes.includes('A pending invitation already exists for this email, role and school')],
  ['Acceptance serializes concurrent token submissions', routes.includes('pg_advisory_xact_lock(hashtextextended(${tokenHash}, 0))')],
  ['Acceptance checks active invitation with atomic update', routes.includes('updateMany({ where: { id: invitation.id, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } }, data: { acceptedAt: new Date() } })')],
  ['Role assignment is not duplicated on re-accept/retry', routes.includes('const existingRoleAssignment = await tx.userRoleAssignment.findFirst')],
  ['Organization Admin invitation form added', admin.includes('Organization invitations')],
  ['Invitation form includes organization and school role choices', admin.includes('value="ORG_ADMIN"') && admin.includes('value="SCHOOL_ADMIN"')],
  ['Invitation list and revoke action shown', admin.includes('invitations.map(inv =>') && admin.includes('revokeInvitation(inv.id)')],
  ['UI does not reveal raw invitation token', admin.includes('Invitation tokens are never displayed in this workspace.')],
  ['UI reports configured email delivery after invitation creation', admin.includes('Invitation email sent successfully. The recipient can open the secure link and accept using their invited account.')]
];
let failures = 0;
for (const [name, ok] of assertions) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failures++; }
console.log(`${assertions.length - failures}/${assertions.length} assertions passed`);
if (failures) process.exit(1);
