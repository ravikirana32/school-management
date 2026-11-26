import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { hasSchoolPermission } from "./authorization";

type SchoolMembership = { organization: { id: string; name: string; slug: string }; school: { id: string; name: string; code: string; timezone: string } };
type AcademicYear = { id: string; name: string; code: string; isCurrent: boolean; status: string; startsOn: string; endsOn: string };
type SessionValue = {
  api: string; token: string; refreshToken: string; userEmail: string;
  org: string; school: string; year: string; years: AcademicYear[]; permissions: string[]; permissionsLoading: boolean;
  can: (permission: string) => boolean;
  mfaStatus: { enrolled: boolean; policy?: { required: boolean; challengeRequired: boolean; enrollmentRequired: boolean; reasons: string[]; sessionFresh: boolean } } | null;
  refreshMfaStatus: () => Promise<void>;
  verifyMfa: (code: string) => Promise<void>;
  setToken: (value: string) => void; setRefreshToken: (value: string) => void;
  refreshSession: () => Promise<string>; request: (url: string, init?: RequestInit) => Promise<Response>; reloadAcademicYears: () => Promise<void>;
};
const Context = createContext<SessionValue | null>(null);
export function useSchoolAdminSession() { const value = useContext(Context); if (!value) throw new Error("SchoolAdminSessionProvider is missing"); return value; }

