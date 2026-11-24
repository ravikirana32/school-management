import React, { useCallback, useEffect, useState } from "react";
import { useSchoolAdminSession } from "./SchoolAdminSession";

type FinanceConfig = {
  currency: string;
  feeCategories: { code: string; label: string; active: boolean }[];
  paymentMethods: { code: string; label: string; enabled: boolean }[];
  invoicePrefix: string;
  receiptPrefix: string;
  requireReferenceForNonCash: boolean;
};
const defaults: FinanceConfig = {
  currency: "INR",
  feeCategories: [
    { code: "TUITION", label: "Tuition Fee", active: true },
    { code: "ADMISSION", label: "Admission Fee", active: true },
    { code: "TRANSPORT", label: "Transport Fee", active: true },
    { code: "BOOKS", label: "Books & Materials", active: true },
    { code: "UNIFORM", label: "Uniform Fee", active: true },
    { code: "EXAM", label: "Examination Fee", active: true },
    { code: "OTHER", label: "Other Fee", active: true }
  ],
  paymentMethods: [
    { code: "CASH", label: "Cash", enabled: true },
    { code: "UPI", label: "UPI", enabled: true },
    { code: "BANK_TRANSFER", label: "Bank Transfer", enabled: true },
    { code: "CHEQUE", label: "Cheque", enabled: true },
    { code: "CARD", label: "Card", enabled: true },
    { code: "OTHER", label: "Other", enabled: true }
  ],
  invoicePrefix: "INV", receiptPrefix: "RCT", requireReferenceForNonCash: true
};
export function FinanceConfigurationWorkspace() {
  const session = useSchoolAdminSession();
  const { api, org, school, token, request, can } = session;
  const endpoint = `${api.replace(/\/+$/, "")}/api/v1/finance/${encodeURIComponent(org)}/${encodeURIComponent(school)}/configuration`;
  const [config, setConfig] = useState<FinanceConfig>(defaults);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newCategory, setNewCategory] = useState({ code: "", label: "" });
  const [newMethod, setNewMethod] = useState({ code: "", label: "" });
  const call = useCallback(async (method = "GET", body?: unknown) => {
    const response = await request(endpoint, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
    return payload.data;
  }, [endpoint, request]);
  const load = useCallback(async () => {
    if (!token || !org || !school || !can("fees.read")) return;
    setBusy(true); setError("");
    try { const result = await call(); setConfig(result?.configuration || defaults); setVersion(Number(result?.version || 0)); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load finance configuration"); }
    finally { setBusy(false); }
  }, [token, org, school, call, can]);
  useEffect(() => { void load(); }, [load]);
  const save = async () => {
    setBusy(true); setError(""); setMessage("");
    try { const result = await call("PUT", config); setConfig(result.configuration); setVersion(Number(result.version || 0)); setMessage(`Finance settings saved (version ${result.version}).`); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to save finance settings"); }
    finally { setBusy(false); }
  };
  function addCategory() {
    const code = newCategory.code.trim().toUpperCase(); const label = newCategory.label.trim();
    if (!code || !label || config.feeCategories.some(item => item.code.toUpperCase() === code)) return;
    setConfig(value => ({ ...value, feeCategories: [...value.feeCategories, { code, label, active: true }] })); setNewCategory({ code: "", label: "" });
  }
  function addMethod() {
    const code = newMethod.code.trim().toUpperCase(); const label = newMethod.label.trim();
    if (!code || !label || config.paymentMethods.some(item => item.code.toUpperCase() === code)) return;
    setConfig(value => ({ ...value, paymentMethods: [...value.paymentMethods, { code, label, enabled: true }] })); setNewMethod({ code: "", label: "" });
  }
  return <section className="config-card"><h2>Finance configuration</h2><p className="helper">School-scoped finance defaults used as the foundation for fee structures, billing, collection and receipts. Version {version || "unsaved"}.</p>
    {!can("fees.read") ? <p className="notice">You need fees.read permission to view finance configuration.</p> : !can("fees.manage") ? <p className="notice">You need fees.manage permission to update these settings.</p> : null}
    {error ? <p role="alert" className="error-message">{error}</p> : null}{message ? <p className="notice">{message}</p> : null}
    <div className="form-grid">
      <label>Default currency (ISO 4217)<input maxLength={3} value={config.currency} onChange={e => setConfig(v => ({ ...v, currency: e.target.value.toUpperCase() }))} /></label>
      <label>Invoice prefix<input maxLength={12} value={config.invoicePrefix} onChange={e => setConfig(v => ({ ...v, invoicePrefix: e.target.value.toUpperCase() }))} /></label>
      <label>Receipt prefix<input maxLength={12} value={config.receiptPrefix} onChange={e => setConfig(v => ({ ...v, receiptPrefix: e.target.value.toUpperCase() }))} /></label>
    </div>
    <label className="check-line"><input type="checkbox" checked={config.requireReferenceForNonCash} onChange={e => setConfig(v => ({ ...v, requireReferenceForNonCash: e.target.checked }))} /> Require transaction reference for non-cash payments</label>
    <div className="subsection"><h3>Fee categories</h3><p className="helper">Codes are stable identifiers. Inactive categories are retained for historical records.</p>
      <div className="grade-list">{config.feeCategories.map((category, index) => <div className="grade-row" key={category.code}><b>{category.label}</b><small>{category.code}</small><label className="check-line"><input type="checkbox" checked={category.active} onChange={e => setConfig(v => ({ ...v, feeCategories: v.feeCategories.map((item, i) => i === index ? { ...item, active: e.target.checked } : item) }))} /> Active</label></div>)}</div>
      <div className="form-grid"><label>Category code<input value={newCategory.code} onChange={e => setNewCategory(v => ({ ...v, code: e.target.value.toUpperCase() }))} placeholder="ACTIVITY" maxLength={24}/></label><label>Category label<input value={newCategory.label} onChange={e => setNewCategory(v => ({ ...v, label: e.target.value }))} placeholder="Activity fee" maxLength={80}/></label></div><button type="button" disabled={!newCategory.code.trim()||!newCategory.label.trim()} onClick={addCategory}>Add fee category</button>
    </div>
    <div className="subsection"><h3>Payment methods</h3><div className="grade-list">{config.paymentMethods.map((method, index) => <div className="grade-row" key={method.code}><b>{method.label}</b><small>{method.code}</small><label className="check-line"><input type="checkbox" checked={method.enabled} onChange={e => setConfig(v => ({ ...v, paymentMethods: v.paymentMethods.map((item, i) => i === index ? { ...item, enabled: e.target.checked } : item) }))} /> Enabled</label></div>)}</div>
      <div className="form-grid"><label>Method code<input value={newMethod.code} onChange={e => setNewMethod(v => ({ ...v, code: e.target.value.toUpperCase() }))} placeholder="WALLET" maxLength={24}/></label><label>Method label<input value={newMethod.label} onChange={e => setNewMethod(v => ({ ...v, label: e.target.value }))} placeholder="Wallet" maxLength={60}/></label></div><button type="button" disabled={!newMethod.code.trim()||!newMethod.label.trim()} onClick={addMethod}>Add payment method</button>
    </div>
    <div className="form-actions"><span>Persisted per organization and school · audit logged</span><button type="button" disabled={busy||!can("fees.manage")||!can("fees.read")} onClick={() => void save()}>{busy ? "Saving…" : "Save finance configuration"}</button><button type="button" disabled={busy} onClick={() => void load()}>Reload</button></div>
  </section>;
}
