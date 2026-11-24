import React,{useCallback,useEffect,useState} from "react";
import {useSchoolAdminSession} from "./SchoolAdminSession";

type Journey={title:string;state:string;metrics:Record<string,string|number>;nextAction:string;blocker?:string;mobileCapabilities?:string[]};
type Overview={generatedAt:string;journeys:Record<string,Journey>;limitations:string[]};
const labels:Record<string,string>={
 admissionToEnrollment:"Admission to enrollment",
 attendanceToReportCard:"Attendance to report card",
 feeToLedger:"Fees to accounting ledger",
 staffToPayroll:"Staff to payroll",
 parentToMobile:"Parent to mobile"
};
const display=(value:string)=>value.replaceAll("_"," ").toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
export function JourneyReadinessWorkspace(){
 const {api,token,org,school,request}=useSchoolAdminSession();
 const [data,setData]=useState<Overview|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const load=useCallback(async()=>{
  if(!token||!org||!school)return;
  setBusy(true);setError("");
  try{
   const response=await request(`${api}/api/v1/${encodeURIComponent(org)}/${encodeURIComponent(school)}/journeys/overview`);
   const body=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(body.error||`Unable to load journey overview (${response.status})`);
   setData(body.data);
  }catch(e){setError(e instanceof Error?e.message:"Unable to load journey overview");}
  finally{setBusy(false);}
 },[api,token,org,school,request]);
 useEffect(()=>{void load();},[load]);
 return <section className="config-card" style={{display:"grid",gap:16}}>
  <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}>
   <div><h2>Cross-module journey readiness</h2><p className="helper">Operational read-only view across admissions, enrollment, attendance, reports, fees, staff and parent mobile.</p></div>
   <button disabled={busy} onClick={()=>void load()}>{busy?"Refreshing…":"Refresh"}</button>
  </div>
  {error&&<p className="error" role="alert">{error}</p>}
  {!data&&!error&&<p className="helper">Loading journey metrics…</p>}
  {data&&<>
   <p className="helper">Snapshot generated {new Date(data.generatedAt).toLocaleString()}</p>
   {Object.entries(data.journeys).map(([key,journey])=><article key={key} className="notice" style={{display:"grid",gap:10}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}><h3>{labels[key]||journey.title}</h3><b>{display(journey.state)}</b></div>
    <div className="form-grid">{Object.entries(journey.metrics).map(([metric,value])=><div key={metric}><small className="helper">{display(metric)}</small><div><b>{typeof value==="number"&&metric.toLowerCase().includes("amount")?new Intl.NumberFormat(undefined,{style:"currency",currency:"INR",maximumFractionDigits:2}).format(value):value}</b></div></div>)}</div>
    <p>{journey.nextAction}</p>
    {journey.blocker&&<p className="error">{journey.blocker}</p>}
    {journey.mobileCapabilities&&<p className="helper">Mobile areas: {journey.mobileCapabilities.join(" · ")}</p>}
   </article>)}
   <div><h3>Interpretation and limits</h3><ul>{data.limitations.map((item,index)=><li key={index}>{item}</li>)}</ul></div>
  </>}
 </section>;
}
