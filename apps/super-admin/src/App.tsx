import { FormEvent, useState } from "react";

type Summary = { organizations: number; schools: number; users: number; suspendedOrganizations: number };
type Organization = { id: string; name: string; slug: string; country: string; timezone?: string; isActive: boolean; createdAt: string };
type PageInfo = { page: number; pageSize: number; total: number; pages: number };
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

export default function App() {
  const [token, setToken] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 20, total: 0, pages: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orgSaving, setOrgSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", country: "IN", timezone: "Asia/Kolkata" });

  async function load(nextPage = 1, nextSearch = search) {
    if (!token.trim()) return;
    setLoading(true); setError(""); setNotice("");
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const query = new URLSearchParams({ page: String(nextPage), pageSize: "20" });
      if (nextSearch.trim()) query.set("search", nextSearch.trim());
      const [dashboardResponse, orgResponse] = await Promise.all([
        fetch(`${API_BASE}/platform/dashboard`, { headers }),
        fetch(`${API_BASE}/platform/organizations?${query}`, { headers })
      ]);
      if (!dashboardResponse.ok || !orgResponse.ok) throw new Error("Platform administrator sign-in is required, or the request failed.");
      const dashboard = await dashboardResponse.json();
      const orgs = await orgResponse.json();
      setSummary(dashboard.data);
      setOrganizations(orgs.data ?? []);
      setPageInfo(orgs.pagination ?? { page: nextPage, pageSize: 20, total: (orgs.data ?? []).length, pages: 1 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load platform data");
    } finally { setLoading(false); }
  }

  function applySearch(e: FormEvent) { e.preventDefault(); setSearch(searchInput.trim()); load(1, searchInput.trim()); }

  async function createOrganization(e: FormEvent) {
    e.preventDefault(); setError(""); setNotice(""); setOrgSaving(true);
    try {
      const response = await fetch(`${API_BASE}/platform/organizations`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, name: form.name.trim(), slug: form.slug.trim().toLowerCase(), country: form.country.trim().toUpperCase() })
      });
      if (!response.ok) throw new Error(response.status === 400 ? "Please check the organization details (name, slug, country code, and timezone)." : "Unable to create organization.");
      setNotice("Organization created successfully."); setForm({ name: "", slug: "", country: "IN", timezone: "Asia/Kolkata" }); setShowCreate(false);
      await load(1, search);
    } catch (e) { setError(e instanceof Error ? e.message : "Organization creation failed"); }
    finally { setOrgSaving(false); }
  }

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div><h1>School SaaS · Platform Console</h1><p>Platform operations and tenant administration</p></div><span>Super Admin</span>
      </header>
      <section style={{ margin: "24px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input aria-label="Access token" placeholder="Paste platform admin access token" value={token} onChange={e => setToken(e.target.value)} style={{ flex: 1, minWidth: 240, padding: 12 }} />
        <button onClick={() => load(1)} disabled={!token.trim() || loading}>{loading ? "Loading…" : "Load console"}</button>
      </section>
      {error && <p role="alert" style={{ color: "#a83232", background: "#fde8e8", padding: 12, borderRadius: 8 }}>{error}</p>}
      {notice && <p role="status" style={{ color: "#176b37", background: "#e4f5ea", padding: 12, borderRadius: 8 }}>{notice}</p>}
      {summary && <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        {Object.entries(summary).map(([key, value]) => <article key={key} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}><strong>{value}</strong><p>{key.replace(/[A-Z]/g, m => ` ${m.toLowerCase()}`)}</p></article>)}
      </section>}
      <section style={{ marginTop: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}><h2>Organizations</h2><button onClick={() => setShowCreate(v => !v)} disabled={!summary}>{showCreate ? "Cancel" : "Create organization"}</button></div>
        {showCreate && <form onSubmit={createOrganization} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <h3>Create organization</h3><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
            <label>Organization name<input required minLength={2} maxLength={160} value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} /></label>
            <label>Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} value={form.slug} onChange={e => setForm(v => ({ ...v, slug: e.target.value.toLowerCase() }))} /></label>
            <label>Country (ISO 2-letter)<input required minLength={2} maxLength={2} value={form.country} onChange={e => setForm(v => ({ ...v, country: e.target.value.toUpperCase() }))} /></label>
            <label>Timezone<input required minLength={3} maxLength={80} value={form.timezone} onChange={e => setForm(v => ({ ...v, timezone: e.target.value }))} /></label>
          </div><button type="submit" disabled={orgSaving}>{orgSaving ? "Saving…" : "Create"}</button>
        </form>}
        <form onSubmit={applySearch} style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
          <input placeholder="Search organization name or slug" aria-label="Search organizations" value={searchInput} onChange={e => setSearchInput(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
          <button type="submit" disabled={loading}>Search</button><button type="button" onClick={() => { setSearchInput(""); setSearch(""); load(1, ""); }} disabled={loading} style={{ background: "#e8edf4", color: "#25364d" }}>Clear</button>
        </form>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">Name</th><th align="left">Slug</th><th align="left">Country</th><th align="left">Status</th></tr></thead><tbody>
          {organizations.map(org => <tr key={org.id}><td>{org.name}</td><td>{org.slug}</td><td>{org.country}</td><td>{org.isActive ? "Active" : "Inactive"}</td></tr>)}
        </tbody></table></div>
        {!loading && !organizations.length && summary && <p>{search ? `No organizations match “${search}”.` : "No organizations found."}</p>}
        {loading && <p role="status">Loading organizations…</p>}
        {pageInfo.pages > 1 && <nav aria-label="Organization pagination" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <span>Showing page {pageInfo.page} of {pageInfo.pages} · {pageInfo.total} organizations</span><div>
            <button type="button" onClick={() => load(pageInfo.page - 1)} disabled={loading || pageInfo.page <= 1}>Previous</button>
            <button type="button" onClick={() => load(pageInfo.page + 1)} disabled={loading || pageInfo.page >= pageInfo.pages}>Next</button>
          </div>
        </nav>}
      </section>
    </main>
  );
}
