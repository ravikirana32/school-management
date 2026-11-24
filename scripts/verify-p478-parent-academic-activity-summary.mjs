import fs from 'node:fs';
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const component=fs.readFileSync('apps/parent-mobile/src/academics/ParentAcademicActivitySummary.tsx','utf8');
const checks=[
 ['summary component exported',component.includes('export function ParentAcademicActivitySummary')],
 ['summary component imported',app.includes('import { ParentAcademicActivitySummary } from "./src/academics/ParentAcademicActivitySummary"')],
 ['summary integrated with live parent data',app.includes('<ParentAcademicActivitySummary attendance={attendance} homework={homework} reportCards={reportCards}/>')],
 ['pure activity snapshot helper exported',component.includes('export function summarizeParentAcademicActivity')],
 ['attendance presence totals computed',component.includes('const present = attendance.filter')],
 ['absence totals computed',component.includes('const absent = attendance.filter')],
 ['other attendance statuses retained in total',component.includes('otherAttendance: Math.max(0, attendance.length - present - absent)')],
 ['assignment submitted status calculated',component.includes('const submitted = homework.filter')],
 ['pending assignments calculated',component.includes('const pendingRows = homework.filter')],
 ['overdue assignments computed with valid due dates',component.includes('Number.isFinite(Date.parse(row.dueAt))') && component.includes('Date.parse(row.dueAt) < now')],
 ['latest published report card sorted',component.includes('sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!))')],
 ['empty activity state supported',component.includes('Academic activity will appear here')],
 ['overdue indicator highlighted',component.includes('snapshot.overdue > 0 ? { color: "#b42318" }')],
 ['details sections remain preserved',app.includes('Published attendance')&&app.includes('Homework & assignments')&&app.includes('Report cards & academic progress')],
 ['snapshot stays scoped to active child',app.includes('!!activeChild&&<View style={styles.card}><ParentAcademicActivitySummary')],
 ['no writes/payment actions added to academic summary',!component.includes('fetch(')&&!component.includes('onPress=')]
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}console.log(`${checks.length-fail}/${checks.length} checks passed`);if(fail)process.exit(1);
