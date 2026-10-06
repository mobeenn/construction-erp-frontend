import { useCallback, useEffect, useMemo, useState } from "react";
import {
   FiAlertTriangle,
   FiCalendar,
   FiCheck,
   FiClipboard,
   FiDownload,
   FiEye,
   FiEyeOff,
   FiFileText,
   FiPackage,
   FiPaperclip,
   FiPlus,
   FiRefreshCw,
   FiShield,
   FiTrash2,
   FiTruck,
   FiUsers,
   FiX,
} from "react-icons/fi";
import { useAuth } from "../../auth/AuthContext";
import { getActivities } from "../../services/activityService";
import { getInventory } from "../../services/inventoryService";
import { getProjects } from "../../services/projectService";
import {
   approveDailyReport,
   createDailyReport,
   downloadDailyReportAttachment,
   getDailyReports,
   rejectDailyReport,
} from "../../services/dailyReportService";
import { useToast } from "../../components/ui/ToastContext";
import { BarChart, DonutChart } from "../../components/charts/Charts";
import { ChartCard, KpiCard } from "../../components/dashboard/widgets";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput, FilterSelect } from "../../components/ui/Controls";
import { EmptyState, TableSkeleton } from "../../components/ui/States";
import { Avatar } from "../../components/ui/TableShell";
import StatusBadge from "../../components/ui/StatusBadge";

