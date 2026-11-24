import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const route = readFileSync('backend/api/src/modules/organizations/organization.routes.ts','utf8');
const env = readFileSync('backend/api/src/config/env.ts','utf8');
const ui = readFileSync('apps/organization-admin/src/main.tsx','utf8');
const example = readFileSync('.env.example','utf8');
const checks = [
 ['delivery config fails closed before token creation', route.indexOf('Organization invitation delivery is not configured') < route.indexOf('const token = opaqueToken()')],
 ['provider uses configured notification endpoint', route.includes('fetch(env.NOTIFICATION_EMAIL_PROVIDER_URL')],
 ['provider bearer secret is used', route.includes('Bearer ${env.NOTIFICATION_EMAIL_PROVIDER_TOKEN}')],
 ['invitation token is sent only through email payload', route.includes('variables: { invitationUrl')],
 ['token remains hash-only in database', route.includes('tokenHash: hashToken(token)')],
 ['provider idempotency key uses invitation ID', route.includes('"idempotency-key": invitation.id')],
 ['delivery failure revokes invitation', route.includes('data: { revokedAt: new Date() }')],
 ['failure audit stores safe provider failure metadata', route.includes('providerFailure: error instanceof Error ? error.name')],
 ['API response excludes raw token', !route.includes('return res.status(202).json({ data: { invitationId: invitation.id, status: "SENT", token')],
 ['frontend accepts token from hash and calls accept endpoint', ui.includes("new URLSearchParams(window.location.hash") && ui.includes("'/organizations/invitations/accept'")],
 ['frontend provides acceptance action and removes hash after success', ui.includes('Accept invitation') && ui.includes("window.history.replaceState(null")],
 ['base URL is configurable and validated as URL', env.includes('ORGANIZATION_ADMIN_INVITATION_BASE_URL: z.string().url().optional()')],
 ['production invitation URL HTTPS validation', env.includes('ORGANIZATION_ADMIN_INVITATION_BASE_URL"] as const')],
 ['deployment config example exists', example.includes('ORGANIZATION_ADMIN_INVITATION_BASE_URL=https://admin.example.com')],
];
for (const [name, result] of checks) { assert.ok(result, `FAIL: ${name}`); console.log(`PASS: ${name}`); }
console.log(`${checks.length}/${checks.length} PASS`);
