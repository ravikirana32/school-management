import React,{useCallback,useEffect,useRef,useState} from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import "./design-system.css";

const API_BASE=import.meta.env.VITE_API_BASE_URL||import.meta.env.VITE_API_URL||"http://localhost:18080";
const API=API_BASE.replace(/\/api\/v1\/?$/,"");
type Org={id:string;name:string;slug:string;isActive:boolean;createdAt:string};
type Domain={id:string;hostname:string;status:string;verifiedAt?:string|null;activatedAt?:string|null};
type Grant={id:string;organizationId:string;grantedTo:string;requestedBy?:string;status:string;reason:string;ticketReference?:string|null;startsAt:string;expiresAt:string};
type Brand={brandName:string;primaryColor:string;secondaryColor:string;logoUrl?:string|null;faviconUrl?:string|null;supportEmail?:string|null;supportUrl?:string|null;loginMessage?:string|null};
type Secret={id:string;key:string;keyVersion:string;rotatedAt:string;updatedAt:string};
type MfaStatus={enrolled:boolean;policy:{required:boolean;enrollmentRequired:boolean;challengeRequired:boolean;reasons:string[]}};

function App(){
 const [token,setToken]=useState(""),[connected,setConnected]=useState(false);
 const api=API;
 const [refreshToken,setRefreshToken]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState("");
 const [mfaStatus,setMfaStatus]=useState<MfaStatus|null>(null),[mfaCode,setMfaCode]=useState(""),[mfaSecret,setMfaSecret]=useState(""),[recoveryCodes,setRecoveryCodes]=useState<string[]>([]);
 const [error,setError]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
 const [dashboard,setDashboard]=useState<any>(null),[orgs,setOrgs]=useState<Org[]>([]),[selected,setSelected]=useState("");
 const [domains,setDomains]=useState<Domain[]>([]),[hostname,setHostname]=useState(""),[challenge,setChallenge]=useState<any>(null);
 const [opsAlerts,setOpsAlerts]=useState<any>({rows:[],counts:[]}),[opsStatus,setOpsStatus]=useState("ALL"),[opsLifecycleFilter,setOpsLifecycleFilter]=useState("ALL"),[opsWorkload,setOpsWorkload]=useState<any[]>([]);
 const [alertPolicy,setAlertPolicy]=useState<any>(null),[alertPolicyUpdatedAt,setAlertPolicyUpdatedAt]=useState<string|null>(null);
 const [alertChannelPreferences,setAlertChannelPreferences]=useState<any>(null),[alertChannelPreferencesUpdatedAt,setAlertChannelPreferencesUpdatedAt]=useState<string|null>(null);
 const [brand,setBrand]=useState<Brand>({brandName:"",primaryColor:"#24476B",secondaryColor:"#F2F5F9"});
 const [grants,setGrants]=useState<Grant[]>([]),[secrets,setSecrets]=useState<Secret[]>([]);
 const [grantOrg,setGrantOrg]=useState(""),[grantTo,setGrantTo]=useState(""),[grantReason,setGrantReason]=useState(""),[grantTicket,setGrantTicket]=useState("");
 const [secretKey,setSecretKey]=useState(""),[secretValue,setSecretValue]=useState("");
 const refreshTokenRef=useRef("");
 const refreshInFlight=useRef<Promise<string>|null>(null);
 const call=useCallback(async(path:string,init:RequestInit={})=>{
  const root=api.replace(/\/+$/,"").replace(/\/api\/v1$/,"");
  const request=(accessToken:string)=>{
   const requestHeaders=new Headers(init.headers);
   requestHeaders.set("Content-Type","application/json");requestHeaders.set("Authorization",`Bearer ${accessToken}`);
   return fetch(`${root}/api/v1/platform${path}`,{...init,headers:requestHeaders});
  };
  let response=await request(token);
  if(response.status===401&&refreshTokenRef.current){
   let pending=refreshInFlight.current;
   if(!pending){
    pending=(async()=>{
     const refreshed=await fetch(`${root}/api/v1/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refreshToken:refreshTokenRef.current})});
     const session=await refreshed.json().catch(()=>({}));
     if(!refreshed.ok||!session.accessToken||!session.refreshToken)throw new Error(session.error||"Session expired. Sign in again.");
     refreshTokenRef.current=session.refreshToken;setToken(session.accessToken);setRefreshToken(session.refreshToken);return session.accessToken as string;
    })();
    refreshInFlight.current=pending;
   }
   try{response=await request(await pending);}catch(refreshError){refreshTokenRef.current="";setToken("");setRefreshToken("");setConnected(false);throw refreshError;}finally{if(refreshInFlight.current===pending)refreshInFlight.current=null;}
  }
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.error||`Request failed (${response.status})`);
  return body.data;
 },[api,token]);
 const load=useCallback(async()=>{
  const [d,o,g,s,a]=await Promise.all([call("/dashboard"),call("/organizations?page=1&pageSize=100"),call("/support-access-grants"),call("/secrets"),call(`/operations-alerts?status=${encodeURIComponent(opsStatus)}&limit=100`)]);
  setDashboard(d);setOrgs(o);setGrants(g);setSecrets(s);setOpsAlerts(a);
  if(!selected&&o.length)setSelected(o[0].id);
 },[call,selected,opsStatus]);
 const loadTenant=useCallback(async()=>{
  if(!selected)return;
  const [d,b]=await Promise.all([call(`/organizations/${selected}/domains`),call(`/organizations/${selected}/branding`)]);
  setDomains(d);if(b)setBrand(b);else setBrand({brandName:orgs.find(o=>o.id===selected)?.name||"",primaryColor:"#24476B",secondaryColor:"#F2F5F9"});
 },[call,selected,orgs]);
 useEffect(()=>{if(connected)void load().catch(e=>setError(e.message));},[connected,load]);
 useEffect(()=>{if(connected&&selected)void loadTenant().catch(e=>setError(e.message));},[connected,selected,loadTenant]);
 useEffect(()=>{if(connected)void call("/operations-alert-policy").then(r=>{setAlertPolicy(r.policy);setAlertPolicyUpdatedAt(r.updatedAt||null);}).catch(e=>setError(e.message));},[connected,call]);
 useEffect(()=>{if(connected)void call("/operations-alert-channel-preferences").then(r=>{setAlertChannelPreferences(r.preferences);setAlertChannelPreferencesUpdatedAt(r.updatedAt||null);}).catch(e=>setError(e.message));},[connected,call]);
 const run=async(fn:()=>Promise<void>)=>{setBusy(true);setError("");setNotice("");try{await fn();}catch(e){setError(e instanceof Error?e.message:"Operation failed");}finally{setBusy(false);}};
 const connect=()=>void run(async()=>{
  const root=api.replace(/\/+$/,"").replace(/\/api\/v1$/,"");
  const login=await fetch(`${root}/api/v1/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
  const session=await login.json().catch(()=>({}));
  if(!login.ok||!session.accessToken)throw new Error(session.error||`Sign-in failed (${login.status})`);
  const statusResponse=await fetch(`${root}/api/v1/auth/mfa/status`,{headers:{Authorization:`Bearer ${session.accessToken}`}});
  const statusPayload=await statusResponse.json().catch(()=>({}));
  if(!statusResponse.ok)throw new Error(statusPayload.error||"Unable to load platform MFA policy.");
  setPassword("");setMfaStatus(statusPayload.data||null);setMfaCode("");setMfaSecret("");setRecoveryCodes([]);
  if(statusPayload.data?.policy?.required&&(statusPayload.data.policy.enrollmentRequired||statusPayload.data.policy.challengeRequired)){
   refreshTokenRef.current=session.refreshToken;setToken(session.accessToken);setRefreshToken(session.refreshToken);setNotice("Complete the required authenticator step to continue.");return;
  }
  const dashboard=await fetch(`${root}/api/v1/platform/dashboard`,{headers:{Authorization:`Bearer ${session.accessToken}`}});
  const platform=await dashboard.json().catch(()=>({}));
  if(!dashboard.ok)throw new Error(platform.error||"This account does not have platform administrator access.");
  refreshTokenRef.current=session.refreshToken;setToken(session.accessToken);setRefreshToken(session.refreshToken);setConnected(true);setNotice("Signed in to platform operations.");
 });
 const startMfaEnrollment=()=>void run(async()=>{
  const root=api.replace(/\/+$/,"").replace(/\/api\/v1$/,"");
  const response=await fetch(`${root}/api/v1/auth/mfa/totp/enroll`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok||!body.data?.secret)throw new Error(body.error||"Unable to start authenticator enrollment.");
  setMfaSecret(body.data.secret);setNotice("Add the setup key to your authenticator app, then enter its current 6-digit code.");
 });
 const verifyMfa=()=>void run(async()=>{
  const root=api.replace(/\/+$/,"").replace(/\/api\/v1$/,"");
  const response=await fetch(`${root}/api/v1/auth/mfa/verify`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({code:mfaCode})});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.error||"MFA verification failed.");
  const dashboard=await fetch(`${root}/api/v1/platform/dashboard`,{headers:{Authorization:`Bearer ${token}`}});
  const platform=await dashboard.json().catch(()=>({}));
  if(!dashboard.ok)throw new Error(platform.error||"This account does not have platform administrator access.");
  setRecoveryCodes(body.data?.recoveryCodes||[]);setMfaCode("");setMfaSecret("");setConnected(true);setNotice("Authenticator verified. Platform access is enabled.");
 });
 const disconnect=()=>void run(async()=>{
  const root=api.replace(/\/+$/,"").replace(/\/api\/v1$/,"");
  try{
   if(refreshToken){
    const response=await fetch(`${root}/api/v1/auth/logout`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refreshToken})});
    if(!response.ok){const body=await response.json().catch(()=>({}));throw new Error(body.error||"Unable to revoke the current session.");}
   }
   setNotice("Signed out.");
  }finally{refreshTokenRef.current="";setConnected(false);setToken("");setRefreshToken("");setMfaStatus(null);setMfaCode("");setMfaSecret("");setRecoveryCodes([]);setDashboard(null);}
 });
 const createDomain=()=>void run(async()=>{
  const d=await call(`/organizations/${selected}/domains`,{method:"POST",body:JSON.stringify({hostname})});
  setChallenge(d.dnsChallenge);setHostname("");await loadTenant();setNotice("Domain registered. Publish the DNS TXT challenge, then verify ownership.");
 });
 const renewChallenge=(id:string)=>void run(async()=>{const d=await call(`/domains/${id}/challenge`,{method:"POST",body:"{}"});setChallenge(d.dnsChallenge);await loadTenant();setNotice("New DNS TXT challenge generated. Replace the previous TXT value.");});
 const verifyDomain=(id:string)=>void run(async()=>{await call(`/domains/${id}/verify`,{method:"POST",body:"{}"});await loadTenant();setNotice("DNS ownership verified. Activate the domain when ready.");});
 const activateDomain=(id:string)=>void run(async()=>{await call(`/domains/${id}/activate`,{method:"POST",body:"{}"});await loadTenant();setNotice("Custom domain activated.");});
 const disableDomain=(id:string)=>void run(async()=>{await call(`/domains/${id}/disable`,{method:"POST",body:"{}"});await loadTenant();setNotice("Custom domain disabled.");});
 const saveBrand=()=>void run(async()=>{await call(`/organizations/${selected}/branding`,{method:"PUT",body:JSON.stringify(brand)});setNotice("Tenant branding saved.");});
 const createGrant=()=>void run(async()=>{
  const startsAt=new Date(Date.now()+5*60*1000),expiresAt=new Date(startsAt.getTime()+60*60*1000);
  await call("/support-access-grants",{method:"POST",body:JSON.stringify({organizationId:grantOrg,grantedTo:grantTo,reason:grantReason,ticketReference:grantTicket||undefined,startsAt:startsAt.toISOString(),expiresAt:expiresAt.toISOString()})});
  setGrantTo("");setGrantReason("");setGrantTicket("");await load();setNotice("Support access request submitted for independent approval.");
 });
 const grantAction=(id:string,action:"approve"|"reject"|"revoke")=>void run(async()=>{
  const reason=action==="approve"?undefined:window.prompt(`Reason for ${action} (at least 10 characters)`);
  if(action!=="approve"&&!reason)return;
  await call(`/support-access-grants/${id}/${action}`,{method:"POST",body:JSON.stringify(action==="approve"?{}:{reason})});await load();setNotice(`Support request ${action} action submitted.`);
 });
 const saveSecret=()=>void run(async()=>{await call(`/secrets/${encodeURIComponent(secretKey)}`,{method:"PUT",body:JSON.stringify({value:secretValue})});setSecretKey("");setSecretValue("");await load();setNotice("Secret encrypted and saved. Its value will not be shown again.");});
 const deleteSecret=(key:string)=>void run(async()=>{if(!window.confirm(`Delete secret ${key}?`))return;await fetch(`${api.replace(/\/$/,"")}/api/v1/platform/secrets/${encodeURIComponent(key)}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}}).then(async r=>{if(!r.ok)throw new Error("Unable to delete secret");});await load();});
 const loadAlertPolicy=()=>void run(async()=>{const result=await call("/operations-alert-policy");setAlertPolicy(result.policy);setAlertPolicyUpdatedAt(result.updatedAt||null);});
 const editAlertPolicy=()=>void run(async()=>{if(!alertPolicy)return;const edited=window.prompt("Edit severity-based routing policy as JSON",JSON.stringify(alertPolicy,null,2));if(!edited)return;let parsed:any;try{parsed=JSON.parse(edited);}catch{setNotice("Policy edit cancelled: invalid JSON.");return;}const result=await call("/operations-alert-policy",{method:"PUT",body:JSON.stringify({policy:parsed})});setAlertPolicy(result.policy);setAlertPolicyUpdatedAt(result.updatedAt||null);setNotice("Alert routing policy saved and audited.");});
 const editAlertChannelPreferences=()=>void run(async()=>{if(!alertChannelPreferences)return;const edited=window.prompt("Edit channel preferences JSON. Channels: IN_APP, EMAIL, WEBHOOK. WEBHOOK is currently the only active delivery adapter.",JSON.stringify(alertChannelPreferences,null,2));if(!edited)return;let parsed:any;try{parsed=JSON.parse(edited);}catch{setNotice("Channel preference edit cancelled: invalid JSON.");return;}const result=await call("/operations-alert-channel-preferences",{method:"PUT",body:JSON.stringify({preferences:parsed})});setAlertChannelPreferences(result.preferences);setAlertChannelPreferencesUpdatedAt(result.updatedAt||null);setNotice("Notification channel preferences saved and audited.");});
 const refreshAlertChannelPreferences=()=>void run(async()=>{const result=await call("/operations-alert-channel-preferences");setAlertChannelPreferences(result.preferences);setAlertChannelPreferencesUpdatedAt(result.updatedAt||null);});
 const loadOpsAlerts=()=>void run(async()=>{const [alerts,workload]=await Promise.all([call(`/operations-alerts?status=${encodeURIComponent(opsStatus)}&limit=100`),call(`/operations-alerts/ownership-workload`)]);setOpsAlerts(alerts);setOpsWorkload(workload);});
 const opsAlertAction=(id:string,action:"acknowledge"|"retry"|"assign"|"resolve")=>void run(async()=>{let body:any={};if(action==="acknowledge"){body.note=window.prompt("Acknowledgement note (optional)")||"";}else if(action==="assign"){const userId=window.prompt("Assign to platform admin user ID");if(!userId?.trim())return;body.userId=userId.trim();}else if(action==="resolve"){const note=window.prompt("Resolution note (minimum 10 characters)");if(!note||note.trim().length<10){setNotice("Resolution cancelled: provide at least 10 characters.");return;}body.note=note.trim();}await call(`/operations-alerts/${encodeURIComponent(id)}/${action}`,{method:"POST",body:JSON.stringify(body)});await loadOpsAlerts();setNotice(action==="acknowledge"?"Platform alert acknowledged.":action==="retry"?"Platform alert retry queued.":action==="assign"?"Platform alert assigned.":"Platform alert resolved.");});
 const opsAlertSla=(id:string)=>void run(async()=>{const value=window.prompt("Set SLA due date/time (ISO format, e.g. 2026-11-23T14:30:00+05:30)");if(!value)return;const dueAt=new Date(value);if(Number.isNaN(dueAt.getTime())||dueAt.getTime()<=Date.now()){setNotice("SLA cancelled: enter a valid future date/time.");return;}await call(`/operations-alerts/${encodeURIComponent(id)}/sla`,{method:"POST",body:JSON.stringify({dueAt:dueAt.toISOString()})});await loadOpsAlerts();setNotice("Alert SLA deadline updated.");});
 const opsFollowUp=(id:string)=>void run(async()=>{const note=window.prompt("Follow-up note (optional)")||"";await call(`/operations-alerts/${encodeURIComponent(id)}/follow-up`,{method:"POST",body:JSON.stringify({note})});await loadOpsAlerts();setNotice("Follow-up reminder recorded.");});
 const opsAlertHistory=(id:string)=>void run(async()=>{const rows=await call(`/operations-alerts/${encodeURIComponent(id)}/lifecycle-history`);setNotice(`Lifecycle history for ${id}: ${JSON.stringify(rows.data||rows).slice(0,900)}`);});
 const current=orgs.find(o=>o.id===selected);
 const visibleOpsAlerts=(opsAlerts?.rows||[]).filter((a:any)=>opsLifecycleFilter==="ALL"||(opsLifecycleFilter==="ESCALATED"&&Number(a.escalationLevel||0)>0)||(opsLifecycleFilter==="UNACKNOWLEDGED"&&!a.acknowledgedAt)||(opsLifecycleFilter==="RESOLVED"&&a.resolvedAt)||(opsLifecycleFilter==="OPEN"&&!a.resolvedAt)||(opsLifecycleFilter==="OVERDUE"&&a.slaOverdue)||(opsLifecycleFilter==="ASSIGNED"&&a.assignedToUserId));
 if(!connected)return <main className="shell"><section className="panel login"><div className="eyebrow">SCHOOL MANAGEMENT SAAS · PLATFORM CONTROL PLANE</div>
  {token&&mfaStatus?.policy?.required&&(mfaStatus.policy.enrollmentRequired||mfaStatus.policy.challengeRequired)?<>
   <h1>Secure your platform account</h1><p>Multi-factor authentication is required. Tokens and the temporary setup key stay in memory only.</p>
   {mfaStatus.policy.enrollmentRequired&&!mfaSecret&&<button type="button" disabled={busy} onClick={startMfaEnrollment}>{busy?"Starting enrollment…":"Set up authenticator"}</button>}
   {mfaSecret&&<div className="challenge"><b>Authenticator setup key</b><p>In your authenticator app, add an account using this key. Keep it private; it is only shown during this setup.</p><code>{mfaSecret}</code><p><small>After adding the key, enter the current 6-digit code below.</small></p></div>}
   {(mfaStatus.policy.challengeRequired||Boolean(mfaSecret))&&<form onSubmit={e=>{e.preventDefault();verifyMfa();}}><label>6-digit authenticator code or recovery code<input value={mfaCode} onChange={e=>setMfaCode(e.target.value)} autoComplete="one-time-code" inputMode="numeric" maxLength={32} required /></label><button type="submit" disabled={!mfaCode.trim()||busy}>{busy?"Verifying…":"Verify and continue"}</button></form>}
   <button className="secondary" type="button" disabled={busy} onClick={disconnect}>Cancel and sign out</button>
  </>:<>
   <h1>Super Admin</h1><p>Sign in with your platform administrator account. Session tokens stay in memory for this browser session.</p><form onSubmit={e=>{e.preventDefault();connect();}}><label>Email<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label><button type="submit" disabled={!email||!password||busy}>{busy?"Signing in…":"Sign in"}</button></form><p className="muted">For a local demo, use <code>superadmin@school.demo</code> and the <code>DEMO_SEED_PASSWORD</code> configured in <code>.env.docker</code>.</p>
  </>}
  {error&&<p className="error" role="alert">{error}</p>}{notice&&<p className="notice" role="status">{notice}</p>}
 </section></main>;
 return <main className="workspace">
  <header className="topbar"><div><div className="eyebrow">SCHOOL MANAGEMENT SAAS · P102</div><h1>Platform Operations</h1></div><button className="secondary" onClick={disconnect}>Disconnect</button></header>
  {error&&<p className="error" role="alert">{error}</p>}{notice&&<p className="notice" role="status">{notice}</p>}
  {recoveryCodes.length>0&&<section className="panel" role="alert"><h2>Save your recovery codes</h2><p>These are shown once. Store them somewhere private; each code can be used once if you lose access to your authenticator.</p><pre>{recoveryCodes.join("\n")}</pre><button type="button" className="secondary" onClick={()=>setRecoveryCodes([])}>I saved these codes</button></section>}
  {dashboard&&<section className="metrics">{Object.entries(dashboard).map(([k,v])=><article key={k}><span>{k.replace(/[A-Z]/g," $&")}</span><strong>{String(v)}</strong></article>)}</section>}
  <section id="tenant-management" className="panel"><div className="section-head"><div><h2>Tenant domains and branding</h2><p>Register a custom hostname, prove DNS ownership, activate routing and configure tenant identity.</p></div><select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Select organization</option>{orgs.map(o=><option key={o.id} value={o.id}>{o.name} ({o.slug})</option>)}</select></div>
   {current&&<p className="muted">Selected tenant: <b>{current.name}</b> · {current.isActive?"Active":"Inactive"}</p>}
   <div className="two-col"><div className="subpanel"><h3>Custom domains</h3><form onSubmit={e=>{e.preventDefault();createDomain();}}><label>Hostname<input value={hostname} onChange={e=>setHostname(e.target.value)} placeholder="portal.school.example" required /></label><button disabled={busy||!selected}>Register domain</button></form>
    {challenge&&<div className="challenge"><b>Publish this DNS TXT record</b><p>Host: <code>{challenge.name}</code></p><p>Value: <code>{challenge.value}</code></p><small>Keep this value private until ownership verification is complete.</small></div>}
    {domains.map(d=><article className="item" key={d.id}><div><b>{d.hostname}</b><span className={`pill ${d.status.toLowerCase()}`}>{d.status}</span></div><small>{d.verifiedAt?`Verified ${new Date(d.verifiedAt).toLocaleString()}`:"Ownership not verified"}</small><div className="actions">{d.status==="PENDING_VERIFICATION"&&<><button disabled={busy} onClick={()=>verifyDomain(d.id)}>Verify DNS</button><button className="secondary" disabled={busy} onClick={()=>renewChallenge(d.id)}>Renew challenge</button></>}{d.status==="VERIFIED"&&<button disabled={busy} onClick={()=>activateDomain(d.id)}>Activate</button>}{d.status==="ACTIVE"&&<button className="danger" disabled={busy} onClick={()=>disableDomain(d.id)}>Disable</button>}</div></article>)}
   </div><div className="subpanel"><h3>Tenant branding</h3><div className="form-grid"><label>Brand name<input value={brand.brandName} onChange={e=>setBrand({...brand,brandName:e.target.value})}/></label><label>Primary color<input value={brand.primaryColor} onChange={e=>setBrand({...brand,primaryColor:e.target.value})}/></label><label>Secondary color<input value={brand.secondaryColor} onChange={e=>setBrand({...brand,secondaryColor:e.target.value})}/></label><label>Logo URL (HTTPS)<input value={brand.logoUrl||""} onChange={e=>setBrand({...brand,logoUrl:e.target.value||null})}/></label><label>Favicon URL (HTTPS)<input value={brand.faviconUrl||""} onChange={e=>setBrand({...brand,faviconUrl:e.target.value||null})}/></label><label>Support email<input value={brand.supportEmail||""} onChange={e=>setBrand({...brand,supportEmail:e.target.value||null})}/></label><label>Support URL (HTTPS)<input value={brand.supportUrl||""} onChange={e=>setBrand({...brand,supportUrl:e.target.value||null})}/></label><label>Login message<textarea value={brand.loginMessage||""} onChange={e=>setBrand({...brand,loginMessage:e.target.value||null})}/></label></div><button disabled={busy||!selected} onClick={saveBrand}>Save tenant branding</button></div></div>
  </section>
  <section id="notification-channels" className="panel"><h2>Notification channels & recipient preferences</h2><p>Configure the default delivery channels and per-platform-admin channel preferences. WEBHOOK delivery is active; IN_APP and EMAIL are preference/readiness options and do not send in this phase.</p>{alertChannelPreferences&&<><p><b>Defaults:</b> {(alertChannelPreferences.defaultChannels||[]).join(", ")||"None"} · {alertChannelPreferencesUpdatedAt?`Updated ${new Date(alertChannelPreferencesUpdatedAt).toLocaleString()}`:"Using defaults (not yet saved)"}</p><pre className="policy-preview">{JSON.stringify(alertChannelPreferences,null,2)}</pre><button className="secondary" disabled={busy} onClick={editAlertChannelPreferences}>Edit channel preferences JSON</button><button className="secondary" disabled={busy} onClick={refreshAlertChannelPreferences}>Refresh channel preferences</button></>}</section>
  <section className="panel"><h2>Alert routing policy</h2><p>Severity-specific recipients and SLA reminder/escalation timing. Recipients are validated against active platform administrators. Configuration is stored as a platform setting and audited.</p>{alertPolicy&&<><p><b>Policy:</b> {alertPolicy.enabled?"Enabled":"Disabled"} · {alertPolicyUpdatedAt?`Last updated ${new Date(alertPolicyUpdatedAt).toLocaleString()}`:"Using defaults (not yet saved)"}</p><pre className="policy-preview">{JSON.stringify(alertPolicy,null,2)}</pre><button className="secondary" disabled={busy} onClick={editAlertPolicy}>Edit policy JSON</button><button className="secondary" disabled={busy} onClick={loadAlertPolicy}>Refresh policy</button></>}</section>
  <section className="panel"><h2>Global worker and platform alerts</h2><p>Cross-school operational events. Access requires platform administrator identity, enrolled MFA and a fresh MFA assertion. Tenant users cannot access this feed.</p><div className="actions"><label>Delivery status <select value={opsStatus} onChange={e=>{setOpsStatus(e.target.value);void run(async()=>setOpsAlerts(await call(`/operations-alerts?status=${encodeURIComponent(e.target.value)}&limit=100`)));}}><option value="ALL">All</option><option value="PENDING">Pending</option><option value="RETRY">Retry</option><option value="SENDING">Sending</option><option value="DELIVERED">Delivered</option></select></label><label>Lifecycle <select value={opsLifecycleFilter} onChange={e=>setOpsLifecycleFilter(e.target.value)}><option value="ALL">All alerts</option><option value="ESCALATED">Escalated only</option><option value="UNACKNOWLEDGED">Unacknowledged</option><option value="OPEN">Open only</option><option value="RESOLVED">Resolved only</option><option value="OVERDUE">SLA overdue</option><option value="ASSIGNED">Assigned alerts</option></select></label><button className="secondary" disabled={busy} onClick={loadOpsAlerts}>Refresh alerts</button></div><div className="metrics">{opsWorkload.map((w:any)=><article key={w.assignedToUserId}><span>Owner {w.assignedToUserId}</span><strong>{w.openCount} open</strong><small>{w.overdueCount} overdue</small></article>)}{(opsAlerts?.counts||[]).map((c:any)=><article key={c.status}><span>{c.status}</span><strong>{c.count}</strong><small>{c.unacknowledged} unacknowledged</small></article>)}</div>{visibleOpsAlerts.map((a:any)=><article className="item" key={a.id}><div><b>{a.severity} · {a.eventType}</b><span className={`pill ${String(a.status).toLowerCase()}`}>{a.status}</span></div><small>{new Date(a.createdAt).toLocaleString()} · Attempts {a.attempts} · Tenant {a.organizationId||"Platform-wide"} · School {a.schoolId||"—"}</small>{Number(a.escalationLevel||0)>0&&<small className="pill critical">Escalated · Level {a.escalationLevel} · {a.escalatedAt?new Date(a.escalatedAt).toLocaleString():"Timestamp unavailable"}</small>}{a.payload?.originalAlertId&&<small>Escalation of alert: {a.payload.originalAlertId}</small>}{a.lastErrorCode&&<small>Last error: {a.lastErrorCode} · Next retry {a.nextAttemptAt?new Date(a.nextAttemptAt).toLocaleString():"—"}</small>}{a.acknowledgedAt&&<small>Acknowledged by {a.acknowledgedByUserId||"unknown"} · {new Date(a.acknowledgedAt).toLocaleString()} {a.acknowledgementNote&&` · Note: ${a.acknowledgementNote}`}</small>}{a.assignedToUserId&&<small>Assigned to: {a.assignedToUserId}</small>}{a.slaDueAt&&<small className={a.slaOverdue?"pill critical":"pill"}>SLA due {new Date(a.slaDueAt).toLocaleString()} {a.slaOverdue?"· OVERDUE":""}</small>}{a.followUpReminderAt&&<small>Follow-up recorded {new Date(a.followUpReminderAt).toLocaleString()}</small>}{a.slaReminderSentAt&&<small className="pill">Automated SLA reminder sent · {new Date(a.slaReminderSentAt).toLocaleString()}</small>}{a.slaEscalationSentAt&&<small className="pill critical">Automated overdue escalation · {new Date(a.slaEscalationSentAt).toLocaleString()}</small>}{a.resolvedAt&&<small className="pill">Resolved · {new Date(a.resolvedAt).toLocaleString()} · {a.resolvedByUserId||"unknown"} · {a.resolutionNote}</small>}<div className="actions">{!a.acknowledgedAt&&!a.resolvedAt&&<button className="secondary" disabled={busy} onClick={()=>opsAlertAction(a.id,"acknowledge")}>Acknowledge</button>}{!a.resolvedAt&&<button className="secondary" disabled={busy} onClick={()=>opsAlertAction(a.id,"assign")}>Assign</button>}{!a.resolvedAt&&<button className="secondary" disabled={busy} onClick={()=>opsAlertSla(a.id)}>Set SLA</button>}{!a.resolvedAt&&!a.followUpReminderAt&&<button className="secondary" disabled={busy} onClick={()=>opsFollowUp(a.id)}>Follow-up</button>}{!a.resolvedAt&&<button className="secondary" disabled={busy} onClick={()=>opsAlertAction(a.id,"resolve")}>Resolve</button>}{<button className="secondary" disabled={busy} onClick={()=>opsAlertHistory(a.id)}>History</button>}{a.status==="RETRY"&&<button disabled={busy} onClick={()=>opsAlertAction(a.id,"retry")}>Retry delivery</button>}</div></article>)}{!visibleOpsAlerts.length&&<p className="muted">No platform alerts match this lifecycle filter.</p>}</section>
  <section className="panel"><h2>Support access approvals</h2>
   <div className="form-grid">
    <label>Tenant<select value={grantOrg} onChange={e=>setGrantOrg(e.target.value)}><option value="">Select tenant</option>{orgs.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
    <label>Support operator user ID<input value={grantTo} onChange={e=>setGrantTo(e.target.value)} placeholder="Platform admin user ID"/></label>
    <label>Reason<input value={grantReason} onChange={e=>setGrantReason(e.target.value)} placeholder="Why is temporary access needed?"/></label>
    <label>Ticket reference<input value={grantTicket} onChange={e=>setGrantTicket(e.target.value)}/></label>
   </div><button disabled={busy||!grantOrg||!grantTo||grantReason.trim().length<10} onClick={createGrant}>Request one-hour support access</button><p>Support requests require a different platform administrator to approve. The server applies the current MFA policy to the approver's session.</p>{grants.length===0?<p className="muted">No support access requests.</p>:grants.map(g=><article className="item" key={g.id}><div><b>{g.reason}</b><span className={`pill ${g.status.toLowerCase()}`}>{g.status}</span></div><small>Tenant {g.organizationId} · Operator {g.grantedTo} · {g.ticketReference||"No ticket"} · {new Date(g.startsAt).toLocaleString()}–{new Date(g.expiresAt).toLocaleString()}</small>{g.status==="PENDING_APPROVAL"&&<div className="actions"><button disabled={busy} onClick={()=>grantAction(g.id,"approve")}>Approve</button><button className="danger" disabled={busy} onClick={()=>grantAction(g.id,"reject")}>Reject</button></div>}{g.status==="ACTIVE"&&<button className="danger" disabled={busy} onClick={()=>grantAction(g.id,"revoke")}>Revoke access</button>}</article>)}</section>
  <section className="panel"><h2>Platform secrets vault</h2><p>Secrets are encrypted using AES-256-GCM. Plaintext values are never returned by the API. Configure <code>PLATFORM_SECRET_ENCRYPTION_KEY</code> before saving secrets.</p><div className="form-grid"><label>Secret key<input value={secretKey} onChange={e=>setSecretKey(e.target.value.toUpperCase())} placeholder="PAYMENT_PROVIDER_TOKEN"/></label><label>Secret value<input type="password" value={secretValue} onChange={e=>setSecretValue(e.target.value)} autoComplete="new-password"/></label></div><button disabled={busy||!secretKey||!secretValue} onClick={saveSecret}>Encrypt / rotate secret</button>{secrets.map(s=><article className="item" key={s.id}><div><b>{s.key}</b><span className="pill active">{s.keyVersion}</span></div><small>Updated {new Date(s.updatedAt).toLocaleString()}</small><button className="danger" onClick={()=>deleteSecret(s.key)}>Delete</button></article>)}</section>
  <footer>Platform actions are audited. Domain routing is available only after DNS verification and activation. Support access follows the active server MFA policy.</footer>
 </main>;
}
ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
