import React, { useCallback, useEffect, useState } from "react";

type Campus = { id: string; campusCode: string; name: string; description?: string | null; status: "ACTIVE" | "INACTIVE"; isMain: boolean; createdAt?: string; updatedAt?: string };
const blank = { campusCode: "", name: "", description: "", status: "ACTIVE" as const, isMain: false };

export function CampusRegistryWorkspace({ apiBase, organizationId, schoolId, token }: { apiBase: string; organizationId: string; schoolId: string; token: string }) {
  const base = `${apiBase.replace(/\/+$/, "")}/api/v1/schools/${encodeURIComponent(organizationId)}/${encodeURIComponent(schoolId)}/campus-registry`;
  const [rows, setRows] = useState<Campus[]>([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const request = useCallback(async (url = base, init: RequestInit = {}) => {
    const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init.headers } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
    return payload.data;
  }, [base, token]);
  const load = useCallback(async () => { setBusy(true); setError(""); try { const data = await request(); setRows(Array.isArray(data) ? data : []); } catch (e: any) { setError(e?.message || "Unable to load campus registry"); } finally { setBusy(false); } }, [request]);
  useEffect(() => { void load(); }, [load]);
  function startEdit(row: Campus) { setEditingId(row.id); setForm({ campusCode: row.campusCode, name: row.name, description: row.description || "", status: row.status, isMain: row.isMain }); setNotice(""); }
  function resetForm() { setEditingId(null); setForm(blank); }
  async function save(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(""); setNotice(""); try { const url = editingId ? `${base}/${encodeURIComponent(editingId)}` : base; await request(url, { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) }); setNotice(editingId ? "Campus updated successfully." : "Campus created successfully."); resetForm(); const data = await request(); setRows(Array.isArray(data) ? data : []); } catch (e: any) { setError(e?.message || "Save failed"); } finally { setBusy(false); } }
  async function archive(row: Campus) { if (!window.confirm(`Archive campus ${row.name} (${row.campusCode})?`)) return; setBusy(true); setError(""); setNotice(""); try { await request(`${base}/${encodeURIComponent(row.id)}`, { method: "DELETE" }); setNotice(`Campus ${row.name} archived.`); if (editingId === row.id) resetForm(); const data = await request(); setRows(Array.isArray(data) ? data : []); } catch (e: any) { setError(e?.message || "Archive failed"); } finally { setBusy(false); } }
  return <section style={{ display: "grid", gap: 14, maxWidth: 1120 }}>
    <header><h2>Campus Registry</h2><p>Manage active campuses for this school. Campus codes are unique within the school. Main campus designation is maintained by the API.</p></header>
    {error && <div role="alert" style={{ border: "1px solid #c66", borderRadius: 8, padding: 10 }}>{error}</div>}
    {notice && <div role="status" style={{ border: "1px solid #6a9", borderRadius: 8, padding: 10 }}>{notice}</div>}
    <form onSubmit={save} style={{ display: "grid", gap: 10, border: "" }}>
      <fieldset style={{ display: "grid", gap: 10 }}><legend>{editingId ? "Edit campus" : "Register campus"}</legend>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
          <label style={{ display: "grid", gap: 4 }}>Campus code<input maxLength={40} required value={form.campusCode} onChange={e => setForm(v => ({ ...v, campusCode: e.target.value }))} placeholder="e.g. MAIN" /></label>
          <label style={{ display: "grid", gap: 4 }}>Campus name<input maxLength={160} required value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} placeholder="e.g. Central Campus" /></label>
          <label style={{ display: "grid", gap: 4 }}>Status<select value={form.status} onChange={e => setForm(v => ({ ...v, status: e.target.value as "ACTIVE" | "INACTIVE" }))}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
        </div>
        <label style={{ display: "grid", gap: 4 }}>Description<textarea maxLength={500} rows={2} value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} placeholder="Optional details" /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" checked={form.isMain} onChange={e => setForm(v => ({ ...v, isMain: e.target.checked }))} /> Designate as main campus</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button disabled={busy || !form.campusCode.trim() || !form.name.trim()} type="submit">{busy ? "Saving…" : editingId ? "Save campus" : "Create campus"}</button>{editingId && <button type="button" disabled={busy} onClick={resetForm}>Cancel edit</button>}<button type="button" disabled={busy} onClick={() => void load()}>Refresh list</button></div>
      </fieldset>
    </form>
    <div><h3>Registered campuses ({rows.length})</h3>{busy && !rows.length ? <p>Loading campuses…</p> : rows.length === 0 ? <p>No campuses registered yet.</p> : <div style={{ display: "grid", gap: 8 }}>{rows.map(row => <article key={row.id} style={{ border: "1px solid var(--border,#ddd)", borderRadius: 10, padding: 12, display: "grid", gap: 8 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}><div><strong>{row.name}</strong> <span style={{ opacity: .7 }}>({row.campusCode})</span>{row.isMain && <span style={{ marginLeft: 8, padding: "2px 7px", borderRadius: 20, background: "#e7f5eb", color: "#28623a", fontSize: 12 }}>Main campus</span>}</div><span>{row.status}</span></div>{row.description && <p style={{ margin: 0 }}>{row.description}</p>}<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button type="button" disabled={busy} onClick={() => startEdit(row)}>Edit</button><button type="button" disabled={busy} onClick={() => void archive(row)}>Archive</button></div></article>)}</div>}</div>
    <small>Campus records are school-scoped. Archived campuses are excluded from this list and cannot be used for new inheritance configuration.</small>
  </section>;
}
