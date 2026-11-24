import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSchoolAdminSession } from "./SchoolAdminSession";

type Session = {
  id:string; academicYearId:string; gradeLevelId:string; sectionName:string|null;
  sessionDate:string; status:"DRAFT"|"OPEN"|"SUBMITTED"|"LOCKED";
};
type RosterItem = {
  enrollmentId:string; rollNumber:string|null;
  student:{id:string;admissionNumber:string;firstName:string;middleName?:string|null;lastName?:string|null;preferredName?:string|null};
  attendance?:{id:string;status:MarkStatus;remarks?:string|null}|null;
};
type MarkStatus = "PRESENT"|"ABSENT"|"LATE"|"HALF_DAY"|"EXCUSED"|"LEAVE";
type GradeOption = {id:string; name:string; code?:string};
type SectionCapacity = {academicYearId:string; gradeLevelId:string; sectionName:string; capacity?:number; enrolledSeats?:number; reservedSeats?:number};
const statuses:MarkStatus[]=["PRESENT","ABSENT","LATE","HALF_DAY","EXCUSED","LEAVE"];
export function AttendanceWorkspace() {
  const session = useSchoolAdminSession();
  const { api, token, org: organizationId, school: schoolId, year: academicYearId, request: sessionRequest } = session;
  const [gradeLevelId,setGradeLevelId]=useState("");
  const [sectionName,setSectionName]=useState("");
  const [gradeOptions,setGradeOptions]=useState<GradeOption[]>([]);
  const [sectionOptions,setSectionOptions]=useState<SectionCapacity[]>([]);
  const [catalogBusy,setCatalogBusy]=useState(false);
  const [catalogMessage,setCatalogMessage]=useState("");
  const [sessionDate,setSessionDate]=useState(new Date().toISOString().slice(0,10));
  const [sessions,setSessions]=useState<Session[]>([]);
  const [selectedSession,setSelectedSession]=useState<Session|null>(null);
  const [roster,setRoster]=useState<RosterItem[]>([]);
  const [marks,setMarks]=useState<Record<string,MarkStatus>>({});
  const [remarks,setRemarks]=useState<Record<string,string>>({});
  const [correctionStatus,setCorrectionStatus]=useState<Record<string,MarkStatus>>({});
  const [correctionReason,setCorrectionReason]=useState<Record<string,string>>({});
  const [correctionRequests,setCorrectionRequests]=useState<any[]>([]);
  const [reportSessions,setReportSessions]=useState<any[]>([]);
  const [rangeStart,setRangeStart]=useState(new Date().toISOString().slice(0,10));
  const [rangeEnd,setRangeEnd]=useState(new Date().toISOString().slice(0,10));
  const [rangeReports,setRangeReports]=useState<any[]>([]);
  const [reportBusy,setReportBusy]=useState(false);
  const [reportError,setReportError]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("Select an authenticated school and academic year above to connect.");
  const [error,setError]=useState("");

  const base=api.trim().replace(/\/+$/,"");
  const configured=!!(base&&token.trim()&&organizationId.trim()&&schoolId.trim());
  const endpoint=`${base}/api/v1/${encodeURIComponent(organizationId)}/${encodeURIComponent(schoolId)}/attendance`;
  const request=useCallback(async(path:string,init:RequestInit={})=>{
    const response=await sessionRequest(`${endpoint}${path}`,{
      ...init,
      headers:{"Content-Type":"application/json",...(init.headers||{})}
    });
    const body=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(body.error||body.message||`Request failed (${response.status})`);
    return body.data;
  },[endpoint,sessionRequest]);

  useEffect(()=>{
    if(!configured||!academicYearId)return;
    let cancelled=false;
    setCatalogBusy(true);setCatalogMessage("");
    const apiRoot=base;
    const catalogRequest=async(path:string)=>{
      const response=await sessionRequest(`${apiRoot}${path}`,{headers:{Accept:"application/json"}});
      const body=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(body.error||body.message||`Request failed (${response.status})`);
      return body.data??body;
    };
    void Promise.all([
      catalogRequest(`/api/v1/curriculum/${encodeURIComponent(organizationId)}/${encodeURIComponent(schoolId)}/grades`),
      catalogRequest(`/api/v1/${encodeURIComponent(organizationId)}/${encodeURIComponent(schoolId)}/admissions/capacities`)
    ]).then(([gradeData,capacityData])=>{
      if(cancelled)return;
      const grades=Array.isArray(gradeData)?gradeData:[];
      setGradeOptions(grades.map((g:any)=>({id:String(g.id),name:String(g.name||g.code||g.id),code:g.code?String(g.code):undefined})));
      setSectionOptions(Array.isArray(capacityData)?capacityData.map((c:any)=>({academicYearId:String(c.academicYearId),gradeLevelId:String(c.gradeLevelId),sectionName:String(c.sectionName),capacity:Number(c.capacity||0),enrolledSeats:Number(c.enrolledSeats||0),reservedSeats:Number(c.reservedSeats||0)})):[]);
      setCatalogMessage("Grade and configured-section catalog loaded.");
    }).catch(e=>{if(!cancelled)setCatalogMessage(e instanceof Error?e.message:"Unable to load attendance grade/section catalog");}).finally(()=>{if(!cancelled)setCatalogBusy(false);});
    return ()=>{cancelled=true;};
  },[configured,academicYearId,base,organizationId,schoolId,sessionRequest]);

  const filteredSections=sectionOptions.filter(c=>String(c.academicYearId)===String(academicYearId)&&String(c.gradeLevelId)===String(gradeLevelId));


  const loadSessions=useCallback(async()=>{
    if(!configured)return;
    setBusy(true);setError("");
    try {
      const data=await request(`/sessions?date=${encodeURIComponent(sessionDate)}`);
      setSessions(Array.isArray(data)?data:[]);
      setMessage("Attendance sessions loaded from the school API.");
    } catch(e){setError(e instanceof Error?e.message:"Unable to load sessions");}
    finally{setBusy(false);}
  },[configured,request,sessionDate]);

  const loadRoster=useCallback(async(session:Session)=>{
    setBusy(true);setError("");
    try {
      const data=await request(`/sessions/${encodeURIComponent(session.id)}/roster`);
      const items: RosterItem[]=data.items||[];
      setRoster(items);
      const nextMarks:Record<string,MarkStatus>={};
      const nextRemarks:Record<string,string>={};
      for(const item of items)if(item.attendance){
        nextMarks[item.student.id]=item.attendance.status;
        nextRemarks[item.student.id]=item.attendance.remarks||"";
      }
      setMarks(nextMarks);setRemarks(nextRemarks);setSelectedSession(data.session);
      setMessage(`${items.length} enrolled students loaded for ${session.sessionDate}.`);
    } catch(e){setError(e instanceof Error?e.message:"Unable to load class roster");}
    finally{setBusy(false);}
  },[request]);

  useEffect(()=>{if(configured)void loadSessions();},[configured,loadSessions]);

  const markedCount=useMemo(()=>Object.keys(marks).length,[marks]);
  const updateMark=(studentId:string,status:MarkStatus)=>setMarks(old=>({...old,[studentId]:status}));

  async function createSession(){
    if(!configured||!academicYearId.trim()||!gradeLevelId.trim())return;
    setBusy(true);setError("");
    try {
      const created:Session=await request("/sessions",{method:"POST",body:JSON.stringify({
        academicYearId:academicYearId.trim(),gradeLevelId:gradeLevelId.trim(),
        sectionName:sectionName.trim()||undefined,sessionDate
      })});
      setMessage("Attendance session created.");
      await loadSessions();
      await loadRoster(created);
    } catch(e){setError(e instanceof Error?e.message:"Unable to create session");}
    finally{setBusy(false);}
  }

  async function transition(action:"open"|"submit"|"lock"){
    if(!selectedSession)return;
    setBusy(true);setError("");
    try {
      const updated:Session=await request(`/sessions/${selectedSession.id}/${action}`,{method:"POST",body:"{}"});
      setSelectedSession(updated);
      setSessions(old=>old.map(s=>s.id===updated.id?updated:s));
      setMessage(`Session ${action==="open"?"opened":action==="submit"?"submitted":"locked"}.`);
      if(action==="open")await loadRoster(updated);
    } catch(e){setError(e instanceof Error?e.message:"Unable to update session");}
    finally{setBusy(false);}
  }

  async function requestCorrection(item:RosterItem){
    const attendanceId=item.attendance?.id;
    const requestedStatus=correctionStatus[attendanceId||""];
    const reason=(correctionReason[attendanceId||""]||"").trim();
    if(!attendanceId||!requestedStatus||reason.length<10){setError("Choose a requested status and provide a reason of at least 10 characters.");return;}
    setBusy(true);setError("");
    try{
      await request(`/${attendanceId}/correction-requests`,{method:"POST",body:JSON.stringify({requestedStatus,reason})});
      setMessage(`Correction request submitted for ${item.student.admissionNumber}.`);
      setCorrectionStatus(old=>({...old,[attendanceId]:requestedStatus}));
    }catch(e){setError(e instanceof Error?e.message:"Unable to submit correction request");}
    finally{setBusy(false);}
  }

  async function loadCorrectionRequests(){
    setBusy(true);setError("");
    try{const data=await request("/correction-requests?status=PENDING");setCorrectionRequests(Array.isArray(data)?data:[]);setMessage("Pending correction requests loaded.");}
    catch(e){setError(e instanceof Error?e.message:"Unable to load correction requests");}
    finally{setBusy(false);}
  }

  async function reviewCorrection(requestId:string,decision:"APPROVED"|"REJECTED"){
    setBusy(true);setError("");
    try{await request(`/correction-requests/${encodeURIComponent(requestId)}/review`,{method:"POST",body:JSON.stringify({decision})});setMessage(`Correction request ${decision.toLowerCase()}.`);await loadCorrectionRequests();}
    catch(e){setError(e instanceof Error?e.message:"Unable to review correction request");}
    finally{setBusy(false);}
  }

  async function generateDailyReport(){
    if(!configured)return;
    setReportBusy(true);setReportError("");
    try{
      const sessionData=await request(`/sessions?date=${encodeURIComponent(sessionDate)}`);
      const daySessions=Array.isArray(sessionData)?sessionData:[];
      const withRosters=await Promise.all(daySessions.map(async (item:Session)=>{
        const detail=await request(`/sessions/${encodeURIComponent(item.id)}/roster`);
        const rosterItems:RosterItem[]=Array.isArray(detail?.items)?detail.items:[];
        return {...item,items:rosterItems};
      }));
      setReportSessions(withRosters);
    }catch(e){setReportError(e instanceof Error?e.message:"Unable to generate attendance report");setReportSessions([]);}
    finally{setReportBusy(false);}
  }


  async function generateRangeReport(){
    if(!configured)return;
    if(!rangeStart||!rangeEnd||rangeEnd<rangeStart){setReportError("Choose a valid date range.");return;}
    const start=new Date(`${rangeStart}T00:00:00Z`),end=new Date(`${rangeEnd}T00:00:00Z`);
    const dayCount=Math.floor((end.getTime()-start.getTime())/86400000)+1;
    if(dayCount>31){setReportError("Date range is limited to 31 days for this basic report.");return;}
    setReportBusy(true);setReportError("");setRangeReports([]);
    try{
      const dates=Array.from({length:dayCount},(_,i)=>new Date(start.getTime()+i*86400000).toISOString().slice(0,10));
      const daily=await Promise.all(dates.map(async date=>{
        const raw=await request(`/sessions?date=${encodeURIComponent(date)}`);const sessions=Array.isArray(raw)?raw:[];
        const loaded=await Promise.all(sessions.map(async session=>{const detail=await request(`/sessions/${encodeURIComponent(session.id)}/roster`);return {...session,items:Array.isArray(detail?.items)?detail.items:[]};}));
        return {date,sessions:loaded};
      }));setRangeReports(daily);
    }catch(e){setReportError(e instanceof Error?e.message:"Unable to generate attendance range report");setRangeReports([]);}finally{setReportBusy(false);}
  }

  function csvCell(value:unknown){const text=String(value??"");return `\"${text.replace(/\"/g,'\"\"')}\"`;}
  function downloadCsv(filename:string, rows:unknown[][]){const csv=rows.map(row=>row.map(csvCell).join(",")).join("\r\n");const blob=new Blob(["\uFEFF",csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);}
  function exportDailyReport(){if(!reportSessions.length)return;const rows:unknown[][]=[["Date","Session ID","Grade","Section","Session Status","Student ID","Admission Number","Student Name","Attendance Status","Remarks"]];for(const session of reportSessions){for(const item of session.items||[]){rows.push([session.sessionDate,session.id,session.gradeLevelId,session.sectionName,session.status,item.student?.id,item.student?.admissionNumber,[item.student?.preferredName,item.student?.firstName,item.student?.middleName,item.student?.lastName].filter(Boolean).join(" "),item.attendance?.status||"UNMARKED",item.attendance?.remarks||""]);}}downloadCsv(`attendance-daily-${sessionDate}.csv`,rows);setMessage("Daily attendance CSV exported.");}
  function exportRangeReport(){if(!rangeReports.length)return;const rows:unknown[][]=[["Date","Sessions","Roster","Marked","Present Equivalent","Absent","Late","Unmarked","Presence Rate (%)"]];for(const day of rangeReports){const entries=day.sessions.flatMap((session:any)=>session.items||[]);const marked=entries.filter((entry:any)=>entry.attendance);const present=marked.filter((entry:any)=>["PRESENT","LATE","HALF_DAY"].includes(entry.attendance.status)).length;const absent=marked.filter((entry:any)=>entry.attendance.status==="ABSENT").length;const late=marked.filter((entry:any)=>entry.attendance.status==="LATE").length;rows.push([day.date,day.sessions.length,entries.length,marked.length,present,absent,late,entries.length-marked.length,marked.length?Math.round(present/marked.length*1000)/10:0]);}downloadCsv(`attendance-range-${rangeStart}-to-${rangeEnd}.csv`,rows);setMessage("Historical attendance CSV exported.");}


  async function saveMarks(){
    if(!selectedSession||selectedSession.status!=="OPEN")return;
    const payload=roster.filter(r=>marks[r.student.id]).map(r=>({
      studentId:r.student.id,status:marks[r.student.id],
      ...(remarks[r.student.id]?.trim()?{remarks:remarks[r.student.id].trim()}: {})
    }));
    if(!payload.length){setError("Mark at least one student before saving.");return;}
    setBusy(true);setError("");
    try {
      await request(`/sessions/${selectedSession.id}/marks`,{method:"POST",body:JSON.stringify({marks:payload})});
      setMessage(`${payload.length} attendance marks saved.`);
      await loadRoster(selectedSession);
    } catch(e){setError(e instanceof Error?e.message:"Unable to save attendance marks");}
    finally{setBusy(false);}
  }

  return <section className="attendance-workspace">
    <div className="attendance-heading">
      <div><h2>Student attendance</h2><p>Connected attendance workflow. Access tokens are held in memory only and are not saved in browser storage.</p></div>
      <span className="environment">API CONNECTED UI</span>
    </div>
    <div className="attendance-connection">
      <h3>Shared authenticated school scope</h3>
      <p className="helper">API URL, user session, organization and school are provided by the authenticated workspace above.</p>
      <div className="form-actions"><span>{configured?"Authenticated school context is active.":"Sign in and select a school and academic year above."}</span><button type="button" disabled={!configured||busy} onClick={()=>void loadSessions()}>Load sessions</button></div>
    </div>
    <div className="attendance-connection">
      <h3>Create attendance session</h3>
      <div className="form-grid">
        <label>Academic year<input value={session.years.find(item=>item.id===academicYearId)?.name||"Select above"} readOnly /></label>
        {gradeOptions.length>0?<label>Grade level<select value={gradeLevelId} onChange={e=>{setGradeLevelId(e.target.value);setSectionName("");}} disabled={catalogBusy}><option value="">Select grade</option>{gradeOptions.map(g=><option key={g.id} value={g.id}>{g.name}{g.code?` (${g.code})`: ""}</option>)}</select></label>:<label>Grade level ID<input value={gradeLevelId} onChange={e=>{setGradeLevelId(e.target.value);setSectionName("");}} placeholder="Catalog unavailable — enter grade ID"/></label>}
        {filteredSections.length>0?<label>Section<select value={sectionName} onChange={e=>setSectionName(e.target.value)}><option value="">Select section</option>{filteredSections.map(c=><option key={`${c.academicYearId}-${c.gradeLevelId}-${c.sectionName}`} value={c.sectionName}>{c.sectionName}</option>)}</select></label>:<label>Section<input value={sectionName} onChange={e=>setSectionName(e.target.value)} placeholder="A (manual if not configured)"/></label>}
        <label>Attendance date<input type="date" value={sessionDate} onChange={e=>setSessionDate(e.target.value)}/></label>
      </div>
      {catalogMessage&&<p className="helper" role="status">{catalogMessage}</p>}
      <div className="form-actions"><span>Only active students enrolled in this year, grade and section are included in the roster.</span><button type="button" disabled={!configured||!academicYearId.trim()||!gradeLevelId.trim()||!sectionName.trim()||busy} onClick={()=>void createSession()}>Create session</button></div>
    </div>
    {error&&<div className="attendance-error" role="alert">{error}</div>}
    {message&&<div className="attendance-message" role="status">{message}</div>}
    <div className="attendance-columns">
      <div className="attendance-connection">
        <h3>Sessions for {sessionDate}</h3>
        {sessions.length===0?<p className="helper">No sessions loaded for this date.</p>:sessions.map(session=><button type="button" className={`attendance-session ${selectedSession?.id===session.id?"selected":""}`} key={session.id} onClick={()=>void loadRoster(session)}>
          <b>{session.sectionName||"No section"}</b><span>{session.gradeLevelId}</span><small>{session.status}</small>
        </button>)}
      </div>
      <div className="attendance-connection">
        <h3>Class roster {selectedSession?`· ${selectedSession.status}`:""}</h3>
        {!selectedSession?<p className="helper">Select a session to load enrolled students.</p>:<>
          <p className="helper">{selectedSession.sessionDate} · {roster.length} students · {markedCount} marked</p>
          <div className="attendance-table-wrap"><table className="attendance-table">
            <thead><tr><th>Student</th><th>Admission no.</th><th>Status</th><th>Remarks</th></tr></thead>
            <tbody>{roster.map(item=><tr key={item.student.id}>
              <td>{item.student.preferredName||[item.student.firstName,item.student.middleName,item.student.lastName].filter(Boolean).join(" ")}</td>
              <td>{item.student.admissionNumber}</td>
              <td>{item.attendance? <div><strong>{item.attendance.status}</strong><div className="helper">Recorded</div>{selectedSession.status!=="OPEN"&&<div className="attendance-correction"><select aria-label={`Requested correction status for ${item.student.admissionNumber}`} value={correctionStatus[item.attendance.id]||""} onChange={e=>setCorrectionStatus(old=>({...old,[item.attendance!.id]:e.target.value as MarkStatus}))}><option value="">Request change…</option>{statuses.map(status=><option value={status} key={status}>{status}</option>)}</select><input aria-label={`Correction reason for ${item.student.admissionNumber}`} placeholder="Reason (min 10 chars)" value={correctionReason[item.attendance.id]||""} onChange={e=>setCorrectionReason(old=>({...old,[item.attendance!.id]:e.target.value}))}/><button type="button" disabled={busy||!correctionStatus[item.attendance.id]||(correctionReason[item.attendance.id]||"").trim().length<10} onClick={()=>void requestCorrection(item)}>Request correction</button></div>}</div>:<select aria-label={`Attendance for ${item.student.admissionNumber}`} disabled={selectedSession.status!=="OPEN"} value={marks[item.student.id]||""} onChange={e=>e.target.value&&updateMark(item.student.id,e.target.value as MarkStatus)}>
                <option value="">Unmarked</option>{statuses.map(status=><option value={status} key={status}>{status}</option>)}
              </select>}</td>
              <td><input aria-label={`Remarks for ${item.student.admissionNumber}`} disabled={selectedSession.status!=="OPEN"||!!item.attendance} value={remarks[item.student.id]||""} onChange={e=>setRemarks(old=>({...old,[item.student.id]:e.target.value}))}/></td>
            </tr>)}</tbody>
          </table></div>
          <div className="form-actions attendance-actions">
            <button type="button" disabled={busy||selectedSession.status!=="OPEN"||!markedCount} onClick={()=>void saveMarks()}>Save marks</button>
            <button type="button" disabled={busy||selectedSession.status!=="DRAFT"} onClick={()=>void transition("open")}>Open</button>
            <button type="button" disabled={busy||selectedSession.status!=="OPEN"||!roster.some(r=>r.attendance)||!markedCount} onClick={()=>void transition("submit")}>Submit</button>
            <button type="button" disabled={busy||selectedSession.status!=="SUBMITTED"} onClick={()=>void transition("lock")}>Lock</button>
          </div>
        </>}
      </div>
    </div>
    <div className="attendance-connection">
      <h3>Daily attendance report</h3>
      <p className="helper">Report for the selected attendance date. Data is loaded from the authenticated school API; counts are calculated from recorded student marks across sessions.</p>
      <div className="form-actions"><span>Report date: {sessionDate}</span><button type="button" disabled={!configured||reportBusy||busy} onClick={()=>void generateDailyReport()}>{reportBusy?"Generating…":"Generate daily report"}</button></div>
      {reportSessions.length>0&&<div className="form-actions"><button type="button" onClick={exportDailyReport}>Export daily report CSV</button></div>}
      <h4>Historical range summary (up to 31 days)</h4>
      <div className="form-grid"><label>From date<input type="date" value={rangeStart} onChange={e=>setRangeStart(e.target.value)} /></label><label>To date<input type="date" min={rangeStart} value={rangeEnd} onChange={e=>setRangeEnd(e.target.value)} /></label><button type="button" disabled={!configured||reportBusy||busy||!rangeStart||!rangeEnd||rangeEnd<rangeStart} onClick={()=>void generateRangeReport()}>{reportBusy?"Generating…":"Generate range report"}</button></div>
      {rangeReports.length>0&&(()=>{const dailyRows=rangeReports.map(day=>{const entries=day.sessions.flatMap((session:any)=>session.items||[]);const marked=entries.filter((entry:any)=>entry.attendance);const present=marked.filter((entry:any)=>["PRESENT","LATE","HALF_DAY"].includes(entry.attendance.status)).length;return {date:day.date,sessions:day.sessions.length,roster:entries.length,marked:marked.length,present,absent:marked.filter((entry:any)=>entry.attendance.status==="ABSENT").length,late:marked.filter((entry:any)=>entry.attendance.status==="LATE").length,rate:marked.length?Math.round(present/marked.length*1000)/10:0};});const total=dailyRows.reduce((a,r)=>({sessions:a.sessions+r.sessions,marked:a.marked+r.marked,present:a.present+r.present,absent:a.absent+r.absent,late:a.late+r.late}),{sessions:0,marked:0,present:0,absent:0,late:0});return <><div className="attendance-report-summary"><div><strong>{dailyRows.length}</strong><span>Days</span></div><div><strong>{total.sessions}</strong><span>Sessions</span></div><div><strong>{total.marked}</strong><span>Marked</span></div><div><strong>{total.marked?Math.round(total.present/total.marked*1000)/10:0}%</strong><span>Presence rate</span></div></div><div className="attendance-table-wrap"><table className="attendance-table"><thead><tr><th>Date</th><th>Sessions</th><th>Roster</th><th>Marked</th><th>Present*</th><th>Absent</th><th>Late</th><th>Rate</th></tr></thead><tbody>{dailyRows.map(r=><tr key={r.date}><td>{r.date}</td><td>{r.sessions}</td><td>{r.roster}</td><td>{r.marked}</td><td>{r.present}</td><td>{r.absent}</td><td>{r.late}</td><td>{r.rate}%</td></tr>)}</tbody></table></div><p className="helper">*Present includes PRESENT, LATE and HALF_DAY. Unmarked entries are excluded from the presence-rate calculation.</p><div className="form-actions"><button type="button" onClick={exportRangeReport}>Export historical range CSV</button></div></>;})()}

      {reportError&&<div className="attendance-error" role="alert">{reportError}</div>}
      {reportSessions.length>0&&(()=>{
        const items=reportSessions.flatMap((item:any)=>item.items||[]);
        const count=(status:MarkStatus)=>items.filter((i:any)=>i.attendance?.status===status).length;
        const marked=items.filter((i:any)=>i.attendance).length;
        const present=count("PRESENT")+count("LATE")+count("HALF_DAY");
        const percentage=marked?Math.round((present/marked)*1000)/10:0;
        return <>
          <div className="attendance-report-summary">
            <div><strong>{reportSessions.length}</strong><span>Sessions</span></div>
            <div><strong>{items.length}</strong><span>Roster entries</span></div>
            <div><strong>{marked}</strong><span>Marked</span></div>
            <div><strong>{percentage}%</strong><span>Presence rate*</span></div>
          </div>
          <div className="attendance-report-summary">
            {statuses.map(status=><div key={status}><strong>{count(status)}</strong><span>{status.replace("_"," ")}</span></div>)}
          </div>
          <p className="helper">*Presence rate counts PRESENT, LATE and HALF_DAY as present-equivalent, divided by recorded marks. Unmarked roster entries are excluded.</p>
          <div className="attendance-table-wrap"><table className="attendance-table"><thead><tr><th>Grade</th><th>Section</th><th>Session</th><th>Roster</th><th>Marked</th><th>Present</th><th>Absent</th><th>Late</th><th>Rate</th></tr></thead><tbody>
            {reportSessions.map((item:any)=>{const list=item.items||[];const m=list.filter((i:any)=>i.attendance);const p=m.filter((i:any)=>["PRESENT","LATE","HALF_DAY"].includes(i.attendance.status)).length;const a=m.filter((i:any)=>i.attendance.status==="ABSENT").length;const l=m.filter((i:any)=>i.attendance.status==="LATE").length;return <tr key={item.id}><td>{item.gradeLevelId}</td><td>{item.sectionName||"—"}</td><td>{item.status}</td><td>{list.length}</td><td>{m.length}</td><td>{p}</td><td>{a}</td><td>{l}</td><td>{m.length?Math.round(p/m.length*1000)/10:0}%</td></tr>})}
          </tbody></table></div>
          <div className="attendance-table-wrap"><table className="attendance-table"><thead><tr><th>Student</th><th>Admission no.</th><th>Grade/Section</th><th>Status</th></tr></thead><tbody>
            {reportSessions.flatMap((item:any)=>(item.items||[]).map((student:any)=><tr key={`${item.id}-${student.student.id}`}><td>{student.student.preferredName||[student.student.firstName,student.student.middleName,student.student.lastName].filter(Boolean).join(" ")}</td><td>{student.student.admissionNumber}</td><td>{item.gradeLevelId} / {item.sectionName||"—"}</td><td>{student.attendance?.status||"UNMARKED"}</td></tr>))}
          </tbody></table></div>
        </>
      })()}
      {reportSessions.length===0&&!reportBusy&&!reportError&&<p className="helper">No report generated yet.</p>}
    </div>
    <div className="attendance-connection">
      <h3>Attendance correction review</h3>
      <p className="helper">School administrators can review pending correction requests. Review access is enforced by the API.</p>
      <div className="form-actions"><button type="button" disabled={!configured||busy} onClick={()=>void loadCorrectionRequests()}>Load pending requests</button></div>
      {correctionRequests.length===0?<p className="helper">No pending correction requests loaded.</p>:correctionRequests.map((item:any)=><div className="attendance-session" key={item.id}><b>{item.requestedStatus}</b><span>{item.reason}</span><small>{item.studentId} · {item.attendanceId}</small><div className="form-actions"><button type="button" disabled={busy} onClick={()=>void reviewCorrection(item.id,"APPROVED")}>Approve</button><button type="button" disabled={busy} onClick={()=>void reviewCorrection(item.id,"REJECTED")}>Reject</button></div></div>)}
    </div>
    {busy&&<p className="helper">Working…</p>}
  </section>;
}
