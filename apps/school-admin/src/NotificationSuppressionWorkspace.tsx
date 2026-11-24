import React, { useCallback, useEffect, useState } from "react";
import { useSchoolAdminSession } from "./SchoolAdminSession";
import { buildSuppressionKeyHealthRows } from "./suppression-key-health";

type AuditEvent = { id: string; action: string; reason: string | null; createdAt: string };
type KeyHealth = { currentVersion: string; previousVersion: string | null; aliases: { version: string; status: string; count: number }[]; outboxReferences: { version: string | null; status: string; count: number }[] };
type Suppression = {
  id: string; reason: string; status: "ACTIVE" | "RELEASED"; sourceEventId?: string | null;
  createdAt: string; releasedAt?: string | null; releaseReason?: string | null; auditEvents: AuditEvent[];
};

const reasons = ["MANUAL", "BOUNCE", "COMPLAINT", "PROVIDER_POLICY"] as const;
type Reason = typeof reasons[number];

export function NotificationSuppressionWorkspace() {
  const { api, org, school, request, can } = useSchoolAdminSession();
  const [rows, setRows] = useState<Suppression[]>([]);
  const [keyHealth, setKeyHealth] = useState<KeyHealth | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<"ACTIVE" | "RELEASED">("ACTIVE");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState<Reason>("MANUAL");
  const [releaseId, setReleaseId] = useState("");
  const [releaseReason, setReleaseReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Email suppression is school-local. Email addresses are never displayed in the list.");
  const permitted = can("school.settings.manage");
  const endpoint = `${api}/api/v1/${encodeURIComponent(org)}/${encodeURIComponent(school)}/notification-suppressions`;

  const load = useCallback(async (cursor: string | null = null, append = false) => {
    if (!org || !school || !permitted) { setRows([]); setNextCursor(null); setHasMore(false); setKeyHealth(null); return; }
    setBusy(true);
    try {
      const query = new URLSearchParams({ status, limit: "50", ...(cursor ? { cursor } : {}) });
      const response = await request(`${endpoint}?${query.toString()}`);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Unable to load suppressions (${response.status})`);
      const pageRows = Array.isArray(payload.data) ? payload.data : [];
      setRows(current => append ? [...current, ...pageRows] : pageRows);
      setNextCursor(typeof payload.pagination?.nextCursor === "string" ? payload.pagination.nextCursor : null);
      setHasMore(Boolean(payload.pagination?.hasMore));
      try {
        const healthResponse = await request(`${endpoint}/key-health`);
        const healthPayload = await healthResponse.json().catch(() => ({}));
        if (healthResponse.ok && healthPayload.data) setKeyHealth(healthPayload.data as KeyHealth);
      } catch { setKeyHealth(null); }
      setMessage(append ? `Loaded ${pageRows.length} additional ${status.toLowerCase()} suppression record(s).` : `Showing ${pageRows.length} newest ${status.toLowerCase()} school-local suppression record(s).`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load suppressions"); }
    finally { setBusy(false); }
  }, [org, school, permitted, endpoint, status, request]);

  useEffect(() => { void load(); }, [load]);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await request(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, reason }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Unable to add suppression (${response.status})`);
      setEmail("");
      setStatus("ACTIVE");
      setMessage("Suppression saved. The email address was converted to a keyed hash and is not returned by the API.");
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to add suppression"); }
    finally { setBusy(false); }
  }

  async function release(event: React.FormEvent) {
    event.preventDefault();
    if (!releaseId) return;
    setBusy(true);
    try {
      const response = await request(`${endpoint}/${encodeURIComponent(releaseId)}/release`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: releaseReason })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Unable to release suppression (${response.status})`);
      setReleaseId(""); setReleaseReason("");
      setMessage("Suppression released. The release reason and actor are retained in the audit history.");
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to release suppression"); }
    finally { setBusy(false); }
  }

  const keyHealthRows = keyHealth ? buildSuppressionKeyHealthRows(keyHealth) : [];
  if (!permitted) return <section className="config-card"><h2>Access denied</h2><p className="helper">The school.settings.manage permission is required to manage notification suppression.</p></section>;

  return <section className="config-card suppression-workspace">
    <div className="page-heading"><div><div className="eyebrow">COMMUNICATIONS · EMAIL CONTROLS</div><h2>Email suppression</h2><p className="helper">Manage school-local addresses that must not receive email notifications.</p></div><button type="button" disabled={busy} onClick={() => void load()}>Refresh</button></div>
    <div className="notice"><b>Privacy</b><span>Addresses are normalized and stored only as keyed HMAC hashes. This workspace never displays stored email addresses or hashes.</span></div>
    {keyHealth && <div className="key-health-panel"><div><h3>Suppression key health</h3><p className="helper">Counts only; secrets and hashes are never returned.</p></div><p className="key-health-current">Current: <b>{keyHealth.currentVersion}</b>{keyHealth.previousVersion && <> · Previous: <b>{keyHealth.previousVersion}</b></>}</p><div className="table-wrap"><table className="suppression-table"><thead><tr><th>Key version</th><th>Active aliases</th><th>Released aliases</th><th>Outbox references</th></tr></thead><tbody>{keyHealthRows.map(row => <tr key={row.version}><td>{row.version}{row.isCurrent ? " · current" : row.isPrevious ? " · previous" : ""}</td><td>{row.activeAliases}</td><td>{row.releasedAliases}</td><td>{row.outboxReferences}</td></tr>)}</tbody></table></div><p className="helper">Do not retire a previous key while active aliases or outbox references remain. Outbox references may still receive delayed provider callbacks; apply the approved retention/callback window before retirement.</p></div>}
    <form className="form-grid" onSubmit={add}>
      <label>Email address<input type="email" autoComplete="off" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="parent@example.com" /></label>
      <label>Reason<select value={reason} onChange={event => setReason(event.target.value as Reason)}>{reasons.map(value => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
      <div className="form-actions suppression-submit"><span>Adding a duplicate active suppression is idempotent.</span><button type="submit" disabled={busy || !email.trim()}>Add suppression</button></div>
    </form>
    <div className="suppression-toolbar"><div><h3>Suppression records</h3><p className="helper">Showing newest records in pages of 50; use Load more to continue.</p></div><div className="suppression-filters"><button type="button" className={status === "ACTIVE" ? "selected" : ""} onClick={() => setStatus("ACTIVE")}>Active</button><button type="button" className={status === "RELEASED" ? "selected" : ""} onClick={() => setStatus("RELEASED")}>Released</button></div></div>
    {rows.length === 0 ? <div className="empty-row">{busy ? "Loading records…" : "No records found for this status."}</div> : <div className="table-wrap"><table className="suppression-table"><thead><tr><th>Created</th><th>Reason</th><th>Status</th><th>Source event</th><th>Audit history</th><th>Action</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td>{new Date(row.createdAt).toLocaleString()}</td><td>{row.reason.replaceAll("_", " ")}</td><td><span className={`suppression-status ${row.status.toLowerCase()}`}>{row.status}</span></td><td>{row.sourceEventId || "—"}</td><td><details><summary>{row.auditEvents.length} event(s)</summary><ul>{row.auditEvents.map(event => <li key={event.id}><b>{event.action}</b> · {new Date(event.createdAt).toLocaleString()}{event.reason ? ` · ${event.reason}` : ""}</li>)}</ul>{row.releaseReason && <p>Release: {row.releaseReason}</p>}</details></td><td>{row.status === "ACTIVE" && <button type="button" disabled={busy} onClick={() => { setReleaseId(row.id); setReleaseReason(""); }}>Release</button>}</td></tr>)}</tbody></table></div>}
    {hasMore && <div className="form-actions"><button type="button" disabled={busy || !nextCursor} onClick={() => void load(nextCursor, true)}>Load more</button></div>}
    {releaseId && <form className="release-panel" onSubmit={release}><h3>Release suppression</h3><p className="helper">Provide a reason of at least 8 characters. This action is audited.</p><label>Release reason<textarea required minLength={8} maxLength={500} rows={3} value={releaseReason} onChange={event => setReleaseReason(event.target.value)} /></label><div className="form-actions"><button type="button" disabled={busy} onClick={() => setReleaseId("")}>Cancel</button><button type="submit" disabled={busy || releaseReason.trim().length < 8}>Confirm release</button></div></form>}
    <div className="notice"><b>Policy boundary</b><span>These records suppress email for this school only. Provider-global complaint suppression is separate and cannot be managed here. A provider-native adapter remains deferred until a provider is selected.</span></div>
    <p className="footer-note" role="status" aria-live="polite">{message}</p>
  </section>;
}
