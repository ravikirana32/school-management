import React, { useCallback, useEffect, useState } from "react";
import { useSchoolAdminSession } from "./SchoolAdminSession";

type Row = Record<string, unknown> & { id: string };
type Area = "fees" | "homework" | "reports" | "notifications";

export function ParentOperationsWorkspace({ area }: { area: Area }) {
  const session = useSchoolAdminSession();
  const { api, org, school, token, request, can } = session;
  const [students, setStudents] = useState<Row[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [charges, setCharges] = useState<Row[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Row | null>(null);
  const [submissionRows, setSubmissionRows] = useState<Row[]>([]);
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, { score: string; maxScore: string; feedback: string }>>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Loading school records…");
  const [form, setForm] = useState<Record<string, string>>({});
  const [homeworkTargetMode, setHomeworkTargetMode] = useState("individual");
  const [targetGrade, setTargetGrade] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const base = `${api}/api/v1/${encodeURIComponent(org)}/${encodeURIComponent(school)}/parents`;
  const set = (key: string, value: string) => setForm(old => ({ ...old, [key]: value }));

  const call = useCallback(async (path: string, method = "GET", body?: unknown) => {
    const response = await request(`${base}${path}`, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
    return payload.data;
  }, [base, request]);

  const load = useCallback(async () => {
    if (!token || !org || !school) return;
    setBusy(true);
    try {
      const studentResult = await request(`${api}/api/v1/${encodeURIComponent(org)}/${encodeURIComponent(school)}/students?page=1&pageSize=100`);
      const studentPayload = await studentResult.json().catch(() => ({}));
      if (!studentResult.ok) throw new Error(studentPayload.error || "Unable to load students");
      const studentRows = Array.isArray(studentPayload.data?.items) ? studentPayload.data.items : [];
      setStudents(studentRows);
      const currentStudent = studentRows.some((x: Row) => x.id === selectedStudent) ? selectedStudent : (studentRows[0]?.id ?? "");
      setSelectedStudent(currentStudent);
      const endpoint = area === "fees" ? "/fees" : area === "homework" ? "/homework" : area === "reports" ? "/report-cards" : "/notifications";
      const params = new URLSearchParams({ limit: "30" });
      if (currentStudent && area !== "notifications") params.set("studentId", currentStudent);
      const result = await call(`${endpoint}?${params.toString()}`);
      const page = result && Array.isArray(result.items) ? result : { items: Array.isArray(result) ? result : [], nextCursor: null, hasMore: false };
      setRows(page.items);
      setNextCursor(typeof page.nextCursor === "string" ? page.nextCursor : null);
      setHasMore(Boolean(page.hasMore));
      if (area === "fees") setCharges(page.items);
      else setCharges([]);
      setMessage(`${page.items.length} record(s) loaded. ${page.hasMore ? "More records are available." : "End of list."}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load records");
    } finally { setBusy(false); }
  }, [token, org, school, api, area, selectedStudent, request, call]);

  useEffect(() => { void load(); }, [load]);


  async function loadMore() {
    if (!nextCursor || busy) return;
    setBusy(true);
    try {
      const endpoint = area === "fees" ? "/fees" : area === "homework" ? "/homework" : area === "reports" ? "/report-cards" : "/notifications";
      const params = new URLSearchParams({ limit: "30", cursor: nextCursor });
      if (selectedStudent && area !== "notifications") params.set("studentId", selectedStudent);
      const page = await call(`${endpoint}?${params.toString()}`);
      if (!page || !Array.isArray(page.items)) throw new Error("The server returned an invalid page response.");
      setRows(current => [...current, ...page.items.filter((item: Row) => !current.some(existing => existing.id === item.id))]);
      setNextCursor(typeof page.nextCursor === "string" ? page.nextCursor : null);
      setHasMore(Boolean(page.hasMore));
      setMessage(`${page.items.length} additional record(s) loaded.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load the next page");
    } finally { setBusy(false); }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedStudent && area !== "notifications") { setMessage("Select a student first."); return; }
    setBusy(true);
    try {
      if (area === "fees" && form.action === "payment") {
        await call(`/fees/${form.chargeId}/payments`, "POST", { amount: Number(form.paymentAmount), method: form.paymentMethod || "BANK_TRANSFER", reference: form.reference, paidAt: form.paidAt });
      } else if (area === "fees") {
        await call(`/children/${selectedStudent}/fees`, "POST", { chargeCode: form.chargeCode, title: form.title, description: form.description || undefined, category: form.category || "GENERAL", currency: form.currency || "INR", amount: Number(form.amount), dueAt: form.dueAt || undefined, publish: form.publish === "true" });
      } else if (area === "homework") {
        const homeworkPayload = { title: form.title, subjectName: form.subjectName, description: form.description, dueAt: form.dueAt ? new Date(`${form.dueAt}T23:59:00`).toISOString() : undefined, publish: false };
        const targetStudents = homeworkTargetMode === "individual" ? students.filter(student => student.id === selectedStudent) : students.filter(student => String(student.gradeLevelId || student.grade || "") === targetGrade && (homeworkTargetMode === "grade" || String(student.sectionName || student.section || "") === targetSection));
        if (!targetStudents.length) throw new Error("No matching students found in the loaded student list. Refresh or use individual targeting.");
        if (homeworkTargetMode !== "individual" && students.length >= 100) throw new Error("Bulk targeting is blocked because the student list may be truncated at 100. Narrow the target or use individual assignments.");
        let created = 0; const failures: string[] = [];
        for (const student of targetStudents) { try { await call(`/children/${student.id}/homework`, "POST", homeworkPayload); created++; } catch (error) { failures.push(`${student.id}: ${error instanceof Error ? error.message : "failed"}`); } }
        if (failures.length) { setMessage(`Created ${created}/${targetStudents.length} draft assignments. Failures: ${failures.slice(0, 4).join("; ")}`); }
        else setMessage(`Created ${created} homework draft assignment(s) for ${homeworkTargetMode === "individual" ? "selected student" : homeworkTargetMode === "grade" ? `grade ${targetGrade}` : `grade ${targetGrade}, section ${targetSection}`}.`);
      } else if (area === "reports") {
        const resultSummary = JSON.parse(form.resultSummary || "{}");
        if (!resultSummary || Array.isArray(resultSummary) || typeof resultSummary !== "object") throw new Error("Result summary must be a JSON object.");
        await call(`/children/${selectedStudent}/report-cards`, "POST", { academicYearId: session.year, termLabel: form.termLabel, resultSummary, teacherRemarks: form.teacherRemarks || undefined, principalRemarks: form.principalRemarks || undefined, publish: form.publish === "true" });
      } else {
        await call(`/children/${selectedStudent}/notifications`, "POST", { category: form.category || "GENERAL", title: form.title, body: form.body });
      }
      setForm({}); await load(); if (area !== "homework") setMessage("Saved successfully. Parent visibility follows the publication and consent rules.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Save failed"); }
    finally { setBusy(false); }
  }


  async function loadSubmissions(assignment: Row) {
    setSelectedAssignment(assignment); setSubmissionRows([]); setBusy(true);
    try {
      const result = await call(`/homework/${assignment.id}/submissions`);
      const records = Array.isArray(result) ? result : [];
      setSubmissionRows(records);
      setGradeDrafts(Object.fromEntries(records.map((row: Row) => [String(row.id), { score: row.score == null ? "" : String(row.score), maxScore: row.maxScore == null ? "100" : String(row.maxScore), feedback: String(row.teacherFeedback || "") }])));
      setMessage(`${records.length} submission(s) loaded for ${String(assignment.title || "assignment")}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load submissions"); }
    finally { setBusy(false); }
  }

  async function gradeSubmission(row: Row) {
    const draft = gradeDrafts[String(row.id)];
    if (!draft || draft.score.trim() === "" || draft.maxScore.trim() === "") { setMessage("Enter score and maximum score before grading."); return; }
    const score = Number(draft.score), maxScore = Number(draft.maxScore);
    if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0 || score < 0 || score > maxScore) { setMessage("Score must be between zero and the maximum score."); return; }
    setBusy(true);
    try {
      await call(`/homework/submissions/${row.id}/grade`, "PATCH", { score, maxScore, teacherFeedback: draft.feedback.trim() || undefined });
      await loadSubmissions(selectedAssignment || { id: row.id });
      setMessage("Submission graded successfully.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Grading failed"); }
    finally { setBusy(false); }
  }

  async function publish(row: Row) {
    const path = area === "fees" ? `/fees/${row.id}/publish` : area === "homework" ? `/homework/${row.id}/publish` : `/report-cards/${row.id}/publish`;
    setBusy(true);
    try { await call(path, "PATCH", {}); await load(); setMessage("Published. Eligible parents can now view this record."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Publish failed"); }
    finally { setBusy(false); }
  }

  const title = area === "fees" ? "Fees & payment reconciliation" : area === "homework" ? "Homework & assignments" : area === "reports" ? "Report cards" : "Parent notifications";
  const studentLabel = (id: unknown) => { const s = students.find(x => x.id === id); return s ? `${String(s.admissionNumber || "")} — ${String(s.firstName || "")} ${String(s.lastName || "")}` : String(id || "School-wide"); };
  return <section className="config-card" style={{ display: "grid", gap: 16 }}>
    <div className="page-heading"><div><div className="eyebrow">PARENT OPERATIONS</div><h2>{title}</h2><p className="helper">Authenticated, tenant-scoped management. Parent visibility is restricted to published records and active guardian consent.</p></div><button type="button" disabled={busy} onClick={() => void load()}>Refresh</button></div>
    <div className="form-grid"><label>Student{area === "notifications" ? " (required for this message)" : ""}<select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}><option value="">Select student</option>{students.map(s => <option key={s.id} value={s.id}>{String(s.admissionNumber || "")} — {String(s.firstName || "")} {String(s.lastName || "")}</option>)}</select></label><div className="notice"><b>Access</b><span>{can(area === "fees" ? "fees.manage" : area === "homework" ? "academics.manage" : area === "reports" ? "reports.manage" : "parent.notifications.manage") ? "Required permission present." : "Required permission missing; server will reject writes."}</span></div></div>
    {area === "reports" && <div className="notice"><b>Report-card approval workflow</b><span>Direct draft creation and publishing are disabled in this legacy workspace. Use the new schema-backed report-card API workflow; the dedicated schema editor and principal approval UI are scheduled for P39.</span></div>}
    {area !== "reports" && <form className="form-grid" onSubmit={submit}>
      {area === "fees" && form.action !== "payment" && <><label>Charge code<input required value={form.chargeCode || ""} onChange={e => set("chargeCode", e.target.value)} placeholder="TUITION-2027-T1" /></label><label>Title<input required value={form.title || ""} onChange={e => set("title", e.target.value)} /></label><label>Category<input value={form.category || "TUITION"} onChange={e => set("category", e.target.value)} /></label><label>Currency<input maxLength={3} value={form.currency || "INR"} onChange={e => set("currency", e.target.value.toUpperCase())} /></label><label>Amount<input required type="number" min="0.01" step="0.01" value={form.amount || ""} onChange={e => set("amount", e.target.value)} /></label><label>Due date<input type="date" value={form.dueAt || ""} onChange={e => set("dueAt", e.target.value)} /></label><label>Description<input value={form.description || ""} onChange={e => set("description", e.target.value)} /></label><label>Publish immediately<select value={form.publish || "false"} onChange={e => set("publish", e.target.value)}><option value="false">Save draft</option><option value="true">Publish</option></select></label><button type="submit" disabled={busy || !selectedStudent}>Create fee charge</button></>}
      {area === "fees" && form.action === "payment" && <><label>Fee charge<select required value={form.chargeId || ""} onChange={e => set("chargeId", e.target.value)}><option value="">Select charge</option>{charges.filter(c => ["PUBLISHED", "PARTIALLY_PAID", "OVERDUE"].includes(String(c.status))).map(c => <option key={c.id} value={c.id}>{String(c.title)} · {String(c.currency)} {String(c.amount)} · {String(c.status)}</option>)}</select></label><label>Amount received<input required type="number" min="0.01" step="0.01" value={form.paymentAmount || ""} onChange={e => set("paymentAmount", e.target.value)} /></label><label>Method<select value={form.paymentMethod || "BANK_TRANSFER"} onChange={e => set("paymentMethod", e.target.value)}>{["CASH","BANK_TRANSFER","CHEQUE","CARD","UPI","OTHER"].map(x => <option key={x}>{x}</option>)}</select></label><label>Reference<input required minLength={3} value={form.reference || ""} onChange={e => set("reference", e.target.value)} /></label><label>Paid on<input required type="date" value={form.paidAt || ""} onChange={e => set("paidAt", e.target.value)} /></label><button type="submit" disabled={busy || !form.chargeId}>Record manual payment</button></>}
      {area === "fees" && <button type="button" onClick={() => setForm(old => old.action === "payment" ? {} : { action: "payment" })}>{form.action === "payment" ? "Switch to fee charge" : "Record payment"}</button>}
      {area === "homework" && <><label>Target type<select value={homeworkTargetMode} onChange={e => { setHomeworkTargetMode(e.target.value); setTargetGrade(""); setTargetSection(""); }}><option value="individual">Individual student</option><option value="grade">Whole grade</option><option value="section">Specific section</option></select></label>{homeworkTargetMode !== "individual" && <><label>Grade/class<input required value={targetGrade} onChange={e => { setTargetGrade(e.target.value); setTargetSection(""); }} placeholder="Match grade/class field" /></label>{homeworkTargetMode === "section" && <label>Section<input required value={targetSection} onChange={e => setTargetSection(e.target.value)} placeholder="e.g. A" /></label>}<div className="notice"><b>Target preview</b><span>{students.filter(student => String(student.gradeLevelId || student.grade || "") === targetGrade && (homeworkTargetMode === "grade" || String(student.sectionName || student.section || "") === targetSection)).length} student(s) matched in the currently loaded list. Bulk targeting is capped by the loaded roster.</span></div></>}<label>Title<input required value={form.title || ""} onChange={e => set("title", e.target.value)} /></label><label>Subject<input required value={form.subjectName || ""} onChange={e => set("subjectName", e.target.value)} /></label><label>Due date<input type="date" value={form.dueAt || ""} onChange={e => set("dueAt", e.target.value)} /></label><label>Description<textarea required value={form.description || ""} onChange={e => set("description", e.target.value)} /></label><div className="notice"><b>Publishing</b><span>Assignments are saved as drafts. Publishing requires the existing approval workflow to approve the draft first.</span></div><button type="submit" disabled={busy || (homeworkTargetMode === "individual" ? !selectedStudent : !targetGrade || (homeworkTargetMode === "section" && !targetSection))}>Create homework draft(s)</button></>}

      {area === "notifications" && <><label>Category<input value={form.category || "GENERAL"} onChange={e => set("category", e.target.value)} /></label><label>Title<input required value={form.title || ""} onChange={e => set("title", e.target.value)} /></label><label>Message<textarea required rows={3} value={form.body || ""} onChange={e => set("body", e.target.value)} /></label><button type="submit" disabled={busy || !selectedStudent}>Send in-app notification</button></>}
    </form>}
    <div className="notice"><b>Result</b><span>{message}</span></div>
    <h3>Existing records</h3>
    {area === "fees" && <div className="table-wrap"><table><thead><tr><th>Student</th><th>Charge</th><th>Amount</th><th>Paid</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td>{studentLabel(r.studentId)}</td><td>{String(r.title)}<small>{String(r.chargeCode)}</small></td><td>{String(r.currency)} {String(r.amount)}</td><td>{String(r.amountPaid)}{Array.isArray(r.payments) && r.payments.length > 0 && <small>{r.payments.map((p: Row) => `${String(p.method)} ${String(p.amount)} · ${String(p.reference)}`).join("; ")}</small>}</td><td>{String(r.status)}</td><td>{r.status === "DRAFT" && <button type="button" disabled={busy} onClick={() => void publish(r)}>Publish</button>}</td></tr>)}</tbody></table></div>}
    {area === "homework" && <div className="table-wrap"><table><thead><tr><th>Student</th><th>Assignment</th><th>Due</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td>{studentLabel(r.studentId)}</td><td>{String(r.title)}<small>{String(r.subjectName)}</small></td><td>{r.dueAt ? new Date(String(r.dueAt)).toLocaleDateString() : "—"}</td><td>{String(r.status)}</td><td><button type="button" disabled={busy || r.status !== "PUBLISHED"} onClick={() => void loadSubmissions(r)}>Review submissions</button></td></tr>)}</tbody></table></div>}
    {area === "homework" && selectedAssignment && <section className="config-card" style={{ display: "grid", gap: 12 }}><div className="page-heading"><div><h3>Submission review — {String(selectedAssignment.title || "Homework")}</h3><p className="helper">Student answers, submission status, grading and feedback. Grading requires homework.grade permission and teacher assignment scope.</p></div><button type="button" disabled={busy} onClick={() => void loadSubmissions(selectedAssignment)}>Refresh submissions</button></div>{submissionRows.length === 0 ? <div className="notice"><b>No submissions loaded</b><span>There may be no submissions yet, or access to the assignment may be restricted.</span></div> : <div className="table-wrap"><table><thead><tr><th>Student ID</th><th>Status</th><th>Submitted</th><th>Answer</th><th>Score</th><th>Max</th><th>Feedback</th><th>Action</th></tr></thead><tbody>{submissionRows.map(sub => { const draft = gradeDrafts[String(sub.id)] || { score: "", maxScore: "100", feedback: "" }; return <tr key={sub.id}><td>{String(sub.studentId)}</td><td>{String(sub.status)}</td><td>{sub.submittedAt ? new Date(String(sub.submittedAt)).toLocaleString() : "—"}</td><td>{String(sub.answerText || "—")}</td><td><input type="number" min="0" step="0.01" value={draft.score} disabled={sub.status === "GRADED"} onChange={e => setGradeDrafts(old => ({ ...old, [String(sub.id)]: { ...draft, score: e.target.value } }))} /></td><td><input type="number" min="0.01" step="0.01" value={draft.maxScore} disabled={sub.status === "GRADED"} onChange={e => setGradeDrafts(old => ({ ...old, [String(sub.id)]: { ...draft, maxScore: e.target.value } }))} /></td><td><textarea rows={2} value={draft.feedback} disabled={sub.status === "GRADED"} onChange={e => setGradeDrafts(old => ({ ...old, [String(sub.id)]: { ...draft, feedback: e.target.value } }))} /></td><td>{sub.status === "GRADED" ? <span>Graded · {String(sub.score)}/{String(sub.maxScore)}</span> : <button type="button" disabled={busy} onClick={() => void gradeSubmission(sub)}>Grade</button>}</td></tr>; })}</tbody></table></div>}</section>}
    {area === "reports" && <div className="table-wrap"><table><thead><tr><th>Student</th><th>Term</th><th>Academic year</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td>{studentLabel(r.studentId)}</td><td>{String(r.termLabel)}</td><td>{String(r.academicYearId)}</td><td>{String(r.status)}</td><td>{String(r.approvalStatus || "LEGACY") === "PENDING_APPROVAL" ? "Awaiting principal approval" : "Use schema-backed approval workflow"}</td></tr>)}</tbody></table></div>}
    {area === "notifications" && <div className="table-wrap"><table><thead><tr><th>Created</th><th>Recipient</th><th>Student</th><th>Message</th><th>Read</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td>{new Date(String(r.createdAt)).toLocaleString()}</td><td>Linked parent account</td><td>{studentLabel(r.studentId)}</td><td>{String(r.title)}<small>{String(r.body)}</small></td><td>{r.readAt ? "Yes" : "No"}</td></tr>)}</tbody></table></div>}
    {hasMore && <div className="form-actions"><span>Showing {rows.length} records</span><button type="button" disabled={busy || !nextCursor} onClick={() => void loadMore()}>Load more</button></div>}
    <p className="helper">Lists are cursor-paginated. Notification recipient account identifiers are never exposed in this workspace. Manual payment recording is reconciliation only; it does not charge a card, initiate UPI or create a gateway transaction. Parent notifications are currently in-app only.</p>
  </section>;
}
