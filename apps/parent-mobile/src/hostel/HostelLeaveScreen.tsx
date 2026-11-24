import React,{useCallback,useEffect,useState} from "react";
import {ActivityIndicator,Alert,StyleSheet,Switch,Text,TextInput,TouchableOpacity,View} from "react-native";

type Props={api:string;organizationId:string;schoolId:string;token:string;studentId:string;studentName:string};
type Leave={id:string;requestedDeparture:string;expectedReturn:string;reason:string;destination?:string|null;contactNumber?:string|null;status:string;decisionNote?:string|null;actualReturnAt?:string|null;gatePass?:{passCode:string;status:string}|null};
type FeeSummary={invoices:any[];payments:any[];totals:{invoiced:number;paid:number;due:number}};
type Consent={leaveUpdatesEnabled:boolean;inAppEnabled:boolean;emailEnabled:boolean;consentVersion:string;revokedAt?:string|null};

export function HostelLeaveScreen({api,organizationId,schoolId,token,studentId,studentName}:Props){
 const [rows,setRows]=useState<Leave[]>([]),[fees,setFees]=useState<FeeSummary>({invoices:[],payments:[],totals:{invoiced:0,paid:0,due:0}}),[consent,setConsent]=useState<Consent>({leaveUpdatesEnabled:false,inAppEnabled:false,emailEnabled:false,consentVersion:"hostel-leave-v1"});
 const [departure,setDeparture]=useState(""),[expectedReturn,setExpectedReturn]=useState(""),[reason,setReason]=useState(""),[destination,setDestination]=useState(""),[contact,setContact]=useState(""),[editingId,setEditingId]=useState<string|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const prefix=`/api/v1/parents/${organizationId}/${schoolId}/portal/children/${studentId}`;
 const request=useCallback(async(path:string,init:RequestInit={})=>{
  const response=await fetch(`${api.replace(/\/$/,"")}${prefix}${path}`,{...init,headers:{"content-type":"application/json",authorization:`Bearer ${token}`,...(init.headers||{})}});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(payload.error||`Request failed (${response.status})`);
  return payload.data;
 },[api,prefix,token]);
 const load=useCallback(async()=>{
  setBusy(true);setError("");
  try{const [leaves,consents,feeData]=await Promise.all([request("/hostel-leaves"),request("/hostel-consent"),request("/hostel-fees")]);setRows(leaves||[]);setFees(feeData||{invoices:[],payments:[],totals:{invoiced:0,paid:0,due:0}});const current=(consents||[])[0];if(current)setConsent(current);else setConsent({leaveUpdatesEnabled:false,inAppEnabled:false,emailEnabled:false,consentVersion:"hostel-leave-v1"});}
  catch(e:any){setError(e.message);}finally{setBusy(false);}
 },[request]);
 useEffect(()=>{void load();},[load]);
 const saveConsent=async()=>{
  setBusy(true);setError("");setNotice("");
  try{const data=await request("/hostel-consent",{method:"PUT",body:JSON.stringify(consent)});setConsent(data?.[0]||consent);setNotice("Hostel leave notification consent saved.");}
  catch(e:any){setError(e.message);}finally{setBusy(false);}
 };
 const submit=async()=>{
  const from=new Date(departure),to=new Date(expectedReturn);
  if(!departure||!expectedReturn||Number.isNaN(from.getTime())||Number.isNaN(to.getTime())||to<=from){setError("Enter valid departure and return date/time; return must be later.");return;}
  setBusy(true);setError("");setNotice("");
  try{await request(editingId?`/hostel-leaves/${editingId}`:"/hostel-leaves",{method:editingId?"PATCH":"POST",body:JSON.stringify({requestedDeparture:from.toISOString(),expectedReturn:to.toISOString(),reason,destination:destination||undefined,contactNumber:contact||undefined})});setReason("");setDestination("");setContact("");setDeparture("");setExpectedReturn("");setEditingId(null);setNotice(editingId?"Pending leave request updated.":"Leave request submitted for warden approval.");await load();}
  catch(e:any){setError(e.message);}finally{setBusy(false);}
 };
 const cancel=async(id:string)=>{
  Alert.alert("Cancel hostel leave","Cancel this leave request?",[{text:"Keep",style:"cancel"},{text:"Cancel request",style:"destructive",onPress:async()=>{setBusy(true);try{await request(`/hostel-leaves/${id}/cancel`,{method:"POST",body:"{}"});setNotice("Leave request cancelled.");await load();}catch(e:any){setError(e.message);}finally{setBusy(false);}}}]);
 };
 const local=(v?:string|null)=>v?new Date(v).toLocaleString():"—";
 return <View style={styles.card}>
  <Text style={styles.heading}>Hostel leave · {studentName}</Text>
  <Text style={styles.hint}>Submit leave for warden approval. Approved requests automatically receive a resident gate-pass. Only verified linked guardians with explicit consent receive notifications.</Text>
  {busy?<ActivityIndicator/>:null}{!!error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}{!!notice?<Text accessibilityRole="text" style={styles.notice}>{notice}</Text>:null}
  <View style={styles.section}>
   <Text style={styles.sectionTitle}>Hostel fees and payments</Text>
   <Text style={styles.hint}>Invoiced ₹{fees.totals.invoiced.toFixed(2)} · Paid ₹{fees.totals.paid.toFixed(2)} · Outstanding ₹{fees.totals.due.toFixed(2)}</Text>
   {fees.invoices.map((invoice:any)=><View key={invoice.id} style={styles.row}><Text style={styles.title}>{invoice.invoiceNumber} · {invoice.status}</Text><Text style={styles.hint}>Total ₹{Number(invoice.totalAmount).toFixed(2)} · Paid ₹{Number(invoice.paidAmount).toFixed(2)} · Due {new Date(invoice.dueAt).toLocaleDateString()}</Text></View>)}
   {fees.invoices.length===0?<Text style={styles.hint}>No hostel fee invoices available.</Text>:null}
  </View>
  <View style={styles.section}>
   <Text style={styles.sectionTitle}>Guardian notification consent</Text>
   <View style={styles.toggle}><Text style={styles.label}>Receive hostel leave updates</Text><Switch value={consent.leaveUpdatesEnabled} onValueChange={v=>setConsent(c=>({...c,leaveUpdatesEnabled:v,inAppEnabled:v?true:false,emailEnabled:v?c.emailEnabled:false}))}/></View>
   <View style={styles.toggle}><Text style={styles.label}>In-app notifications</Text><Switch disabled={!consent.leaveUpdatesEnabled} value={consent.inAppEnabled} onValueChange={v=>setConsent(c=>({...c,inAppEnabled:v}))}/></View>
   <View style={styles.toggle}><Text style={styles.label}>Verified email notifications</Text><Switch disabled={!consent.leaveUpdatesEnabled} value={consent.emailEnabled} onValueChange={v=>setConsent(c=>({...c,emailEnabled:v}))}/></View>
   <TouchableOpacity accessibilityRole="button" style={styles.buttonSecondary} disabled={busy||consent.leaveUpdatesEnabled&&!(consent.inAppEnabled||consent.emailEnabled)} onPress={()=>void saveConsent()}><Text style={styles.buttonSecondaryText}>Save notification consent</Text></TouchableOpacity>
  </View>
  <View style={styles.section}>
   <Text style={styles.sectionTitle}>Request leave</Text>
   <TextInput style={styles.input} value={departure} onChangeText={setDeparture} placeholder="Departure date/time (e.g. 2026-12-01T16:00:00+05:30)"/>
   <TextInput style={styles.input} value={expectedReturn} onChangeText={setExpectedReturn} placeholder="Expected return date/time (ISO 8601)"/>
   <TextInput style={styles.input} value={reason} onChangeText={setReason} placeholder="Reason for leave"/>
   <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="Destination (optional)"/>
   <TextInput style={styles.input} value={contact} onChangeText={setContact} placeholder="Contact number while away (optional)" keyboardType="phone-pad"/>
   <TouchableOpacity accessibilityRole="button" style={styles.button} disabled={busy||reason.trim().length<3} onPress={()=>void submit()}><Text style={styles.buttonText}>{editingId?"Save leave changes":"Submit leave request"}</Text></TouchableOpacity>{editingId?<TouchableOpacity accessibilityRole="button" style={styles.buttonSecondary} onPress={()=>{setEditingId(null);setDeparture("");setExpectedReturn("");setReason("");setDestination("");setContact("");}}><Text style={styles.buttonSecondaryText}>Stop editing</Text></TouchableOpacity>:null}
  </View>
  <View style={styles.section}>
   <Text style={styles.sectionTitle}>Leave history ({rows.length})</Text>
   {rows.length===0?<Text style={styles.hint}>No hostel leave requests found.</Text>:rows.map(row=><View key={row.id} style={styles.row}>
    <Text style={styles.title}>{row.status.replaceAll("_"," ")}</Text>
    <Text style={styles.hint}>Depart: {local(row.requestedDeparture)}</Text><Text style={styles.hint}>Return: {local(row.expectedReturn)}</Text>
    <Text style={styles.hint}>{row.reason}{row.destination?` · ${row.destination}`:""}</Text>
    {row.gatePass?<Text style={styles.pass}>Gate pass {row.gatePass.passCode} · {row.gatePass.status}</Text>:null}
    {row.status==="PENDING"?<TouchableOpacity accessibilityRole="button" style={styles.buttonSecondary} disabled={busy} onPress={()=>{setEditingId(row.id);setDeparture(new Date(row.requestedDeparture).toISOString());setExpectedReturn(new Date(row.expectedReturn).toISOString());setReason(row.reason);setDestination(row.destination||"");setContact(row.contactNumber||"");}}><Text style={styles.buttonSecondaryText}>Edit pending request</Text></TouchableOpacity>:null}
    {row.actualReturnAt?<Text style={styles.hint}>Checked in: {local(row.actualReturnAt)}</Text>:null}
    {row.decisionNote?<Text style={styles.hint}>Warden note: {row.decisionNote}</Text>:null}
    {["PENDING","APPROVED"].includes(row.status)&&row.gatePass?.status!=="CHECKED_OUT"?<TouchableOpacity accessibilityRole="button" style={styles.cancel} disabled={busy} onPress={()=>cancel(row.id)}><Text style={styles.cancelText}>Cancel request</Text></TouchableOpacity>:null}
   </View>)}
  </View>
 </View>;
}