export function SchoolAdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [api, setApi] = useState(import.meta.env.VITE_API_BASE_URL || "http://localhost:4000");
  const [token, setToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);
  const [memberships, setMemberships] = useState<SchoolMembership[]>([]);
  const [selected, setSelected] = useState("");
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionScope, setPermissionScope] = useState("");
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [mfaStatus, setMfaStatus] = useState<SessionValue["mfaStatus"]>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaEnrollmentSecret, setMfaEnrollmentSecret] = useState("");
  const [year, setYear] = useState("");
  const [message, setMessage] = useState("Sign in to load your organization and school memberships.");
  const [busy, setBusy] = useState(false);
  const refreshInFlight = useRef<Promise<string> | null>(null);
  const base = api.replace(/\/+$/, "");
  const selectedMembership = memberships.find(m => `${m.organization.id}::${m.school.id}` === selected);
  const org = selectedMembership?.organization.id ?? "";
  const school = selectedMembership?.school.id ?? "";

  const auth = useCallback(async (path: string, body: unknown) => {
    const response = await fetch(`${base}/api/v1/auth${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Authentication failed (${response.status})`);
    return payload;
  }, [base]);
  const refreshSession = useCallback(async () => {
    if (!refreshToken) throw new Error("Session expired. Please sign in again.");
    if (refreshInFlight.current) return refreshInFlight.current;
    const pending = (async () => {
      const rotated = await auth("/refresh", { refreshToken });
      setToken(rotated.accessToken); setRefreshToken(rotated.refreshToken);
      return rotated.accessToken as string;
    })().finally(() => { refreshInFlight.current = null; });
    refreshInFlight.current = pending;
    return pending;
  }, [refreshToken, auth]);
  const request = useCallback(async (url: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    let response = await fetch(url, { ...init, headers });
    if (response.status === 401 && refreshToken) {
      try {
        const nextToken = await refreshSession();
        headers.set("Authorization", `Bearer ${nextToken}`);
        response = await fetch(url, { ...init, headers });
      } catch (error) {
        setToken(""); setRefreshToken(""); setSessionReady(false); setUserEmail(""); setMemberships([]); setSelected(""); setYears([]); setYear(""); setPermissions([]);
        throw error;
      }
    }
    return response;
  }, [token, refreshToken, refreshSession]);
  async function loadMemberships(activeToken?: string) {
    // Bootstrap the authenticated identity before loading tenant-scoped workspaces.
    // The API response is authoritative; the email entered in the login form is not.
    const identityUrl = `${base}/api/v1/auth/me`;
    const identityResponse = activeToken
      ? await fetch(identityUrl, { headers: { Authorization: `Bearer ${activeToken}` } })
      : await request(identityUrl);
    const identityPayload = await identityResponse.json().catch(() => ({}));
    if (!identityResponse.ok || !identityPayload.user?.id) {
      throw new Error(identityPayload.error || "Unable to validate the signed-in identity");
    }
    setUserEmail(identityPayload.user.email || "");
    const mfaResponse = await fetch(`${base}/api/v1/auth/mfa/status`, { headers: { Authorization: `Bearer ${activeToken || token}` } });
    const mfaPayload = await mfaResponse.json().catch(() => ({}));
    if (!mfaResponse.ok) throw new Error(mfaPayload.error || "Unable to load MFA policy");
    setMfaStatus(mfaPayload.data || null);

    const membershipUrl = `${base}/api/v1/organizations/me/schools`;
    const response = activeToken
      ? await fetch(membershipUrl, { headers: { Authorization: `Bearer ${activeToken}` } })
      : await request(membershipUrl);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Unable to load school memberships");
    const rows = (payload.data ?? []) as SchoolMembership[];
    setMemberships(rows);
    if (!rows.some(m => `${m.organization.id}::${m.school.id}` === selected)) setSelected(rows[0] ? `${rows[0].organization.id}::${rows[0].school.id}` : "");
    setMessage(rows.length ? `Found ${rows.length} active school membership(s).` : "No active school memberships were found for this account.");
    setSessionReady(true);
  }
  const refreshMfaStatus = useCallback(async () => {
    if (!token) { setMfaStatus(null); return; }
    const response = await request(`${base}/api/v1/auth/mfa/status`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Unable to load MFA policy");
    setMfaStatus(payload.data || null);
  }, [token, base, request]);
  const beginMfaEnrollment = useCallback(async () => {
    const response = await request(`${base}/api/v1/auth/mfa/totp/enroll`, { method: "POST" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Unable to start authenticator enrollment");
    setMfaEnrollmentSecret(payload.data?.secret || "");
  }, [base, request]);
  const verifyMfa = useCallback(async (code: string) => {
    const response = await request(`${base}/api/v1/auth/mfa/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    if (!response.ok) { const payload = await response.json().catch(() => ({})); throw new Error(payload.error || "MFA verification failed"); }
    setMfaCode(""); await refreshMfaStatus();
  }, [base, request, refreshMfaStatus]);

  const reloadAcademicYears = useCallback(async () => {
    if (!token || !org || !school) { setYears([]); setYear(""); return; }
    const response = await request(`${base}/api/v1/schools/${encodeURIComponent(org)}/${encodeURIComponent(school)}/academic-years`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Unable to load academic years");
    const rows = (payload.data ?? []) as AcademicYear[];
    setYears(rows);
    setYear(current => rows.some(item => item.id === current) ? current : (rows.find(item => item.isCurrent)?.id ?? rows[0]?.id ?? ""));
  }, [token, org, school, base, request]);

  async function requestPasswordReset(event: React.FormEvent) {
    event.preventDefault(); setForgotBusy(true);
    try {
      const response = await fetch(`${base}/api/v1/auth/password/forgot`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail.trim() }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to request password reset");
      setMessage(payload.message || "If the account exists, reset instructions will be sent.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to request password reset"); }
    finally { setForgotBusy(false); }
  }
  async function signIn(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    try {
      const result = await auth("/login", { email: email.trim(), password });
      setToken(result.accessToken); setRefreshToken(result.refreshToken); setPassword("");
      await loadMemberships(result.accessToken);
    } catch (error) {
      setToken(""); setRefreshToken(""); setSessionReady(false); setUserEmail(""); setMemberships([]); setSelected(""); setYears([]); setYear(""); setPermissions([]); setPermissionScope(""); setMfaStatus(null);
      setMessage(error instanceof Error ? error.message : "Sign-in failed");
    }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true);
    try { if (refreshToken) await auth("/logout", { refreshToken }); } catch { /* local credentials are still cleared */ }
    setToken(""); setRefreshToken(""); setSessionReady(false); setUserEmail(""); setMemberships([]); setSelected(""); setYears([]); setYear(""); setPermissions([]); setPermissionScope(""); setMfaStatus(null); setMfaCode(""); setMfaEnrollmentSecret(""); setBusy(false); setMessage("Signed out.");
  }
  useEffect(() => {
    let cancelled = false;
    async function loadYears() {
      if (!token || !org || !school) { setYears([]); setYear(""); return; }
      try {
        const response = await request(`${base}/api/v1/schools/${encodeURIComponent(org)}/${encodeURIComponent(school)}/academic-years`);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Unable to load academic years");
        if (cancelled) return;
        const rows = (payload.data ?? []) as AcademicYear[];
        setYears(rows); setYear(current => rows.some(item => item.id === current) ? current : (rows.find(item => item.isCurrent)?.id ?? rows[0]?.id ?? ""));
      } catch (error) { if (!cancelled) setMessage(error instanceof Error ? error.message : "Unable to load academic years"); }
    }
    void loadYears(); return () => { cancelled = true; };
  }, [token, org, school, api]);

  useEffect(() => {
    let cancelled = false;
    async function loadPermissions() {
      if (!token || !org || !school) { setPermissions([]); setPermissionScope(""); setPermissionsLoading(false); return; }
      setPermissions([]); setPermissionScope(""); setPermissionsLoading(true);
      try {
        const response = await request(`${base}/api/v1/${encodeURIComponent(org)}/${encodeURIComponent(school)}/access/me/permissions`);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Unable to load school permissions");
        if (!cancelled) { setPermissions(Array.isArray(payload.data?.permissions) ? payload.data.permissions : []); setPermissionScope(`${org}::${school}`); }
      } catch (error) {
        if (!cancelled) { setPermissions([]); setPermissionScope(""); setMessage(error instanceof Error ? error.message : "Unable to load school permissions"); }
      } finally { if (!cancelled) setPermissionsLoading(false); }
    }
    void loadPermissions(); return () => { cancelled = true; };
  }, [token, org, school, base]);

  const activePermissions = permissionScope === `${org}::${school}` ? permissions : [];
  const value = useMemo<SessionValue>(() => ({ api: base, token, refreshToken, userEmail, org, school, year, years, permissions: activePermissions, permissionsLoading, can: (permission: string) => hasSchoolPermission(activePermissions, permission), mfaStatus, refreshMfaStatus, verifyMfa, setToken, setRefreshToken, refreshSession, request, reloadAcademicYears }), [base, token, refreshToken, userEmail, org, school, year, years, activePermissions, permissionsLoading, mfaStatus, refreshMfaStatus, verifyMfa, refreshSession, request, reloadAcademicYears]);
  return <Context.Provider value={value}>
    <section className="config-card" style={{ marginBottom: 18, display: "grid", gap: 12 }}>
      <div><h2>Authenticated school workspace</h2><p className="helper">One shared session for connected School Admin workspaces. Memberships and academic years are loaded from the API; access and refresh tokens are memory-only.</p></div>
      {!sessionReady ? (forgotMode && !token ? <form className="form-grid" onSubmit={requestPasswordReset}>
        <label>API base URL<input value={api} onChange={e => setApi(e.target.value)} /></label>
        <label>Account email<input type="email" autoComplete="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} /></label>
        <p className="helper">For privacy, the response does not reveal whether the account exists. Reset email delivery requires a configured provider.</p>
        <div className="form-actions"><button type="submit" disabled={forgotBusy}>{forgotBusy ? "Submitting…" : "Request reset instructions"}</button><button type="button" disabled={forgotBusy} onClick={() => setForgotMode(false)}>Back to sign in</button></div>
      </form> : <form className="form-grid" onSubmit={signIn}>
        <label>API base URL<input value={api} onChange={e => setApi(e.target.value)} /></label>
        <label>Email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        <div className="form-actions"><button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button><button type="button" disabled={busy} onClick={() => { setForgotEmail(email); setForgotMode(true); }}>Forgot password?</button></div>
      </form>) : <>
        <div className="form-grid">
          <label>Organization & school<select value={selected} onChange={e => setSelected(e.target.value)}><option value="">Select a school</option>{memberships.map(m => <option key={`${m.organization.id}::${m.school.id}`} value={`${m.organization.id}::${m.school.id}`}>{m.organization.name} — {m.school.name} ({m.school.code})</option>)}</select></label>
          <label>Academic year<select value={year} onChange={e => setYear(e.target.value)} disabled={!years.length}><option value="">Select academic year</option>{years.map(y => <option key={y.id} value={y.id}>{y.name} {y.isCurrent ? "(Current)" : ""}</option>)}</select></label>
        </div>
        <div className="form-actions"><span>Signed in as {userEmail} · {memberships.length} school(s) · {years.length} academic year(s) · {permissions.length} permissions</span><button type="button" disabled={busy} onClick={() => void loadMemberships()}>Refresh memberships</button><button type="button" disabled={busy} onClick={() => void signOut()}>Sign out</button></div>
      </>}
      {token && mfaStatus?.policy?.required ? <div className="config-card" style={{ display: "grid", gap: 8 }}><h3>Multi-factor authentication</h3><p className="helper">Policy required: {mfaStatus.policy.reasons.join(", ") || "configured role policy"}. {mfaStatus.enrolled ? (mfaStatus.policy.challengeRequired ? "Verify your authenticator to refresh the five-minute session assurance." : "Authenticator enrolled; current session assurance is valid.") : "Enroll an authenticator to satisfy this policy."}</p>{mfaStatus.policy.enrollmentRequired && !mfaEnrollmentSecret ? <button type="button" disabled={busy} onClick={() => void beginMfaEnrollment().catch(error => setMessage(error instanceof Error ? error.message : "Unable to start MFA enrollment"))}>Start authenticator enrollment</button> : null}{mfaEnrollmentSecret ? <p className="helper">Add this setup key to your authenticator app: <code>{mfaEnrollmentSecret}</code></p> : null}{(mfaStatus.policy.challengeRequired || mfaStatus.policy.enrollmentRequired) && (mfaStatus.enrolled || mfaEnrollmentSecret) ? <><label>6-digit authenticator or recovery code<input value={mfaCode} onChange={event => setMfaCode(event.target.value)} autoComplete="one-time-code" /></label><button type="button" disabled={busy || !mfaCode.trim()} onClick={() => void verifyMfa(mfaCode).then(() => setMfaEnrollmentSecret("")).catch(error => setMessage(error instanceof Error ? error.message : "MFA verification failed"))}>Verify MFA</button></> : null}</div> : null}
      <div className="notice"><b>Session</b><span>{permissionsLoading ? "Loading school permissions… " : ""}{message}</span></div>
    </section>
    {!sessionReady ? null : token && mfaStatus?.policy?.required && (mfaStatus.policy.challengeRequired || mfaStatus.policy.enrollmentRequired)
      ? <section className="config-card"><h2>Workspace locked pending MFA</h2><p className="helper">Complete the required authenticator enrollment or verification above before using School Admin workspaces.</p></section>
      : children}
  </Context.Provider>;
}
