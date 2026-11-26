import { HealthWorkspace } from "./HealthWorkspace";
import { LibraryWorkspace } from "./LibraryWorkspace";
import { TransportWorkspace } from "./TransportWorkspace";
import { HostelWorkspace } from "./HostelWorkspace";
import { CanteenWorkspace } from "./CanteenWorkspace";
import { PayrollWorkspace } from "./PayrollWorkspace";
import { HRLifecycleWorkspace } from "./HRLifecycleWorkspace";
import { AttendanceWorkspace } from "./AttendanceWorkspace";
import { AdmissionsWorkspace } from "./AdmissionsWorkspace";
import { TimetableWorkspace } from "./TimetableWorkspace";
import { SchoolConfigurationWorkspace } from "./SchoolConfigurationWorkspace";
import { CampusRegistryWorkspace } from "./CampusRegistryWorkspace";
import { OnboardingWorkspace } from "./OnboardingWorkspace";
import { OperationalModulesWorkspace } from "./OperationalModulesWorkspace";
import { ParentOperationsWorkspace } from "./ParentOperationsWorkspace";
import { ReportCardGovernanceWorkspace } from "./ReportCardGovernanceWorkspace";
import { ExamAssessmentWorkspace } from "./ExamAssessmentWorkspace";
import { SchoolBrandWorkspace } from "./SchoolBrandWorkspace";
import { NotificationSuppressionWorkspace } from "./NotificationSuppressionWorkspace";
import { DataGovernanceWorkspace } from "./DataGovernanceWorkspace";
import { CampusInheritanceWorkspace } from "./CampusInheritanceWorkspace";
import { JourneyReadinessWorkspace } from "./JourneyReadinessWorkspace";
import { SecurityOperationsWorkspace } from "./SecurityOperationsWorkspace";
import { FinanceWorkspace } from "./FinanceWorkspace";
import { FinanceConfigurationWorkspace } from "./FinanceConfigurationWorkspace";
import { FeeStructuresWorkspace } from "./FeeStructuresWorkspace";
import { CommunicationWorkspace } from "./CommunicationWorkspace";
import { AdmissionsCommunicationsReportsWorkspace } from "./AdmissionsCommunicationsReportsWorkspace";
import { StudentAccountLinksWorkspace } from "./StudentAccountLinksWorkspace";
import { MessagingWorkspace } from "./MessagingWorkspace";
import { SubscriptionBillingWorkspace } from "./SubscriptionBillingWorkspace";
import { SchoolAdminSessionProvider, useSchoolAdminSession } from "./SchoolAdminSession";
import { visibleSchoolAdminTabs } from "./authorization";
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import "./design-system.css";

