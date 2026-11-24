import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { createConfigTransfer, validateConfigTransfer, type ConfigTransferTab } from "./school-config-transfer";
import { useSchoolAdminSession } from "./SchoolAdminSession";

type ConfigTab = "profile" | "academic" | "calendar" | "working" | "policies";
type Calendar = { id: string; name: string; isDefault: boolean; academicYearId?: string | null };
type Day = { dayOfWeek: number; isWorkingDay: boolean; opensAt?: string; closesAt?: string; notes?: string };
type EventRow = { id: string; title: string; eventType: string; startsAt: string; endsAt: string };
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const emptyProfile = { legalName: "", displayName: "", schoolType: "PRIVATE", boardKey: "CBSE", affiliationNumber: "", addressLine1: "", addressLine2: "", locality: "", city: "", state: "", postalCode: "", countryCode: "IN", phone: "", email: "", website: "", primaryLanguage: "en", timezone: "Asia/Kolkata", currency: "INR", dateFormat: "DD-MM-YYYY", weekStartsOn: 1 };
const defaultDays: Day[] = weekdays.map((_, dayOfWeek) => ({ dayOfWeek, isWorkingDay: dayOfWeek >= 1 && dayOfWeek <= 5, opensAt: "08:00", closesAt: "15:00" }));

