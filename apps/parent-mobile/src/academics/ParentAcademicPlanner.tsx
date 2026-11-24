import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PlannerItem = { id?: string; title?: string; subjectName?: string; eventType?: string; startsAt?: string; endsAt?: string; date?: string; dayOfWeek?: number; periodNumber?: number; startTime?: string; endTime?: string; room?: string; description?: string; status?: string };
type Request = (path: string, init?: RequestInit) => Promise<any>;
const dayLabel = (date: Date) => date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
const toDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const mondayOf = (date: Date) => { const result = new Date(date); result.setDate(result.getDate()-((result.getDay()+6)%7)); result.setHours(12,0,0,0); return result; };
export function ParentAcademicPlanner({ organizationId, schoolId, studentId, request, offline }: { organizationId:string; schoolId:string; studentId:string; request:Request; offline:boolean }) {
  const [date,setDate]=useState(()=>new Date());
  const [mode,setMode]=useState<"day"|"week">("week");
  const [timetable,setTimetable]=useState<PlannerItem[]>([]);
  const [events,setEvents]=useState<PlannerItem[]>([]);
  const [exams,setExams]=useState<PlannerItem[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const monday=useMemo(()=>mondayOf(date),[date]);
  const days=useMemo(()=>Array.from({length:mode==="week"?7:1},(_,i)=>{const d=new Date(mode==="week"?monday:date);d.setDate(d.getDate()+i);return d;}),[date,monday,mode]);
  const load=useCallback(async()=>{
    if(offline){setError("Academic planner requires a connection. No cached planner records are available yet.");setTimetable([]);setEvents([]);setExams([]);return;}
    setBusy(true);setError("");const from=toDateKey(monday),to=new Date(monday);to.setDate(to.getDate()+6);
    const root=`/parents/${organizationId}/${schoolId}/portal/children/${studentId}`;
    try{
      const [t,e,x]=await Promise.all([
        request(`${root}/timetable?from=${from}&to=${toDateKey(to)}`),
        request(`${root}/calendar?from=${from}&to=${toDateKey(to)}`),
        request(`${root}/exams?from=${from}&to=${toDateKey(to)}`)
      ]);
      setTimetable(t.data||t.slots||[]);setEvents(e.data||e.events||[]);setExams(x.data||x.exams||[]);
    }catch(err){setTimetable([]);setEvents([]);setExams([]);setError(err instanceof Error?err.message:"Academic planner service is not available. Please retry later.");}
    finally{setBusy(false);}
  },[offline,organizationId,schoolId,studentId,request,monday]);
  useEffect(()=>{setTimetable([]);setEvents([]);setExams([]);setError("");void load();},[load]);
  const shift=(delta:number)=>setDate(current=>{const next=new Date(current);next.setDate(next.getDate()+delta*(mode==="week"?7:1));return next;});
  const filtered=(rows:PlannerItem[])=>rows.filter(row=>{const stamp=row.date||row.startsAt;if(!stamp){if(mode==="week")return true;return row.dayOfWeek==null||Number(row.dayOfWeek)===date.getDay();}const d=toDateKey(new Date(stamp));return d>=toDateKey(days[0])&&d<=toDateKey(days[days.length-1]);});
  const renderList=(heading:string,rows:PlannerItem[],empty:string)=> <View style={s.group}><Text style={s.heading}>{heading}</Text>{rows.length===0?<Text style={s.muted}>{empty}</Text>:rows.map((item,i)=><View key={item.id||`${heading}-${i}`} style={s.item}><Text style={s.itemTitle}>{item.title||item.subjectName||item.eventType||heading}</Text><Text style={s.muted}>{item.date?item.date:item.startsAt?new Date(item.startsAt).toLocaleString():item.dayOfWeek!=null?`Day ${item.dayOfWeek}`:"Date not provided"}{item.periodNumber!=null?` · Period ${item.periodNumber}`:""}{item.startTime?` · ${item.startTime}`:""}{item.endsAt?` – ${new Date(item.endsAt).toLocaleTimeString()}`:item.endTime?` – ${item.endTime}`:""}{item.room?` · Room ${item.room}`:""}</Text>{item.description?<Text style={s.muted}>{item.description}</Text>:null}</View>)}</View>;
  return <View style={s.card} accessibilityLabel="Parent academic planner"><Text style={s.title}>Academic planner</Text><Text style={s.muted}>Timetable, school calendar and published exam schedule</Text>
    <View style={s.controls}><TouchableOpacity style={s.button} onPress={()=>shift(-1)} accessibilityLabel="Previous period"><Text style={s.buttonText}>‹ Back</Text></TouchableOpacity><Text style={s.date}>{mode==="week"?`${dayLabel(days[0])} – ${days[6].toLocaleDateString()}`:dayLabel(date)}</Text><TouchableOpacity style={s.button} onPress={()=>shift(1)} accessibilityLabel="Next period"><Text style={s.buttonText}>Next ›</Text></TouchableOpacity></View>
    <View style={s.controls}><TouchableOpacity style={[s.button,mode==="day"&&s.active]} onPress={()=>setMode("day")}><Text style={s.buttonText}>Day</Text></TouchableOpacity><TouchableOpacity style={[s.button,mode==="week"&&s.active]} onPress={()=>setMode("week")}><Text style={s.buttonText}>Week</Text></TouchableOpacity><TouchableOpacity style={s.button} onPress={()=>setDate(new Date())}><Text style={s.buttonText}>Today</Text></TouchableOpacity><TouchableOpacity style={s.button} onPress={()=>void load()} disabled={busy||offline}><Text style={s.buttonText}>Refresh</Text></TouchableOpacity></View>
    {busy?<ActivityIndicator/>:null}{error?<Text accessibilityRole="alert" style={s.error}>{error}</Text>:null}
    {renderList("Timetable",filtered(timetable),"No timetable slots returned for this period.")}{renderList("School calendar",filtered(events),"No calendar events returned for this period.")}{renderList("Exams",filtered(exams),"No published exams returned for this period.")}
    <Text style={s.footnote}>Planner data is child-scoped. If the service is not available, the app does not substitute another child's records.</Text>
  </View>;
}
const s=StyleSheet.create({card:{backgroundColor:"#fff",borderWidth:1,borderColor:"#e3e8f0",borderRadius:14,padding:14,gap:12},title:{fontSize:18,fontWeight:"800",color:"#172033"},heading:{fontSize:15,fontWeight:"700",color:"#263246"},muted:{fontSize:12,color:"#667085",lineHeight:18},controls:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:6,flexWrap:"wrap"},button:{paddingVertical:8,paddingHorizontal:10,borderWidth:1,borderColor:"#cbd5e1",borderRadius:8},active:{backgroundColor:"#eef4fc",borderColor:"#254f91"},buttonText:{color:"#254f91",fontWeight:"700",fontSize:12},date:{flex:1,textAlign:"center",fontSize:12,fontWeight:"700",color:"#344054"},group:{gap:6},item:{paddingVertical:9,borderTopWidth:1,borderColor:"#edf0f4",gap:3},itemTitle:{fontWeight:"700",color:"#263246"},error:{padding:10,borderRadius:8,backgroundColor:"#fff0f0",color:"#a12626"},footnote:{fontSize:11,color:"#667085"}});
