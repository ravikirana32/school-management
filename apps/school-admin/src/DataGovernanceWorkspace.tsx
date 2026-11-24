import React,{useCallback,useEffect,useState} from "react";
import {useSchoolAdminSession} from "./SchoolAdminSession";

type RequestRow={id:string;requestType:string;subjectType:string;subjectId:string;requesterName:string;status:string;requestedAt:string;reason?:string|null};
type HoldRow={id:string;targetType:string;targetId:string;reason:string;placedAt:string;releasedAt?:string|null};
type PolicyRow={id:string;recordType:string;retentionDays:number;enabled:boolean};
type ConsentEvent={id:string;guardianId:string;eventType:string;consentVersion:string;occurredAt:string;noticeSnapshot:string};
export function DataGovernanceWorkspace(){
 const {api,token,org,school,request}=useSchoolAdminSession();
 const prefix=`${api}/api/v1/${encodeURIComponent(org)}/${encodeURIComponent(school)}`;
 const [requests,setRequests]=useState<RequestRow[]>([]),[holds,setHolds]=useState<HoldRow[]>([]),[policies,setPolicies]=useState<PolicyRow[]>([]),[preview,setPreview]=useState<any[]>([]),[consents,setConsents]=useState<ConsentEvent[]>([]);
 const [requestType,setRequestType]=useState("ACCESS"),[subjectType,setSubjectType]=useState("STUDENT"),[subjectId,setSubjectId]=useState(""),[requesterName,setRequesterName]=useState(""),[requesterEmail,setRequesterEmail]=useState(""),[reason,setReason]=useState("");
 const [targetType,setTargetType]=useState("STUDENT_DOCUMENT"),[targetId,setTargetId]=useState(""),[holdReason,setHoldReason]=useState("");
 const [recordType,setRecordType]=useState("STUDENT_DOCUMENT"),[retentionDays,setRetentionDays]=useState("3650");
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const load=useCallback(async()=>{
  if(!token||!org||!school)return;
  const paths=["/governance/requests","/governance/legal-holds","/governance/retention-policies","/governance/retention-preview","/governance/consent-events"];
  const responses=await Promise.all(paths.map(path=>request(`${prefix}${path}`)));
  const payloads=await Promise.all(responses.map(r=>r.json().catch(()=>({}))));
  const failed=responses.findIndex(r=>!r.ok);if(failed>=0)throw new Error(payloads[failed].error||"Unable to load governance workspace");
  setRequests(payloads[0].data||[]);setHolds(payloads[1].data||[]);setPolicies(payloads[2].data||[]);setPreview(payloads[3].data?.items||[]);setConsents(payloads[4].data||[]);
 },[token,org,school,prefix,request]);
 useEffect(()=>{void load().catch(e=>setError(e.message));},[load]);
 const post=async(path:string,body:unknown)=>{
  setBusy(true);setError("");setNotice("");
  try{const r=await request(`${prefix}${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||`Request failed (${r.status})`);setNotice("Governance record saved.");await load();}
  catch(e){setError(e instanceof Error?e.message:"Action failed");}
  finally{setBusy(false);}
 };
 return <section className="config-card" style={{display:"grid",gap:18}}>
  <div><h2>Document &amp; data governance</h2><p className="helper">Manage data-subject requests, document legal holds and school retention policies. Erasure and retention are review-only; this workspace never deletes records automatically.</p></div>
  {error&&<p className="error" role="alert">{error}</p>}{notice&&<p className="notice" role="status">{notice}</p>}
  <form className="notice" style={{display:"grid",gap:10}} onSubmit={e=>{e.preventDefault();void post("/governance/requests",{requestType,subjectType,subjectId,requesterName,requesterEmail:requesterEmail||undefined,reason:reason||undefined});}}>
   <h3>Register data-subject request</h3><div className="form-grid">
    <label>Request type<select value={requestType} onChange={e=>setRequestType(e.target.value)}><option value="ACCESS">Access</option><option value="EXPORT">Data export</option><option value="ERASURE">Erasure</option><option value="CORRECTION">Correction</option></select></label>
    <label>Subject type<select value={subjectType} onChange={e=>setSubjectType(e.target.value)}><option value="STUDENT">Student</option><option value="GUARDIAN">Guardian</option><option value="STAFF">Staff</option></select></label>
    <label>Subject record ID<input required value={subjectId} onChange={e=>setSubjectId(e.target.value)} placeholder="Existing record ID"/></label>
    <label>Requester name<input required value={requesterName} onChange={e=>setRequesterName(e.target.value)}/></label>
    <label>Requester email<input type="email" value={requesterEmail} onChange={e=>setRequesterEmail(e.target.value)}/></label>
    <label>Reason<textarea value={reason} onChange={e=>setReason(e.target.value)}/></label>
   </div><button disabled={busy}>Register request</button>
  </form>
  <div><h3>Data-subject requests</h3>{requests.length===0?<p className="helper">No requests registered.</p>:requests.map(row=><article key={row.id} className="notice" style={{display:"grid",gap:8,marginTop:8}}>
   <b>{row.requestType} · {row.subjectType} · {row.requesterName}</b><small>{row.subjectId} · {row.status} · {new Date(row.requestedAt).toLocaleString()}</small>{row.reason&&<p>{row.reason}</p>}
   {row.status==="REQUESTED"&&<div className="form-actions"><button disabled={busy} onClick={()=>void post(`/governance/requests/${row.id}/review`,{decision:"UNDER_REVIEW"})}>Start review</button><button disabled={busy} onClick={()=>void post(`/governance/requests/${row.id}/review`,{decision:"APPROVED",resolutionNotes:"Approved for controlled fulfilment; verify identity and legal basis before execution."})}>Approve</button><button disabled={busy} onClick={()=>void post(`/governance/requests/${row.id}/review`,{decision:"REJECTED",resolutionNotes:"Request rejected after review."})}>Reject</button></div>}
  </article>)}</div>
  <form className="notice" style={{display:"grid",gap:10}} onSubmit={e=>{e.preventDefault();void post("/governance/legal-holds",{targetType,targetId,reason:holdReason});}}>
   <h3>Place document legal hold</h3><p className="helper">A hold blocks retention-based deletion review for the selected document. It does not grant download access.</p><div className="form-grid">
    <label>Document type<select value={targetType} onChange={e=>setTargetType(e.target.value)}><option value="STUDENT_DOCUMENT">Student document</option><option value="STAFF_DOCUMENT">Staff document</option><option value="HOMEWORK_ATTACHMENT">Homework attachment</option></select></label>
    <label>Document ID<input required value={targetId} onChange={e=>setTargetId(e.target.value)}/></label>
    <label>Legal basis / reason<input required minLength={5} value={holdReason} onChange={e=>setHoldReason(e.target.value)}/></label>
   </div><button disabled={busy}>Place legal hold</button>
  </form>
  <div><h3>Legal holds</h3>{holds.length===0?<p className="helper">No legal holds.</p>:holds.map(h=><article key={h.id} className="notice" style={{marginTop:8}}><b>{h.targetType} · {h.targetId}</b><p>{h.reason}</p><small>{h.releasedAt?`Released ${new Date(h.releasedAt).toLocaleString()}`:`Active · placed ${new Date(h.placedAt).toLocaleString()}`}</small>{!h.releasedAt&&<button disabled={busy} onClick={()=>{const releaseReason=window.prompt("Reason for releasing this legal hold");if(releaseReason)void post(`/governance/legal-holds/${h.id}/release`,{releaseReason});}}>Release hold</button>}</article>)}</div>
  <form className="notice" style={{display:"grid",gap:10}} onSubmit={e=>{e.preventDefault();void post("/governance/retention-policies",{recordType,retentionDays:Number(retentionDays),enabled:true});}}>
   <h3>Retention policy</h3><div className="form-grid"><label>Record type<select value={recordType} onChange={e=>setRecordType(e.target.value)}><option value="STUDENT_DOCUMENT">Student documents</option><option value="STAFF_DOCUMENT">Staff documents</option><option value="HOMEWORK_ATTACHMENT">Homework attachments</option></select></label><label>Retention period (days)<input type="number" min="1" max="36500" value={retentionDays} onChange={e=>setRetentionDays(e.target.value)}/></label></div><button disabled={busy}>Save retention policy</button>
  </form>
  <div><h3>Configured policies</h3>{policies.map(p=><p key={p.id} className="notice">{p.recordType}: {p.retentionDays} days · {p.enabled?"Enabled":"Disabled"}</p>)}</div>
  <div><h3>Consent history</h3><p className="helper">Append-only acceptance and withdrawal events captured from parent invitation and withdrawal flows.</p>{consents.length===0?<p className="helper">No consent events recorded yet.</p>:consents.map(c=><article key={c.id} className="notice" style={{marginTop:8}}><b>{c.eventType} · Guardian {c.guardianId}</b><small>{c.consentVersion} · {new Date(c.occurredAt).toLocaleString()}</small><p>{c.noticeSnapshot}</p></article>)}</div>
  <div><h3>Retention review preview</h3><p className="helper">Only CLEAN documents older than the configured period are listed. Active legal holds are excluded from eligibility. This is not a deletion job.</p>{preview.length===0?<p className="helper">No documents currently match the preview criteria.</p>:preview.map(p=><p key={`${p.recordType}-${p.id}`} className="notice">{p.recordType} · {p.id} · {p.blockedByLegalHold?"Blocked by active legal hold":"Eligible for authorized review"}</p>)}</div>
 </section>;
}
