import { CurriculumLessonPlanning } from "./CurriculumLessonPlanning";
import { CurriculumReflectionReviewWorkspace } from "./CurriculumReflectionReviewWorkspace";
import { CurriculumReflectionTasksWorkspace } from "./CurriculumReflectionTasksWorkspace";
import { CurriculumTaskReminderPolicyWorkspace } from "./CurriculumTaskReminderPolicyWorkspace";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSchoolAdminSession } from "./SchoolAdminSession";

type Row = Record<string, unknown>;
const statusOptions = ["DRAFT", "IN_REVIEW", "APPROVED", "ARCHIVED"] as const;

const nextStates: Record<string, string[]> = { DRAFT: ["IN_REVIEW", "ARCHIVED"], IN_REVIEW: ["DRAFT", "APPROVED", "ARCHIVED"], APPROVED: ["IN_REVIEW", "ARCHIVED"], ARCHIVED: ["DRAFT"] };

export function CurriculumOutcomesWorkspace() {
  const session = useSchoolAdminSession();
  const { api, org, school, token, request, can } = session;
  const [versions, setVersions] = useState<Row[]>([]);
  const [grades, setGrades] = useState<Row[]>([]);
  const [subjects, setSubjects] = useState<Row[]>([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [outcomes, setOutcomes] = useState<Row[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterGrade, setFilterGrade] = useState("ALL");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("Select a curriculum version to manage outcomes.");
  const [importCsv, setImportCsv] = useState("");
  const [importPreview, setImportPreview] = useState<Record<string, any> | null>(null);
  const [importSummary, setImportSummary] = useState("");
  const [form, setForm] = useState<Record<string, string>>({ gradeLevelId: "", code: "", title: "", description: "", competencyDomain: "", sourceReference: "", sourceEdition: "", sourceUrl: "", provenanceNote: "" });
  const base = `${api.replace(/\/+$/, "")}/api/v1/curriculum/${encodeURIComponent(org)}/${encodeURIComponent(school)}`;
  const call = useCallback(async (url: string, method = "GET", body?: unknown) => {
    const response = await request(url, { method, headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
    return payload.data;
  }, [request]);

  const loadOutcomes = useCallback(async (versionId = selectedVersion) => {
    if (!token || !versionId) { setOutcomes([]); return; }
    try {
      const query = filterStatus === "ALL" ? "" : `?reviewStatus=${encodeURIComponent(filterStatus)}`;
      const data = await call(`${base}/versions/${encodeURIComponent(versionId)}/outcomes${query}`);
      setOutcomes(Array.isArray(data) ? data : []);
      setMessage(`${Array.isArray(data) ? data.length : 0} outcome(s) loaded.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load outcomes"); }
  }, [token, selectedVersion, filterStatus, call, base]);

  useEffect(() => {
    if (!token || !org || !school) return;
    let cancelled = false;
    (async () => {
      try {
        const [v, g] = await Promise.all([call(`${base}/versions`), call(`${base}/grades`)]);
        if (cancelled) return;
        const versionRows = Array.isArray(v) ? v : [];
        const gradeRows = Array.isArray(g) ? g : [];
        setVersions(versionRows); setGrades(gradeRows);
        if (!selectedVersion && versionRows[0]?.id) setSelectedVersion(String(versionRows[0].id));
      } catch (error) { if (!cancelled) setMessage(error instanceof Error ? error.message : "Unable to load curriculum setup"); }
    })();
    return () => { cancelled = true; };
  }, [token, org, school, base, call]);

  useEffect(() => {
    if (!selectedVersion) { setSubjects([]); setOutcomes([]); return; }
    let cancelled = false;
    void Promise.all([call(`${base}/versions/${encodeURIComponent(selectedVersion)}/subjects`), call(`${base}/versions/${encodeURIComponent(selectedVersion)}/outcomes${filterStatus === "ALL" ? "" : `?reviewStatus=${encodeURIComponent(filterStatus)}`}`)]).then(([s, o]) => {
      if (cancelled) return;
      setSubjects(Array.isArray(s) ? s : []); setOutcomes(Array.isArray(o) ? o : []); setMessage(`${Array.isArray(o) ? o.length : 0} outcome(s) loaded.`);
    }).catch(error => { if (!cancelled) setMessage(error instanceof Error ? error.message : "Unable to load outcomes"); });
    return () => { cancelled = true; };
  }, [selectedVersion, filterStatus, base, call]);

  const filtered = useMemo(() => outcomes.filter(o => filterGrade === "ALL" || String(o.gradeLevelId) === filterGrade), [outcomes, filterGrade]);
  const setField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const canManage = can("academics.manage");
  async function createOutcome(event: React.FormEvent) {
    event.preventDefault(); if (!selectedVersion || !canManage) return;
    setBusy(true);
    try {
      const payload: Record<string, unknown> = { gradeLevelId: form.gradeLevelId, code: form.code.trim(), title: form.title.trim(), provenanceNote: form.provenanceNote.trim(), ...(form.curriculumSubjectId ? { curriculumSubjectId: form.curriculumSubjectId } : {}) };
      for (const key of ["description", "competencyDomain", "sourceReference", "sourceEdition", "sourceUrl"] as const) if (form[key]?.trim()) payload[key] = form[key].trim();
      await call(`${base}/versions/${encodeURIComponent(selectedVersion)}/outcomes`, "POST", payload);
      setForm({ gradeLevelId: "", code: "", title: "", description: "", competencyDomain: "", sourceReference: "", sourceEdition: "", sourceUrl: "", provenanceNote: "" });
      await loadOutcomes(selectedVersion); setMessage("Outcome created successfully.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Outcome creation failed"); }
    finally { setBusy(false); }
  }
  async function review(outcomeId: string, reviewStatus: string) {
    if (!canManage) return;
    setBusy(true);
    try { await call(`${base}/outcomes/${encodeURIComponent(outcomeId)}/review`, "PATCH", { reviewStatus }); await loadOutcomes(selectedVersion); setMessage(`Outcome updated to ${reviewStatus}.`); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Review update failed"); }
    finally { setBusy(false); }
  }
  function beginEdit(outcome: Row) {
    if (!canManage || !["DRAFT", "IN_REVIEW"].includes(String(outcome.reviewStatus))) return;
    setEditing(outcome);
    setEditForm({ gradeLevelId: String(outcome.gradeLevelId || ""), curriculumSubjectId: String(outcome.curriculumSubjectId || ""), code: String(outcome.code || ""), title: String(outcome.title || ""), description: String(outcome.description || ""), competencyDomain: String(outcome.competencyDomain || ""), sourceReference: String(outcome.sourceReference || ""), sourceEdition: String(outcome.sourceEdition || ""), sourceUrl: String(outcome.sourceUrl || ""), provenanceNote: String(outcome.provenanceNote || "") });
  }
  const setEditField = (key: string, value: string) => setEditForm(prev => ({ ...prev, [key]: value }));
  async function saveEdit(event: React.FormEvent) {
    event.preventDefault(); if (!editing || !canManage) return;
    setBusy(true);
    try {
      const payload: Record<string, unknown> = { gradeLevelId: editForm.gradeLevelId, code: editForm.code.trim(), title: editForm.title.trim(), provenanceNote: editForm.provenanceNote.trim(), curriculumSubjectId: editForm.curriculumSubjectId || null };
      for (const key of ["description", "competencyDomain", "sourceReference", "sourceEdition", "sourceUrl"] as const) if (editForm[key]?.trim()) payload[key] = editForm[key].trim();
      await call(`${base}/outcomes/${encodeURIComponent(String(editing.id))}`, "PATCH", payload);
      setEditing(null); setEditForm({}); await loadOutcomes(selectedVersion); setMessage("Outcome changes saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Outcome update failed"); }
    finally { setBusy(false); }
  }
  async function deleteDraft(outcome: Row) {
    if (!canManage || outcome.reviewStatus !== "DRAFT") return;
    if (!window.confirm(`Delete draft outcome ${String(outcome.code || "")}? This cannot be undone.`)) return;
    setBusy(true);
    try { await call(`${base}/outcomes/${encodeURIComponent(String(outcome.id))}`, "DELETE"); if (String(editing?.id) === String(outcome.id)) setEditing(null); await loadOutcomes(selectedVersion); setMessage("Draft outcome deleted."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Outcome deletion failed"); }
    finally { setBusy(false); }
  }
  async function downloadCsv(url: string, filename: string) {
    if (!selectedVersion) return;
    setBusy(true);
    try {
      const response = await request(url, { method: "GET" });
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || `Download failed (${response.status})`); }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = objectUrl; anchor.download = filename; anchor.click(); URL.revokeObjectURL(objectUrl);
    } catch (error) { setMessage(error instanceof Error ? error.message : "CSV download failed"); }
    finally { setBusy(false); }
  }
  async function previewCsv() {
    if (!selectedVersion || !canManage || !importCsv.trim()) return;
    setBusy(true); setImportPreview(null); setImportSummary("");
    try {
      const data = await call(`${base}/versions/${encodeURIComponent(selectedVersion)}/outcomes/import-preview`, "POST", { csvText: importCsv });
      setImportPreview(data || null); setImportSummary(`Preview: ${Number(data?.validCount || 0)} valid, ${Number(data?.invalidCount || 0)} issue(s), ${Number(data?.totalRows || 0)} row(s).`);
    } catch (error) { setImportSummary(error instanceof Error ? error.message : "Import preview failed"); }
    finally { setBusy(false); }
  }
  async function commitImport() {
    if (!selectedVersion || !canManage || !importCsv.trim() || !importPreview || Number(importPreview.invalidCount) !== 0 || Number(importPreview.validCount) === 0) return;
    if (!window.confirm(`Import ${Number(importPreview.validCount)} outcome(s) as DRAFT? This action cannot be undone as a batch.`)) return;
    setBusy(true);
    try {
      const data = await call(`${base}/versions/${encodeURIComponent(selectedVersion)}/outcomes/import`, "POST", { csvText: importCsv });
      setImportSummary(`Imported ${Number(data?.createdCount || 0)} outcome(s). All imported outcomes remain DRAFT.`);
      setImportPreview(null); setImportCsv(""); await loadOutcomes(selectedVersion);
    } catch (error) { setImportSummary(error instanceof Error ? error.message : "Import failed"); }
    finally { setBusy(false); }
  }
  const selectedGradeCode = filterGrade === "ALL" ? "" : String(grades.find(g => String(g.id) === filterGrade)?.code || "");
  const exportQuery = [filterStatus !== "ALL" ? `reviewStatus=${encodeURIComponent(filterStatus)}` : "", selectedGradeCode ? `gradeCode=${encodeURIComponent(selectedGradeCode)}` : ""].filter(Boolean).join("&");
  const outcomesPath = `${base}/versions/${encodeURIComponent(selectedVersion)}/outcomes`;
  const gradeName = (id: unknown) => String(grades.find(g => String(g.id) === String(id))?.name || id || "—");
  const subjectName = (id: unknown) => String(subjects.find(s => String(s.id) === String(id))?.name || "General / no subject");

  return <section className="subsection" style={{ display: "grid", gap: 12 }}>
    <div className="page-heading"><div><h3>Curriculum outcomes & competency mapping</h3><p className="helper">Create school-owned outcomes, attach source provenance, filter by grade/status and move outcomes through the review workflow. No official board content is preloaded.</p></div><button type="button" disabled={busy || !selectedVersion} onClick={() => void loadOutcomes()}>Refresh outcomes</button></div>
    <div className="form-grid"><label>Curriculum version<select value={selectedVersion} onChange={e => { setSelectedVersion(e.target.value); setForm(prev => ({ ...prev, gradeLevelId: "", curriculumSubjectId: "" })); }}><option value="">Select version</option>{versions.map(v => <option key={String(v.id)} value={String(v.id)}>{String(v.name || v.code || v.versionLabel || v.id)} · {String(v.status || "")}</option>)}</select></label><label>Review status filter<select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option>ALL</option>{statusOptions.map(s => <option key={s}>{s}</option>)}</select></label><label>Grade filter<select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}><option value="ALL">All grades</option>{grades.map(g => <option key={String(g.id)} value={String(g.id)}>{String(g.name)} ({String(g.code)})</option>)}</select></label></div>
    <div className="card" style={{ display: "grid", gap: 10, padding: 12 }}><h4>Bulk import / export (CSV)</h4><div className="form-actions"><button type="button" disabled={busy || !selectedVersion} onClick={() => void downloadCsv(`${base}/versions/${encodeURIComponent(selectedVersion)}/outcomes/import-template`, "curriculum-outcomes-import-template.csv")}>Download template</button><button type="button" disabled={busy || !selectedVersion} onClick={() => void downloadCsv(`${outcomesPath}/export${exportQuery ? `?${exportQuery}` : ""}`, `curriculum-outcomes-${selectedVersion}.csv`)}>Export outcomes</button></div>{canManage && <><label>Choose CSV file<input type="file" accept=".csv,text/csv" disabled={busy || !selectedVersion} onChange={async e => { const file = e.currentTarget.files?.[0]; if (!file) return; if (file.size > 1_500_000) { setImportSummary("CSV file must be 1.5 MB or smaller."); return; } setImportCsv(await file.text()); setImportPreview(null); setImportSummary(`Loaded ${file.name} (${file.size} bytes). Preview before importing.`); }} /></label><label>CSV content<textarea rows={5} value={importCsv} onChange={e => { setImportCsv(e.target.value); setImportPreview(null); }} placeholder="Paste CSV content here or select a file above" /></label><div className="form-actions"><button type="button" disabled={busy || !selectedVersion || !importCsv.trim()} onClick={() => void previewCsv()}>{busy ? "Working…" : "Validate / preview"}</button><button type="button" disabled={busy || !importPreview || Number(importPreview.invalidCount) !== 0 || Number(importPreview.validCount) === 0} onClick={() => void commitImport()}>Import valid preview</button></div>{importPreview && <div className="notice"><b>Preview results</b><span>{Number(importPreview.validCount || 0)} valid row(s); {Number(importPreview.invalidCount || 0)} issue(s).</span></div>}{Array.isArray(importPreview?.issues) && importPreview.issues.length > 0 && <div className="table-wrap"><table><thead><tr><th>Row</th><th>Field</th><th>Issue</th></tr></thead><tbody>{importPreview.issues.map((issue: any, index: number) => <tr key={`${issue.row}-${issue.field}-${index}`}><td>{String(issue.row)}</td><td>{String(issue.field)}</td><td>{String(issue.message)}</td></tr>)}</tbody></table></div>}{importPreview && Number(importPreview.invalidCount) === 0 && <p className="helper">All rows validate. Import will create DRAFT outcomes only; it does not approve or review them.</p>}</>}{importSummary && <p className="helper">{importSummary}</p>}</div>
    <OutcomeCoverageDashboard versionId={selectedVersion} base={base} request={request} gradeFilter={filterGrade} reviewFilter={filterStatus} />
    <CurriculumLessonPlanning versionId={selectedVersion} base={base} grades={grades} subjects={subjects} outcomes={outcomes} canManage={canManage} request={request} />
    <CurriculumReflectionReviewWorkspace />
    <CurriculumTaskReminderPolicyWorkspace />
    <CurriculumReflectionTasksWorkspace />
    {canManage ? <form onSubmit={createOutcome} style={{ display: "grid", gap: 10 }}><h4>Create curriculum outcome</h4><div className="form-grid"><label>Grade<select required value={form.gradeLevelId} onChange={e => setField("gradeLevelId", e.target.value)}><option value="">Select grade</option>{grades.map(g => <option key={String(g.id)} value={String(g.id)}>{String(g.name)} ({String(g.code)})</option>)}</select></label><label>Subject (optional)<select value={form.curriculumSubjectId || ""} onChange={e => setField("curriculumSubjectId", e.target.value)}><option value="">General / grade-level</option>{subjects.filter(s => !form.gradeLevelId || String(s.gradeLevelId) === form.gradeLevelId).map(s => <option key={String(s.id)} value={String(s.id)}>{String(s.code || "")} · {String(s.name || "")}</option>)}</select></label><label>Outcome code<input required maxLength={40} value={form.code} onChange={e => setField("code", e.target.value)} placeholder="MATH-G1-001" /></label><label>Competency domain<input maxLength={100} value={form.competencyDomain} onChange={e => setField("competencyDomain", e.target.value)} placeholder="Numeracy / communication…" /></label><label>Outcome title<input required minLength={3} maxLength={180} value={form.title} onChange={e => setField("title", e.target.value)} /></label><label>Source reference<input maxLength={300} value={form.sourceReference} onChange={e => setField("sourceReference", e.target.value)} placeholder="Book, document, chapter, section…" /></label><label>Source edition<input maxLength={100} value={form.sourceEdition} onChange={e => setField("sourceEdition", e.target.value)} placeholder="2026 edition" /></label><label>Source URL<input type="url" maxLength={1000} value={form.sourceUrl} onChange={e => setField("sourceUrl", e.target.value)} /></label></div><label>Description<textarea rows={3} maxLength={4000} value={form.description} onChange={e => setField("description", e.target.value)} /></label><label>Required provenance note<textarea required minLength={3} maxLength={1000} rows={2} value={form.provenanceNote} onChange={e => setField("provenanceNote", e.target.value)} placeholder="How was this outcome sourced, authored or adapted?" /></label><div className="form-actions"><button type="submit" disabled={busy || !selectedVersion || !form.gradeLevelId || !form.code.trim() || form.title.trim().length < 3 || form.provenanceNote.trim().length < 3}>{busy ? "Saving…" : "Create outcome"}</button></div></form> : <p className="helper">You have read-only access. Outcome creation and review require academics.manage.</p>}
    {editing && canManage && <form onSubmit={saveEdit} className="card" style={{ display: "grid", gap: 10, padding: 12 }}><h4>Edit curriculum outcome · {String(editing.code || "")}</h4><div className="form-grid"><label>Grade<select required value={editForm.gradeLevelId} onChange={e => setEditField("gradeLevelId", e.target.value)}><option value="">Select grade</option>{grades.map(g => <option key={String(g.id)} value={String(g.id)}>{String(g.name)} ({String(g.code)})</option>)}</select></label><label>Subject<select value={editForm.curriculumSubjectId} onChange={e => setEditField("curriculumSubjectId", e.target.value)}><option value="">General / grade-level</option>{subjects.filter(s => !editForm.gradeLevelId || String(s.gradeLevelId) === editForm.gradeLevelId).map(s => <option key={String(s.id)} value={String(s.id)}>{String(s.code || "")} · {String(s.name || "")}</option>)}</select></label><label>Code<input required maxLength={40} value={editForm.code} onChange={e => setEditField("code", e.target.value)} /></label><label>Title<input required minLength={3} maxLength={180} value={editForm.title} onChange={e => setEditField("title", e.target.value)} /></label><label>Competency domain<input maxLength={100} value={editForm.competencyDomain} onChange={e => setEditField("competencyDomain", e.target.value)} /></label><label>Source reference<input maxLength={300} value={editForm.sourceReference} onChange={e => setEditField("sourceReference", e.target.value)} /></label><label>Source edition<input maxLength={100} value={editForm.sourceEdition} onChange={e => setEditField("sourceEdition", e.target.value)} /></label><label>Source URL<input type="url" maxLength={1000} value={editForm.sourceUrl} onChange={e => setEditField("sourceUrl", e.target.value)} /></label></div><label>Description<textarea rows={3} maxLength={4000} value={editForm.description} onChange={e => setEditField("description", e.target.value)} /></label><label>Provenance note<textarea required minLength={3} maxLength={1000} rows={2} value={editForm.provenanceNote} onChange={e => setEditField("provenanceNote", e.target.value)} /></label><div className="form-actions"><button type="submit" disabled={busy || !editForm.gradeLevelId || !editForm.code.trim() || editForm.title.trim().length < 3 || editForm.provenanceNote.trim().length < 3}>{busy ? "Saving…" : "Save changes"}</button><button type="button" disabled={busy} onClick={() => { setEditing(null); setEditForm({}); }}>Cancel</button></div></form>}
    <div className="table-wrap"><table><thead><tr><th>Code</th><th>Outcome</th><th>Grade</th><th>Subject</th><th>Domain</th><th>Source / provenance</th><th>Review</th><th>Actions</th></tr></thead><tbody>{filtered.map(o => <tr key={String(o.id)}><td>{String(o.code || "")}</td><td><strong>{String(o.title || "")}</strong><br/><small>{String(o.description || "")}</small></td><td>{gradeName(o.gradeLevelId)}</td><td>{subjectName(o.curriculumSubjectId)}</td><td>{String(o.competencyDomain || "—")}</td><td>{[o.sourceReference, o.sourceEdition, o.sourceUrl, o.provenanceNote].filter(Boolean).map(x => String(x)).join(" · ")}</td><td>{String(o.reviewStatus || "DRAFT")}</td><td>{canManage ? <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{(nextStates[String(o.reviewStatus || "DRAFT")] || []).map(s => <button type="button" key={s} disabled={busy} onClick={() => void review(String(o.id), s)}>{s.replace("_", " ")}</button>)}{["DRAFT", "IN_REVIEW"].includes(String(o.reviewStatus)) && <button type="button" disabled={busy} onClick={() => beginEdit(o)}>Edit</button>}{String(o.reviewStatus) === "DRAFT" && <button type="button" disabled={busy} onClick={() => void deleteDraft(o)}>Delete draft</button>}</div> : "—"}</td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-row">No outcomes match the selected curriculum version and filters.</div>}</div>
    <AssessmentMappingPanel versionId={selectedVersion} outcomes={outcomes} grades={grades} subjects={subjects} canManage={canManage} busy={busy} setBusy={setBusy} base={base} api={api} org={org} school={school} token={token} request={request} />
    <div className="notice"><b>Status</b><span>{message}</span></div>
  </section>;
}

type AssessmentMappingPanelProps = { versionId: string; outcomes: Row[]; grades: Row[]; subjects: Row[]; canManage: boolean; busy: boolean; setBusy: React.Dispatch<React.SetStateAction<boolean>>; base: string; api: string; org: string; school: string; token: string; request: (url: string, init?: RequestInit) => Promise<Response> };
function AssessmentMappingPanel(props: AssessmentMappingPanelProps) {
  const { versionId, outcomes, grades, subjects, canManage, busy, setBusy, base, api, org, school, token, request } = props;
  const [outcomeId, setOutcomeId] = useState("");
  const [exams, setExams] = useState<Row[]>([]);
  const [mappings, setMappings] = useState<Row[]>([]);
  const [mapError, setMapError] = useState("");
  const [mapNotice, setMapNotice] = useState("");
  const selectedOutcome = outcomes.find(o => String(o.id) === outcomeId);
  const subject = subjects.find(s => String(s.id) === String(selectedOutcome?.curriculumSubjectId));
  const compatibleExams = exams.filter(e => String(e.gradeLevelId) === String(selectedOutcome?.gradeLevelId) && (!subject || [String(subject.name || "").trim().toLowerCase(), String(subject.code || "").trim().toLowerCase()].includes(String(e.subjectName || "").trim().toLowerCase())));
  const examLabel = (e: Row) => `${String(e.examName || "Exam")} · ${String(e.subjectName || "Subject")} · ${String(e.examDate || "").slice(0,10)} · ${String(e.status || "")}`;
  const loadMappings = async (id: string) => {
    if (!id) { setMappings([]); return; }
    const r = await request(`${base}/outcomes/${encodeURIComponent(id)}/assessment-mappings`); const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || "Unable to load outcome mappings"); setMappings(Array.isArray(d.data) ? d.data : []);
  };
  useEffect(() => {
    if (!versionId || !token) { setExams([]); return; }
    let cancelled = false;
    void request(`${api.replace(/\/+$/, "")}/api/v1/${encodeURIComponent(org)}/${encodeURIComponent(school)}/exams`).then(async r => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || "Unable to load exams"); if (!cancelled) setExams(Array.isArray(d.data) ? d.data : []); }).catch(e => { if (!cancelled) setMapError(e instanceof Error ? e.message : "Exam loading failed"); });
    return () => { cancelled = true; };
  }, [versionId, token, api, org, school, request]);
  useEffect(() => { if (!outcomeId) { setMappings([]); return; } let cancelled = false; void loadMappings(outcomeId).catch(e => { if (!cancelled) setMapError(e instanceof Error ? e.message : "Unable to load mappings"); }); return () => { cancelled = true; }; }, [outcomeId, base, request]);
  const mapExam = async (examId: string) => { if (!outcomeId || !canManage || !examId) return; setBusy(true); setMapError(""); setMapNotice(""); try { const r = await request(`${base}/outcomes/${encodeURIComponent(outcomeId)}/assessment-mappings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ examId }) }); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || "Unable to map exam"); await loadMappings(outcomeId); setMapNotice("Assessment mapping added."); } catch (e) { setMapError(e instanceof Error ? e.message : "Mapping failed"); } finally { setBusy(false); } };
  const unmap = async (mappingId: string) => { if (!canManage || !window.confirm("Remove this outcome-to-exam mapping?")) return; setBusy(true); setMapError(""); setMapNotice(""); try { const r = await request(`${base}/assessment-mappings/${encodeURIComponent(mappingId)}`, { method: "DELETE" }); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || "Unable to remove mapping"); await loadMappings(outcomeId); setMapNotice("Mapping removed."); } catch (e) { setMapError(e instanceof Error ? e.message : "Remove mapping failed"); } finally { setBusy(false); } };
  return <section className="card" style={{ display: "grid", gap: 10, padding: 12 }}><div><h4>Outcome ↔ assessment alignment</h4><p className="helper">Link curriculum outcomes to school exams. Grade must match; subject-scoped outcomes require an exam subject matching the curriculum subject name or code.</p></div><label>Curriculum outcome<select value={outcomeId} onChange={e => { setOutcomeId(e.target.value); setMapError(""); setMapNotice(""); }} disabled={!versionId}><option value="">Select outcome</option>{outcomes.map(o => <option key={String(o.id)} value={String(o.id)}>{String(o.code || "")} · {String(o.title || "")} · {String(o.reviewStatus || "")}</option>)}</select></label>{selectedOutcome && <><div className="form-grid"><label>Grade<div className="helper">{String(grades.find(g => String(g.id) === String(selectedOutcome.gradeLevelId))?.name || selectedOutcome.gradeLevelId)}</div></label><label>Subject<div className="helper">{subject ? `${String(subject.code || "")} · ${String(subject.name || "")}` : "General / grade-level outcome"}</div></label><label>Available compatible exams<div className="helper">{compatibleExams.length} exam(s)</div></label></div>{canManage && <div className="form-actions"><select aria-label="Select exam to map" id="p416-exam-select" disabled={busy || compatibleExams.length === 0}><option value="">Select compatible exam</option>{compatibleExams.filter(e => !mappings.some(m => String(m.examId) === String(e.id))).map(e => <option key={String(e.id)} value={String(e.id)}>{examLabel(e)}</option>)}</select><button type="button" disabled={busy || !compatibleExams.length} onClick={() => { const select = document.getElementById("p416-exam-select") as HTMLSelectElement | null; if (select?.value) void mapExam(select.value); }}>Add mapping</button></div>}<div><b>Mapped assessments</b>{mappings.length === 0 ? <p className="helper">No assessments mapped to this outcome yet.</p> : <ul>{mappings.map(m => <li key={String(m.id)}>{m.exam ? examLabel(m.exam as Row) : `Exam ${String(m.examId)}`}{canManage && <button type="button" disabled={busy} onClick={() => void unmap(String(m.id))}>Remove</button>}</li>)}</ul>}</div></>}{mapError && <p className="error">{mapError}</p>}{mapNotice && <p className="notice">{mapNotice}</p>}</section>;
}