type Tab = "campuses" | "campusInheritance" | "onboarding" | "admissions" | "admissionsReports" | "profile" | "academic" | "calendar" | "working" | "policies" | "curriculum" | "students" | "staff" | "access" | "attendance" | "exams" | "timetable" | "fees" | "homework" | "reports" | "branding" | "parentNotifications" | "emailSuppression" | "dataGovernance" | "journeys" | "securityOperations" | "health" | "library" | "transport" | "hostel" | "canteen" | "payroll" | "hr" | "accounting" | "billing" | "communications" | "studentAccounts" | "messages";
const tabs: { id: Tab; label: string; permission: string }[] = [
  { id: "campuses", label: "Campus registry", permission: "school.settings.manage" },
  { id: "campusInheritance", label: "Campus inheritance", permission: "school.settings.manage" },
  { id: "onboarding", label: "Guided onboarding", permission: "school.settings.manage" },
  { id: "admissions", label: "Admissions & enrollment", permission: "admissions.read" },
  { id: "admissionsReports", label: "Admissions reports", permission: "admissions.read" },
  { id: "profile", label: "School profile", permission: "school.settings.manage" },
  { id: "academic", label: "Academic year", permission: "academics.manage" },
  { id: "calendar", label: "Calendar", permission: "academics.manage" },
  { id: "working", label: "Working days", permission: "school.settings.manage" },
  { id: "policies", label: "Policies", permission: "school.settings.manage" },
  { id: "curriculum", label: "Board & curriculum", permission: "academics.read" },
  { id: "students", label: "Students & guardians", permission: "students.read" },
  { id: "staff", label: "Staff & teachers", permission: "staff.read" },
  { id: "access", label: "Roles & permissions", permission: "access.roles.manage" },
  { id: "attendance", label: "Student attendance", permission: "attendance.manage" },
  { id: "health", label: "Health & wellbeing", permission: "health.read" },
  { id: "library", label: "Library management", permission: "library.read" },
  { id: "transport", label: "Transport management", permission: "transport.read" },
  { id: "hostel", label: "Hostel management", permission: "hostel.read" },
  { id: "canteen", label: "Canteen & meals", permission: "canteen.read" },
  { id: "payroll", label: "Payroll", permission: "payroll.read" },
  { id: "hr", label: "HR Lifecycle", permission: "hr.read" },
  { id: "exams", label: "Exams & assessment", permission: "academics.manage" },
  { id: "timetable", label: "Timetable", permission: "academics.manage" },
  { id: "fees", label: "Fees & payments", permission: "fees.manage" },
  { id: "accounting", label: "Accounting & finance", permission: "accounting.read" },
  { id: "communications", label: "Communication Center", permission: "communications.read" },
  { id: "messages", label: "Parent Messaging", permission: "communications.read" },
  { id: "studentAccounts", label: "Student Account Links", permission: "students.update" },
  { id: "billing", label: "Subscription & billing", permission: "school.settings.manage" },
  { id: "homework", label: "Homework", permission: "academics.manage" },
  { id: "reports", label: "Report cards", permission: "reports.read" },
  { id: "branding", label: "School branding", permission: "school.settings.manage" },
  { id: "parentNotifications", label: "Parent notifications", permission: "parent.notifications.manage" },
  { id: "emailSuppression", label: "Email suppression", permission: "school.settings.manage" },
  { id: "dataGovernance", label: "Data governance", permission: "school.settings.manage" },
  { id: "journeys", label: "Journey readiness", permission: "reports.read" },
  { id: "securityOperations", label: "Security & assurance", permission: "school.settings.manage" }
];

const navigationGroups: { title: string; tabs: Tab[] }[] = [
  { title: "School setup", tabs: ["profile", "academic", "calendar", "working", "policies", "campuses", "campusInheritance", "onboarding", "branding"] },
  { title: "People & admissions", tabs: ["admissions", "admissionsReports", "students", "staff", "access", "studentAccounts"] },
  { title: "Teaching & learning", tabs: ["curriculum", "exams", "timetable", "homework", "reports"] },
  { title: "Daily operations", tabs: ["attendance", "health", "library", "transport", "hostel", "canteen", "payroll", "hr"] },
  { title: "Finance", tabs: ["fees", "accounting", "billing"] },
  { title: "Family & communication", tabs: ["communications", "messages", "parentNotifications", "emailSuppression"] },
  { title: "Governance", tabs: ["dataGovernance", "journeys", "securityOperations"] }
];

const pageDescriptions: Record<Tab, string> = {
  campuses: "Organize school sites, campuses, and their operational details.",
  campusInheritance: "Review how school settings are inherited across campuses.",
  onboarding: "Follow guided steps to prepare your school workspace.",
  admissions: "Manage applicant progress and enrollment readiness.",
  admissionsReports: "Review admissions activity and enrollment performance.",
  profile: "Manage your school identity, location, and regional preferences.",
  academic: "Set academic years, terms, and important date ranges.",
  calendar: "Coordinate school events, holidays, exams, and meetings.",
  working: "Define the regular operating days for your school.",
  policies: "Configure attendance thresholds and grading policies.",
  curriculum: "Plan curriculum, grade levels, and subject mappings.",
  students: "Review student records and guardian contact workflows.",
  staff: "Manage staff details, roles, and employment workflows.",
  access: "Review role scopes and permissions for school users.",
  attendance: "Record and review attendance across your school.",
  exams: "Coordinate examinations, assessments, and results.",
  timetable: "Build and manage class schedules and teaching periods.",
  fees: "Review fee operations, charges, and payment activity.",
  homework: "Manage learning tasks and homework communication.",
  reports: "Review academic performance and report-card readiness.",
  branding: "Customize the school identity used across communications.",
  parentNotifications: "Manage the notices and updates sent to families.",
  emailSuppression: "Review and manage email delivery safeguards.",
  dataGovernance: "Manage data handling, retention, and governance controls.",
  journeys: "Track readiness milestones across the school experience.",
  securityOperations: "Maintain school security and operational assurance.",
  health: "Coordinate health and wellbeing operations.",
  library: "Manage library resources and circulation workflows.",
  transport: "Coordinate transport routes, vehicles, and riders.",
  hostel: "Manage accommodation and hostel operations.",
  canteen: "Coordinate meal services and canteen operations.",
  payroll: "Review payroll workflows and staff compensation.",
  hr: "Manage staff lifecycle and human-resources operations.",
  accounting: "Review accounting configuration and financial records.",
  billing: "Manage school subscriptions, plans, and invoices.",
  communications: "Coordinate school-wide communication and announcements.",
  studentAccounts: "Manage student portal access and account links.",
  messages: "Review conversations and messaging with parents."
};

