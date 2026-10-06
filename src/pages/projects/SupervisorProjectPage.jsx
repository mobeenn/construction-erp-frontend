import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
   FiActivity,
   FiAlertTriangle,
   FiBox,
   FiCalendar,
   FiCheckCircle,
   FiClipboard,
   FiClock,
   FiFileText,
   FiFolder,
   FiLayers,
   FiMapPin,
   FiPackage,
   FiTruck,
   FiUsers,
} from "react-icons/fi";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/ui/ToastContext";
import { getProjects, getProjectDashboard } from "../../services/projectService";
import { getActivities } from "../../services/activityService";
import { getProgressDashboard, getProgressUpdates } from "../../services/progressUpdateService";
import { getDailyReports } from "../../services/dailyReportService";
import { getDocuments } from "../../services/documentService";
import { getEmployees } from "../../services/employeeService";
import { getDailyAttendance } from "../../services/attendanceService";
import { getInventory } from "../../services/inventoryService";
import { getMaterialRequests } from "../../services/materialRequestService";
import { getMaterialIssues } from "../../services/materialIssueService";
import Tabs from "../../components/ui/Tabs";
import { SearchInput, FilterSelect } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap, Avatar } from "../../components/ui/TableShell";
import StatusBadge from "../../components/ui/StatusBadge";
import { Hero, KpiCard, ViewAllLink } from "../../components/dashboard/widgets";
import { ProgressBar } from "../../components/charts/Charts";
import { formatMoney } from "../../utils/format";

const idOf = (v) => String(v?._id || v || "");
const dayKey = (v) => String(v || "").slice(0, 10);
const todayKey = () => new Date().toISOString().slice(0, 10);
const money = (v) => formatMoney(v, { compact: true });
const readList = (res) => res?.data?.data || [];

const TABS = ["Overview", "Tasks", "Team & Materials", "Issues & Feed", "Documents"];
const TASK_STATUSES = [
   { value: "all", label: "All statuses" },
   { value: "not_started", label: "Not started" },
   { value: "in_progress", label: "In progress" },
   { value: "delayed", label: "Delayed" },
   { value: "completed", label: "Completed" },
   { value: "on_hold", label: "On hold" },
];
const SORTS = [
   { value: "deadline", label: "Sort: Deadline" },
   { value: "progress", label: "Sort: Progress" },
   { value: "name", label: "Sort: Name" },
];

