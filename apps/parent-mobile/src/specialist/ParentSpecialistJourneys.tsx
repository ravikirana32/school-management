import React, {useMemo, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

type Props={studentName:string; studentId:string; schoolName:string};
type JourneyKey='transport'|'library'|'hostel';
const journeys:{key:JourneyKey;title:string;description:string;details:string[];availability:string}[]=[
 {key:'transport',title:'School Transport',description:'Your child’s assigned transport information and daily commute updates.',details:['Assigned route and pickup/drop stop','Pickup/drop timings and route notes','Trip status and parent-visible incident notices'],availability:'Parent transport APIs and live trip/vehicle visibility are not yet available. This view does not expose staff transport records.'},
 {key:'library',title:'Library',description:'Library borrowing information for the selected child.',details:['Borrowed books and due dates','Return status and overdue notices','Reservation status when supported'],availability:'Guardian-scoped library loan APIs are not yet available. No catalogue or loan data is fabricated.'},
 {key:'hostel',title:'Hostel & Residence',description:'Parent-visible hostel placement and wellbeing updates, where applicable.',details:['Hostel and room assignment','Parent-visible check-in/out updates','Approved wellbeing/incident notices'],availability:'Guardian-scoped hostel APIs are not yet available. Staff incident details remain private.'}
];
export function ParentSpecialistJourneys({studentName,studentId,schoolName}:Props){
 const [selected,setSelected]=useState<JourneyKey>('transport');
 const active=useMemo(()=>journeys.find(x=>x.key===selected)!, [selected]);
 return <View style={s.card} accessibilityLabel={`Specialist parent journeys for ${studentName}`}>
  <Text style={s.heading}>Transport, Library & Hostel</Text>
  <Text style={s.meta}>Child: {studentName} · School: {schoolName}</Text>
  <View style={s.tabs}>{journeys.map(item=><TouchableOpacity key={item.key} accessibilityRole="tab" accessibilityState={{selected:selected===item.key}} style={[s.tab,selected===item.key&&s.tabActive]} onPress={()=>setSelected(item.key)}><Text style={[s.tabText,selected===item.key&&s.tabTextActive]}>{item.title}</Text></TouchableOpacity>)}</View>
  <View style={s.section} key={`${selected}:${studentId}`}>
   <Text style={s.title}>{active.title}</Text><Text style={s.body}>{active.description}</Text>
   {active.details.map(d=><Text style={s.bullet} key={d}>• {d}</Text>)}
   <View style={s.notice}><Text style={s.noticeTitle}>Availability status</Text><Text style={s.body}>{active.availability}</Text></View>
  </View>
 </View>;
}
const s=StyleSheet.create({card:{backgroundColor:'#fff',borderRadius:14,borderWidth:1,borderColor:'#e3e8f0',padding:16,gap:10},heading:{fontSize:17,fontWeight:'700',color:'#172033'},meta:{fontSize:12,color:'#667085'},tabs:{flexDirection:'row',flexWrap:'wrap',gap:6},tab:{borderWidth:1,borderColor:'#cbd5e1',paddingVertical:8,paddingHorizontal:10,borderRadius:8},tabActive:{backgroundColor:'#eef4fc',borderColor:'#254f91'},tabText:{fontSize:12,color:'#52647e',fontWeight:'600'},tabTextActive:{color:'#254f91'},section:{gap:8},title:{fontSize:16,fontWeight:'700',color:'#263246'},body:{fontSize:12,color:'#667085',lineHeight:18},bullet:{fontSize:12,color:'#344054',lineHeight:18},notice:{backgroundColor:'#f8fafc',borderColor:'#d8deea',borderWidth:1,borderRadius:8,padding:10,gap:4},noticeTitle:{fontSize:12,fontWeight:'700',color:'#52647e'}});