const styles=StyleSheet.create({
 card:{backgroundColor:"#fff",borderRadius:12,padding:14,marginVertical:8,gap:10},
 heading:{fontSize:18,fontWeight:"700",color:"#172033"},section:{borderTopWidth:1,borderTopColor:"#e5e7eb",paddingTop:12,gap:8},sectionTitle:{fontSize:15,fontWeight:"700",color:"#253047"},hint:{fontSize:12,color:"#667085",lineHeight:18},label:{fontSize:13,color:"#344054",flex:1},toggle:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},input:{borderWidth:1,borderColor:"#d0d5dd",borderRadius:8,padding:10,fontSize:13,color:"#101828"},button:{backgroundColor:"#175cd3",borderRadius:8,padding:12,alignItems:"center"},buttonText:{color:"#fff",fontWeight:"700"},buttonSecondary:{borderWidth:1,borderColor:"#98a2b3",borderRadius:8,padding:10,alignItems:"center"},buttonSecondaryText:{color:"#344054",fontWeight:"600"},row:{borderWidth:1,borderColor:"#e4e7ec",borderRadius:8,padding:10,gap:4},title:{fontSize:14,fontWeight:"700",color:"#344054"},pass:{fontSize:12,color:"#175cd3",fontWeight:"600"},cancel:{alignSelf:"flex-start",paddingVertical:6,paddingHorizontal:10,borderRadius:6,backgroundColor:"#fff1f0"},cancelText:{color:"#b42318",fontWeight:"600"},error:{color:"#b42318",fontSize:13},notice:{color:"#027a48",fontSize:13}
});