export function SchoolConfigurationWorkspace({ tab }: { tab: ConfigTab }) {
  const session = useSchoolAdminSession();
  const { api, org, school, token, request, reloadAcademicYears } = session;
  const base = api.replace(/\/+$/, "");
  const prefix = `${base}/api/v1/schools/${encodeURIComponent(org)}/${encodeURIComponent(school)}`;
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Loading saved school configuration…");
  const [profile, setProfile] = useState<any>(emptyProfile);
  const [yearRows, setYearRows] = useState<any[]>([]);
  const [termRows, setTermRows] = useState<any[]>([]);
  const [selectedTermYear, setSelectedTermYear] = useState("");
  const [termName, setTermName] = useState("");
  const [termCode, setTermCode] = useState("");
  const [termType, setTermType] = useState("TERM");
  const [termSequence, setTermSequence] = useState(1);
  const [termStart, setTermStart] = useState("");
  const [termEnd, setTermEnd] = useState("");
  const [yearName, setYearName] = useState("");
  const [yearCode, setYearCode] = useState("");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [makeCurrent, setMakeCurrent] = useState(false);
  const [calendarName, setCalendarName] = useState("Main School Calendar");
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [calendarId, setCalendarId] = useState("");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("HOLIDAY");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [days, setDays] = useState<Day[]>(defaultDays);
  const [attendancePolicy, setAttendancePolicy] = useState({ lateAfterMinutes: 15, allowHalfDay: true, requireReasonForAbsence: false });
  const [gradingPolicy, setGradingPolicy] = useState({ gradingScale: "PERCENTAGE", passingPercentage: 35, decimalPlaces: 0 });
  const [transferText, setTransferText] = useState("");
  const [transferPreview, setTransferPreview] = useState<any>(null);
  const [transferErrors, setTransferErrors] = useState<string[]>([]);
  const [campusRows, setCampusRows] = useState<any[]>([]);
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [campusEffectiveConfig, setCampusEffectiveConfig] = useState<any>(null);
  const [campusConfigLoading, setCampusConfigLoading] = useState(false);
  const [campusConfigError, setCampusConfigError] = useState("");
  const transferScope = (tab === "profile" || tab === "academic" || tab === "working" || tab === "policies" || tab === "calendar") ? tab as ConfigTransferTab : null;
  const currentTransferData = transferScope === "profile" ? profile : transferScope === "academic" ? { academicYears: yearRows.map(year => ({ name: year.name, code: year.code, startsOn: String(year.startsOn).slice(0,10), endsOn: String(year.endsOn).slice(0,10), terms: [] })) } : transferScope === "working" ? { days } : transferScope === "policies" ? { attendance: attendancePolicy, grading: gradingPolicy } : transferScope === "calendar" ? null : null;
  async function exportTransfer() {
    if (!transferScope) return;
    let exportData = currentTransferData;
    if (transferScope === "academic") {
      const academicYears = [];
      for (const year of yearRows) {
        const terms = await read(`/academic-years/${encodeURIComponent(year.id)}/terms`);
        academicYears.push({
          name: year.name, code: year.code, startsOn: String(year.startsOn).slice(0, 10), endsOn: String(year.endsOn).slice(0, 10),
          terms: terms.map((term: any) => ({
            name: term.name, code: term.code, termType: term.termType, sequence: term.sequence,
            startsOn: String(term.startsOn).slice(0, 10), endsOn: String(term.endsOn).slice(0, 10),
          })),
        });
      }
      exportData = { academicYears };
    }
    if (transferScope === "calendar") {
      if (!calendarId) { setMessage("Select a calendar before exporting."); return; }
      const selectedCalendar = calendars.find(row => row.id === calendarId);
      const calendarEvents = await read(`/calendars/${encodeURIComponent(calendarId)}/events`);
      exportData = { calendar: { name: selectedCalendar?.name ?? "Imported calendar", academicYearId: selectedCalendar?.academicYearId ?? null }, events: (calendarEvents ?? []).map((event: any) => ({ title: event.title, eventType: event.eventType, startsAt: event.startsAt, endsAt: event.endsAt, isAllDay: event.isAllDay ?? false, isInstructionDay: event.isInstructionDay ?? false, audience: event.audience ?? "ALL" })) };
    }
    const doc = createConfigTransfer(transferScope, exportData);
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = `school-config-${transferScope}.json`; link.click(); URL.revokeObjectURL(url);
  }
  function previewTransfer() {
    setTransferPreview(null);
    try { const result = validateConfigTransfer(JSON.parse(transferText), transferScope as ConfigTransferTab); const errors = [...result.errors]; if (transferScope === "academic" && result.valid) { const existingCodes = new Set(yearRows.map(y => String(y.code).trim().toLowerCase())); for (const year of result.data.academicYears) if (existingCodes.has(String(year.code).trim().toLowerCase())) errors.push(`Academic year code ${year.code} already exists in this school.`); } setTransferErrors(errors); if (result.valid && errors.length === 0) setTransferPreview(result.data); }
    catch { setTransferErrors(["Invalid JSON. Please paste a valid configuration transfer file."]); }
  }
  async function applyTransfer() {
    if (!transferScope || !transferPreview || !session.can((transferScope === "academic" || transferScope === "calendar") ? "academics.manage" : "school.settings.manage")) return;
    setBusy(true); setTransferErrors([]);
    try {
      const response = await request(`${prefix}/configuration-transfer/import`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope: transferScope, data: transferPreview }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || payload.message || `Import failed (${response.status})`);
      const result = payload.data || {};
      if (transferScope === "profile") setProfile(transferPreview);
      else if (transferScope === "working") setDays(transferPreview.days);
      else if (transferScope === "policies") { setAttendancePolicy(transferPreview.attendance || attendancePolicy); setGradingPolicy(transferPreview.grading || gradingPolicy); }
      else if (transferScope === "academic") await reloadAcademicYears();
      else if (transferScope === "calendar") await load();
      setMessage(transferScope === "academic" ? `Atomic academic import completed: ${result.createdYears ?? 0} year(s), ${result.createdTerms ?? 0} term(s).` : transferScope === "calendar" ? `Atomic calendar import completed: ${result.createdEvents ?? 0} event(s) created.` : `Atomic ${transferScope} import completed.`);
      setTransferPreview(null); setTransferText("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Configuration import failed; server transaction was rolled back."); }
    finally { setBusy(false); }
  }

  const read = useCallback(async (path: string) => {
    const response = await request(`${prefix}${path}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
    return payload.data;
  }, [prefix, request]);
  const write = useCallback(async (path: string, method: "PUT" | "POST", body: unknown) => {
    const response = await request(`${prefix}${path}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Save failed (${response.status})`);
    return payload.data;
  }, [prefix, request]);

  const load = useCallback(async () => {
    if (!token || !org || !school) return;
    setLoading(true);
    try {
      if (tab === "profile") {
        const result = await read("/profile");
        const saved = result ?? {};
        setProfile(Object.fromEntries(Object.keys(emptyProfile).map(key => [key, saved[key] ?? (emptyProfile as any)[key]])));
      } else if (tab === "academic") {
        setYearRows(await read("/academic-years"));
      } else if (tab === "calendar") {
        const rows = await read("/calendars") as Calendar[];
        setCalendars(rows);
        const selected = rows.find(row => row.id === calendarId)?.id ?? rows.find(row => row.isDefault)?.id ?? rows[0]?.id ?? "";
        setCalendarId(selected);
        if (selected) setEvents(await read(`/calendars/${encodeURIComponent(selected)}/events`));
        else setEvents([]);
      } else if (tab === "working") {
        const rows = await read("/working-days") as Day[];
        setDays(rows.length ? defaultDays.map(day => { const saved = rows.find(row => row.dayOfWeek === day.dayOfWeek); return saved ? { dayOfWeek: saved.dayOfWeek, isWorkingDay: saved.isWorkingDay, opensAt: saved.opensAt, closesAt: saved.closesAt, notes: saved.notes } : day; }) : defaultDays);
      } else if (tab === "policies") {
        const rows = await read("/policies") as { policyKey: string; value: any }[];
        const attendance = rows.find(row => row.policyKey === "attendance")?.value;
        const grading = rows.find(row => row.policyKey === "grading")?.value;
        if (attendance) setAttendancePolicy({ lateAfterMinutes: 15, allowHalfDay: true, requireReasonForAbsence: false, ...attendance });
        if (grading) setGradingPolicy({ gradingScale: "PERCENTAGE", passingPercentage: 35, decimalPlaces: 0, ...grading });
      }
      setMessage("Saved configuration loaded from the school API.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load configuration"); }
    finally { setLoading(false); }
  }, [token, org, school, tab, read]);

  useEffect(() => { void load(); }, [load]);
  // P409: school configuration workspace supports a read-only campus-effective view.
  useEffect(() => {
    if (!token || !org || !school) return;
    let cancelled = false;
    void read("/campus-registry").then((rows: any[]) => {
      if (cancelled) return;
      const active = (rows ?? []).filter(row => row.status === "ACTIVE");
      setCampusRows(active);
      setSelectedCampusId(current => active.some(row => row.id === current) ? current : (active.find(row => row.isMain)?.id ?? active[0]?.id ?? ""));
    }).catch(error => { if (!cancelled) setCampusConfigError(error instanceof Error ? error.message : "Unable to load campus list"); });
    return () => { cancelled = true; };
  }, [token, org, school, read]);
  useEffect(() => {
    if (!selectedCampusId) { setCampusEffectiveConfig(null); return; }
    let cancelled = false;
    setCampusConfigLoading(true); setCampusConfigError("");
    void read(`/campus-config/effective/${encodeURIComponent(selectedCampusId)}`).then(result => {
      if (!cancelled) setCampusEffectiveConfig(result);
    }).catch(error => {
      if (!cancelled) { setCampusEffectiveConfig(null); setCampusConfigError(error instanceof Error ? error.message : "Unable to resolve campus configuration"); }
    }).finally(() => { if (!cancelled) setCampusConfigLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCampusId, read]);
  useEffect(() => {
    if (tab !== "academic" || !selectedTermYear) { setTermRows([]); return; }
    let cancelled = false;
    void read(`/academic-years/${encodeURIComponent(selectedTermYear)}/terms`).then(rows => { if (!cancelled) setTermRows(rows); }).catch(error => { if (!cancelled) setMessage(error instanceof Error ? error.message : "Unable to load academic terms"); });
    return () => { cancelled = true; };
  }, [tab, selectedTermYear, read]);

  useEffect(() => {
    if (tab !== "calendar" || !calendarId) return;
    let cancelled = false;
    void read(`/calendars/${encodeURIComponent(calendarId)}/events`).then(rows => { if (!cancelled) setEvents(rows); }).catch(error => { if (!cancelled) setMessage(error instanceof Error ? error.message : "Unable to load events"); });
    return () => { cancelled = true; };
  }, [tab, calendarId, read]);

  async function submit(event: FormEvent, action: () => Promise<void>) {
    event.preventDefault(); setBusy(true);
    try { await action(); setMessage("Changes saved successfully."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save changes"); }
    finally { setBusy(false); }
  }

  return <section className="config-card" aria-busy={loading || busy}>
    <section className="subsection campus-effective-view" aria-label="Campus effective configuration preview">
      <h2>Campus configuration context</h2>
      <p className="helper">Choose an active campus to inspect the resolved school settings and inheritance. This is a read-only preview; existing school-level editing remains unchanged.</p>
      <div className="form-grid"><label>Campus<select value={selectedCampusId} onChange={event => setSelectedCampusId(event.target.value)}><option value="">Select campus</option>{campusRows.map(row => <option key={row.id} value={row.id}>{row.name} ({row.campusCode}){row.isMain ? " — Main campus" : ""}</option>)}</select></label></div>
      {campusConfigLoading && <p role="status">Loading effective campus configuration…</p>}
      {campusConfigError && <p className="error" role="alert">{campusConfigError}</p>}
      {campusEffectiveConfig && <div className="empty-row"><strong>Resolved inheritance:</strong> {Array.isArray(campusEffectiveConfig.chain) ? campusEffectiveConfig.chain.map((row: any) => row.name ?? row.campusId ?? String(row)).join(" → ") : "Available"}<pre style={{whiteSpace:"pre-wrap",maxHeight:300,overflow:"auto"}}>{JSON.stringify(campusEffectiveConfig,null,2)}</pre></div>}
    </section>
    <div className="form-actions"><span>{loading ? "Loading…" : message}</span><button type="button" disabled={loading || busy} onClick={() => void load()}>Reload from server</button></div>
    {transferScope && <section className="subsection config-transfer"><h3>Configuration transfer (JSON)</h3><p className="helper">Export the current {transferScope} settings or import a file for validation and preview. Import is scope-limited to the active tab. Imports are validated and applied in a single server-side database transaction for the selected scope. If validation or a database write fails, the transaction rolls back all changes in that scope.</p><div className="form-actions"><button type="button" disabled={loading || busy} onClick={() => void exportTransfer()}>Export current settings</button></div><textarea rows={7} value={transferText} onChange={e => { setTransferText(e.target.value); setTransferPreview(null); setTransferErrors([]); }} placeholder="Paste the exported JSON configuration here…" style={{width:"100%",marginTop:12,fontFamily:"monospace"}} /><div className="form-actions"><button type="button" disabled={loading || busy || !transferText.trim()} onClick={previewTransfer}>Validate & preview import</button></div>{transferErrors.length > 0 && <ul className="error">{transferErrors.map((err,i) => <li key={i}>{err}</li>)}</ul>}{transferPreview && <><div className="empty-row"><strong>Preview valid.</strong> {transferScope === "academic" ? "This will create new academic years and their terms. Existing records will not be modified." : transferScope === "calendar" ? "This will create a new calendar and its events. Existing calendars will not be modified." : `This will replace the active ${transferScope} configuration scope.`} Review before applying.<pre style={{whiteSpace:"pre-wrap",maxHeight:260,overflow:"auto"}}>{JSON.stringify(transferPreview,null,2)}</pre></div><div className="form-actions"><button type="button" disabled={busy || loading || !session.can((transferScope === "academic" || transferScope === "calendar") ? "academics.manage" : "school.settings.manage")} onClick={() => void applyTransfer()}>Apply validated import</button></div></>}</section>}
    {tab === "profile" && <form onSubmit={event => void submit(event, async () => { const payload = { ...profile }; if (!payload.email) delete payload.email; if (!payload.website) delete payload.website; await write("/profile", "PUT", payload); })}>
      <h2>School identity</h2><p className="helper">Changes are saved to the selected school profile.</p>
      <div className="form-grid">
        {([ ["displayName", "Display name"], ["legalName", "Legal name"], ["affiliationNumber", "Affiliation number"], ["addressLine1", "Address line 1"], ["addressLine2", "Address line 2"], ["locality", "Locality"], ["city", "City"], ["state", "State"], ["postalCode", "Postal code"], ["countryCode", "Country code"], ["phone", "Phone"], ["email", "Email"], ["website", "Website"], ["primaryLanguage", "Primary language"], ["timezone", "Timezone"], ["currency", "Currency"] ] as const).map(([key, label]) => <label key={key}>{label}<input value={profile[key] ?? ""} onChange={e => setProfile((old: any) => ({ ...old, [key]: e.target.value }))} required={key === "displayName"} /></label>)}
        <label>School type<select value={profile.schoolType ?? "PRIVATE"} onChange={e => setProfile((old: any) => ({ ...old, schoolType: e.target.value }))}>{["PUBLIC", "PRIVATE", "AIDED", "INTERNATIONAL", "OTHER"].map(v => <option key={v}>{v}</option>)}</select></label>
        <label>Board key<input value={profile.boardKey ?? ""} onChange={e => setProfile((old: any) => ({ ...old, boardKey: e.target.value }))} /></label>
        <label>Date format<select value={profile.dateFormat ?? "DD-MM-YYYY"} onChange={e => setProfile((old: any) => ({ ...old, dateFormat: e.target.value }))}>{["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD"].map(v => <option key={v}>{v}</option>)}</select></label>
        <label>Week starts on<select value={profile.weekStartsOn ?? 1} onChange={e => setProfile((old: any) => ({ ...old, weekStartsOn: Number(e.target.value) }))}>{weekdays.map((v, i) => <option key={v} value={i}>{v}</option>)}</select></label>
      </div><div className="form-actions"><button disabled={busy || loading || !session.can("school.settings.manage")}>Save school profile</button></div>
    </form>}
    {tab === "academic" && <form onSubmit={event => void submit(event, async () => { const created = await write("/academic-years", "POST", { name: yearName, code: yearCode, startsOn: yearStart, endsOn: yearEnd, makeCurrent }); setYearRows(old => [...old, created]); await reloadAcademicYears(); setYearName(""); setYearCode(""); })}>
      <h2>Academic years</h2><p className="helper">Create a new academic year. Existing years are listed below.</p>
      <div className="subsection"><h3>Existing academic years</h3>{yearRows.length ? yearRows.map(year => <div className="empty-row" key={year.id}>{year.name} · {year.code} · {String(year.startsOn).slice(0,10)} to {String(year.endsOn).slice(0,10)} {year.isCurrent ? "· Current" : ""}</div>) : <div className="empty-row">No academic years found.</div>}</div>
      <div className="form-grid"><label>Name<input required value={yearName} onChange={e => setYearName(e.target.value)} placeholder="2027–2028" /></label><label>Code<input required value={yearCode} onChange={e => setYearCode(e.target.value)} placeholder="2027-28" /></label><label>Starts on<input required type="date" value={yearStart} onChange={e => setYearStart(e.target.value)} /></label><label>Ends on<input required type="date" value={yearEnd} onChange={e => setYearEnd(e.target.value)} /></label></div>
      <label className="weekday"><input type="checkbox" checked={makeCurrent} onChange={e => setMakeCurrent(e.target.checked)} /> Make this the current academic year</label>
      {yearStart && yearEnd && yearEnd < yearStart && <p className="error">End date must not precede start date.</p>}
      <div className="form-actions"><button disabled={busy || loading || !session.can("academics.manage") || !yearName || !yearCode || !yearStart || !yearEnd || yearEnd < yearStart}>Create academic year</button></div>
    </form>}
    {tab === "academic" && <section className="subsection">
      <h3>Academic terms</h3><p className="helper">Manage terms within an academic year. Dates must stay inside the selected year.</p>
      <div className="form-grid"><label>Academic year<select value={selectedTermYear} onChange={e => setSelectedTermYear(e.target.value)}><option value="">Select academic year</option>{yearRows.map(year => <option key={year.id} value={year.id}>{year.name} ({String(year.startsOn).slice(0,10)} – {String(year.endsOn).slice(0,10)})</option>)}</select></label></div>
      {selectedTermYear && <><div className="subsection"><h4>Existing terms</h4>{termRows.length ? termRows.map(term => <div className="empty-row" key={term.id}>{term.sequence}. {term.name} · {term.code} · {term.termType} · {String(term.startsOn).slice(0,10)} to {String(term.endsOn).slice(0,10)}</div>) : <div className="empty-row">No terms configured for this academic year.</div>}</div>
      <form onSubmit={event => void submit(event, async () => { const created = await write(`/academic-years/${encodeURIComponent(selectedTermYear)}/terms`, "POST", { name: termName, code: termCode, termType, sequence: termSequence, startsOn: termStart, endsOn: termEnd }); setTermRows(old => [...old, created].sort((a,b) => a.sequence-b.sequence)); setTermName(""); setTermCode(""); })}>
        <div className="form-grid"><label>Name<input required value={termName} onChange={e => setTermName(e.target.value)} placeholder="Term 1" /></label><label>Code<input required value={termCode} onChange={e => setTermCode(e.target.value)} placeholder="T1" /></label><label>Type<select value={termType} onChange={e => setTermType(e.target.value)}>{["TERM","SEMESTER","QUARTER","TRIMESTER","CUSTOM"].map(v => <option key={v}>{v}</option>)}</select></label><label>Sequence<input type="number" min="1" max="20" required value={termSequence} onChange={e => setTermSequence(Number(e.target.value))} /></label><label>Starts on<input type="date" required value={termStart} onChange={e => setTermStart(e.target.value)} /></label><label>Ends on<input type="date" required value={termEnd} onChange={e => setTermEnd(e.target.value)} /></label></div>
        {termStart && termEnd && termEnd < termStart && <p className="error">End date must not precede start date.</p>}
        <div className="form-actions"><button disabled={busy || loading || !session.can("academics.manage") || !termName || !termCode || !termStart || !termEnd || termEnd < termStart}>Create academic term</button></div>
      </form></>}
    </section>}
    {tab === "calendar" && <>
      <h2>School calendar</h2><p className="helper">Create calendars and publish school events, holidays and closures.</p>
      <form onSubmit={event => void submit(event, async () => { const row = await write("/calendars", "POST", { name: calendarName, academicYearId: session.year || undefined, isDefault: calendars.length === 0 }); setCalendars(old => [...old, row]); setCalendarId(row.id); })}>
        <div className="form-grid"><label>New calendar name<input required value={calendarName} onChange={e => setCalendarName(e.target.value)} /></label><label>Existing calendar<select value={calendarId} onChange={e => setCalendarId(e.target.value)}><option value="">Select calendar</option>{calendars.map(row => <option key={row.id} value={row.id}>{row.name}{row.isDefault ? " (Default)" : ""}</option>)}</select></label></div>
        <div className="form-actions"><button disabled={busy || !session.can("academics.manage")}>Create calendar</button></div>
      </form>
      {calendarId && <><div className="subsection"><h3>Calendar events</h3>{events.map(row => <div className="empty-row" key={row.id}>{row.title} · {row.eventType} · {new Date(row.startsAt).toLocaleString()}</div>)}{!events.length && <div className="empty-row">No events configured.</div>}</div>
        <form onSubmit={event => void submit(event, async () => { await write(`/calendars/${encodeURIComponent(calendarId)}/events`, "POST", { title: eventTitle, eventType, startsAt: new Date(eventStart).toISOString(), endsAt: new Date(eventEnd).toISOString(), isAllDay: allDay, isInstructionDay: false, audience: "ALL" }); setEventTitle(""); await load(); })}>
          <h3>Add event</h3><div className="form-grid"><label>Title<input required value={eventTitle} onChange={e => setEventTitle(e.target.value)} /></label><label>Type<select value={eventType} onChange={e => setEventType(e.target.value)}>{["HOLIDAY", "SCHOOL_EVENT", "EXAM", "PARENT_MEETING", "STAFF_EVENT", "CLOSURE", "OTHER"].map(v => <option key={v}>{v}</option>)}</select></label><label>Starts at<input required type="datetime-local" value={eventStart} onChange={e => setEventStart(e.target.value)} /></label><label>Ends at<input required type="datetime-local" value={eventEnd} onChange={e => setEventEnd(e.target.value)} /></label></div><label className="weekday"><input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} /> All-day event</label><div className="form-actions"><button disabled={busy || !session.can("academics.manage") || !eventTitle || !eventStart || !eventEnd || eventEnd < eventStart}>Add event</button></div>
        </form></>}
    </>}
    {tab === "working" && <form onSubmit={event => void submit(event, async () => { await write("/working-days", "PUT", days); })}>
      <h2>Weekly working days</h2><p className="helper">Configure operating days and opening/closing times.</p>
      <div className="weekday-list">{weekdays.map((day, index) => { const row = days.find(item => item.dayOfWeek === index) ?? defaultDays[index]; return <div className="weekday" key={day}><label><input type="checkbox" checked={row.isWorkingDay} onChange={e => setDays(old => old.map(item => item.dayOfWeek === index ? { ...item, isWorkingDay: e.target.checked } : item))} /> {day}</label><label>Opens<input type="time" value={row.opensAt ?? "08:00"} onChange={e => setDays(old => old.map(item => item.dayOfWeek === index ? { ...item, opensAt: e.target.value } : item))} /></label><label>Closes<input type="time" value={row.closesAt ?? "15:00"} onChange={e => setDays(old => old.map(item => item.dayOfWeek === index ? { ...item, closesAt: e.target.value } : item))} /></label></div>; })}</div>
      <div className="form-actions"><button disabled={busy || loading || !session.can("school.settings.manage")}>Save working days</button></div>
    </form>}
    {tab === "policies" && <form onSubmit={event => void submit(event, async () => { await write("/policies", "PUT", { attendance: attendancePolicy, grading: gradingPolicy }); })}>
      <h2>School policies</h2><p className="helper">Attendance and grading policy values are stored as versioned school settings.</p>
      <div className="subsection"><h3>Attendance</h3><div className="form-grid"><label>Late after (minutes)<input type="number" min="0" max="240" value={attendancePolicy.lateAfterMinutes} onChange={e => setAttendancePolicy(old => ({ ...old, lateAfterMinutes: Number(e.target.value) }))} /></label><label className="weekday"><input type="checkbox" checked={attendancePolicy.allowHalfDay} onChange={e => setAttendancePolicy(old => ({ ...old, allowHalfDay: e.target.checked }))} /> Allow half-day attendance</label><label className="weekday"><input type="checkbox" checked={attendancePolicy.requireReasonForAbsence} onChange={e => setAttendancePolicy(old => ({ ...old, requireReasonForAbsence: e.target.checked }))} /> Require absence reason</label></div></div>
      <div className="subsection"><h3>Grading</h3><div className="form-grid"><label>Grading scale<select value={gradingPolicy.gradingScale} onChange={e => setGradingPolicy(old => ({ ...old, gradingScale: e.target.value }))}>{["PERCENTAGE", "LETTER", "GPA", "DESCRIPTIVE"].map(v => <option key={v}>{v}</option>)}</select></label><label>Passing percentage<input type="number" min="0" max="100" value={gradingPolicy.passingPercentage} onChange={e => setGradingPolicy(old => ({ ...old, passingPercentage: Number(e.target.value) }))} /></label><label>Decimal places<input type="number" min="0" max="3" value={gradingPolicy.decimalPlaces} onChange={e => setGradingPolicy(old => ({ ...old, decimalPlaces: Number(e.target.value) }))} /></label></div></div>
      <div className="form-actions"><button disabled={busy || loading || !session.can("school.settings.manage")}>Save policies</button></div>
    </form>}
  </section>;
}