const today = () => {
   const date = new Date();
   const offset = date.getTimezoneOffset();
   return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const emptyForm = () => ({
   project: "",
   site: "",
   reportDate: today(),
   weather: "",
   workPerformed: "",
   manpower: [{ trade: "", count: "" }],
   equipment: [{ name: "", quantity: "", hours: "" }],
   activities: [],
   materialConsumed: [{ inventory: "", quantity: "" }],
   materialReceived: [{ inventory: "", quantity: "" }],
   safetyIncidents: "",
   issues: "",
   delays: "",
   instructions: "",
   remarks: "",
});

const readList = (response) => response.data?.data || [];
const idOf = (value) => String(value?._id || value || "");
const hasIncident = (value) => Boolean(value?.trim()) && !["none", "no incidents", "n/a"].includes(value.trim().toLowerCase());
const dayKey = (value) => String(value || "").slice(0, 10);

export default function DailyReportsPage() {
   const { user, can } = useAuth();
   const toast = useToast();
   const isSupervisor = user?.role === "site_supervisor";
   const canViewReports = can("progress", "view");
   const canCreateReport = can("progress", "create");
   const canApproveReports = can("progress", "approve");
   const canRejectReports = can("progress", "reject");
   const [reports, setReports] = useState([]);
   const [visibleReports, setVisibleReports] = useState([]);
   const [projects, setProjects] = useState([]);
   const [inventory, setInventory] = useState([]);
   const [activityCatalog, setActivityCatalog] = useState([]);
   const [delayedActivities, setDelayedActivities] = useState([]);
   const [form, setForm] = useState(emptyForm);
   const [files, setFiles] = useState([]);
   const [statusFilter, setStatusFilter] = useState("all");
   const [search, setSearch] = useState("");
   const [showForm, setShowForm] = useState(false);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState("");

   const loadPage = useCallback(async () => {
      const [reportsRes, projectsRes, inventoryRes, delayedRes, activitiesRes] = await Promise.all([
         getDailyReports(),
         getProjects(),
         getInventory(),
         getActivities("?delayed=true"),
         getActivities(),
      ]);
      const allReports = readList(reportsRes);
      const allProjects = readList(projectsRes);
      const status = statusFilter === "all" ? "" : statusFilter;
      return {
         allReports,
         visibleReports: status ? allReports.filter((report) => report.status === status) : allReports,
         projects: isSupervisor
            ? allProjects.filter((project) =>
               [project.siteSupervisor, project.supervisor]
                  .filter(Boolean)
                  .some((assigned) => idOf(assigned) === idOf(user)))
            : allProjects,
         inventory: readList(inventoryRes),
         delayedActivities: readList(delayedRes),
         activityCatalog: readList(activitiesRes),
      };
   }, [isSupervisor, statusFilter, user]);

   const applyPage = useCallback((data) => {
      setError("");
      setReports(data.allReports);
      setVisibleReports(data.visibleReports);
      setProjects(data.projects);
      setInventory(data.inventory);
      setDelayedActivities(data.delayedActivities);
      setActivityCatalog(data.activityCatalog);
   }, []);

   const refresh = useCallback(async () => {
      try {
         applyPage(await loadPage());
      } catch (loadError) {
         setError(loadError.response?.data?.message || "Unable to load daily reports.");
      }
   }, [applyPage, loadPage]);

   useEffect(() => {
      if (!canViewReports) return undefined;
      let active = true;
      setLoading(true);
      loadPage()
         .then((data) => {
            if (active) applyPage(data);
         })
         .catch((loadError) => {
            if (active) setError(loadError.response?.data?.message || "Unable to load daily reports.");
         })
         .finally(() => {
            if (active) setLoading(false);
         });
      return () => {
         active = false;
      };
   }, [applyPage, canViewReports, loadPage]);

   const projectActivities = useMemo(
      () => activityCatalog.filter((activity) => idOf(activity.project) === form.project),
      [activityCatalog, form.project],
   );
   const projectInventory = useMemo(
      () => inventory.filter((item) => idOf(item.project) === form.project),
      [form.project, inventory],
   );
   const activityById = useMemo(
      () => Object.fromEntries(activityCatalog.map((activity) => [activity._id, activity])),
      [activityCatalog],
   );
   const inventoryById = useMemo(
      () => Object.fromEntries(inventory.map((item) => [item._id, item])),
      [inventory],
   );

   const metrics = useMemo(() => {
      const todaysReports = reports.filter((report) => dayKey(report.reportDate) === today());
      return {
         reports: todaysReports.length,
         manpower: todaysReports.reduce((sum, report) =>
            sum + (report.manpower || []).reduce((people, row) => people + Number(row.count || 0), 0), 0),
         materials: todaysReports.reduce((sum, report) => sum + (report.materialConsumed || []).length, 0),
         incidents: todaysReports.filter((report) => hasIncident(report.safetyIncidents)).length,
         issues: todaysReports.filter((report) => hasIncident(report.issues)).length,
      };
   }, [reports]);

   const weekTrend = useMemo(() => {
      const days = Array.from({ length: 7 }, (_, i) => {
         const d = new Date();
         d.setDate(d.getDate() - (6 - i));
         return d.toISOString().slice(0, 10);
      });
      return {
         labels: days.map((d) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" })),
         counts: days.map((d) => reports.filter((r) => dayKey(r.reportDate) === d).length),
         crew: days.map((d) => reports
            .filter((r) => dayKey(r.reportDate) === d)
            .reduce((s, r) => s + (r.manpower || []).reduce((p, row) => p + Number(row.count || 0), 0), 0)),
      };
   }, [reports]);

   const statusMix = useMemo(() => {
      const count = (s) => reports.filter((r) => r.status === s).length;
      return [
         { name: "Pending", value: count("pending"), color: "#D9A441" },
         { name: "Approved", value: count("approved"), color: "#57C785" },
         { name: "Rejected", value: count("rejected"), color: "#E05252" },
      ].filter((s) => s.value > 0);
   }, [reports]);

   const filteredReports = useMemo(() => {
      const q = search.trim().toLowerCase();
      if (!q) return visibleReports;
      return visibleReports.filter((r) =>
         `${r.project?.name || ""} ${r.site || ""} ${r.workPerformed || ""} ${r.siteSupervisor?.name || ""}`.toLowerCase().includes(q),
      );
   }, [visibleReports, search]);

   const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }));
   const setRow = (name, index, field, value) => setForm((current) => ({
      ...current,
      [name]: current[name].map((row, rowIndex) =>
         rowIndex === index ? { ...row, [field]: value } : row),
   }));
   const addRow = (name, template) => setForm((current) => ({
      ...current,
      [name]: [...current[name], { ...template }],
   }));
   const removeRow = (name, index) => setForm((current) => ({
      ...current,
      [name]: current[name].filter((_, rowIndex) => rowIndex !== index),
   }));

   const resetForm = () => {
      setForm(emptyForm());
      setFiles([]);
      setShowForm(false);
   };

   const submitReport = async (event) => {
      event.preventDefault();
      setSaving(true);
      setError("");
      try {
         const payload = {
            ...form,
            manpower: form.manpower
               .filter((row) => row.trade.trim() && row.count !== "")
               .map((row) => ({ trade: row.trade.trim(), count: Number(row.count) })),
            equipment: form.equipment
               .filter((row) => row.name.trim() && row.quantity !== "")
               .map((row) => ({
                  name: row.name.trim(),
                  quantity: Number(row.quantity),
                  ...(row.hours !== "" ? { hours: Number(row.hours) } : {}),
               })),
            activities: form.activities
               .filter((row) => row.activity)
               .map((row) => ({
                  activity: row.activity,
                  ...(row.progress !== "" ? { progress: Number(row.progress) } : {}),
                  ...(row.quantityCompleted !== "" ? { quantityCompleted: Number(row.quantityCompleted) } : {}),
                  ...(row.status ? { status: row.status } : {}),
                  remarks: row.remarks || "",
               })),
            materialConsumed: form.materialConsumed
               .filter((row) => row.inventory && row.quantity !== "")
               .map((row) => ({ inventory: row.inventory, quantity: Number(row.quantity) })),
            materialReceived: form.materialReceived
               .filter((row) => row.inventory && row.quantity !== "")
               .map((row) => ({ inventory: row.inventory, quantity: Number(row.quantity) })),
         };
         await createDailyReport(payload, files);
         toast.success("Daily report submitted for review.");
         resetForm();
         applyPage(await loadPage());
      } catch (submitError) {
         setError(submitError.response?.data?.message || "Unable to submit the report.");
      } finally {
         setSaving(false);
      }
   };

   const reviewReport = async (report, action) => {
      setError("");
      try {
         if (action === "approve") await approveDailyReport(report._id);
         else await rejectDailyReport(report._id);
         toast.success(action === "approve" ? "Report approved." : "Report rejected.");
         applyPage(await loadPage());
      } catch (reviewError) {
         setError(reviewError.response?.data?.message || `Unable to ${action} this report.`);
      }
   };

   const selectedProject = projects.find((project) => project._id === form.project);

   if (!canViewReports) {
      return (
         <div className="surface-card p-8 text-center">
            <h1 className="text-lg font-bold text-ink-900">Daily reports are restricted</h1>
            <p className="mt-2 text-sm text-ink-500">Your role does not have permission to view site daily reports.</p>
         </div>
      );
   }

   return (
      <div className="space-y-5">
         <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
               <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Field operations</p>
               <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Site daily reports</h1>
               <p className="mt-1 text-sm text-slate-500">Daily progress, workforce, materials and site conditions.</p>
            </div>
            <div className="flex flex-wrap gap-2">
               <Button variant="secondary" icon={FiRefreshCw} onClick={refresh}>Refresh</Button>
               {canCreateReport && (
                  <Button variant="primary" icon={FiPlus} onClick={() => setShowForm((visible) => !visible)}>
                     {showForm ? "Close report form" : "New daily report"}
                  </Button>
               )}
            </div>
         </header>

         {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

         <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="Reports today" value={metrics.reports} icon={FiClipboard} tone="brand" hint="site submissions" />
            <KpiCard label="Manpower today" value={metrics.manpower} icon={FiUsers} tone="mint" hint="people reported" />
            <KpiCard label="Material lines" value={metrics.materials} icon={FiPackage} tone="sun" hint="consumed today" />
            <KpiCard label="Delayed activities" value={delayedActivities.length} icon={FiAlertTriangle} tone="amber" hint="across projects" />
            <KpiCard label="Safety incidents" value={metrics.incidents} icon={FiShield} tone={metrics.incidents > 0 ? "danger" : "neutral"} hint="reported today" />
            <KpiCard label="Site issues" value={metrics.issues} icon={FiFileText} tone={metrics.issues > 0 ? "amber" : "neutral"} hint="reported today" />
         </div>

         <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="Week in the field" subtitle="Reports submitted per day" icon={FiCalendar} className="lg:col-span-2">
               <BarChart
                  labels={weekTrend.labels}
                  series={[{ name: "Reports", data: weekTrend.counts, color: "#2A7B9B" }]}
                  valueFormat={(v) => String(Math.round(v))}
                  height={220}
               />
            </ChartCard>
            <ChartCard title="Review pipeline" subtitle="Reports by status" icon={FiClipboard}>
               {statusMix.length ? (
                  <DonutChart data={statusMix} size={150} centerLabel="Reports" valueFormat={(v) => String(v)} />
               ) : (
                  <EmptyState title="No reports yet" message="Submitted reports will appear here by status." />
               )}
            </ChartCard>
         </div>

         {showForm && canCreateReport && (
            <form onSubmit={submitReport} className="space-y-4">
               <Panel title="1 · Site information" subtitle="Where and when this work happened.">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                     {field("Project *", (
                        <select required value={form.project} onChange={(event) => {
                           const projectId = event.target.value;
                           setForm((current) => ({
                              ...current,
                              project: projectId,
                              site: projects.find((project) => project._id === projectId)?.location || "",
                              activities: [],
                           }));
                        }} className="input">
                           <option value="">Select project</option>
                           {projects.map((project) => <option key={project._id} value={project._id}>{project.projectCode} · {project.name}</option>)}
                        </select>
                     ))}
                     {field("Site / location *", <input required value={form.site} onChange={(event) => setField("site", event.target.value)} placeholder="Site location" className="input" />)}
                     {field("Report date *", <input required type="date" value={form.reportDate} onChange={(event) => setField("reportDate", event.target.value)} className="input" />)}
                     {field("Weather *", (
                        <select required value={form.weather} onChange={(event) => setField("weather", event.target.value)} className="input">
                           <option value="">Select weather</option>
                           {["Clear", "Cloudy", "Rain", "Windy", "Hot", "Cold", "Other"].map((weather) => <option key={weather}>{weather}</option>)}
                        </select>
                     ))}
                  </div>
                  <div className="mt-3">
                     {field("Work performed *", <textarea required rows="3" value={form.workPerformed} onChange={(event) => setField("workPerformed", event.target.value)} placeholder="Summarize the work completed on site today" className="input" />)}
                  </div>
               </Panel>

               <Panel
                  title="2 · Activities and progress"
                  subtitle={form.project ? `${projectActivities.length} activities registered for this project` : "Select a project to link activities."}
                  action={<button type="button" onClick={() => addRow("activities", { activity: "", progress: "", quantityCompleted: "", remarks: "" })} className="btn btn-secondary btn-sm">＋ Add row</button>}
               >
                  <div className="space-y-2">
                     {!form.activities.length && <p className="py-4 text-center text-sm text-slate-500">No activity lines yet. Add the work fronts completed today.</p>}
                     {form.activities.map((row, index) => (
                        <div key={`activity-${index}`} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-2 lg:grid-cols-6">
                           <select aria-label="Project activity" value={row.activity} onChange={(event) => setRow("activities", index, "activity", event.target.value)} className="input lg:col-span-2">
                              <option value="">Select activity</option>
                              {projectActivities.map((activity) => <option key={activity._id} value={activity._id}>{activity.title || activity.name}</option>)}
                           </select>
                           <input aria-label="Activity progress percent" type="number" min="0" max="100" placeholder="Progress %" value={row.progress} onChange={(event) => setRow("activities", index, "progress", event.target.value)} className="input" />
                           <input aria-label="Completed quantity" type="number" min="0" step="any" placeholder="Qty completed" value={row.quantityCompleted} onChange={(event) => setRow("activities", index, "quantityCompleted", event.target.value)} className="input" />
                           <select aria-label="Activity status" value={row.status || ""} onChange={(event) => setRow("activities", index, "status", event.target.value)} className="input">
                              <option value="">Keep status</option>
                              <option value="in_progress">In progress</option>
                              <option value="delayed">Delayed</option>
                              <option value="on_hold">On hold</option>
                              <option value="completed">Completed</option>
                           </select>
                           <div className="flex items-center justify-end">
                              <button type="button" aria-label="Remove activity row" onClick={() => removeRow("activities", index)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-700"><FiTrash2 size={15} /></button>
                           </div>
                           <input aria-label="Activity remarks" placeholder="Activity remarks" value={row.remarks} onChange={(event) => setRow("activities", index, "remarks", event.target.value)} className="input sm:col-span-2 lg:col-span-6" />
                        </div>
                     ))}
                  </div>
               </Panel>

               <div className="grid gap-4 lg:grid-cols-2">
                  <Panel
                     title="3 · Manpower"
                     subtitle="Trades and headcount on site."
                     action={<button type="button" onClick={() => addRow("manpower", { trade: "", count: "" })} className="btn btn-secondary btn-sm">＋ Add row</button>}
                  >
                     <div className="space-y-2">
                        {form.manpower.map((row, index) => (
                           <div key={`manpower-${index}`} className="grid grid-cols-[minmax(0,1fr)_6rem_auto] items-center gap-2">
                              <input aria-label="Manpower trade" placeholder="Trade / role (e.g. Mason)" value={row.trade} onChange={(event) => setRow("manpower", index, "trade", event.target.value)} className="input min-w-0" />
                              <input aria-label="Number of workers" type="number" min="0" step="1" placeholder="People" value={row.count} onChange={(event) => setRow("manpower", index, "count", event.target.value)} className="input min-w-0" />
                              <button type="button" aria-label="Remove manpower row" onClick={() => removeRow("manpower", index)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-700"><FiTrash2 size={15} /></button>
                           </div>
                        ))}
                     </div>
                  </Panel>
                  <Panel
                     title="4 · Equipment"
                     subtitle="Machines and hours used."
                     action={<button type="button" onClick={() => addRow("equipment", { name: "", quantity: "", hours: "" })} className="btn btn-secondary btn-sm">＋ Add row</button>}
                  >
                     <div className="space-y-2">
                        {form.equipment.map((row, index) => (
                           <div key={`equipment-${index}`} className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_5rem_5rem_auto]">
                              <input aria-label="Equipment name" placeholder="Equipment" value={row.name} onChange={(event) => setRow("equipment", index, "name", event.target.value)} className="input col-span-2 min-w-0 sm:col-span-1" />
                              <input aria-label="Equipment quantity" type="number" min="0" step="any" placeholder="Qty" value={row.quantity} onChange={(event) => setRow("equipment", index, "quantity", event.target.value)} className="input min-w-0" />
                              <input aria-label="Equipment hours used" type="number" min="0" step="any" placeholder="Hours" value={row.hours} onChange={(event) => setRow("equipment", index, "hours", event.target.value)} className="input min-w-0" />
                              <button type="button" aria-label="Remove equipment row" onClick={() => removeRow("equipment", index)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-700"><FiTrash2 size={15} /></button>
                           </div>
                        ))}
                     </div>
                  </Panel>
               </div>

               <div className="grid gap-4 lg:grid-cols-2">
                  <Panel
                     title="5 · Material consumed"
                     subtitle="Stock used from the site store."
                     action={<button type="button" onClick={() => addRow("materialConsumed", { inventory: "", quantity: "" })} className="btn btn-secondary btn-sm">＋ Add row</button>}
                  >
                     <MaterialRows name="materialConsumed" form={form} inventory={projectInventory} setRow={setRow} removeRow={removeRow} emptyHint="Project inventory items appear after selecting a project." />
                  </Panel>
                  <Panel
                     title="6 · Material received"
                     subtitle="Deliveries accepted on site."
                     action={<button type="button" onClick={() => addRow("materialReceived", { inventory: "", quantity: "" })} className="btn btn-secondary btn-sm">＋ Add row</button>}
                  >
                     <MaterialRows name="materialReceived" form={form} inventory={projectInventory} setRow={setRow} removeRow={removeRow} emptyHint="Project inventory items appear after selecting a project." />
                  </Panel>
               </div>

               <Panel title="7 · Safety, issues and notes" subtitle="Flags managers see first during review.">
                  <div className="grid gap-3 sm:grid-cols-2">
                     {field("Safety incidents", <textarea rows="2" value={form.safetyIncidents} onChange={(event) => setField("safetyIncidents", event.target.value)} placeholder="Describe incidents or enter “None”" className="input" />)}
                     {field("Site issues", <textarea rows="2" value={form.issues} onChange={(event) => setField("issues", event.target.value)} placeholder="Access, quality, or coordination issues" className="input" />)}
                     {field("Delays", <textarea rows="2" value={form.delays} onChange={(event) => setField("delays", event.target.value)} placeholder="Delayed activities and reasons" className="input" />)}
                     {field("Instructions", <textarea rows="2" value={form.instructions} onChange={(event) => setField("instructions", event.target.value)} placeholder="Instructions received or given" className="input" />)}
                     {field("Remarks", <textarea rows="2" value={form.remarks} onChange={(event) => setField("remarks", event.target.value)} placeholder="Additional notes" className="input" />)}
                     {field("Photos and documents (max 8 files, 5 MB each)", (
                        <span>
                           <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx" onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 8))} className="input file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:font-medium file:text-brand-700" />
                           {!!files.length && <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><FiPaperclip size={12} />{files.length} file(s) selected</span>}
                        </span>
                     ))}
                  </div>
                  <div className="mt-4 flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
                     <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                     <Button variant="primary" type="submit" loading={saving} disabled={!projects.length}>
                        {saving ? "Submitting…" : "Submit for review"}
                     </Button>
                  </div>
               </Panel>
               {selectedProject && <span className="sr-only">Selected project {selectedProject.name}</span>}
            </form>
         )}

         <Panel
            title="Daily site activity"
            subtitle={isSupervisor ? "Your submitted site reports" : "Review reports submitted by site supervisors"}
            action={
               <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search site or project…" className="sm:w-64" />
                  <FilterSelect
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                     options={[
                        { value: "all", label: "All statuses" },
                        { value: "pending", label: "Pending review" },
                        { value: "approved", label: "Approved" },
                        { value: "rejected", label: "Rejected" },
                     ]}
                     className="sm:w-48"
                  />
               </div>
            }
         >
            {loading ? <TableSkeleton rows={4} cols={3} /> : filteredReports.length ? (
               <div className="space-y-3">
                  {filteredReports.map((report) => (
                     <ReportCard
                        key={report._id}
                        report={report}
                        canApprove={canApproveReports}
                        canReject={canRejectReports}
                        onReview={reviewReport}
                        onDownload={async (file) => {
                           try {
                              const response = await downloadDailyReportAttachment(file.url);
                              const objectUrl = URL.createObjectURL(response.data);
                              const link = document.createElement("a");
                              link.href = objectUrl;
                              link.download = file.name;
                              link.click();
                              URL.revokeObjectURL(objectUrl);
                           } catch (downloadError) {
                              setError(downloadError.response?.data?.message || "Unable to download attachment.");
                           }
                        }}
                        activities={activityById}
                        inventory={inventoryById}
                     />
                  ))}
               </div>
            ) : (
               <EmptyState
                  icon={FiClipboard}
                  title={search ? "No matching reports" : "No daily reports"}
                  message={search ? "Try a different site, project or keyword." : "No daily reports match this filter. Supervisors can submit the first one above."}
               />
            )}
         </Panel>
      </div>
   );
}

const field = (label, control) => (
   <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {control}
   </label>
);

function Panel({ title, subtitle, children, action }) {
   return (
      <section className="surface-card overflow-hidden p-0">
         <header className="flex flex-col gap-2 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
               <h2 className="text-[0.95rem] font-bold text-ink-900">{title}</h2>
               {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
            </div>
            {action}
         </header>
         <div className="p-4 sm:p-5">{children}</div>
      </section>
   );
}

function MaterialRows({ name, form, inventory, setRow, removeRow, emptyHint }) {
   return (
      <div className="space-y-2">
         {form[name].map((row, index) => (
            <div key={`${name}-${index}`} className="grid grid-cols-[minmax(0,1fr)_6rem_auto] items-center gap-2">
               <select aria-label="Material item" value={row.inventory} onChange={(event) => setRow(name, index, "inventory", event.target.value)} className="input min-w-0">
                  <option value="">Select material</option>
                  {inventory.map((item) => <option key={item._id} value={item._id}>{item.materialName} · {item.currentStock} {item.unit} available</option>)}
               </select>
               <input aria-label="Material quantity" type="number" min="0" step="any" placeholder="Qty" value={row.quantity} onChange={(event) => setRow(name, index, "quantity", event.target.value)} className="input min-w-0" />
               <button type="button" aria-label="Remove material row" onClick={() => removeRow(name, index)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-700"><FiTrash2 size={15} /></button>
            </div>
         ))}
         {!inventory.length && <p className="py-2 text-center text-xs text-slate-500">{emptyHint}</p>}
      </div>
   );
}

function ReportCard({ report, canApprove, canReject, onReview, onDownload, activities, inventory }) {
   const [expanded, setExpanded] = useState(false);
   const [confirm, setConfirm] = useState(null);
   const manpower = (report.manpower || []).reduce((sum, row) => sum + Number(row.count || 0), 0);

   return (
      <article className="rounded-2xl border border-line bg-white p-4 transition hover:border-[#bfd7d0] hover:shadow-[var(--shadow-card)] sm:p-5">
         <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
               <Avatar name={report.project?.name || "Site"} />
               <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                     <h3 className="font-bold text-ink-900">{report.project?.name || "Project"}</h3>
                     <StatusBadge status={report.status} />
                     {hasIncident(report.safetyIncidents) && <span className="badge badge-danger">Safety incident</span>}
                     {hasIncident(report.issues) && !hasIncident(report.safetyIncidents) && <span className="badge badge-warning">Site issue</span>}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-500">
                     <span className="inline-flex items-center gap-1"><FiCalendar size={12} />{new Date(`${dayKey(report.reportDate)}T00:00:00`).toLocaleDateString()}</span>
                     <span>·</span><span>{report.weather || "—"}</span>
                     <span>·</span><span>{report.site}</span>
                     <span>·</span><span>{report.siteSupervisor?.name || "Site supervisor"}</span>
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-700">{report.workPerformed}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                     <Chip icon={FiUsers} text={`${manpower} workers`} />
                     <Chip icon={FiClipboard} text={`${(report.activities || []).length} activities`} />
                     <Chip icon={FiPackage} text={`${(report.materialConsumed || []).length} consumed`} />
                     <Chip icon={FiTruck} text={`${(report.materialReceived || []).length} received`} />
                  </div>
               </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
               <Button variant="secondary" size="sm" icon={expanded ? FiEyeOff : FiEye} onClick={() => setExpanded((value) => !value)}>
                  {expanded ? "Hide details" : "View details"}
               </Button>
               {report.status === "pending" && canApprove && (
                  <Button variant="primary" size="sm" icon={FiCheck} onClick={() => setConfirm("approve")}>Approve</Button>
               )}
               {report.status === "pending" && canReject && (
                  <Button variant="danger" size="sm" icon={FiX} onClick={() => setConfirm("reject")}>Reject</Button>
               )}
            </div>
         </div>

         {expanded && (
            <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 xl:grid-cols-3">
               <Detail title="Work performed" value={report.workPerformed} />
               <Detail title="Manpower" value={(report.manpower || []).map((row) => `${row.trade}: ${row.count}`).join(" · ") || "Not recorded"} />
               <Detail title="Equipment" value={(report.equipment || []).map((row) => `${row.name} × ${row.quantity}${row.hours ? ` (${row.hours}h)` : ""}`).join(" · ") || "Not recorded"} />
               <Detail title="Activities" value={(report.activities || []).map((row) => `${activities[row.activity]?.title || activities[row.activity]?.name || "Activity"}${row.progress !== undefined ? ` · ${row.progress}%` : ""}${row.remarks ? ` — ${row.remarks}` : ""}`).join("\n") || "None linked"} />
               <Detail title="Material consumed" value={materialList(report.materialConsumed, inventory)} />
               <Detail title="Material received" value={materialList(report.materialReceived, inventory)} />
               <Detail title="Safety incidents" value={report.safetyIncidents || "None reported"} alert={hasIncident(report.safetyIncidents)} />
               <Detail title="Issues and delays" value={[report.issues && `Issues: ${report.issues}`, report.delays && `Delays: ${report.delays}`].filter(Boolean).join("\n") || "None reported"} alert={hasIncident(report.issues) || hasIncident(report.delays)} />
               <Detail title="Instructions and remarks" value={[report.instructions, report.remarks].filter(Boolean).join("\n") || "None"} />
               {!!report.attachments?.length && (
                  <div className="rounded-xl bg-canvas/70 p-3 text-sm">
                     <h4 className="mb-1.5 flex items-center gap-1.5 font-semibold text-ink-700"><FiPaperclip size={13} />Photos and documents</h4>
                     <ul className="space-y-1">
                        {report.attachments.map((file) => (
                           <li key={file.url}>
                              <button type="button" className="inline-flex items-center gap-1.5 break-all text-left font-medium text-brand-600 hover:underline" onClick={() => onDownload(file)}>
                                 <FiDownload size={12} className="shrink-0" />{file.name}
                              </button>
                           </li>
                        ))}
                     </ul>
                  </div>
               )}
               {report.reviewNote && <Detail title="Review note" value={report.reviewNote} />}
            </div>
         )}

         <Modal
            isOpen={confirm !== null}
            onClose={() => setConfirm(null)}
            title={confirm === "approve" ? "Approve this report?" : "Reject this report?"}
            subtitle={confirm === "approve" ? "Approved updates can roll into activity progress and inventory." : "The supervisor will see this report as rejected."}
         >
            <p className="text-sm text-ink-700">
               {report.project?.name || "Project"} · {dayKey(report.reportDate)} · {manpower} workers reported.
            </p>
            <div className="mt-5 flex justify-end gap-2">
               <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
               <Button
                  variant={confirm === "approve" ? "primary" : "danger"}
                  onClick={() => { const action = confirm; setConfirm(null); onReview(report, action); }}
               >
                  {confirm === "approve" ? "Approve report" : "Reject report"}
               </Button>
            </div>
         </Modal>
      </article>
   );
}

function Chip({ icon: Icon, text }) {
   return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-2.5 py-1 text-xs font-medium text-ink-700">
         {Icon && <Icon size={12} className="text-ink-400" />}
         {text}
      </span>
   );
}

function materialList(lines = [], inventory) {
   return lines.map((line) => `${inventory[line.inventory]?.materialName || "Material"}: ${line.quantity} ${inventory[line.inventory]?.unit || ""}`.trim()).join("\n") || "None recorded";
}

function Detail({ title, value, alert = false }) {
   return (
      <div className={`min-w-0 rounded-xl p-3 text-sm ${alert ? "border border-[rgba(224,82,82,0.25)] bg-[rgba(224,82,82,0.05)]" : "bg-canvas/70"}`}>
         <h4 className="mb-1 font-semibold text-ink-700">{title}</h4>
         <p className="whitespace-pre-line break-words text-ink-600">{value}</p>
      </div>
   );
}