function AdminWorkspace() {
  const session = useSchoolAdminSession();
  const { token, org, school, permissions, permissionsLoading, userEmail, memberships, selectedMembership, setSelectedMembership, year, years, setYear, signOut } = session;
  const visibleTabs = useMemo(() => visibleSchoolAdminTabs(tabs, permissions), [permissions]);
  const [tab, setTab] = useState<Tab>("profile");
  const [navigationQuery, setNavigationQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => {
    if (visibleTabs.length && !visibleTabs.some(item => item.id === tab)) setTab(visibleTabs[0].id as Tab);
  }, [visibleTabs, tab]);
  const visibleNavigationGroups = useMemo(() => navigationGroups.map(group => ({
    ...group,
    items: visibleTabs.filter(item => group.tabs.includes(item.id) && item.label.toLowerCase().includes(navigationQuery.trim().toLowerCase()))
  })).filter(group => group.items.length > 0), [visibleTabs, navigationQuery]);
  const [schoolName, setSchoolName] = useState("Your School");
  const [board, setBoard] = useState("CBSE");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [language, setLanguage] = useState("en");
  const [gradeRows, setGradeRows] = useState(["Grade 1", "Grade 2", "Grade 3"]);
  const [newGrade, setNewGrade] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  const [studentRows, setStudentRows] = useState<{ admissionNo: string; name: string }[]>([]);
  const [employeeNo, setEmployeeNo] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("Teacher");
  const [staffRows, setStaffRows] = useState<{ employeeNo: string; name: string; role: string }[]>([]);
  const [roleRows, setRoleRows] = useState(["School Admin", "HR Manager", "Principal", "Department Head", "Teacher", "Front Office"]);
  const [yearName, setYearName] = useState("2027–2028");
  const [yearStart, setYearStart] = useState("2027-04-01");
  const [yearEnd, setYearEnd] = useState("2028-03-31");
  const [workingDays, setWorkingDays] = useState([false, true, true, true, true, true, false]);
  const [message, setMessage] = useState("Configuration preview only — connect the authenticated API to save changes.");
  const selectedTab = tabs.find(t => t.id === tab);
  const selected = selectedTab?.label ?? "Workspace";
  const activeGroup = navigationGroups.find(group => group.tabs.includes(tab))?.title ?? "Workspace";
  const currentYear = years.find(item => item.id === year);
  const canOpenWorkspace = Boolean(token && org && school && !permissionsLoading && visibleTabs.length);

  function submitPreview(event: React.FormEvent) {
    event.preventDefault();
    setMessage("Preview updated locally. Backend persistence requires API integration and an authenticated school context.");
  }

  return <main className="admin-shell">
    {mobileNavOpen && <button className="sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
    <aside id="school-workspace-sidebar" className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand-row"><div className="brand"><span className="brand-mark">S</span><div><b>SchoolOS</b><small>School workspace</small></div></div><button className="sidebar-close" type="button" onClick={() => setMobileNavOpen(false)}>Close</button></div>
      <label className="sidebar-search"><span className="sr-only">Search pages</span><input type="search" value={navigationQuery} onChange={event => setNavigationQuery(event.target.value)} placeholder="Search pages…" /></label>
      <nav aria-label="School workspace pages">{visibleNavigationGroups.map(group => <section className="nav-group" key={group.title}>
        <h2>{group.title}</h2>
        {group.items.map(item => <button type="button" key={item.id} className={tab === item.id ? "nav-item active" : "nav-item"} aria-current={tab === item.id ? "page" : undefined} onClick={() => { setTab(item.id); setMobileNavOpen(false); }}>
          <span className="nav-item-marker" aria-hidden="true" />{item.label}
        </button>)}
      </section>)}{visibleNavigationGroups.length === 0 && <p className="nav-empty">No pages match your search.</p>}</nav>
      <div className="sidebar-foot"><span>Role-based access</span><span>{permissions.length} permissions</span></div>
    </aside>
    <section className="workspace">
      <header className="topbar">
        <div className="topbar-main">
          <button className="mobile-nav-toggle" type="button" aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"} aria-controls="school-workspace-sidebar" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(open => !open)}>Menu</button>
          <div className="topbar-heading"><div className="breadcrumb"><span>SchoolOS</span><span>/</span><span>{activeGroup}</span></div><strong>{selected}</strong></div>
        </div>
        <div className="topbar-controls">
          <label className="topbar-select"><span>School</span><select value={selectedMembership} onChange={event => setSelectedMembership(event.target.value)} disabled={memberships.length < 2}>{memberships.map(item => <option key={`${item.organization.id}::${item.school.id}`} value={`${item.organization.id}::${item.school.id}`}>{item.organization.name} · {item.school.name}</option>)}</select></label>
          <label className="topbar-select"><span>Academic year</span><select value={year} onChange={event => setYear(event.target.value)} disabled={years.length < 2}>{years.map(item => <option key={item.id} value={item.id}>{item.name}{item.isCurrent ? " · Current" : ""}</option>)}</select></label>
          <div className="user-menu"><span className="user-avatar">{userEmail.slice(0, 1).toUpperCase() || "U"}</span><div className="user-info"><strong>{userEmail}</strong><small>{permissions.length} permissions · secure session</small></div><button type="button" onClick={() => void signOut()}>Sign out</button></div>
        </div>
      </header>
      <div className="content">
        {!canOpenWorkspace ? <div className="config-card"><h2>{!token ? "Sign in required" : permissionsLoading ? "Loading permissions" : "No accessible school modules"}</h2><p className="helper">{!token ? "Sign in above to load your active school memberships and permissions." : permissionsLoading ? "Checking your permissions for the selected school." : "Your active school membership has no module permissions. Ask a school administrator to assign the appropriate role."}</p></div> : <>
        <div className="page-heading"><div><div className="eyebrow">{activeGroup}</div><h1>{selected}</h1><p>{pageDescriptions[tab]}</p></div>{currentYear && <span className="page-context">{currentYear.name}</span>}</div>
        {tab === "campuses" ? <CampusRegistryWorkspace apiBase={session.api} organizationId={org} schoolId={school} token={token} /> : tab === "campusInheritance" ? <CampusInheritanceWorkspace /> : tab === "onboarding" ? <OnboardingWorkspace onNavigate={next => setTab(next as Tab)} /> : tab === "admissions" ? <AdmissionsWorkspace /> : (["profile", "academic", "calendar", "working", "policies"] as Tab[]).includes(tab) ? (
          <SchoolConfigurationWorkspace tab={tab as "profile" | "academic" | "calendar" | "working" | "policies"} />
        ) : (["curriculum", "students", "staff", "access"] as Tab[]).includes(tab) ? <OperationalModulesWorkspace tab={tab as "curriculum" | "students" | "staff" | "access"} /> : tab === "health" ? <HealthWorkspace apiBase={session.api} organizationId={org} schoolId={school} token={token} /> : tab === "library" ? <LibraryWorkspace apiBase={session.api} organizationId={org} schoolId={school} token={token} /> : tab === "transport" ? <TransportWorkspace apiBase={session.api} organizationId={org} schoolId={school} token={token} /> : tab === "hostel" ? <HostelWorkspace apiBase={session.api} organizationId={org} schoolId={school} token={token} /> : tab === "canteen" ? <CanteenWorkspace apiBase={session.api} organizationId={org} schoolId={school} token={token} /> : tab === "payroll" ? <PayrollWorkspace apiBase={session.api} organizationId={org} schoolId={school} token={token} /> : tab === "hr" ? <HRLifecycleWorkspace apiBase={session.api} organizationId={org} schoolId={school} token={token} /> : tab === "exams" ? <ExamAssessmentWorkspace /> : tab === "reports" ? <ReportCardGovernanceWorkspace /> : tab === "branding" ? <SchoolBrandWorkspace /> : tab === "emailSuppression" ? <NotificationSuppressionWorkspace /> : tab === "dataGovernance" ? <DataGovernanceWorkspace /> : tab === "journeys" ? <JourneyReadinessWorkspace /> : tab === "securityOperations" ? <SecurityOperationsWorkspace /> : (["fees", "homework", "parentNotifications"] as Tab[]).includes(tab) ? <ParentOperationsWorkspace area={tab === "parentNotifications" ? "notifications" : tab as "fees" | "homework"} /> : <>
        <div className="notice"><b>Workspace</b><span>{message}</span></div>
        <form className="config-card" onSubmit={submitPreview}>
          {tab === "profile" && <>
            <h2>School identity</h2><p className="helper">Core school details and regional preferences.</p>
            <div className="form-grid">
              <label>School display name<input value={schoolName} onChange={e => setSchoolName(e.target.value)} required /></label>
              <label>Board / curriculum<select value={board} onChange={e => setBoard(e.target.value)}><option>CBSE</option><option>ICSE</option><option>STATE</option><option>IB</option><option>IGCSE</option><option>OTHER</option></select></label>
              <label>Timezone<input value={timezone} onChange={e => setTimezone(e.target.value)} /></label>
              <label>Primary language<input value={language} onChange={e => setLanguage(e.target.value)} /></label>
              <label>Country code<input defaultValue="IN" maxLength={2} /></label>
              <label>Currency<input defaultValue="INR" maxLength={3} /></label>
            </div>
          </>}
          {tab === "academic" && <>
            <h2>Academic year</h2><p className="helper">Define the school year and its date range.</p>
            <div className="form-grid">
              <label>Academic year name<input value={yearName} onChange={e => setYearName(e.target.value)} /></label>
              <label>Academic year code<input defaultValue="2027-28" /></label>
              <label>Starts on<input type="date" value={yearStart} onChange={e => setYearStart(e.target.value)} /></label>
              <label>Ends on<input type="date" value={yearEnd} onChange={e => setYearEnd(e.target.value)} /></label>
            </div>
            {yearEnd < yearStart && <p className="error">End date must not precede start date.</p>}
            <div className="subsection"><h3>Terms and semesters</h3><p className="helper">Add terms after creating the academic year through the API.</p><div className="empty-row">No terms configured in this local preview.</div></div>
          </>}
          {tab === "calendar" && <>
            <h2>School calendar</h2><p className="helper">Organize holidays, exams, parent meetings and school events.</p>
            <div className="form-grid">
              <label>Calendar name<input defaultValue="Main School Calendar" /></label>
              <label>Academic year<select defaultValue="2027-28"><option>2027-28</option><option>2026-27</option></select></label>
              <label>Event title<input placeholder="e.g. Independence Day" /></label>
              <label>Event type<select><option>HOLIDAY</option><option>SCHOOL_EVENT</option><option>EXAM</option><option>PARENT_MEETING</option><option>STAFF_EVENT</option><option>CLOSURE</option></select></label>
              <label>Starts at<input type="datetime-local" /></label>
              <label>Ends at<input type="datetime-local" /></label>
            </div>
          </>}
          {tab === "working" && <>
            <h2>Weekly working days</h2><p className="helper">Choose the days when the school normally operates.</p>
            <div className="weekday-list">{["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day, i) => <label className="weekday" key={day}><input type="checkbox" checked={workingDays[i]} onChange={e => setWorkingDays(old => old.map((v, idx) => idx === i ? e.target.checked : v))} /><span>{day}</span><small>{workingDays[i] ? "Working day" : "Non-working"}</small></label>)}</div>
          </>}
          {tab === "students" && <>
            <h2>Student records</h2><p className="helper">Create an admission record and associate guardian contacts. This screen is a local preview; it does not store personal data in the backend.</p>
            <div className="form-grid">
              <label>Admission number<input value={admissionNo} onChange={e => setAdmissionNo(e.target.value)} placeholder="e.g. 2027-0001" /></label>
              <label>First name<input value={studentFirstName} onChange={e => setStudentFirstName(e.target.value)} /></label>
              <label>Last name<input value={studentLastName} onChange={e => setStudentLastName(e.target.value)} /></label>
              <label>Date of birth<input type="date" /></label>
            </div>
            <div className="subsection"><h3>Guardian and emergency contact</h3><p className="helper">Guardian portal access is not enabled by creating a contact record.</p>
              <div className="form-grid">
                <label>Guardian name<input placeholder="Full name" /></label>
                <label>Relationship<select><option>MOTHER</option><option>FATHER</option><option>LEGAL_GUARDIAN</option><option>GRANDPARENT</option><option>OTHER</option></select></label>
                <label>Phone<input type="tel" placeholder="Contact number" /></label>
                <label>Email<input type="email" placeholder="Optional" /></label>
              </div>
            </div>
            <div className="form-actions"><span>{studentRows.length} preview records in this session</span><button type="button" onClick={() => { if (admissionNo.trim() && studentFirstName.trim()) { setStudentRows(rows => [...rows, { admissionNo: admissionNo.trim(), name: `${studentFirstName.trim()} ${studentLastName.trim()}`.trim() }]); setAdmissionNo(""); setStudentFirstName(""); setStudentLastName(""); setMessage("Student preview added locally. No personal data was sent to the server."); } }}>Add preview student</button></div>
            {studentRows.length > 0 && <div className="grade-list">{studentRows.map(row => <div className="grade-row" key={row.admissionNo}><span className="grade-index">S</span><b>{row.name}</b><small>{row.admissionNo}</small></div>)}</div>}
          </>}
          {tab === "curriculum" && <>
            <h2>Board and curriculum</h2><p className="helper">Choose a board family, define grade levels and prepare curriculum versions and subject mappings.</p>
            <div className="form-grid">
              <label>Board / curriculum<select defaultValue="CBSE"><option>CBSE</option><option>ICSE</option><option>ISC</option><option>STATE</option><option>IB</option><option>IGCSE</option><option>CUSTOM</option></select></label>
              <label>Jurisdiction country<input defaultValue="IN" maxLength={2} /></label>
              <label>State / region<input placeholder="e.g. Karnataka" /></label>
              <label>Affiliation / registration number<input placeholder="Optional" /></label>
            </div>
            <div className="subsection"><h3>Grade levels</h3><p className="helper">A school can customize its grade names and sequence.</p>
              <div className="grade-list">{gradeRows.map((grade, i) => <div className="grade-row" key={`${grade}-${i}`}><span className="grade-index">{i + 1}</span><b>{grade}</b><small>Active · Draft preview</small></div>)}</div>
              <div className="add-grade"><input value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder="Enter a grade name" /><button type="button" onClick={() => { if (newGrade.trim()) { setGradeRows(rows => [...rows, newGrade.trim()]); setNewGrade(""); } }}>Add grade</button></div>
            </div>
            <div className="subsection"><h3>Curriculum versions</h3><div className="empty-row">Create a version linked to an academic year through the curriculum API. Add subjects per grade after creating the version.</div></div>
          </>}
          {tab === "policies" && <>
            <h2>Attendance and grading policies</h2><p className="helper">Baseline policy values consumed by later attendance and examination modules.</p>
            <div className="form-grid">
              <label>Late arrival threshold (minutes)<input type="number" min="0" max="240" defaultValue="15" /></label>
              <label>Grading scale<select defaultValue="PERCENTAGE"><option>PERCENTAGE</option><option>LETTER</option><option>GPA</option><option>DESCRIPTIVE</option></select></label>
              <label>Passing percentage<input type="number" min="0" max="100" defaultValue="35" /></label>
              <label>Decimal places<input type="number" min="0" max="3" defaultValue="0" /></label>
            </div>
            <label className="check-line"><input type="checkbox" defaultChecked /> Allow half-day attendance</label>
            <label className="check-line"><input type="checkbox" /> Require a reason for absence</label>
          </>}
          {tab === "staff" && <>
            <h2>Staff and teacher directory</h2>
            <p className="helper">Preview staff records, departments and teacher roles. This screen is local-only and is not connected to the staff API yet.</p>
            <div className="form-grid">
              <label>Employee number<input value={employeeNo} onChange={e => setEmployeeNo(e.target.value)} placeholder="EMP-001" /></label>
              <label>Staff full name<input value={staffName} onChange={e => setStaffName(e.target.value)} placeholder="Full name" /></label>
              <label>Designation<select value={staffRole} onChange={e => setStaffRole(e.target.value)}><option>Teacher</option><option>Principal</option><option>Coordinator</option><option>Administrator</option><option>Accountant</option><option>Support staff</option></select></label>
              <label>Employment type<select defaultValue="FULL_TIME"><option>FULL_TIME</option><option>PART_TIME</option><option>CONTRACT</option><option>VISITING</option><option>INTERN</option></select></label>
            </div>
            <div className="form-actions"><span>{staffRows.length} preview staff records</span><button type="button" onClick={() => { if (employeeNo.trim() && staffName.trim()) { setStaffRows(rows => [...rows, { employeeNo: employeeNo.trim(), name: staffName.trim(), role: staffRole }]); setEmployeeNo(""); setStaffName(""); setMessage("Staff preview added locally. No staff data was sent to the server."); } }}>Add preview staff</button></div>
            {staffRows.length > 0 && <div className="grade-list">{staffRows.map(row => <div className="grade-row" key={row.employeeNo}><span className="grade-index">T</span><b>{row.name}</b><small>{row.employeeNo} · {row.role}</small></div>)}</div>}
            <div className="subsection"><h3>Teacher assignments</h3><div className="empty-row">Assign active teachers to academic year, grade, section and curriculum subject through the teacher-assignment API.</div></div>
            <div className="subsection"><h3>Employment documents</h3><div className="empty-row">Private document metadata endpoint is available; secure binary upload, review and signed access remain future work.</div></div>
          </>}
          {tab === "attendance" && <AttendanceWorkspace />}
          {tab === "accounting" && <><FinanceConfigurationWorkspace /><FinanceWorkspace /><FeeStructuresWorkspace /></>}
          {tab === "communications" && <CommunicationWorkspace />}
          {tab === "admissionsReports" && <AdmissionsCommunicationsReportsWorkspace />}
          {tab === "studentAccounts" && <StudentAccountLinksWorkspace />}
          {tab === "messages" && <MessagingWorkspace />}
          {tab === "billing" && <SubscriptionBillingWorkspace />}
          {tab === "timetable" && <TimetableWorkspace />}
          {tab === "access" && <>
            <h2>Roles and permissions</h2>
            <p className="helper">Review baseline school roles. The permission catalog and assignment APIs are available; this preview is not yet connected to them.</p>
            <div className="grade-list">{roleRows.map((role, i) => <div className="grade-row" key={role}><span className="grade-index">{i + 1}</span><b>{role}</b><small>School scope · preview</small></div>)}</div>
            <div className="subsection"><h3>Permission groups</h3><div className="empty-row">Staff · Students · Admissions · Attendance · Academics · Fees · Reports · School settings · Access administration</div></div>
            <div className="subsection"><h3>Access safeguards</h3><p className="helper">Teacher self-service exposes only the linked active staff profile and assigned teaching sections. Other student and staff records remain School Admin-only until each module adopts granular authorization.</p></div>
          </>}
          {tab !== "attendance" && tab !== "timetable" && tab !== "accounting" && <div className="form-actions"><span>Local preview only · no server write</span><button type="submit" disabled={tab === "academic" && yearEnd < yearStart}>Update local preview</button></div>}
        </form>
        </>}
        <div className="footer-note">School settings are tenant-scoped. Changes are submitted to authenticated APIs and require the appropriate school permissions.</div>
      </> }
      </div>
    </section>
  </main>;
}

function App() { return <SchoolAdminSessionProvider><AdminWorkspace /></SchoolAdminSessionProvider>; }

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
