import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSchoolAdminSession } from "./SchoolAdminSession";

type ChecklistItem = { key: string; title: string; description: string; remediation?: string; complete: boolean; actionTab: "profile" | "academic" | "calendar" | "working" | "policies" | "curriculum" | "timetable" | "fees"; prerequisites: string[] };

/** Parse RFC-4180-style CSV fields, including quoted commas, escaped quotes and line breaks. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let field = ""; let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '\"' && text[index + 1] === '\"') { field += '\"'; index++; }
      else if (char === '\"') quoted = false;
      else field += char;
    } else if (char === '\"' && field.length === 0) quoted = true;
    else if (char === ',') { row.push(field); field = ""; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index++;
      row.push(field); field = "";
      if (row.some(cell => cell.trim() !== "")) rows.push(row);
      row = [];
    } else field += char;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted field.");
  row.push(field); if (row.some(cell => cell.trim() !== "")) rows.push(row);
  return rows;
}

export function OnboardingWorkspace({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { api, token, org, school, request, userEmail } = useSchoolAdminSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [serverNextIncompleteKey, setServerNextIncompleteKey] = useState<string | null>(null);
  const [focusedStep, setFocusedStep] = useState(0);
  const [restoredProgressKey, setRestoredProgressKey] = useState("");
  const [assignmentMembers, setAssignmentMembers] = useState<Array<{id:string;displayName:string;email:string}>>([]);
  const [assignmentMap, setAssignmentMap] = useState<Record<string,string>>({});
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentErrors, setAssignmentErrors] = useState<Record<string, string>>({});
  const [savingAssignments, setSavingAssignments] = useState<Record<string, boolean>>({});
  const [assignmentSaveStatus, setAssignmentSaveStatus] = useState<Record<string, "saved" | "">>({});
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "mine" | "unassigned">("all");
  const [bulkPreview, setBulkPreview] = useState<Array<{taskKey:string;email:string;userId:string;valid:boolean;message:string}>>([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const progressKey = useMemo(() => org && school ? `school-onboarding-step:v1:${org}:${school}` : "", [org, school]);

  const load = useCallback(async () => {
    // Readiness data is school-scoped. Clear the previous scope immediately, including
    // when the session temporarily has no selected school, to prevent stale checklist UI.
    setItems([]); setLastUpdated(null); setServerNextIncompleteKey(null);
    if (!token || !org || !school) { setLoading(false); setError(""); return; }
    setLoading(true); setError("");
    // Clear tenant-scoped assignment data before loading the new school so stale
    // owners/status/errors from the previous scope are never shown during refresh.
    setAssignmentMembers([]); setAssignmentMap({}); setAssignmentError("");
    setAssignmentErrors({}); setAssignmentSaveStatus({}); setSavingAssignments({});
    const base = api.replace(/\/+$/, "");
    const prefix = `${base}/api/v1/schools/${encodeURIComponent(org)}/${encodeURIComponent(school)}`;
    const read = async (path: string) => {
      const response = await request(`${prefix}${path}`);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Readiness request failed (${response.status})`);
      return payload.data;
    };
    try {
      const readiness = await read("/readiness");
      const serverProgress = await read("/onboarding-progress").catch(() => null);
      const assignments = await read("/onboarding-assignments").catch(() => null);
      if (Array.isArray(assignments?.members)) setAssignmentMembers(assignments.members);
      if (Array.isArray(assignments?.assignments)) setAssignmentMap(Object.fromEntries(assignments.assignments.map((row: any) => [row.taskKey, row.assignedToUserId])));
      setAssignmentError(assignments ? "" : "Task assignments are unavailable for this account or API version.");
      const serverStepKey = typeof serverProgress?.currentStepKey === "string" ? serverProgress.currentStepKey : null;
      const checkMap = new Map((Array.isArray(readiness?.checks) ? readiness.checks : []).map((check: any) => [check.key, check]));
      const isComplete = (key: string) => Boolean(checkMap.get(key)?.complete);
      const details = (key: string) => checkMap.get(key) || {};
      const prerequisites = (key: string, fallback: string[]) => Array.isArray(details(key).prerequisites) ? details(key).prerequisites : fallback;
      setServerNextIncompleteKey(typeof readiness?.nextIncompleteKey === "string" ? readiness.nextIncompleteKey : null);
      setItems([
        { key: "profile", title: "Complete school identity", description: details("profile").description || "Display and legal name, location and school identity details.", remediation: details("profile").remediation, complete: isComplete("profile"), actionTab: "profile", prerequisites: prerequisites("profile", []) },
        { key: "board-profile", title: "Set board affiliation", description: details("board-profile").description || "Select the school's board or curriculum framework.", remediation: details("board-profile").remediation, complete: isComplete("board-profile"), actionTab: "curriculum", prerequisites: prerequisites("board-profile", ["profile"]) },
        { key: "academic-year", title: "Set an active academic year", description: details("academic-year").description || "Create and activate the current academic year.", remediation: details("academic-year").remediation, complete: isComplete("academic-year"), actionTab: "academic", prerequisites: prerequisites("academic-year", ["profile"]) },
        { key: "terms", title: "Configure academic terms", description: details("terms").description || "Add at least one term to an academic year.", remediation: details("terms").remediation, complete: isComplete("terms"), actionTab: "academic", prerequisites: prerequisites("terms", ["academic-year"]) },
        { key: "grade-levels", title: "Configure grade levels", description: details("grade-levels").description || "Create the school's active grade or level list.", remediation: details("grade-levels").remediation, complete: isComplete("grade-levels"), actionTab: "curriculum", prerequisites: prerequisites("grade-levels", ["board-profile"]) },
        { key: "rooms", title: "Configure rooms and resources", description: details("rooms").description || "Create at least one active room or classroom resource.", remediation: details("rooms").remediation, complete: isComplete("rooms"), actionTab: "timetable", prerequisites: prerequisites("rooms", ["profile", "grade-levels"]) },
        { key: "fee-structures", title: "Publish a fee structure", description: details("fee-structures").description || "Publish a fee structure for the current academic year or school-wide.", remediation: details("fee-structures").remediation, complete: isComplete("fee-structures"), actionTab: "fees", prerequisites: prerequisites("fee-structures", ["academic-year", "grade-levels"]) },
        { key: "calendar", title: "Create the default calendar", description: details("calendar").description || "Ensure a school calendar exists and is marked default.", remediation: details("calendar").remediation, complete: isComplete("calendar"), actionTab: "calendar", prerequisites: prerequisites("calendar", ["profile", "academic-year"]) },
        { key: "working-days", title: "Set school working days", description: details("working-days").description || "Configure weekly operating days and timings.", remediation: details("working-days").remediation, complete: isComplete("working-days"), actionTab: "working", prerequisites: prerequisites("working-days", ["profile"]) },
        { key: "attendance-policy", title: "Configure attendance policy", description: details("attendance-policy").description || "Review and save the school's attendance rules.", remediation: details("attendance-policy").remediation, complete: isComplete("attendance-policy"), actionTab: "policies", prerequisites: prerequisites("attendance-policy", ["profile", "academic-year"]) },
        { key: "grading-policy", title: "Configure grading policy", description: details("grading-policy").description || "Set grading scale, passing threshold and precision.", remediation: details("grading-policy").remediation, complete: isComplete("grading-policy"), actionTab: "policies", prerequisites: prerequisites("grading-policy", ["profile", "academic-year", "grade-levels"]) }
      ]);
      if (serverStepKey) { const stepIndex = ["profile", "board-profile", "academic-year", "terms", "grade-levels", "rooms", "fee-structures", "calendar", "working-days", "attendance-policy", "grading-policy"].indexOf(serverStepKey); if (stepIndex >= 0) setFocusedStep(stepIndex); }
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load school onboarding readiness.");
    } finally { setLoading(false); }
  }, [api, token, org, school, request]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!progressKey) { setRestoredProgressKey(""); return; }
    let restored = 0;
    try {
      const raw = window.localStorage.getItem(progressKey);
      if (raw !== null) {
        const parsed = Number(raw);
        if (Number.isInteger(parsed) && parsed >= 0) restored = parsed;
      }
    } catch { /* Storage may be unavailable; the wizard remains usable in memory. */ }
    setFocusedStep(restored);
    setRestoredProgressKey(progressKey);
  }, [progressKey]);
  useEffect(() => {
    if (!progressKey || restoredProgressKey !== progressKey || !Number.isInteger(focusedStep) || focusedStep < 0) return;
    try { window.localStorage.setItem(progressKey, String(focusedStep)); } catch { /* Storage may be unavailable; progress remains in memory. */ }
  }, [focusedStep, progressKey, restoredProgressKey]);
  const completeCount = useMemo(() => items.filter(item => item.complete).length, [items]);
  const currentMemberId = useMemo(() => assignmentMembers.find(member => member.email.toLowerCase() === userEmail.toLowerCase())?.id ?? "", [assignmentMembers, userEmail]);
  const filteredItems = useMemo(() => items.filter(item => { const owner = assignmentMap[item.key] || ""; if (assignmentFilter === "mine") return Boolean(currentMemberId && owner === currentMemberId); if (assignmentFilter === "unassigned") return !owner; return true; }), [items, assignmentMap, assignmentFilter, currentMemberId]);
  const percent = items.length ? Math.round(completeCount / items.length * 100) : 0;
  const currentStep = items[Math.min(focusedStep, Math.max(items.length - 1, 0))];
  useEffect(() => {
    if (!token || !org || !school || !items.length || !currentStep) return;
    const base = api.replace(/\/+$/, "");
    const url = `${base}/api/v1/schools/${encodeURIComponent(org)}/${encodeURIComponent(school)}/onboarding-progress`;
    void request(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentStepKey: currentStep.key }) }).catch(() => { /* Local resume fallback remains active when API save is unavailable. */ });
  }, [api, token, org, school, focusedStep, items, currentStep, request]);
  const saveAssignment = async (taskKey: string, assignedToUserId: string) => {
    if (!token || !org || !school) return;
    setSavingAssignments(previous => ({ ...previous, [taskKey]: true })); setAssignmentErrors(previous => ({ ...previous, [taskKey]: "" })); setAssignmentSaveStatus(previous => ({ ...previous, [taskKey]: "" }));
    try {
      const base = api.replace(/\/+$/, "");
      const url = `${base}/api/v1/schools/${encodeURIComponent(org)}/${encodeURIComponent(school)}/onboarding-assignments/${encodeURIComponent(taskKey)}`;
      const response = await request(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignedToUserId: assignedToUserId || null }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Assignment save failed (${response.status})`);
      setAssignmentMap(previous => { const next = { ...previous }; if (assignedToUserId) next[taskKey] = assignedToUserId; else delete next[taskKey]; return next; });
      setAssignmentSaveStatus(previous => ({ ...previous, [taskKey]: "saved" })); setAssignmentErrors(previous => ({ ...previous, [taskKey]: "" }));
    } catch (e) { setAssignmentSaveStatus(previous => ({ ...previous, [taskKey]: "" })); setAssignmentErrors(previous => ({ ...previous, [taskKey]: e instanceof Error ? e.message : "Unable to save task assignment." })); }
    finally { setSavingAssignments(previous => ({ ...previous, [taskKey]: false })); }
  };
  const serverRecommendedKey = serverNextIncompleteKey ?? (items.length ? items.find(item => !item.complete)?.key ?? null : null);
  const nextIncomplete = items.findIndex(item => item.key === serverRecommendedKey);
  const nextRecommended = nextIncomplete >= 0 ? items[nextIncomplete] : null;
  const unmetPrerequisites = currentStep ? currentStep.prerequisites.filter(key => !items.find(item => item.key === key)?.complete) : [];
  const configureBlocked = unmetPrerequisites.length > 0;
  const exportReadinessCsv = () => {
    const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
    const headers = ["Step", "Key", "Status", "Description", "Remediation", "Prerequisites", "Assigned owner"];
    const rows = items.map((item, index) => [
      index + 1, item.key, item.complete ? "Complete" : "Incomplete", item.description,
      item.remediation || "", item.prerequisites.map(key => items.find(candidate => candidate.key === key)?.title || key).join("; "),
      assignmentMembers.find(member => member.id === assignmentMap[item.key])?.displayName || "Unassigned"
    ]);
    const csv = [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `school-onboarding-readiness-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  };
  const downloadAssignmentTemplate = () => {
    const csv = "taskKey,email\r\n" + items.map(item => `${item.key},`).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = "school-onboarding-assignments-template.csv";
    document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const previewAssignmentCsv = async (file?: File) => {
    setBulkPreview([]); setBulkStatus(""); if (!file) return;
    const text = await file.text();
    let csvRows: string[][];
    try { csvRows = parseCsv(text.replace(/^\uFEFF/, "")); } catch (parseError) { setBulkStatus(parseError instanceof Error ? parseError.message : "Unable to parse CSV."); return; }
    if (csvRows.length < 2) { setBulkStatus("CSV has no assignment rows."); return; }
    const headers = csvRows[0].map(value => value.trim().toLowerCase());
    const keyColumn = headers.indexOf("taskkey") >= 0 ? headers.indexOf("taskkey") : headers.indexOf("task_key");
    const emailColumn = headers.indexOf("email");
    if (keyColumn < 0 || emailColumn < 0) { setBulkStatus("CSV must include taskKey and email columns."); return; }
    const seen = new Set<string>();
    const rows = csvRows.slice(1).map(cells => {
      const taskKey = (cells[keyColumn] || "").trim(); const email = (cells[emailColumn] || "").trim().toLowerCase();
      const item = items.find(candidate => candidate.key === taskKey); const member = assignmentMembers.find(candidate => candidate.email.toLowerCase() === email);
      const duplicate = seen.has(taskKey); if (taskKey) seen.add(taskKey);
      const valid = Boolean(taskKey && item && !duplicate && (!email || member));
      const message = !taskKey ? "Task key missing" : !item ? "Unknown task key" : duplicate ? "Duplicate task in CSV" : !email ? "Valid (unassign)" : !member ? "Email is not an active member" : "Valid";
      return {taskKey,email,userId:member?.id || "",valid,message};
    });
    setBulkPreview(rows);
    setBulkStatus(`${rows.filter(row => row.valid).length} valid row(s); ${rows.filter(row => !row.valid).length} invalid row(s).`);
  };
  const applyBulkAssignments = async () => {
    const rows = bulkPreview.filter(row => row.valid); if (!rows.length || bulkBusy || !token || !org || !school) return;
    setBulkBusy(true); setBulkStatus("Applying validated assignments…"); let succeeded = 0; let failed = 0;
    const base = api.replace(/\/+$/, ""); const prefix = `${base}/api/v1/schools/${encodeURIComponent(org)}/${encodeURIComponent(school)}/onboarding-assignments`;
    for (const row of rows) {
      try {
        const response = await request(`${prefix}/${encodeURIComponent(row.taskKey)}`, {method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({assignedToUserId:row.userId || null})});
        const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
        setAssignmentMap(previous => {const next={...previous}; if(row.userId)next[row.taskKey]=row.userId;else delete next[row.taskKey];return next;}); succeeded++;
      } catch { failed++; }
    }
    setBulkStatus(`${succeeded} assignment(s) applied; ${failed} failed. Refresh to confirm server state.`); setBulkBusy(false);
  };
  useEffect(() => { if (items.length && focusedStep >= items.length) setFocusedStep(items.length - 1); }, [items.length, focusedStep]);
  return <section className="config-card" style={{ display: "grid", gap: 16 }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div><h2>Guided school onboarding</h2><p className="helper">Read-only readiness checklist assembled from existing school configuration APIs. Complete items from their linked workspaces.</p></div>
      <button type="button" disabled={loading} onClick={() => void load()}>{loading ? "Refreshing…" : "Refresh readiness"}</button>
      <button type="button" disabled={!items.length} onClick={exportReadinessCsv}>Export readiness CSV</button>
    </div>
    {error && <p className="error" role="alert">{error}</p>}
    {!items.length && !error && <p className="helper">Loading onboarding readiness…</p>}
    {items.length > 0 && <>
      <div className="notice" role="status"><div><b>{completeCount} of {items.length} setup steps complete</b><p className="helper">{percent}% readiness · This is a configuration checklist, not a production acceptance or compliance assessment.</p></div><div style={{ height: 8, background: "var(--border, #ddd)", borderRadius: 999, overflow: "hidden" }}><div style={{ width: `${percent}%`, height: "100%", background: "var(--success, #248a54)", transition: "width 160ms ease" }} /></div></div>
      <section aria-label="Guided setup step" className="notice" style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}><b>Step {focusedStep + 1} of {items.length}</b><span className="setup-chip">{currentStep?.complete ? "Complete" : configureBlocked ? "Blocked" : "Ready to configure"}</span></div>
        <div style={{ display: "flex", gap: 6 }} aria-label="Setup progress steps">{items.map((item, index) => <button key={item.key} type="button" aria-label={`Go to step ${index + 1}: ${item.title}`} aria-current={index === focusedStep ? "step" : undefined} onClick={() => setFocusedStep(index)} style={{ flex: 1, minHeight: 8, padding: 0, border: 0, borderRadius: 999, background: item.complete ? "var(--success, #248a54)" : index === focusedStep ? "var(--accent, #365fce)" : "var(--border, #ddd)" }} />)}</div>
        {currentStep && <div><h3>{currentStep.title}</h3><p className="helper">{currentStep.description}</p><p><b>{currentStep.complete ? "Configured" : "Configuration required"}</b></p>{!currentStep.complete && currentStep.remediation && <p className="helper" role="note">Next: {currentStep.remediation}</p>}<button type="button" disabled={configureBlocked} aria-describedby={configureBlocked ? "onboarding-prerequisite-note" : undefined} onClick={() => onNavigate(currentStep.actionTab)}>{currentStep.complete ? "Review settings" : "Configure this step"}</button>{configureBlocked && <p id="onboarding-prerequisite-note" className="helper" role="note">Complete prerequisites first: {unmetPrerequisites.map(key => items.find(item => item.key === key)?.title ?? key).join(", ")}.</p>}</div>}
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", flexWrap: "wrap" }}><button type="button" disabled={focusedStep === 0} onClick={() => setFocusedStep(step => Math.max(0, step - 1))}>Previous step</button><button type="button" disabled={focusedStep >= items.length - 1} onClick={() => setFocusedStep(step => Math.min(items.length - 1, step + 1))}>Next step</button></div>
      </section>
      {nextRecommended && <div className="notice"><b>Recommended next action</b><p className="helper">{nextRecommended.title} — {nextRecommended.complete ? "Review configuration" : "Complete this setup step"}.</p><button type="button" onClick={() => { setFocusedStep(nextIncomplete); onNavigate(nextRecommended.actionTab); }}>Go to next incomplete setup</button></div>}
      {assignmentError && <p className="helper" role="status">{assignmentError}</p>}
      <details><summary>Bulk task assignment import (CSV)</summary><div className="notice" style={{display:"grid",gap:8,marginTop:10}}><p className="helper">CSV columns: taskKey,email. Use a task key and an active organization member email. Blank emails can be used to unassign a task. Duplicate task keys and unknown members are rejected in preview.</p><button type="button" disabled={!items.length} onClick={downloadAssignmentTemplate}>Download CSV template</button><label htmlFor="onboarding-assignment-csv">Choose assignment CSV</label><input id="onboarding-assignment-csv" type="file" accept=".csv,text/csv" disabled={bulkBusy} onChange={event=>void previewAssignmentCsv(event.target.files?.[0])}/>{bulkStatus&&<p role="status" className="helper">{bulkStatus}</p>}{bulkPreview.length>0&&<><div style={{overflowX:"auto"}}><table><thead><tr><th>Task</th><th>Email</th><th>Validation</th></tr></thead><tbody>{bulkPreview.map((row,index)=><tr key={`${row.taskKey}-${index}`}><td>{row.taskKey}</td><td>{row.email||"(blank)"}</td><td>{row.message}</td></tr>)}</tbody></table></div><button type="button" disabled={bulkBusy||bulkPreview.some(row=>!row.valid)||!bulkPreview.length} onClick={()=>void applyBulkAssignments()}>Apply validated assignments ({bulkPreview.length})</button></>}</div></details>
      <details><summary>View setup tasks ({filteredItems.length} shown)</summary><div style={{ display: "grid", gap: 10, marginTop: 12 }}><div className="form-actions" role="group" aria-label="Filter onboarding tasks"><button type="button" aria-pressed={assignmentFilter === "all"} onClick={() => setAssignmentFilter("all")}>All tasks ({items.length})</button><button type="button" aria-pressed={assignmentFilter === "mine"} disabled={!currentMemberId} onClick={() => setAssignmentFilter("mine")}>Assigned to me ({items.filter(item => assignmentMap[item.key] === currentMemberId && Boolean(currentMemberId)).length})</button><button type="button" aria-pressed={assignmentFilter === "unassigned"} onClick={() => setAssignmentFilter("unassigned")}>Unassigned ({items.filter(item => !assignmentMap[item.key]).length})</button></div>{filteredItems.map((item, index) => <article key={item.key} className="notice" style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span aria-label={item.complete ? "Complete" : "Incomplete"} style={{ fontWeight: 700, minWidth: 24 }}>{item.complete ? "✓" : "○"}</span>
        <div style={{ flex: 1 }}><b>{items.findIndex(candidate => candidate.key === item.key) + 1}. {item.title}</b><p className="helper">{item.description}</p>{!item.complete && item.remediation && <p className="helper">Next: {item.remediation}</p>}<small>{item.complete ? "Completed" : item.prerequisites.some(key => !items.find(candidate => candidate.key === key)?.complete) ? "Blocked by prerequisites" : "Ready to configure"}</small>{!item.complete && item.prerequisites.some(key => !items.find(candidate => candidate.key === key)?.complete) && <p className="helper" role="note">Blocked by: {item.prerequisites.filter(key => !items.find(candidate => candidate.key === key)?.complete).map(key => items.find(candidate => candidate.key === key)?.title ?? key).join(", ")}</p>}<div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}><label htmlFor={`onboarding-owner-${item.key}`}>Assigned owner</label><select id={`onboarding-owner-${item.key}`} value={assignmentMap[item.key] || ""} disabled={Boolean(savingAssignments[item.key]) || !assignmentMembers.length} onChange={event => void saveAssignment(item.key, event.target.value)}><option value="">Unassigned</option>{assignmentMembers.map(member => <option key={member.id} value={member.id}>{member.displayName} ({member.email})</option>)}</select>{savingAssignments[item.key] && <small role="status">Saving…</small>}{assignmentSaveStatus[item.key] === "saved" && !savingAssignments[item.key] && <small role="status">Assignment saved.</small>}{assignmentErrors[item.key] && <small className="error" role="alert">{assignmentErrors[item.key]}</small>}</div></div>
        <button type="button" disabled={item.prerequisites.some(key => !items.find(candidate => candidate.key === key)?.complete)} onClick={() => { setFocusedStep(index); onNavigate(item.actionTab); }}>{item.complete ? "Review" : "Configure"}</button>
      </article>)}</div></details>
      {lastUpdated && <small className="helper">Readiness refreshed {lastUpdated.toLocaleTimeString()}</small>}
    </>}
  </section>;
}
