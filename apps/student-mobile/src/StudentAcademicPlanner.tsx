import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from "react-native";

type Enrollment = { academicYearId: string; gradeLevelId: string; sectionName?: string | null; rollNumber?: string | null };
type Props = { api: string; token: string; organizationId: string; schoolId: string; enrollment?: Enrollment | null };
type Attendance = { id: string; sessionDate: string; status: string; remarks?: string | null };
type Event = { id: string; title: string; description?: string | null; eventType: string; startsAt: string; endsAt: string; isAllDay: boolean; location?: string | null };
type Slot = { id: string; dayOfWeek: number; periodNumber: number; startsAt: string; endsAt: string; subjectName: string; room?: string | null };
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
function dateRange() { const d=new Date(); const from=new Date(d.getFullYear(),d.getMonth()-1,1); const to=new Date(d.getFullYear(),d.getMonth()+2,0); const fmt=(x:Date)=>`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; return {from:fmt(from),to:fmt(to)}; }
export function StudentAcademicPlanner({api,token,organizationId,schoolId,enrollment}:Props) {
 const [tab,setTab]=useState<"timetable"|"attendance"|"calendar">("timetable");
 const [attendance,setAttendance]=useState<Attendance[]>([]),[events,setEvents]=useState<Event[]>([]),[slots,setSlots]=useState<Slot[]>([]);
 const [loading,setLoading]=useState(false),[error,setError]=useState("");
 const apiRoot=`${api.replace(/\/+$/ ,"")}/api/v1`;
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  try {
   const {from,to}=dateRange(); const headers={authorization:`Bearer ${token}`};
   const path=tab==="attendance"?`/students/me/${encodeURIComponent(organizationId)}/${encodeURIComponent(schoolId)}/attendance?from=${from}&to=${to}`:tab==="calendar"?`/students/me/${encodeURIComponent(organizationId)}/${encodeURIComponent(schoolId)}/calendar?from=${from}&to=${to}`:`/students/me/${encodeURIComponent(organizationId)}/${encodeURIComponent(schoolId)}/timetable?date=${today()}`;
   const response=await fetch(`${apiRoot}${path}`,{headers}); const body=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(body.error||`Unable to load ${tab} (${response.status})`);
   const rows=body.data||[]; if(tab==="attendance")setAttendance(rows); else if(tab==="calendar")setEvents(rows); else setSlots(rows);
  } catch(e) { setError(e instanceof Error?e.message:`Unable to load ${tab}`); }
  finally { setLoading(false); }
 },[apiRoot,token,organizationId,schoolId,tab]);
 useEffect(()=>{void load();},[load]);
 return <View style={s.card} accessibilityLabel="Student academic planner">
  <Text style={s.title}>Academic planner</Text>
  <View style={s.tabs}>{(["timetable","attendance","calendar"] as const).map(item=><TouchableOpacity key={item} onPress={()=>setTab(item)} style={[s.tab,tab===item&&s.active]}><Text style={[s.tabText,tab===item&&s.activeText]}>{item[0].toUpperCase()+item.slice(1)}</Text></TouchableOpacity>)}</View>
  {loading?<ActivityIndicator accessibilityLabel="Loading academic planner"/>:null}
  {error?<View style={s.error}><Text style={s.errorText}>{error}</Text><TouchableOpacity onPress={()=>void load()}><Text style={s.retry}>Retry</Text></TouchableOpacity></View>:null}
  {tab==="timetable"&&!loading&&!error?<>
   {!enrollment?<Text style={s.muted}>An active enrollment is needed to show the student timetable.</Text>:slots.length===0?<Text style={s.muted}>No timetable slots were published for today.</Text>:slots.map(slot=><View key={slot.id} style={s.row}><View><Text style={s.strong}>Period {slot.periodNumber} · {slot.subjectName}</Text><Text style={s.muted}>{slot.startsAt}–{slot.endsAt}{slot.room?` · ${slot.room}`:""}</Text></View></View>)}
  </>:null}
  {tab==="attendance"&&!loading&&!error?<>
   {attendance.length===0?<Text style={s.muted}>No attendance records found for the selected period.</Text>:attendance.map(row=><View key={row.id} style={s.row}><Text style={s.strong}>{row.sessionDate.slice(0,10)}</Text><Text style={s.badge}>{row.status.replace(/_/g," ")}</Text>{row.remarks?<Text style={s.muted}>{row.remarks}</Text>:null}</View>)}
   <Text style={s.muted}>Recent attendance · loaded records only ({attendance.length})</Text>
  </>:null}
  {tab==="calendar"&&!loading&&!error?<>
   {events.length===0?<Text style={s.muted}>No student-facing calendar events found in the displayed date range.</Text>:events.map(event=><View key={event.id} style={s.row}><Text style={s.strong}>{event.title}</Text><Text style={s.muted}>{event.isAllDay?event.startsAt.slice(0,10):new Date(event.startsAt).toLocaleString()} – {event.isAllDay?event.endsAt.slice(0,10):new Date(event.endsAt).toLocaleString()}</Text>{event.location?<Text style={s.muted}>Location: {event.location}</Text>:null}{event.description?<Text>{event.description}</Text>:null}</View>)}
   <Text style={s.muted}>School events · current month and surrounding months</Text>
  </>:null}
  <TouchableOpacity style={s.refresh} disabled={loading} onPress={()=>void load()}><Text style={s.refreshText}>Refresh {tab}</Text></TouchableOpacity>
 </View>;
}
const s=StyleSheet.create({card:{backgroundColor:"#fff",borderRadius:14,borderWidth:1,borderColor:"#e3e8f0",padding:14,gap:10},title:{fontSize:17,fontWeight:"700",color:"#172033"},tabs:{flexDirection:"row",gap:6},tab:{paddingVertical:8,paddingHorizontal:10,borderWidth:1,borderColor:"#d8deea",borderRadius:8,flex:1,alignItems:"center"},active:{backgroundColor:"#254f91",borderColor:"#254f91"},tabText:{fontSize:12,color:"#254f91",fontWeight:"700"},activeText:{color:"white"},row:{padding:10,borderWidth:1,borderColor:"#d8deea",borderRadius:9,gap:5},strong:{fontWeight:"700",color:"#263246"},muted:{fontSize:12,color:"#667085"},badge:{fontSize:12,fontWeight:"700",color:"#254f91"},error:{backgroundColor:"#fff0f0",padding:10,borderRadius:8},errorText:{color:"#a12626"},retry:{color:"#254f91",fontWeight:"700",marginTop:5},refresh:{borderWidth:1,borderColor:"#cbd5e1",padding:10,borderRadius:8,alignItems:"center"},refreshText:{color:"#254f91",fontWeight:"700"}});
