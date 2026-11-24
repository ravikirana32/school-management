import React, { FormEvent, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

type Organization = { id: string; name: string; slug: string; country: string; timezone?: string; lifecycleStatus?: string; isActive?: boolean };
type School = { id: string; name: string; code: string; timezone?: string; lifecycleStatus?: string; isActive?: boolean };
type Invitation = { id: string; schoolId: string | null; email: string; roleKey: string; expiresAt: string; acceptedAt: string | null; revokedAt: string | null; createdAt: string; status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED' };
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1').replace(/\/+$/, '');

function App() {
  const [token, setToken] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('Enter an authorized token to load organization data.');
  const [error, setError] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('SCHOOL_ADMIN');
  const [inviteSchool, setInviteSchool] = useState('');
  const [acceptToken, setAcceptToken] = useState(() => new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token') ?? '');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token]);

  async function callApi<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, { ...init, headers: { ...headers, ...(init?.headers ?? {}) } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
    return body.data as T;
  }
  async function loadOrganizations() {
    if (!token.trim()) return;
    setLoading(true); setError('');
    try {
      const rows = await callApi<Organization[]>('/organizations');
      setOrganizations(rows);
      const next = selectedOrg && rows.some(o => o.id === selectedOrg) ? selectedOrg : rows[0]?.id ?? '';
      setSelectedOrg(next);
      if (next) await loadSchools(next);
      else setSchools([]);
      setMessage(`Loaded ${rows.length} organization${rows.length === 1 ? '' : 's'}.`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load organizations'); }
    finally { setLoading(false); }
  }
  async function loadSchools(orgId: string) {
    const rows = await callApi<School[]>(`/organizations/${encodeURIComponent(orgId)}/schools`);
    setSchools(rows);
    setInviteSchool(previous => rows.some(s => s.id === previous) ? previous : rows[0]?.id ?? '');
    await loadInvitations(orgId);
  }
  async function loadInvitations(orgId: string) {
    const rows = await callApi<Invitation[]>(`/organizations/${encodeURIComponent(orgId)}/invitations`);
    setInvitations(rows);
  }
  async function acceptOrganizationInvitation() {
    if (!acceptToken.trim() || !token.trim()) return;
    setSaving(true); setError('');
    try {
      const result = await callApi<{ accepted: boolean; organizationId: string }>('/organizations/invitations/accept', { method: 'POST', body: JSON.stringify({ token: acceptToken.trim() }) });
      setMessage(result.accepted ? `Invitation accepted for organization ${result.organizationId}. Reload organizations to see your new access.` : 'Invitation could not be accepted.');
      setAcceptToken('');
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to accept invitation'); }
    finally { setSaving(false); }
  }
  async function createInvitation(event: FormEvent) {
    event.preventDefault(); if (!selectedOrg) return;
    setSaving(true); setError('');
    try {
      await callApi<{ invitationId: string; status: string }>(`/organizations/${encodeURIComponent(selectedOrg)}/invitations`, { method: 'POST', body: JSON.stringify({ email: inviteEmail.trim().toLowerCase(), roleKey: inviteRole, ...(inviteRole === 'ORG_ADMIN' ? {} : { schoolId: inviteSchool }) }) });
      setInviteEmail(''); await loadInvitations(selectedOrg); setMessage('Invitation email sent successfully. The recipient can open the secure link and accept using their invited account.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create invitation'); }
    finally { setSaving(false); }
  }
  async function revokeInvitation(id: string) {
    if (!selectedOrg) return; setSaving(true); setError('');
    try { await callApi<unknown>(`/organizations/${encodeURIComponent(selectedOrg)}/invitations/${encodeURIComponent(id)}/revoke`, { method: 'POST' }); await loadInvitations(selectedOrg); setMessage('Invitation revoked.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to revoke invitation'); } finally { setSaving(false); }
  }
  async function selectOrganization(orgId: string) {
    setSelectedOrg(orgId); setSchools([]); setError('');
    if (!orgId) return;
    setLoading(true);
    try { await loadSchools(orgId); setMessage('School list refreshed for the selected organization.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load schools'); }
    finally { setLoading(false); }
  }
  async function createSchool(event: FormEvent) {
    event.preventDefault(); if (!selectedOrg) return;
    setSaving(true); setError('');
    try {
      const school = await callApi<School>(`/organizations/${encodeURIComponent(selectedOrg)}/schools`, { method: 'POST', body: JSON.stringify({ name: schoolName.trim(), code: schoolCode.trim().toUpperCase(), timezone }) });
      setSchools(old => [...old, school].sort((a, b) => a.name.localeCompare(b.name)));
      setSchoolName(''); setSchoolCode(''); setMessage(`School “${school.name}” created successfully.`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create school'); }
    finally { setSaving(false); }
  }
  const organization = organizations.find(o => o.id === selectedOrg);

  return <main className="shell">
    <header className="app-header"><div><div className="eyebrow">SCHOOL MANAGEMENT SAAS · ORGANIZATION OPERATIONS</div><h1>Organization Admin</h1><p>Manage organizations and their schools from one workspace.</p></div><div className="header-mark">OA</div></header>
    <section className="panel auth-panel"><label className="token-label">API access token<input type="password" autoComplete="off" placeholder="Paste authorized access token" value={token} onChange={e => setToken(e.target.value)} /></label><button className="primary" onClick={() => void loadOrganizations()} disabled={loading || !token.trim()}>{loading ? 'Loading…' : 'Load organizations'}</button><p className="status-text" role="status">{message}</p>{acceptToken && <section className="invite-accept" aria-label="Accept organization invitation"><h2>Accept invitation</h2><label>Invitation token<input type="password" autoComplete="off" value={acceptToken} onChange={e => setAcceptToken(e.target.value)} /></label><button type="button" className="primary" disabled={saving || !token.trim() || !acceptToken.trim()} onClick={() => void acceptOrganizationInvitation()}>{saving ? 'Accepting…' : 'Accept invitation'}</button><p>Sign in with the invited email address using the authorized API token, then accept this invitation.</p></section>}{error && <p className="error" role="alert">{error}</p>}</section>
    {organizations.length > 0 && <section className="workspace">
      <section className="panel org-panel"><div className="section-heading"><div><h2>Organizations</h2><p>Select an organization to manage its schools.</p></div><span className="count-pill">{organizations.length}</span></div><label>Organization<select value={selectedOrg} onChange={e => void selectOrganization(e.target.value)}><option value="">Select organization</option>{organizations.map(o => <option key={o.id} value={o.id}>{o.name} · {o.lifecycleStatus ?? (o.isActive ? 'ACTIVE' : 'INACTIVE')}</option>)}</select></label>{organization && <div className="org-details"><strong>{organization.name}</strong><div className="detail-grid"><span>Slug</span><b>{organization.slug}</b><span>Country</span><b>{organization.country}</b><span>Timezone</span><b>{organization.timezone ?? '—'}</b><span>Status</span><b>{organization.lifecycleStatus ?? (organization.isActive ? 'ACTIVE' : 'INACTIVE')}</b></div></div>}</section>
      <section className="panel schools-panel"><div className="section-heading"><div><h2>Schools</h2><p>Schools belonging to the selected organization.</p></div><span className="count-pill">{schools.length}</span></div>{!selectedOrg ? <div className="empty-state">Choose an organization to view its schools.</div> : schools.length ? <div className="school-list">{schools.map(s => <article className="school-row" key={s.id}><div className="school-avatar">{s.name.slice(0,1).toUpperCase()}</div><div className="school-main"><strong>{s.name}</strong><small>Code: {s.code}</small></div><span className={`status-pill ${s.isActive === false ? 'inactive' : ''}`}>{s.lifecycleStatus ?? (s.isActive === false ? 'INACTIVE' : 'ACTIVE')}</span></article>)}</div> : <div className="empty-state">No schools found. Create the first school below.</div>}</section>
      <section className="panel create-panel"><h2>Organization invitations</h2><p>Invite organization administrators or school members. Invitation tokens are never displayed in this workspace.</p><form onSubmit={createInvitation}><div className="form-grid"><label>Invite email<input required type="email" maxLength={254} value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="person@example.com" /></label><label>Role<select value={inviteRole} onChange={e => setInviteRole(e.target.value)}><option value="ORG_ADMIN">Organization administrator</option><option value="SCHOOL_ADMIN">School administrator</option><option value="TEACHER">Teacher</option><option value="PARENT">Parent</option><option value="ACCOUNTANT">Accountant</option></select></label>{inviteRole !== 'ORG_ADMIN' && <label>School<select required value={inviteSchool} onChange={e => setInviteSchool(e.target.value)}><option value="">Select school</option>{schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}</div><button className="primary" disabled={saving || loading || !selectedOrg || !inviteEmail.trim() || (inviteRole !== 'ORG_ADMIN' && !inviteSchool)}>{saving ? 'Saving…' : 'Create invitation'}</button></form><div className="school-list" aria-label="Invitations">{invitations.length ? invitations.map(inv => <article className="school-row" key={inv.id}><div className="school-main"><strong>{inv.email}</strong><small>{inv.roleKey} · {schools.find(s => s.id === inv.schoolId)?.name ?? (inv.schoolId ? 'School' : 'Organization-wide')} · Expires {new Date(inv.expiresAt).toLocaleDateString()}</small></div><span className={`status-pill ${inv.status !== 'PENDING' ? 'inactive' : ''}`}>{inv.status}</span>{inv.status === 'PENDING' && <button type="button" disabled={saving} onClick={() => void revokeInvitation(inv.id)}>Revoke</button>}</article>) : <div className="empty-state">No invitations yet.</div>}</div></section>
      <section className="panel create-panel"><h2>Add a school</h2><p>Create a new school within the selected organization.</p><form onSubmit={createSchool}><div className="form-grid"><label>School name<input required minLength={2} maxLength={160} value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="e.g. Vinra Public School" /></label><label>School code<input required minLength={2} maxLength={30} pattern="[A-Za-z0-9-]+" value={schoolCode} onChange={e => setSchoolCode(e.toUpperCase())} placeholder="e.g. VINRA-01" /></label><label>Timezone<select value={timezone} onChange={e => setTimezone(e.target.value)}><option>Asia/Kolkata</option><option>Asia/Dubai</option><option>Asia/Singapore</option><option>Europe/London</option><option>America/New_York</option><option>UTC</option></select></label></div><button className="primary" disabled={saving || loading || !selectedOrg || !schoolName.trim() || !schoolCode.trim()}>{saving ? 'Creating…' : 'Create school'}</button></form></section>
    </section>}
    <footer>Organization Admin · Basic functional coverage · Cycle 1</footer>
  </main>;
}


ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
