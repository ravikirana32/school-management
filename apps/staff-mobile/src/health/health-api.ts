/** Staff-mobile health API helpers. All endpoints are organization/school scoped and permission gated by the API. */
const healthRoot=(apiBase:string,org:string,school:string)=>`${apiBase.replace(/\/$/,'')}/api/v1/${encodeURIComponent(org)}/${encodeURIComponent(school)}/health`;
const auth=(token:string)=>({Authorization:`Bearer ${token}`});
async function request<T>(url:string,token:string,method='GET',body?:unknown):Promise<T>{
  const response=await fetch(url,{method,headers:{...auth(token),...(body!==undefined?{'Content-Type':'application/json'}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
  const payload=await response.json().catch(()=>({error:'Health request failed'}));
  if(!response.ok)throw new Error(payload?.error||'Health request failed');
  return payload?.data as T;
}
export async function getStudentHealth(apiBase:string,org:string,school:string,studentId:string,token:string){const root=`${healthRoot(apiBase,org,school)}/students/${encodeURIComponent(studentId)}`;const [profile,events]=await Promise.all([request<any>(`${root}/profile`,token),request<any[]>(`${root}/events`,token)]);return {profile,events};}
export async function recordStudentHealthEvent(apiBase:string,org:string,school:string,studentId:string,token:string,event:Record<string,unknown>){return request<any>(`${healthRoot(apiBase,org,school)}/students/${encodeURIComponent(studentId)}/events`,token,'POST',event);}
export async function getHealthCases(apiBase:string,org:string,school:string,token:string,studentId?:string){const query=studentId?`?studentId=${encodeURIComponent(studentId)}`:'';return request<any[]>(`${healthRoot(apiBase,org,school)}/cases${query}`,token);}
export async function updateHealthCase(apiBase:string,org:string,school:string,token:string,caseId:string,patch:Record<string,unknown>){return request<any>(`${healthRoot(apiBase,org,school)}/cases/${encodeURIComponent(caseId)}`,token,'PATCH',patch);}
export async function addHealthCaseFollowUp(apiBase:string,org:string,school:string,token:string,caseId:string,followUp:Record<string,unknown>){return request<any>(`${healthRoot(apiBase,org,school)}/cases/${encodeURIComponent(caseId)}/follow-ups`,token,'POST',followUp);}
export async function getHealthIncidents(apiBase:string,org:string,school:string,token:string,filters:{studentId?:string;status?:string;severity?:string}={}){const query=new URLSearchParams(Object.entries(filters).filter(([,v])=>Boolean(v)) as [string,string][]).toString();return request<any[]>(`${healthRoot(apiBase,org,school)}/incidents${query?`?${query}`:''}`,token);}
export async function acknowledgeHealthIncident(apiBase:string,org:string,school:string,token:string,incidentId:string){return request<any>(`${healthRoot(apiBase,org,school)}/incidents/${encodeURIComponent(incidentId)}/acknowledge`,token,'POST',{});}
export async function escalateHealthIncident(apiBase:string,org:string,school:string,token:string,incidentId:string){return request<any>(`${healthRoot(apiBase,org,school)}/incidents/${encodeURIComponent(incidentId)}/escalate`,token,'POST',{});}
export async function updateHealthIncident(apiBase:string,org:string,school:string,token:string,incidentId:string,patch:Record<string,unknown>){return request<any>(`${healthRoot(apiBase,org,school)}/incidents/${encodeURIComponent(incidentId)}`,token,'PATCH',patch);}