type CoverageDashboardProps = { versionId: string; base: string; request: (url: string, init?: RequestInit) => Promise<Response>; gradeFilter: string; reviewFilter: string };
function OutcomeCoverageDashboard({ versionId, base, request, gradeFilter, reviewFilter }: CoverageDashboardProps) {
  const [dashboard, setDashboard] = useState<Record<string, any> | null>(null);
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setSubjectFilter("ALL"); }, [versionId, gradeFilter, reviewFilter]);
  useEffect(() => {
    if (!versionId) { setDashboard(null); setError(""); return; }
    let cancelled = false; setBusy(true); setError(""); setDashboard(null);
    const query = [gradeFilter !== "ALL" ? `gradeLevelId=${encodeURIComponent(gradeFilter)}` : "", reviewFilter !== "ALL" ? `reviewStatus=${encodeURIComponent(reviewFilter)}` : "", subjectFilter !== "ALL" ? `curriculumSubjectId=${encodeURIComponent(subjectFilter)}` : ""].filter(Boolean).join("&");
    void request(`${base}/versions/${encodeURIComponent(versionId)}/outcome-assessment-coverage${query ? `?${query}` : ""}`).then(async response => { const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error || `Dashboard request failed (${response.status})`); if (!cancelled) setDashboard(payload.data || null); }).catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : "Coverage dashboard failed to load"); }).finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [versionId, base, request, gradeFilter, reviewFilter, subjectFilter]);
  const summary = dashboard?.summary || {};
  const pct = (value: unknown) => `${Number(value || 0)}%`;
  return <section className="card" style={{ display: "grid", gap: 10, padding: 12 }}>
    <div><h4>Outcome coverage & assessment alignment dashboard</h4><p className="helper">Monitor mapped outcomes, uncovered outcomes, exam alignment and subject coverage for the selected curriculum version. Values update with the grade and review filters above.</p></div>
    <label>Dashboard subject filter<select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} disabled={busy || !versionId}><option value="ALL">All subjects</option>{(dashboard?.bySubject || []).map((row: any) => <option key={String(row.curriculumSubjectId)} value={String(row.curriculumSubjectId)}>{String(row.subjectCode || "")} · {String(row.subjectName || "Subject")}</option>)}</select></label>
    {busy && <p className="helper">Loading coverage…</p>}{error && <p className="error">{error}</p>}
    {!busy && dashboard && <><div className="form-grid">{[["Total outcomes",summary.totalOutcomes],["Mapped",summary.mappedOutcomes],["Unmapped",summary.unmappedOutcomes],["Multi-mapped",summary.multiMappedOutcomes],["Exam mappings",summary.totalMappings],["Coverage",pct(summary.coveragePercent)]].map(([label,value]) => <div key={String(label)} className="card" style={{ padding: 10 }}><strong>{String(value ?? 0)}</strong><div className="helper">{String(label)}</div></div>)}</div>
    <div className="table-wrap"><h5>Grade-wise coverage</h5><table><thead><tr><th>Grade</th><th>Total</th><th>Mapped</th><th>Unmapped</th><th>Exams</th><th>Coverage</th></tr></thead><tbody>{(dashboard.byGrade || []).map((row: any) => <tr key={String(row.gradeLevelId)}><td>{String(row.gradeName)}</td><td>{String(row.totalOutcomes)}</td><td>{String(row.mappedOutcomes)}</td><td>{String(row.unmappedOutcomes)}</td><td>{String(row.mappedExamCount)}</td><td>{pct(row.coveragePercent)}</td></tr>)}</tbody></table>{!(dashboard.byGrade || []).length && <p className="helper">No outcome data for these filters.</p>}</div>
    <div className="table-wrap"><h5>Subject-wise coverage</h5><table><thead><tr><th>Subject</th><th>Grade</th><th>Total</th><th>Mapped</th><th>Unmapped</th><th>Exams</th><th>Coverage</th></tr></thead><tbody>{(dashboard.bySubject || []).map((row: any) => <tr key={String(row.curriculumSubjectId)}><td>{String(row.subjectCode || "")} · {String(row.subjectName)}</td><td>{String(row.gradeLevelId)}</td><td>{String(row.totalOutcomes)}</td><td>{String(row.mappedOutcomes)}</td><td>{String(row.unmappedOutcomes)}</td><td>{String(row.examCount)}</td><td>{pct(row.coveragePercent)}</td></tr>)}</tbody></table>{!(dashboard.bySubject || []).length && <p className="helper">No subject-scoped outcomes under these filters.</p>}</div>
    <div className="table-wrap"><h5>Exam-wise alignment</h5><table><thead><tr><th>Exam</th><th>Subject</th><th>Grade</th><th>Mapped outcomes</th><th>Eligible outcomes</th><th>Coverage</th><th>Status</th></tr></thead><tbody>{(dashboard.byExam || []).map((row: any) => <tr key={String(row.examId)}><td>{String(row.examName)}</td><td>{String(row.subjectName)}</td><td>{String(row.gradeName)}</td><td>{String(row.mappedOutcomeCount)}</td><td>{String(row.eligibleOutcomeCount)}</td><td>{pct(row.coveragePercent)}</td><td>{String(row.examStatus)}</td></tr>)}</tbody></table>{!(dashboard.byExam || []).length && <p className="helper">No exams for the selected grade/filter.</p>}</div>
    <div className="table-wrap"><h5>Unmapped outcomes — action list</h5><table><thead><tr><th>Code</th><th>Outcome</th><th>Grade</th><th>Subject</th><th>Review status</th></tr></thead><tbody>{(dashboard.unmapped || []).map((row: any) => <tr key={String(row.id)}><td>{String(row.code)}</td><td>{String(row.title)}</td><td>{String(row.gradeName)}</td><td>{String(row.subjectName || "General / no subject")}</td><td>{String(row.reviewStatus)}</td></tr>)}</tbody></table>{!(dashboard.unmapped || []).length && <p className="helper">All outcomes in this filtered set have at least one assessment mapping.</p>}</div>
    <div className="table-wrap"><h5>Outcomes mapped to multiple exams</h5><table><thead><tr><th>Code</th><th>Outcome</th><th>Grade</th><th>Mapping count</th></tr></thead><tbody>{(dashboard.multiMapped || []).map((row: any) => <tr key={String(row.id)}><td>{String(row.code)}</td><td>{String(row.title)}</td><td>{String(row.gradeName)}</td><td>{String(row.mappingCount)}</td></tr>)}</tbody></table>{!(dashboard.multiMapped || []).length && <p className="helper">No outcomes are mapped to multiple exams.</p>}</div></>}
  </section>;
}
