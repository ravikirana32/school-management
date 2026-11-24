import React, { useCallback, useEffect, useState } from "react";
import { useSchoolAdminSession } from "./SchoolAdminSession";

type BrandState = { url: string; mimeType: string; sizeBytes: string } | null;
export function SchoolBrandWorkspace() {
  const { api, org, school, can, request } = useSchoolAdminSession();
  const [brand, setBrand] = useState<BrandState>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const prefix = `${api}/api/v1/${encodeURIComponent(org)}/${encodeURIComponent(school)}`;
  const canManage = can("school.settings.manage");
  const load = useCallback(async () => {
    if (!org || !school) return;
    const response = await request(`${prefix}/school-brand/logo`);
    if (response.status === 404) { setBrand(null); return; }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Unable to load school logo");
    setBrand(data.data);
  }, [org, school, prefix, request]);
  useEffect(() => { void load().catch(e => setError(e instanceof Error ? e.message : "Unable to load branding")); }, [load]);
  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;
    if (!canManage) { setError("School settings permission is required."); return; }
    if (!(["image/png", "image/jpeg"].includes(file.type)) || file.size > 5 * 1024 * 1024) { setError("Choose a PNG or JPEG image no larger than 5 MB."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const start = await request(`${prefix}/school-brand/logo/upload`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mimeType: file.type, sizeBytes: file.size }) });
      const started = await start.json().catch(() => ({}));
      if (!start.ok) throw new Error(started.error || "Unable to start logo upload");
      const form = new FormData();
      for (const [key, value] of Object.entries(started.data.upload.fields as Record<string, string>)) form.append(key, value);
      form.append("file", file);
      const stored = await fetch(started.data.upload.url, { method: "POST", body: form });
      if (!stored.ok) throw new Error(`Private storage upload failed (${stored.status})`);
      const completed = await request(`${prefix}/school-brand/logo/${started.data.assetId}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const result = await completed.json().catch(() => ({}));
      if (!completed.ok) throw new Error(result.error || "Unable to complete logo upload");
      setNotice("Logo uploaded to quarantine. It becomes active only after the malware scanner approves it; refresh after scanning.");
      setFile(null);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Logo upload failed"); }
    finally { setBusy(false); }
  };
  return <section className="config-card" style={{ display: "grid", gap: 16 }}>
    <div><h2>School branding</h2><p className="helper">Manage the private school logo used in report cards. Uploaded assets remain quarantined until the malware scanner marks them clean.</p></div>
    {brand ? <div className="notice" style={{ display: "flex", alignItems: "center", gap: 16 }}><img src={brand.url} alt="Current school logo" style={{ maxWidth: 180, maxHeight: 100, objectFit: "contain" }} /><span>Approved logo · {brand.mimeType} · {(Number(brand.sizeBytes) / 1024).toFixed(1)} KB</span></div> : <p className="helper">No approved school logo is currently configured.</p>}
    {canManage ? <form onSubmit={upload} style={{ display: "grid", gap: 10 }}><label>Upload replacement logo (PNG/JPEG, max 5 MB)<input type="file" accept="image/png,image/jpeg" onChange={e => setFile(e.target.files?.[0] || null)} /></label><button disabled={busy || !file}>{busy ? "Uploading…" : "Upload logo for security review"}</button></form> : <p className="helper">You need school.settings.manage permission to change branding.</p>}
    <div className="form-actions"><button type="button" disabled={busy} onClick={() => void load().catch(e => setError(e.message))}>Refresh approved logo</button><span className="helper">Previous logo assets are retained; no destructive cleanup is enabled.</span></div>
    {error && <p className="error" role="alert">{error}</p>}{notice && <p className="notice" role="status">{notice}</p>}
  </section>;
}