export default function SupervisorProjectPage() {
   const { user } = useAuth();
   const toast = useToast();
   const [projects, setProjects] = useState([]);
   const [selectedId, setSelectedId] = useState("");
   const [loadingProjects, setLoadingProjects] = useState(true);
   const [loadingDetail, setLoadingDetail] = useState(false);
   const [projectError, setProjectError] = useState("");
   const [tab, setTab] = useState("Overview");
   const [search, setSearch] = useState("");
   const [statusFilter, setStatusFilter] = useState("all");
   const [detail, setDetail] = useState(null);

   useEffect(() => {
      let active = true;
      setLoadingProjects(true);
      getProjects()
         .then((res) => {
            if (!active) return;
            const all = readList(res);
            const mine = all.filter((p) =>
               [p.siteSupervisor, p.supervisor, p.projectManager].some((a) => a && idOf(a) === idOf(user)),
            );
            const list = mine.length ? mine : all;
            setProjects(list);
            if (list.length) setSelectedId((cur) => cur || list[0]._id);
         })
         .catch((err) => toast.error(err.response?.data?.message || "Could not load projects."))
         .finally(() => active && setLoadingProjects(false));
      return () => { active = false; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const selected = useMemo(() => projects.find((p) => p._id === selectedId) || null, [projects, selectedId]);

   useEffect(() => {
      if (!selectedId) return;
      let active = true;
      setLoadingDetail(true);
      setProjectError("");
      (async () => {
         const out = { dash: null, progress: null, updates: [], activities: [], reports: [], team: [], attendance: [], materials: [], requests: [], issues: [], documents: [] };
         const settle = async (fn, apply) => {
            try {
               const res = await fn();
               if (active) apply(readList(res));
            } catch { /* section stays empty — EmptyState handles it */ }
         };
         try {
            const d = await getProjectDashboard(selectedId);
            if (active) out.dash = d.data?.data || null;
         } catch { /* optional */ }
         try {
            const d = await getProgressDashboard(selectedId);
            if (active) out.progress = d.data?.data || null;
         } catch { /* optional */ }
         await Promise.all([
            settle(() => getProgressUpdates(selectedId), (v) => { out.updates = v; }),
            settle(() => getActivities(`?project=${selectedId}`), (v) => { out.activities = v; }),
            settle(() => getDailyReports(), (v) => { out.reports = v.filter((r) => idOf(r.project) === selectedId); }),
            settle(() => getEmployees(1, 1000, ""), (v) => {
               const list = Array.isArray(v) ? v : [];
               out.team = list.filter((e) => idOf(e.assignedProject) === selectedId || (e.projectAssignments || []).map(idOf).includes(selectedId));
            }),
            settle(() => getDailyAttendance(todayKey()), (v) => { out.attendance = v; }),
            settle(() => getInventory(), (v) => { out.materials = v.filter((m) => idOf(m.project) === selectedId); }),
            settle(() => getMaterialRequests(), (v) => { out.requests = v.filter((r) => idOf(r.project) === selectedId); }),
            settle(() => getMaterialIssues(), (v) => { out.issues = v.filter((r) => idOf(r.project) === selectedId); }),
            settle(() => getDocuments(), (v) => { out.documents = v.filter((doc) => idOf(doc.project) === selectedId || idOf(doc.entityId) === selectedId); }),
         ]);
         if (active) setDetail(out);
      })()
         .catch((err) => active && setProjectError(err.response?.data?.message || "Could not load project workspace."))
         .finally(() => active && setLoadingDetail(false));
      return () => { active = false; };
   }, [selectedId]);

   const filteredProjects = useMemo(() => {
      const q = search.trim().toLowerCase();
      return projects.filter((p) => {
         const matchesQ = !q || `${p.name || ""} ${p.projectCode || ""} ${p.location || ""}`.toLowerCase().includes(q);
         const matchesS = statusFilter === "all" || p.status === statusFilter;
         return matchesQ && matchesS;
      });
   }, [projects, search, statusFilter]);

   if (loadingProjects) {
      return (
         <div className="space-y-4">
            <div className="skeleton h-44 rounded-3xl" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
               {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}
            </div>
            <TableSkeleton rows={5} cols={5} />
         </div>
      );
   }

   if (!projects.length) {
      return (
         <div className="surface-card">
            <EmptyState icon={FiLayers} title="No projects assigned" message="No construction sites are assigned to your account yet. Contact your administrator." />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <Hero
            eyebrow="Site workspace"
            title={selected ? selected.name : "My projects"}
            subtitle={selected ? `${selected.projectCode} · ${selected.client?.name || "No client"} · ${selected.location || "No location"}` : "Select a site to manage its daily operations."}
            actions={
               <>
                  <select
                     value={selectedId}
                     onChange={(e) => { setSelectedId(e.target.value); setTab("Overview"); }}
                     className="select !w-auto min-w-[14rem]"
                     aria-label="Select project"
                  >
                     {projects.map((p) => <option key={p._id} value={p._id}>{p.projectCode} · {p.name}</option>)}
                  </select>
                  <Link to="/site-supervisor" className="btn btn-secondary">
                     <FiClipboard size={16} />
                     Daily reports
                  </Link>
               </>
            }
         >
            {selected && (
               <div className="flex items-center gap-4 rounded-2xl bg-[#0d222b]/12 p-4 backdrop-blur-sm">
                  <div className="text-[#0d222b]">
                     <p className="font-display text-3xl font-extrabold leading-none">{selected.progress || 0}%</p>
                     <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wide opacity-70">Complete</p>
                  </div>
                  <div className="w-28"><ProgressBar value={Number(selected.progress || 0)} gradient /></div>
                  <StatusBadge status={selected.status} />
               </div>
            )}
         </Hero>

         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search my projects…" className="sm:max-w-xs" />
            <FilterSelect
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               options={[{ value: "all", label: "All statuses" }, { value: "in_progress", label: "In progress" }, { value: "mobilization", label: "Mobilization" }, { value: "on_hold", label: "On hold" }, { value: "completed", label: "Completed" }, { value: "planning", label: "Planning" }]}
               className="sm:w-52"
            />
            <span className="badge badge-brand ml-auto">{filteredProjects.length} sites</span>
         </div>

         {filteredProjects.length > 1 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
               {filteredProjects.filter((p) => p._id !== selectedId).slice(0, 3).map((p) => (
                  <button
                     key={p._id}
                     type="button"
                     onClick={() => { setSelectedId(p._id); setTab("Overview"); }}
                     className="surface-card card-hover flex items-center gap-3 p-4 text-left"
                  >
                     <Avatar name={p.name} />
                     <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink-900">{p.name}</span>
                        <span className="block truncate text-xs text-ink-500">{p.projectCode} · {p.location || "—"}</span>
                     </span>
                     <span className="shrink-0 text-right">
                        <span className="block font-display text-lg font-extrabold text-ink-900">{p.progress || 0}%</span>
                        <StatusBadge status={p.status} />
                     </span>
                  </button>
               ))}
            </div>
         )}

         {projectError ? (
            <div className="surface-card"><ErrorState message={projectError} onRetry={() => setSelectedId((id) => `${id}`)} /></div>
         ) : loadingDetail || !detail ? (
            <TableSkeleton rows={6} cols={4} />
         ) : (
            <>
               <Tabs label="Site sections" value={tab} onChange={setTab} options={TABS.map((t) => ({ value: t, label: t }))} />
               <div key={`${selectedId}-${tab}`} className="animate-fade-up">
                  {tab === "Overview" && <OverviewTab project={selected} detail={detail} />}
                  {tab === "Tasks" && <TasksTab detail={detail} />}
                  {tab === "Team & Materials" && <TeamMaterialsTab project={selected} detail={detail} />}
                  {tab === "Issues & Feed" && <IssuesFeedTab detail={detail} />}
                  {tab === "Documents" && <DocumentsTab project={selected} detail={detail} />}
               </div>
            </>
         )}
      </div>
   );
}

/* ================= Overview ================= */

function OverviewTab({ project, detail }) {
   const { dash, progress, activities, reports, team, attendance, materials, requests } = detail;
   const today = todayKey();
   const todaysReports = reports.filter((r) => dayKey(r.reportDate) === today);
   const openIssues = reports.filter((r) => r.status === "pending").length;
   const lowStock = materials.filter((m) => Number(m.currentStock || 0) <= Number(m.minimumStock || m.reorderLevel || 0)).length;
   const pendingRequests = requests.filter((r) => r.status === "pending").length;
   const presentToday = attendance.filter((a) => {
      const empId = idOf(a.employee);
      return team.some((t) => t._id === empId) && a.status === "present";
   }).length;

   const milestones = useMemo(() => buildMilestones(activities), [activities]);
   const doneTasks = activities.filter((a) => a.status === "completed").length;

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Overall progress" value={`${project.progress || 0}%`} icon={FiActivity} tone="brand" hint={`${doneTasks}/${activities.length} tasks done`} />
            <KpiCard label="Team today" value={`${presentToday}/${team.length}`} icon={FiUsers} tone="mint" hint="Present on site" />
            <KpiCard label="Low stock" value={lowStock} icon={FiBox} tone={lowStock > 0 ? "amber" : "mint"} hint={`${materials.length} materials`} />
            <KpiCard label="Open reports" value={openIssues} icon={FiClipboard} tone={openIssues > 0 ? "amber" : "neutral"} hint={`${todaysReports.length} filed today`} />
         </div>

         <div className="grid gap-4 lg:grid-cols-3">
            <div className="surface-card p-5 lg:col-span-1">
               <h3 className="flex items-center gap-2 text-[0.95rem] font-bold text-ink-900"><FiLayers size={16} className="text-brand-500" /> Project overview</h3>
               <div className="mt-3 space-y-2 text-sm">
                  <OverviewRow label="Project code" value={project.projectCode} mono />
                  <OverviewRow label="Client" value={project.client?.name} />
                  <OverviewRow label="Location" value={project.location} />
                  <OverviewRow label="Manager" value={project.projectManager?.name} />
                  <OverviewRow label="Supervisor" value={project.siteSupervisor?.name} />
                  <OverviewRow label="Start" value={project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"} />
                  <OverviewRow label="Expected completion" value={project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"} />
                  <OverviewRow label="Contract value" value={money(project.contractValue)} mono />
                  <OverviewRow label="Budget" value={money(project.budget)} mono />
               </div>
               <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-ink-500">Status</span>
                  <StatusBadge status={project.status} />
               </div>
               {project.description && <p className="mt-3 rounded-xl bg-canvas p-3 text-xs leading-relaxed text-ink-500">{project.description}</p>}
            </div>

            <div className="surface-card p-5 lg:col-span-1">
               <h3 className="flex items-center gap-2 text-[0.95rem] font-bold text-ink-900"><FiActivity size={16} className="text-brand-500" /> Progress</h3>
               <div className="mt-3 space-y-3">
                  <div>
                     <div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold text-ink-700">Overall completion</span><span className="font-bold text-ink-900">{project.progress || 0}%</span></div>
                     <ProgressBar value={Number(project.progress || 0)} gradient />
                  </div>
                  <div>
                     <div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold text-ink-700">Planned vs actual</span><span className="text-ink-500">Plan {progress?.plannedProgress ?? dash?.plannedProgress ?? "—"}% · Actual {progress?.overallProgress ?? project.progress ?? 0}%</span></div>
                     <ProgressBar value={Number(progress?.plannedProgress ?? dash?.plannedProgress ?? 0)} color="#7DBCCD" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                     <MiniStat label="Planned" value={`${progress?.plannedProgress ?? dash?.plannedProgress ?? 0}%`} />
                     <MiniStat label="Actual" value={`${progress?.overallProgress ?? project.progress ?? 0}%`} />
                     <MiniStat label="Variance" value={`${progress?.variance ?? dash?.scheduleVariance ?? 0}%`} />
                  </div>
               </div>
               <h4 className="mt-4 flex items-center gap-2 text-sm font-bold text-ink-900"><FiCalendar size={14} className="text-brand-500" /> Milestones</h4>
               <div className="mt-2 space-y-2">
                  {milestones.length === 0 && <p className="py-3 text-center text-xs text-ink-400">No phased activities yet.</p>}
                  {milestones.slice(0, 5).map((m) => (
                     <div key={m.phase}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                           <span className="font-semibold text-ink-700">{m.phase} <span className="font-normal text-ink-400">· {m.count} tasks</span></span>
                           <span className="font-bold text-ink-900">{m.pct}%</span>
                        </div>
                        <ProgressBar value={m.pct} gradient />
                     </div>
                  ))}
               </div>
            </div>

            <div className="surface-card p-5 lg:col-span-1">
               <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-[0.95rem] font-bold text-ink-900"><FiClock size={16} className="text-brand-500" /> Today&apos;s site activity</h3>
                  <ViewAllLink to="/site-supervisor" label="Reports" />
               </div>
               <div className="mt-3 space-y-2">
                  {todaysReports.length === 0 && <p className="py-4 text-center text-xs text-ink-400">No report filed for today yet.</p>}
                  {todaysReports.slice(0, 4).map((r) => (
                     <div key={r._id} className="rounded-xl border border-line p-3">
                        <div className="flex items-center justify-between gap-2">
                           <p className="truncate text-[0.8rem] font-semibold text-ink-900">{r.weather || "Site update"} · {r.site}</p>
                           <StatusBadge status={r.status} />
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-ink-500">{r.workPerformed}</p>
                     </div>
                  ))}
               </div>
               <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Filed today" value={todaysReports.length} />
                  <MiniStat label="Pending req." value={pendingRequests} />
                  <MiniStat label="Workforce" value={team.length} />
               </div>
            </div>
         </div>

         <TableShell>
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
               <h3 className="text-[0.92rem] font-bold text-ink-900">Timeline · phases & milestone dates</h3>
               <span className="badge badge-brand">{milestones.length} phases</span>
            </div>
            <TableWrap>
               <table className="data-table min-w-[640px]">
                  <thead><tr><th>Phase</th><th>Tasks</th><th>Start</th><th>Target</th><th className="text-center">State</th><th>Progress</th></tr></thead>
                  <tbody>
                     {milestones.map((m) => (
                        <tr key={m.phase}>
                           <td className="font-semibold text-ink-900">{m.phase}</td>
                           <td className="text-ink-500">{m.done}/{m.count}</td>
                           <td className="text-ink-500">{m.start || "—"}</td>
                           <td className="text-ink-500">{m.end || "—"}</td>
                           <td className="text-center"><StatusBadge status={m.pct >= 100 ? "completed" : m.pct > 0 ? "in_progress" : "not_started"} /></td>
                           <td><div className="w-32"><ProgressBar value={m.pct} gradient /></div></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </TableWrap>
            {milestones.length === 0 && <EmptyState title="No timeline yet" message="Phases appear once activities with dates are registered." />}
         </TableShell>
      </div>
   );
}

/* ================= Tasks ================= */

function TasksTab({ detail }) {
   const [q, setQ] = useState("");
   const [status, setStatus] = useState("all");
   const [sort, setSort] = useState("deadline");
   const [priority, setPriority] = useState("all");

   const rows = useMemo(() => {
      const query = q.trim().toLowerCase();
      const filtered = detail.activities.filter((a) => {
         const matchesQ = !query || `${a.name || a.title || ""} ${a.activityCode || ""} ${a.category || ""}`.toLowerCase().includes(query);
         const matchesS = status === "all" || a.status === status;
         const pri = priorityOf(a);
         const matchesP = priority === "all" || pri === priority;
         return matchesQ && matchesS && matchesP;
      });
      const by = {
         deadline: (a, b) => String(a.plannedEnd || "9999").localeCompare(String(b.plannedEnd || "9999")),
         progress: (a, b) => Number(b.actualPercentage || 0) - Number(a.actualPercentage || 0),
         name: (a, b) => String(a.name || a.title || "").localeCompare(String(b.name || b.title || "")),
      }[sort];
      return [...filtered].sort(by);
   }, [detail.activities, q, status, sort, priority]);

   const counts = useMemo(() => ({
      total: detail.activities.length,
      ongoing: detail.activities.filter((a) => a.status === "in_progress").length,
      delayed: detail.activities.filter((a) => a.status === "delayed").length,
      done: detail.activities.filter((a) => a.status === "completed").length,
   }), [detail.activities]);

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Site tasks" value={counts.total} icon={FiClipboard} tone="brand" hint="Work-breakdown lines" />
            <KpiCard label="Ongoing" value={counts.ongoing} icon={FiActivity} tone="mint" hint="In progress now" />
            <KpiCard label="Delayed" value={counts.delayed} icon={FiAlertTriangle} tone={counts.delayed ? "danger" : "neutral"} hint="Needs recovery" />
            <KpiCard label="Completed" value={counts.done} icon={FiCheckCircle} tone="sun" hint="Done tasks" />
         </div>

         <div className="surface-card flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
            <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks…" className="lg:max-w-xs" />
            <FilterSelect value={status} onChange={(e) => setStatus(e.target.value)} options={TASK_STATUSES} className="lg:w-48" />
            <FilterSelect
               value={priority} onChange={(e) => setPriority(e.target.value)}
               options={[{ value: "all", label: "All priorities" }, { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }]}
               className="lg:w-44"
            />
            <FilterSelect value={sort} onChange={(e) => setSort(e.target.value)} options={SORTS} className="lg:w-44" />
            <span className="badge badge-brand ml-auto">{rows.length} tasks</span>
         </div>

         <TableShell>
            <TableWrap>
               <table className="data-table min-w-[860px]">
                  <thead><tr><th>Task</th><th>Team</th><th className="text-center">Priority</th><th>Deadline</th><th>Progress</th><th className="text-center">Status</th></tr></thead>
                  <tbody>
                     {rows.map((a) => (
                        <tr key={a._id}>
                           <td>
                              <p className="font-semibold text-ink-900">{a.name || a.title}</p>
                              <p className="font-mono text-xs text-ink-400">{a.activityCode || "—"} · {a.category || "—"} · {a.plannedQuantity ?? "—"} {a.unit || ""}</p>
                           </td>
                           <td className="text-ink-500">{a.assignedTo?.name || a.responsible?.name || "Unassigned"}</td>
                           <td className="text-center"><PriorityBadge level={priorityOf(a)} /></td>
                           <td className="whitespace-nowrap text-ink-500">{a.plannedEnd ? new Date(a.plannedEnd).toLocaleDateString() : "—"}</td>
                           <td><div className="w-32"><ProgressBar value={Number(a.actualPercentage || 0)} gradient /></div><p className="mt-0.5 text-[0.68rem] text-ink-400">{a.actualPercentage || 0}% · {a.completedQuantity ?? 0}/{a.plannedQuantity ?? "—"}</p></td>
                           <td className="text-center"><StatusBadge status={a.status} /></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </TableWrap>
            {rows.length === 0 && <EmptyState icon={FiClipboard} title="No tasks match" message="Adjust search, status or priority filters." />}
         </TableShell>
      </div>
   );
}

function priorityOf(a) {
   const w = Number(a.weight || 0);
   if (w >= 7 || a.status === "delayed") return "high";
   if (w >= 4) return "medium";
   return "low";
}

function PriorityBadge({ level }) {
   const tone = level === "high" ? "badge-danger" : level === "medium" ? "badge-warning" : "badge-neutral";
   return <span className={`badge ${tone}`}>{level}</span>;
}

/* ================= Team & Materials ================= */

function TeamMaterialsTab({ project, detail }) {
   const [teamQ, setTeamQ] = useState("");
   const [matQ, setMatQ] = useState("");
   const attByEmp = useMemo(() => {
      const map = {};
      detail.attendance.forEach((a) => { map[idOf(a.employee)] = a.status; });
      return map;
   }, [detail.attendance]);

   const team = useMemo(() => {
      const q = teamQ.trim().toLowerCase();
      return detail.team.filter((e) => !q || `${e.name || ""} ${e.designation || ""} ${e.employeeId || ""}`.toLowerCase().includes(q));
   }, [detail.team, teamQ]);

   const materials = useMemo(() => {
      const q = matQ.trim().toLowerCase();
      return detail.materials.filter((m) => !q || `${m.materialName || ""} ${m.category || ""}`.toLowerCase().includes(q));
   }, [detail.materials, matQ]);

   const present = team.filter((e) => attByEmp[e._id] === "present").length;
   const lowStock = detail.materials.filter((m) => Number(m.currentStock || 0) <= Number(m.minimumStock || m.reorderLevel || 0));
   const pendingRequests = detail.requests.filter((r) => r.status === "pending");

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Team assigned" value={detail.team.length} icon={FiUsers} tone="brand" hint={project.name} />
            <KpiCard label="Present today" value={present} icon={FiUserCheck} tone="mint" hint={`${team.length} in view`} />
            <KpiCard label="Materials tracked" value={detail.materials.length} icon={FiPackage} tone="sun" hint={`${lowStock.length} low stock`} />
            <KpiCard label="Pending requests" value={pendingRequests.length} icon={FiTruck} tone={pendingRequests.length ? "amber" : "neutral"} hint="Awaiting store" />
         </div>

         <TableShell>
            <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
               <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-500"><FiUsers size={17} /></span>
                  <div>
                     <h3 className="text-[0.92rem] font-bold text-ink-900">Team · workforce</h3>
                     <p className="text-xs text-ink-500">{team.length} workers assigned · roles, attendance and status</p>
                  </div>
               </div>
               <SearchInput value={teamQ} onChange={(e) => setTeamQ(e.target.value)} placeholder="Search team…" className="sm:w-64" />
            </div>
            <TableWrap>
               <table className="data-table min-w-[680px]">
                  <thead><tr><th>Worker</th><th>Role</th><th className="text-center">Today</th><th className="text-center">Status</th></tr></thead>
                  <tbody>
                     {team.map((e) => (
                        <tr key={e._id}>
                           <td>
                              <span className="flex items-center gap-2.5">
                                 <Avatar name={e.name} />
                                 <span>
                                    <span className="block font-semibold text-ink-900">{e.name}</span>
                                    <span className="block font-mono text-xs text-ink-400">{e.employeeId || "—"} · {e.phone || "—"}</span>
                                 </span>
                              </span>
                           </td>
                           <td className="text-ink-500">{e.designation || "—"}</td>
                           <td className="text-center"><StatusBadge status={attByEmp[e._id] || "not_marked"} /></td>
                           <td className="text-center"><StatusBadge status={e.status || "active"} /></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </TableWrap>
            {team.length === 0 && <EmptyState icon={FiUsers} title="No team assigned" message="No workers are linked to this project yet." />}
         </TableShell>

         <TableShell>
            <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
               <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-500"><FiBox size={17} /></span>
                  <div>
                     <h3 className="text-[0.92rem] font-bold text-ink-900">Materials · stock & needs</h3>
                     <p className="text-xs text-ink-500">Required, available, used and pending · {lowStock.length} low-stock alerts</p>
                  </div>
               </div>
               <SearchInput value={matQ} onChange={(e) => setMatQ(e.target.value)} placeholder="Search materials…" className="sm:w-64" />
            </div>
            <TableWrap>
               <table className="data-table min-w-[720px]">
                  <thead><tr><th>Material</th><th className="text-right">Available</th><th className="text-right">Used</th><th className="text-right">Minimum</th><th className="text-center">Health</th></tr></thead>
                  <tbody>
                     {materials.map((m) => {
                        const min = Number(m.minimumStock || m.reorderLevel || 0);
                        const low = Number(m.currentStock || 0) <= min;
                        return (
                           <tr key={m._id}>
                              <td>
                                 <p className="font-semibold text-ink-900">{m.materialName}</p>
                                 <p className="text-xs text-ink-400">{m.category || "—"} · {m.unit || ""} · {money(m.unitPrice)}</p>
                              </td>
                              <td className="text-right font-mono font-bold">{m.currentStock ?? "—"}</td>
                              <td className="text-right font-mono">{m.issuedQuantity ?? "—"}</td>
                              <td className="text-right font-mono text-ink-500">{min}</td>
                              <td className="text-center"><span className={`badge ${low ? "badge-danger" : "badge-success"}`}>{low ? "Low stock" : "Healthy"}</span></td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </TableWrap>
            {materials.length === 0 && <EmptyState icon={FiPackage} title="No materials" message="No stock is registered for this project yet." />}
         </TableShell>

         {pendingRequests.length > 0 && (
            <TableShell>
               <div className="border-b border-line px-5 py-4">
                  <h3 className="text-[0.92rem] font-bold text-ink-900">Pending material requests</h3>
                  <p className="text-xs text-ink-500">Waiting on the store · {pendingRequests.length} open</p>
               </div>
               <TableWrap>
                  <table className="data-table min-w-[560px]">
                     <thead><tr><th>Request</th><th className="text-right">Qty</th><th className="text-center">Status</th></tr></thead>
                     <tbody>
                        {pendingRequests.map((r) => (
                           <tr key={r._id}>
                              <td className="font-semibold text-ink-900">{r.materialName || r.requestNo} <span className="font-mono text-xs text-ink-400">· {r.requestNo}</span></td>
                              <td className="text-right font-mono">{r.quantity} {r.unit || ""}</td>
                              <td className="text-center"><StatusBadge status={r.status} /></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
            </TableShell>
         )}
      </div>
   );
}

/* ================= Issues & Feed ================= */

function IssuesFeedTab({ detail }) {
   const flagged = useMemo(() => detail.reports.filter((r) =>
      r.status === "pending" || incidentText(r.safetyIncidents) || incidentText(r.issues) || incidentText(r.delays),
   ), [detail.reports]);

   const feed = useMemo(() => {
      const items = [
         ...detail.updates.map((u) => ({
            id: `u-${u._id}`, date: u.updateDate || u.createdAt, icon: FiActivity, tone: "brand",
            title: `${u.activity?.name || "Activity"} → ${u.newProgress ?? 0}%`,
            meta: `${u.updatedBy?.name || "Site team"} · ${u.status || "update"}`,
         })),
         ...detail.reports.map((r) => ({
            id: `r-${r._id}`, date: r.reportDate || r.createdAt, icon: FiClipboard, tone: "sun",
            title: `Daily report · ${r.site || "site"}`,
            meta: `${r.siteSupervisor?.name || "Supervisor"} · ${r.status}`,
         })),
         ...detail.issues.map((i) => ({
            id: `i-${i._id}`, date: i.createdAt, icon: FiPackage, tone: "mint",
            title: `Issued ${i.quantity || ""} ${i.unit || ""} ${i.materialName || ""}`.trim(),
            meta: `${i.request?.requestNo || "Store issue"}`,
         })),
      ];
      return items.sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))).slice(0, 12);
   }, [detail]);

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Flagged reports" value={flagged.length} icon={FiAlertTriangle} tone={flagged.length ? "danger" : "mint"} hint="Needs attention" />
            <KpiCard label="Pending review" value={detail.reports.filter((r) => r.status === "pending").length} icon={FiClock} tone="amber" hint="Site reports" />
            <KpiCard label="Pending updates" value={detail.updates.filter((u) => u.status === "pending").length} icon={FiActivity} tone="brand" hint="Progress approvals" />
            <KpiCard label="Feed events" value={feed.length} icon={FiFileText} tone="sun" hint="Recent activity" />
         </div>

         <TableShell>
            <div className="border-b border-line px-5 py-4">
               <h3 className="text-[0.92rem] font-bold text-ink-900">Issues · open problems & site reports</h3>
               <p className="text-xs text-ink-500">Priority, responsible person and resolution status</p>
            </div>
            <TableWrap>
               <table className="data-table min-w-[760px]">
                  <thead><tr><th>Issue</th><th className="text-center">Priority</th><th>Responsible</th><th>Date</th><th className="text-center">Resolution</th></tr></thead>
                  <tbody>
                     {flagged.map((r) => (
                        <tr key={r._id}>
                           <td>
                              <p className="font-semibold text-ink-900">{[r.safetyIncidents, r.issues, r.delays].filter(incidentText)[0] || `Report pending review · ${r.site}`}</p>
                              <p className="text-xs text-ink-400">{r.site} · {dayKey(r.reportDate)}</p>
                           </td>
                           <td className="text-center"><PriorityBadge level={incidentText(r.safetyIncidents) ? "high" : incidentText(r.issues) ? "medium" : "low"} /></td>
                           <td className="text-ink-500">{r.siteSupervisor?.name || "Site supervisor"}</td>
                           <td className="whitespace-nowrap text-ink-500">{dayKey(r.reportDate)}</td>
                           <td className="text-center"><StatusBadge status={r.status} /></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </TableWrap>
            {flagged.length === 0 && <EmptyState icon={FiCheckCircle} title="No open issues" message="No incidents, delays or pending reports right now." />}
         </TableShell>

         <div className="surface-card p-5">
            <div className="flex items-center justify-between">
               <h3 className="text-[0.95rem] font-bold text-ink-900">Recent updates · activity feed</h3>
               <span className="badge badge-brand">{feed.length} events</span>
            </div>
            <div className="mt-3 space-y-1">
               {feed.length === 0 && <p className="py-6 text-center text-sm text-ink-400">No recent activity yet.</p>}
               {feed.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-canvas">
                     <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${f.tone === "brand" ? "bg-brand-50 text-brand-500" : f.tone === "mint" ? "bg-mint-50 text-mint-600" : "bg-sun-50 text-[#b08a1f]"}`}>
                        <f.icon size={15} />
                     </span>
                     <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.82rem] font-semibold text-ink-900">{f.title}</p>
                        <p className="truncate text-[0.72rem] text-ink-500">{f.meta}</p>
                     </div>
                     <span className="shrink-0 text-[0.7rem] text-ink-400">{f.date ? dayKey(f.date) : ""}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}

function incidentText(v) {
   return Boolean(v && String(v).trim()) && !["none", "no incidents", "n/a", "-"].includes(String(v).trim().toLowerCase());
}

/* ================= Documents ================= */

function DocumentsTab({ project, detail }) {
   const [q, setQ] = useState("");
   const rows = useMemo(() => {
      const query = q.trim().toLowerCase();
      return detail.documents.filter((d) => !query || `${d.name || ""} ${d.category || ""}`.toLowerCase().includes(query));
   }, [detail.documents, q]);

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Documents" value={detail.documents.length} icon={FiFolder} tone="brand" hint={project.name} />
            <KpiCard label="Drawings" value={detail.documents.filter((d) => /drawing/i.test(d.category || "")).length} icon={FiFileText} tone="mint" hint="Design files" />
            <KpiCard label="Reports" value={detail.reports.length} icon={FiClipboard} tone="sun" hint="Site reports" />
         </div>

         <TableShell>
            <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
               <div>
                  <h3 className="text-[0.92rem] font-bold text-ink-900">Documents · drawings, reports & attachments</h3>
                  <p className="text-xs text-ink-500">{rows.length} files linked to this project</p>
               </div>
               <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents…" className="sm:w-64" />
            </div>
            <TableWrap>
               <table className="data-table min-w-[620px]">
                  <thead><tr><th>Document</th><th>Category</th><th>Uploaded by</th><th className="text-right">File</th></tr></thead>
                  <tbody>
                     {rows.map((d) => (
                        <tr key={d._id}>
                           <td>
                              <span className="flex items-center gap-2.5">
                                 <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500"><FiFileText size={15} /></span>
                                 <span className="font-semibold text-ink-900">{d.name}</span>
                              </span>
                           </td>
                           <td><StatusBadge status={d.category || "general"} /></td>
                           <td className="text-ink-500">{d.uploadedBy?.name || "—"}</td>
                           <td className="text-right">
                              {d.url ? <a href={d.url} className="font-semibold text-brand-500 hover:underline">Open</a> : <span className="text-ink-400">—</span>}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </TableWrap>
            {rows.length === 0 && <EmptyState icon={FiFolder} title="No documents" message="Drawings and reports linked to this project will appear here." />}
         </TableShell>

         <div className="surface-card p-5">
            <div className="flex items-center justify-between">
               <h3 className="text-[0.95rem] font-bold text-ink-900">Filing a site report?</h3>
               <Link to="/site-supervisor" className="btn btn-secondary btn-sm">Open daily reports</Link>
            </div>
            <p className="mt-1 text-sm text-ink-500">Photos and documents attached to daily reports are stored with each report and listed here once linked to the project.</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400"><FiMapPin size={12} /> {project.location || "Site location"} · {project.projectCode}</p>
         </div>
      </div>
   );
}

/* ================= shared ================= */

function OverviewRow({ label, value, mono = false }) {
   return (
      <div className="flex items-center justify-between gap-3">
         <span className="shrink-0 text-ink-500">{label}</span>
         <span className={`truncate text-right font-medium text-ink-900 ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
      </div>
   );
}

function MiniStat({ label, value }) {
   return (
      <div className="rounded-xl border border-line bg-canvas/60 px-2 py-2">
         <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
         <p className="mt-0.5 font-display text-sm font-extrabold text-ink-900">{value}</p>
      </div>
   );
}

function buildMilestones(activities) {
   const groups = new Map();
   activities.forEach((a) => {
      const phase = a.phase || a.category || "General";
      if (!groups.has(phase)) groups.set(phase, []);
      groups.get(phase).push(a);
   });
   return [...groups.entries()].map(([phase, list]) => {
      const done = list.filter((a) => a.status === "completed").length;
      const pct = list.length ? Math.round(list.reduce((s, a) => s + Number(a.actualPercentage || 0), 0) / list.length) : 0;
      const starts = list.map((a) => a.plannedStart).filter(Boolean).sort();
      const ends = list.map((a) => a.plannedEnd).filter(Boolean).sort();
      return {
         phase, count: list.length, done, pct,
         start: starts.length ? new Date(starts[0]).toLocaleDateString() : "",
         end: ends.length ? new Date(ends[ends.length - 1]).toLocaleDateString() : "",
      };
   }).sort((a, b) => String(a.start).localeCompare(String(b.start)));
}
