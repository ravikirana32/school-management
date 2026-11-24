import React, { useCallback, useEffect, useState } from "react";
import { useSchoolAdminSession } from "./SchoolAdminSession";

type Plan = { key:string; name:string; description?:string|null; currency:string; monthlyPrice:string|number; quarterlyPrice?:string|number|null; yearlyPrice?:string|number|null; trialDays:number; entitlements?:Record<string,unknown>; limits?:Record<string,unknown> };
type Subscription = Record<string,any> & { plan?:{key:string;name:string;entitlements?:Record<string,unknown>;limits?:Record<string,unknown>} };
type Invoice = Record<string,any>;
export function SubscriptionBillingWorkspace(){
  const {api,token,org,request}=useSchoolAdminSession();
  const [plans,setPlans]=useState<Plan[]>([]);
  const [subscription,setSubscription]=useState<Subscription|null>(null);
  const [invoices,setInvoices]=useState<Invoice[]>([]);
  const [interval,setInterval]=useState<"MONTHLY"|"QUARTERLY"|"YEARLY">("MONTHLY");
  const [selectedPlan,setSelectedPlan]=useState("");
  const [loading,setLoading]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const base=`${api.replace(/\/+$/,"")}/api/v1/billing`;
  const call=useCallback(async(path:string,init:RequestInit={})=>{
    const response=await request(`${base}${path}`,init);
    const payload=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(payload.error||`Request failed (${response.status})`);
    return payload.data;
  },[base,request]);
  const load=useCallback(async()=>{
    if(!token||!org)return;
    setLoading(true);setError("");
    try{
      const [planData,subData,invoiceData]=await Promise.all([
        call("/plans"),
        call(`/organizations/${encodeURIComponent(org)}/subscription`).catch(e=>e instanceof Error&&e.message.includes("404")?null:Promise.reject(e)),
        call(`/organizations/${encodeURIComponent(org)}/invoices`).catch(e=>e instanceof Error&&e.message.includes("404")?[]:Promise.reject(e))
      ]);
      setPlans(Array.isArray(planData)?planData:[]);
      setSubscription(subData||null);
      setInvoices(Array.isArray(invoiceData)?invoiceData:[]);
      if(!selectedPlan&&Array.isArray(planData)&&planData.length)setSelectedPlan(planData[0].key);
    }catch(e){setError(e instanceof Error?e.message:"Unable to load billing details.");}
    finally{setLoading(false);}
  },[token,org,call]);
  useEffect(()=>{void load();},[load]);
  const price=(plan:Plan)=>interval==="YEARLY"?plan.yearlyPrice:interval==="QUARTERLY"?plan.quarterlyPrice:plan.monthlyPrice;
  async function start(planKey:string){
    setBusy(true);setError("");setNotice("");
    try{
      const result=await call(`/organizations/${encodeURIComponent(org)}/subscription`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({planKey,interval})});
      setNotice(`Subscription request created (${result?.status||"submitted"}).`);
      await load();
    }catch(e){setError(e instanceof Error?e.message:"Unable to start subscription.")}
    finally{setBusy(false);}
  }
  const live=subscription&&["PENDING_PAYMENT","TRIALING","ACTIVE","PAST_DUE","PAUSED"].includes(subscription.status);
  const money=(value:any,currency:string)=>value==null?"—":`${currency} ${Number(value).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  return <section className="config-card billing-workspace">
    <div className="workspace-heading"><div><h2>Subscription &amp; billing</h2><p className="helper">Review subscription status, available plans and organization invoices.</p></div><button type="button" onClick={()=>void load()} disabled={loading||busy}>Refresh</button></div>
    {!token||!org?<div className="notice">Sign in and select an organization to view billing.</div>:null}
    {loading?<div className="notice">Loading subscription and billing records…</div>:null}
    {error?<div className="notice error">{error}</div>:null}
    {notice?<div className="notice success">{notice}</div>:null}
    {subscription?<div className="billing-summary">
      <h3>Current subscription</h3>
      <div className="form-grid">
        <div><small>Plan</small><strong>{subscription.plan?.name||subscription.planId}</strong></div>
        <div><small>Status</small><strong>{subscription.status}</strong></div>
        <div><small>Interval</small><strong>{subscription.billingInterval}</strong></div>
        <div><small>Price</small><strong>{money(subscription.unitPrice,subscription.currency)}</strong></div>
        <div><small>Period starts</small><strong>{subscription.currentPeriodStartsAt?new Date(subscription.currentPeriodStartsAt).toLocaleDateString():"—"}</strong></div>
        <div><small>Period ends</small><strong>{subscription.currentPeriodEndsAt?new Date(subscription.currentPeriodEndsAt).toLocaleDateString():"—"}</strong></div>
      </div>
    </div>:<div className="notice">No subscription record is available for this organization yet.</div>}
    <div className="billing-plan-toolbar"><label>Billing interval<select value={interval} onChange={e=>setInterval(e.target.value as typeof interval)}><option value="MONTHLY">Monthly</option><option value="QUARTERLY">Quarterly</option><option value="YEARLY">Yearly</option></select></label></div>
    <div className="billing-plan-grid">{plans.map(plan=><article className="billing-plan" key={plan.key}>
      <h3>{plan.name}</h3><p>{plan.description||"School management plan"}</p><div className="billing-price">{money(price(plan),plan.currency)} <small>/ {interval.toLowerCase()}</small></div>
      {plan.trialDays>0?<small>{plan.trialDays}-day trial, where applicable</small>:null}
      <button type="button" disabled={busy||Boolean(live)||price(plan)==null||!token||!org} onClick={()=>void start(plan.key)}>{live?"Subscription already exists":busy?"Submitting…":"Select plan"}</button>
    </article>)}</div>
    {live?<p className="helper">A live subscription already exists. Plan changes are not enabled in this basic workspace.</p>:null}
    <div className="billing-invoices"><h3>Invoices</h3>{invoices.length===0?<div className="empty-row">No invoices found for this organization.</div>:<div className="table-wrap"><table><thead><tr><th>Invoice</th><th>Status</th><th>Issued</th><th>Due</th><th>Total</th><th>Paid</th></tr></thead><tbody>{invoices.map(row=><tr key={row.id}><td>{row.invoiceNumber||row.id}</td><td>{row.status}</td><td>{row.issuedAt?new Date(row.issuedAt).toLocaleDateString():"—"}</td><td>{row.dueAt?new Date(row.dueAt).toLocaleDateString():"—"}</td><td>{money(row.total,row.currency)}</td><td>{money(row.amountPaid,row.currency)}</td></tr>)}</tbody></table></div>}</div>
  </section>;
}
