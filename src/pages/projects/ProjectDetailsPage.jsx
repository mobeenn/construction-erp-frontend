import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
   FiActivity,
   FiAlertTriangle,
   FiArrowLeft,
   FiCalendar,
   FiCheck,
   FiCheckCircle,
   FiClipboard,
   FiClock,
   FiDollarSign,
   FiDownload,
   FiFileText,
   FiFolder,
   FiLayers,
   FiPackage,
   FiPieChart,
   FiPlus,
   FiRefreshCw,
   FiShoppingCart,
   FiTrash2,
   FiTrendingUp,
   FiTruck,
   FiUsers,
   FiX,
} from "react-icons/fi";

import { getProject, getProjectDashboard } from "../../services/projectService";
import { getActivities, createActivity, deleteActivity } from "../../services/activityService";
import { getProgressDashboard, getProgressUpdates, createProgressUpdate, approveProgressUpdate, rejectProgressUpdate } from "../../services/progressUpdateService";
import { getBudgetAnalysis, createBudget } from "../../services/budgetService";
import { getInterimPayments, createInterimPayment, updateInterimPaymentStatus } from "../../services/interimPaymentService";
import { getDocuments, createDocument, deleteDocument } from "../../services/documentService";
import { getInventory } from "../../services/inventoryService";
import { getPurchaseOrders } from "../../services/purchaseOrderService";
import { getGRNs } from "../../services/grnService";
import { getMaterialIssues } from "../../services/materialIssueService";
import { getExpenses } from "../../services/expenseService";
import { getEmployees } from "../../services/employeeService";
import { getDailyReports } from "../../services/dailyReportService";

import StatusBadge from "../../components/ui/StatusBadge";
import Tabs from "../../components/ui/Tabs";
import Button from "../../components/ui/Button";
import { SearchInput, FilterSelect } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap, Avatar, RowActions } from "../../components/ui/TableShell";
import { Hero, KpiCard, ChartCard, ViewAllLink } from "../../components/dashboard/widgets";
import { BarChart, DonutChart, ProgressBar, formatCurrency } from "../../components/charts/Charts";
import { useToast } from "../../components/ui/ToastContext";
import { formatMoney } from "../../utils/format";

const money = (v) => formatCurrency(v).replace("PKR ", "");
const idOf = (v) => String(v?._id || v || "");
const dayKey = (v) => String(v || "").slice(0, 10);

const TABS = [
   "Overview", "Activities", "Progress", "Budget", "Costs", "Materials",
   "Purchase Orders", "GRNs", "Material Issues", "Expenses",
   "Interim Payments", "Documents", "Reports",
];

const ACTIVITY_STATUSES = ["not_started", "in_progress", "delayed", "completed", "on_hold"];

/* ------------------------------------------------------------------ */
/* Shared primitives — same language as the Project workspace          */
/* ------------------------------------------------------------------ */

function SectionPanel({ title, subtitle, icon: Icon, action, children }) {
   return (
      <div className="surface-card overflow-hidden p-0">
         <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
               {Icon && (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500">
                     <Icon size={17} />
                  </span>
               )}
               <div>
                  <h3 className="text-[0.92rem] font-bold text-ink-900">{title}</h3>
                  {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
               </div>
            </div>
            {action}
         </div>
         <div className="p-4 sm:p-5">{children}</div>
      </div>
   );
}

function Field({ label, children }) {
   return (
      <div>
         <label className="field-label">{label}</label>
         {children}
      </div>
   );
}

function DetailRow({ label, value, mono = false }) {
   return (
      <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
         <span className="shrink-0 text-ink-500">{label}</span>
         <span className={`truncate text-right font-medium text-ink-900 ${mono ? "font-mono" : ""}`}>{value ?? "—"}</span>
      </div>
   );
}

function MiniStat({ label, value }) {
   return (
      <div className="rounded-xl border border-line bg-canvas/60 px-2 py-2 text-center">
         <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
         <p className="mt-0.5 font-display text-sm font-extrabold text-ink-900">{value}</p>
      </div>
   );
}

function DataTable({ headers, rows, renderRow, emptyTitle, emptyMessage, minWidth = "min-w-[720px]", alignRight = [] }) {
   return (
      <TableShell>
         <TableWrap>
            <table className={`data-table ${minWidth}`}>
               <thead>
                  <tr>
                     {headers.map((h) => (
                        <th key={h} className={alignRight.includes(h) ? "text-right" : ""}>{h}</th>
                     ))}
                  </tr>
               </thead>
               <tbody>{rows.map(renderRow)}</tbody>
            </table>
         </TableWrap>
         {rows.length === 0 && <EmptyState title={emptyTitle} message={emptyMessage} />}
      </TableShell>
   );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ProjectDetailsPage() {
   const { id } = useParams();
   const toast = useToast();
   const [tab, setTab] = useState("Overview");
   const [project, setProject] = useState(null);
   const [dash, setDash] = useState(null);
   const [loadError, setLoadError] = useState(false);

   const load = async () => {
      setLoadError(false);
      try {
         const p = await getProject(id);
         setProject(p.data.data);
         const d = await getProjectDashboard(id);
         setDash(d.data.data);
      } catch (err) {
         setLoadError(true);
         toast.error(err.response?.data?.message || "Could not load project.");
      }
   };

   useEffect(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [id]);

   if (!project) {
      if (loadError) {
         return (
            <div className="surface-card">
               <ErrorState message="We couldn't load this project." onRetry={load} />
            </div>
         );
      }
      return (
         <div className="space-y-4">
            <div className="skeleton h-44 rounded-3xl" />
            <div className="skeleton h-12 rounded-2xl" />
            <div className="skeleton h-80 rounded-3xl" />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <Hero
            eyebrow={`${project.projectCode} · ${project.client?.name || "No client"}`}
            title={project.name}
            subtitle={`${project.location || "No location"} · Managed by ${project.projectManager?.name || "—"} · Supervised by ${project.siteSupervisor?.name || "—"}`}
            actions={
               <>
                  <Link to="/projects" className="btn btn-secondary">
                     <FiArrowLeft size={16} />
                     All projects
                  </Link>
                  <span className="badge badge-neutral">Priority: {String(project.priority || "—").replaceAll("_", " ")}</span>
               </>
            }
         >
            <div className="flex items-center gap-4 rounded-2xl bg-[#0d222b]/12 p-4 backdrop-blur-sm">
               <div className="text-[#0d222b]">
                  <p className="font-display text-3xl font-extrabold leading-none">{project.progress || 0}%</p>
                  <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wide opacity-70">Complete</p>
               </div>
               <div className="w-28"><ProgressBar value={Number(project.progress || 0)} gradient /></div>
               <StatusBadge status={project.status} />
            </div>
         </Hero>

         <Tabs label="Project sections" value={tab} onChange={setTab} options={TABS.map((t) => ({ value: t, label: t }))} />

         <div key={`${id}-${tab}`} className="animate-fade-up">
            {tab === "Overview" && <Overview projectId={id} project={project} dash={dash} onRetry={load} />}
            {tab === "Activities" && <Activities projectId={id} />}
            {tab === "Progress" && <Progress projectId={id} />}
            {tab === "Budget" && <Budget projectId={id} />}
            {tab === "Costs" && <Costs dash={dash} />}
            {tab === "Materials" && (
               <Filtered
                  projectId={id} load={getInventory} title="Materials" subtitle="Stock allocated to this site."
                  searchPlaceholder="Search materials…" searchKeys={["materialName", "category"]}
                  headers={["Material", "Category", "Stock", "Unit", "Unit price"]}
                  kpis={(rows) => [
                     { label: "Materials", value: rows.length, icon: FiPackage, tone: "brand", hint: "Tracked items" },
                     { label: "Low stock", value: rows.filter((m) => Number(m.currentStock || 0) <= Number(m.minimumStock || m.reorderLevel || 0)).length, icon: FiAlertTriangle, tone: "amber", hint: "At or below minimum" },
                  ]}
                  renderRow={(r) => {
                     const min = Number(r.minimumStock || r.reorderLevel || 0);
                     const low = Number(r.currentStock || 0) <= min;
                     return (
                        <tr key={r._id}>
                           <td className="font-semibold text-ink-900">{r.materialName}</td>
                           <td className="text-ink-500">{r.category || "—"}</td>
                           <td className="text-right font-mono font-bold">{r.currentStock ?? "—"}</td>
                           <td className="text-ink-500">{r.unit || "—"}</td>
                           <td className="text-right font-mono">{money(r.unitPrice)}</td>
                           <td className="text-center"><span className={`badge ${low ? "badge-danger" : "badge-success"}`}>{low ? "Low" : "OK"}</span></td>
                        </tr>
                     );
                  }}
                  headerLabels={["Material", "Category", "Stock", "Unit", "Unit price", "Health"]}
               />
            )}
            {tab === "Purchase Orders" && (
               <Filtered
                  projectId={id} load={getPurchaseOrders} title="Purchase orders" subtitle="Procurement raised for this project."
                  searchPlaceholder="Search purchase orders…" searchKeys={["poNumber"]}
                  headers={["PO No", "Vendor", "Total", "Status"]}
                  kpis={(rows) => [
                     { label: "Purchase orders", value: rows.length, icon: FiShoppingCart, tone: "brand", hint: "All states" },
                     { label: "Order value", value: money(rows.reduce((s, r) => s + Number(r.grandTotal || 0), 0)), icon: FiDollarSign, tone: "mint", hint: "Committed spend" },
                  ]}
                  renderRow={(r) => (
                     <tr key={r._id}>
                        <td className="font-mono font-semibold text-ink-900">{r.poNumber}</td>
                        <td className="font-medium text-ink-900">{r.vendor?.companyName || "—"}</td>
                        <td className="text-right font-mono font-bold">{money(r.grandTotal)}</td>
                        <td><StatusBadge status={r.status} /></td>
                     </tr>
                  )}
               />
            )}
            {tab === "GRNs" && (
               <Filtered
                  projectId={id} load={getGRNs} title="Goods receipts" subtitle="Deliveries received against purchase orders."
                  searchPlaceholder="Search GRNs…" searchKeys={["grnNo"]}
                  headers={["GRN No", "PO", "Vendor", "Remarks", "Status"]}
                  kpis={(rows) => [
                     { label: "Receipts", value: rows.length, icon: FiTruck, tone: "brand", hint: "Deliveries logged" },
                  ]}
                  renderRow={(r) => (
                     <tr key={r._id}>
                        <td className="font-mono font-semibold text-ink-900">{r.grnNo}</td>
                        <td className="font-mono text-ink-500">{r.purchaseOrder?.poNumber || "—"}</td>
                        <td className="font-medium text-ink-900">{r.vendor?.companyName || "—"}</td>
                        <td className="max-w-[240px] truncate text-ink-500">{r.remarks || "—"}</td>
                        <td><StatusBadge status={r.status || "received"} /></td>
                     </tr>
                  )}
               />
            )}
            {tab === "Material Issues" && (
               <Filtered
                  projectId={id} load={getMaterialIssues} title="Material issues" subtitle="Stock issued from store to site."
                  searchPlaceholder="Search material issues…" searchKeys={["issueNo"]}
                  headers={["Issue No", "Request", "Issued by", "Date"]}
                  kpis={(rows) => [
                     { label: "Issues", value: rows.length, icon: FiClipboard, tone: "brand", hint: "Store movements" },
                  ]}
                  renderRow={(r) => (
                     <tr key={r._id}>
                        <td className="font-mono font-semibold text-ink-900">{r.issueNo}</td>
                        <td className="font-mono text-ink-500">{r.request?.requestNo || "—"}</td>
                        <td className="font-medium text-ink-900">{r.issuedBy?.name || "—"}</td>
                        <td className="text-ink-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                     </tr>
                  )}
               />
            )}
            {tab === "Expenses" && (
               <Filtered
                  projectId={id} load={getExpenses} title="Expenses" subtitle="Site costs booked to this project."
                  searchPlaceholder="Search expenses…" searchKeys={["expenseNo", "category"]}
                  headers={["No", "Category", "Amount", "Payment", "Status"]}
                  kpis={(rows) => [
                     { label: "Expense lines", value: rows.length, icon: FiDollarSign, tone: "brand", hint: "Booked costs" },
                     { label: "Total spend", value: money(rows.reduce((s, r) => s + Number(r.amount || 0), 0)), icon: FiTrendingUp, tone: "amber", hint: "This project" },
                  ]}
                  chart={(rows) => {
                     const map = new Map();
                     rows.forEach((e) => map.set(e.category || "other", (map.get(e.category || "other") || 0) + Number(e.amount || 0)));
                     const data = [...map.entries()].map(([name, value]) => ({ name, value }));
                     if (!data.length) return null;
                     return (
                        <ChartCard title="Spend by category" subtitle="Where site money goes" icon={FiPieChart}>
                           <DonutChart data={data} size={150} centerLabel="Spend" valueFormat={(v) => money(v)} />
                        </ChartCard>
                     );
                  }}
                  renderRow={(r) => (
                     <tr key={r._id}>
                        <td className="font-mono font-semibold text-ink-900">{r.expenseNo}</td>
                        <td><StatusBadge status={r.category || "expense"} /></td>
                        <td className="text-right font-mono font-bold">{money(r.amount)}</td>
                        <td className="capitalize text-ink-500">{r.paymentMethod || "—"}</td>
                        <td><StatusBadge status={r.status || "approved"} /></td>
                     </tr>
                  )}
               />
            )}
            {tab === "Interim Payments" && <InterimPayments projectId={id} />}
            {tab === "Documents" && <Documents projectId={id} />}
            {tab === "Reports" && <ReportSummary project={project} dash={dash} />}
         </div>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/* Overview — header summary, progress, timeline, team, materials,     */
/* issues, recent updates                                              */
/* ------------------------------------------------------------------ */

function Overview({ projectId, project, dash, onRetry }) {
   const toast = useToast();
   const [extra, setExtra] = useState({ activities: [], team: [], materials: [], reports: [], updates: [] });
   const [loadingExtra, setLoadingExtra] = useState(true);

   useEffect(() => {
      let active = true;
      setLoadingExtra(true);
      (async () => {
         const out = { activities: [], team: [], materials: [], reports: [], updates: [] };
         const settle = async (fn, apply) => {
            try {
               const res = await fn();
               if (active) apply(res?.data?.data || []);
            } catch { /* section stays empty */ }
         };
         await Promise.all([
            settle(() => getActivities(`?project=${projectId}`), (v) => { out.activities = v; }),
            settle(() => getEmployees(1, 1000, ""), (v) => {
               const list = Array.isArray(v) ? v : [];
               out.team = list.filter((e) => idOf(e.assignedProject) === projectId);
            }),
            settle(() => getInventory(), (v) => { out.materials = v.filter((m) => idOf(m.project) === projectId); }),
            settle(() => getDailyReports(), (v) => { out.reports = v.filter((r) => idOf(r.project) === projectId); }),
            settle(() => import("../../services/progressUpdateService").then((m) => m.getProgressUpdates(projectId)), (v) => { out.updates = v; }),
         ]);
         if (active) {
            setExtra(out);
            setLoadingExtra(false);
         }
      })().catch((err) => {
         if (active) {
            toast.error(err.response?.data?.message || "Could not load overview extras.");
            setLoadingExtra(false);
         }
      });
      return () => { active = false; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [projectId]);

   const milestones = useMemo(() => buildMilestones(extra.activities), [extra.activities]);
   const lowStock = useMemo(
      () => extra.materials.filter((m) => Number(m.currentStock || 0) <= Number(m.minimumStock || m.reorderLevel || 0)),
      [extra.materials],
   );
   const openReports = useMemo(() => extra.reports.filter((r) => r.status === "pending"), [extra.reports]);
   const feed = useMemo(() => buildFeed(extra.updates, extra.reports), [extra.updates, extra.reports]);

   if (!dash) {
      return (
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
               {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}
            </div>
            <TableSkeleton rows={6} cols={2} />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Contract value" value={money(dash.contractValue)} icon={FiDollarSign} tone="brand" hint={`Budget ${money(dash.budget)}`} />
            <KpiCard label="Actual cost" value={money(dash.actualCost)} icon={FiTrendingUp} tone="amber" hint={`${dash.overallProgress || 0}% complete`} />
            <KpiCard label="Remaining" value={money(dash.remainingBudget)} icon={FiPieChart} tone="mint" hint={`Planned ${dash.plannedProgress || 0}%`} />
            <KpiCard label="Outstanding" value={money(dash.outstandingAmount)} icon={FiFileText} tone="sun" hint={`Billed ${money(dash.amountBilled)}`} />
         </div>

         <div className="grid gap-4 lg:grid-cols-2">
            <SectionPanel title="Project information" subtitle={`${project.projectCode} · ${project.client?.name || "No client"}`} icon={FiLayers}>
               <div className="divide-y divide-[#eef4f2]">
                  <DetailRow label="Location" value={project.location} />
                  <DetailRow label="Project manager" value={project.projectManager?.name} />
                  <DetailRow label="Site supervisor" value={project.siteSupervisor?.name} />
                  <DetailRow label="Start date" value={project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"} />
                  <DetailRow label="Expected completion" value={project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"} />
                  <DetailRow label="Actual completion" value={project.actualEndDate ? new Date(project.actualEndDate).toLocaleDateString() : "—"} />
                  <DetailRow label="Contract value" value={money(project.contractValue)} mono />
                  <DetailRow label="Approved budget" value={money(project.budget)} mono />
                  <DetailRow label="Priority" value={String(project.priority || "—").replaceAll("_", " ")} />
               </div>
               <div className="mt-2 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-sm text-ink-500">Project status</span>
                  <StatusBadge status={project.status} />
               </div>
               {project.description && <p className="mt-3 rounded-xl bg-canvas p-3 text-xs leading-relaxed text-ink-500">{project.description}</p>}
            </SectionPanel>

            <SectionPanel
               title="Progress & health"
               subtitle="Live cost, progress and billing."
               icon={FiActivity}
               action={<Button variant="secondary" size="sm" icon={FiRefreshCw} onClick={onRetry}>Refresh</Button>}
            >
               <div className="space-y-3">
                  <div>
                     <div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold text-ink-700">Overall completion</span><span className="font-bold text-ink-900">{dash.overallProgress || 0}%</span></div>
                     <ProgressBar value={Number(dash.overallProgress || 0)} gradient />
                  </div>
                  <div>
                     <div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold text-ink-700">Planned progress</span><span className="text-ink-500">{dash.plannedProgress || 0}% · variance {dash.scheduleVariance || 0}%</span></div>
                     <ProgressBar value={Number(dash.plannedProgress || 0)} color="#7DBCCD" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                     <MiniStat label="Actual cost" value={money(dash.actualCost)} />
                     <MiniStat label="Remaining" value={money(dash.remainingBudget)} />
                     <MiniStat label="Billed" value={money(dash.amountBilled)} />
                  </div>
                  <div className="divide-y divide-[#eef4f2] border-t border-line">
                     <DetailRow label="Material cost" value={money(dash.materialCost)} mono />
                     <DetailRow label="Labour cost" value={money(dash.labourCost)} mono />
                     <DetailRow label="Purchase cost" value={money(dash.purchaseCost)} mono />
                     <DetailRow label="Received / outstanding" value={`${money(dash.amountReceived)} / ${money(dash.outstandingAmount)}`} mono />
                  </div>
               </div>
            </SectionPanel>
         </div>

         <SectionPanel
            title="Timeline · phases & milestones"
            subtitle={loadingExtra ? "Loading phases…" : `${milestones.length} phases across this project`}
            icon={FiCalendar}
            action={<span className="badge badge-brand">{extra.activities.length} activities</span>}
         >
            {loadingExtra ? <TableSkeleton rows={4} cols={5} /> : (
               <DataTable
                  headers={["Phase", "Tasks", "Start", "Target", "State", "Progress"]}
                  rows={milestones}
                  emptyTitle="No timeline yet"
                  emptyMessage="Phases appear once activities with dates are registered."
                  minWidth="min-w-[680px]"
                  renderRow={(m) => (
                     <tr key={m.phase}>
                        <td className="font-semibold text-ink-900">{m.phase}</td>
                        <td className="text-ink-500">{m.done}/{m.count}</td>
                        <td className="whitespace-nowrap text-ink-500">{m.start || "—"}</td>
                        <td className="whitespace-nowrap text-ink-500">{m.end || "—"}</td>
                        <td><StatusBadge status={m.pct >= 100 ? "completed" : m.pct > 0 ? "in_progress" : "not_started"} /></td>
                        <td><div className="w-32"><ProgressBar value={m.pct} gradient /></div></td>
                     </tr>
                  )}
               />
            )}
         </SectionPanel>

         <div className="grid gap-4 lg:grid-cols-3">
            <SectionPanel
               title="Team · workforce"
               subtitle={loadingExtra ? "Loading team…" : `${extra.team.length} assigned workers`}
               icon={FiUsers}
               action={<ViewAllLink to="/employees" label="Directory" />}
            >
               {loadingExtra ? <TableSkeleton rows={3} cols={2} /> : extra.team.length === 0 ? (
                  <EmptyState title="No team linked" message="Workers assigned to this project will appear here." />
               ) : (
                  <div className="space-y-1">
                     {extra.team.slice(0, 5).map((e) => (
                        <div key={e._id} className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-canvas">
                           <Avatar name={e.name} size="sm" />
                           <div className="min-w-0 flex-1">
                              <p className="truncate text-[0.82rem] font-semibold text-ink-900">{e.name}</p>
                              <p className="truncate text-[0.72rem] text-ink-500">{e.designation || "—"}</p>
                           </div>
                           <StatusBadge status={e.status || "active"} />
                        </div>
                     ))}
                  </div>
               )}
            </SectionPanel>

            <SectionPanel
               title="Materials snapshot"
               subtitle={loadingExtra ? "Loading stock…" : `${lowStock.length} low-stock alerts`}
               icon={FiPackage}
               action={lowStock.length > 0 ? <span className="badge badge-danger">{lowStock.length} low</span> : <span className="badge badge-success">Healthy</span>}
            >
               {loadingExtra ? <TableSkeleton rows={3} cols={2} /> : extra.materials.length === 0 ? (
                  <EmptyState title="No materials" message="Stock allocated to this site will appear here." />
               ) : (
                  <div className="space-y-2">
                     {(lowStock.length ? lowStock : extra.materials).slice(0, 5).map((m) => (
                        <div key={m._id} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
                           <div className="min-w-0">
                              <p className="truncate text-[0.82rem] font-semibold text-ink-900">{m.materialName}</p>
                              <p className="text-[0.72rem] text-ink-500">Min {m.minimumStock ?? m.reorderLevel ?? 0} {m.unit || ""}</p>
                           </div>
                           <span className={`badge ${Number(m.currentStock || 0) <= Number(m.minimumStock || m.reorderLevel || 0) ? "badge-danger" : "badge-success"}`}>{m.currentStock ?? "—"} {m.unit || ""}</span>
                        </div>
                     ))}
                  </div>
               )}
            </SectionPanel>

            <SectionPanel
               title="Issues & recent updates"
               subtitle={loadingExtra ? "Loading activity…" : `${openReports.length} open reports · ${feed.length} recent events`}
               icon={FiAlertTriangle}
               action={<ViewAllLink to="/daily-reports" label="Site reports" />}
            >
               {loadingExtra ? <TableSkeleton rows={3} cols={2} /> : feed.length === 0 ? (
                  <EmptyState title="All quiet" message="Progress updates and site reports will stream in here." />
               ) : (
                  <div className="space-y-1">
                     {feed.slice(0, 5).map((f) => (
                        <div key={f.id} className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-canvas">
                           <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${f.tone === "brand" ? "bg-brand-50 text-brand-500" : "bg-sun-50 text-[#b08a1f]"}`}>
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
               )}
            </SectionPanel>
         </div>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/* Activities                                                          */
/* ------------------------------------------------------------------ */

function Activities({ projectId }) {
   const toast = useToast();
   const [rows, setRows] = useState([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [status, setStatus] = useState("all");
   const [delayedOnly, setDelayedOnly] = useState(false);
   const [search, setSearch] = useState("");
   const [form, setForm] = useState({
      name: "", wbsCode: "", category: "", unit: "", plannedQuantity: "",
      plannedStart: "", plannedEnd: "", status: "not_started",
      weight: "", plannedPercentage: "0", actualPercentage: "0",
   });

   const load = async () => {
      setLoading(true);
      try {
         const params = `?project=${projectId}${status !== "all" ? `&status=${status}` : ""}${delayedOnly ? "&delayed=true" : ""}`;
         const res = await getActivities(params);
         setRows(res.data.data || []);
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not load activities.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId, status, delayedOnly]);

   const filtered = useMemo(() => {
      return rows.filter((r) => `${r.name || r.title || ""} ${r.activityCode || ""} ${r.wbsCode || ""}`.toLowerCase().includes(search.toLowerCase()));
   }, [rows, search]);

   const statusMix = useMemo(() => {
      const data = ACTIVITY_STATUSES.filter((s) => s !== "all").map((s) => ({
         name: s.replaceAll("_", " "), value: rows.filter((r) => r.status === s).length,
      })).filter((d) => d.value > 0);
      return data;
   }, [rows]);

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createActivity({
            ...form, project: projectId,
            plannedQuantity: Number(form.plannedQuantity || 0),
            weight: Number(form.weight || 0),
            plannedPercentage: Number(form.plannedPercentage || 0),
            actualPercentage: Number(form.actualPercentage || 0),
         });
         toast.success("Activity created.");
         setForm({ name: "", wbsCode: "", category: "", unit: "", plannedQuantity: "", plannedStart: "", plannedEnd: "", status: "not_started", weight: "", plannedPercentage: "0", actualPercentage: "0" });
         load();
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not create activity.");
      } finally {
         setSaving(false);
      }
   };

   const remove = async (rowId) => {
      if (!window.confirm("Delete this activity?")) return;
      try {
         await deleteActivity(rowId);
         toast.success("Activity deleted.");
         load();
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not delete activity.");
      }
   };

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Activities" value={rows.length} icon={FiClipboard} tone="brand" hint={`${filtered.length} in view`} />
            <KpiCard label="Completed" value={rows.filter((r) => r.status === "completed").length} icon={FiCheckCircle} tone="mint" hint="Finished fronts" />
            <KpiCard label="In progress" value={rows.filter((r) => r.status === "in_progress").length} icon={FiActivity} tone="sun" hint="Active now" />
            <KpiCard label="Delayed" value={rows.filter((r) => r.status === "delayed").length} icon={FiAlertTriangle} tone="danger" hint="Needs recovery" />
         </div>

         <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
               <SectionPanel
                  title="Activity register"
                  subtitle={`${filtered.length} matching records`}
                  icon={FiClipboard}
                  action={<Button variant="secondary" size="sm" icon={FiRefreshCw} onClick={load}>Refresh</Button>}
               >
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                     <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search activities…" className="sm:max-w-xs" />
                     <FilterSelect
                        value={status} onChange={(e) => setStatus(e.target.value)}
                        options={[{ value: "all", label: "All statuses" }, ...ACTIVITY_STATUSES.filter((s) => s !== "all").map((s) => ({ value: s, label: s.replaceAll("_", " ") }))]}
                        className="sm:w-48"
                     />
                     <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink-700">
                        <input type="checkbox" checked={delayedOnly} onChange={(e) => setDelayedOnly(e.target.checked)} className="h-4 w-4 accent-[#2A7B9B]" />
                        Delayed only
                     </label>
                  </div>
                  {loading ? <TableSkeleton rows={6} cols={6} /> : (
                     <DataTable
                        headers={["Code", "Activity", "Planned", "Qty", "Progress", "Status", "Actions"]}
                        rows={filtered}
                        emptyTitle="No activities"
                        emptyMessage="Add the first work-breakdown activity below."
                        minWidth="min-w-[820px]"
                        renderRow={(r) => (
                           <tr key={r._id}>
                              <td><p className="font-mono font-semibold text-ink-900">{r.activityCode || "—"}</p><p className="font-mono text-xs text-ink-400">{r.wbsCode || "—"}</p></td>
                              <td><p className="font-semibold text-ink-900">{r.name || r.title}</p><p className="text-xs text-ink-400">{r.category || "—"} · {r.unit || "—"}</p></td>
                              <td className="whitespace-nowrap text-ink-500">{r.plannedStart || "—"} → {r.plannedEnd || "—"}</td>
                              <td className="text-right font-mono">{r.plannedQuantity ?? "—"}</td>
                              <td><div className="w-28"><ProgressBar value={Number(r.actualPercentage || 0)} gradient /></div></td>
                              <td><StatusBadge status={r.status} /></td>
                              <td>
                                 <RowActions>
                                    <button type="button" onClick={() => remove(r._id)} className="grid h-8 w-8 place-items-center rounded-xl text-[#c23b3b] transition hover:bg-[rgba(224,82,82,0.1)]" aria-label="Delete activity"><FiTrash2 size={14} /></button>
                                 </RowActions>
                              </td>
                           </tr>
                        )}
                     />
                  )}
               </SectionPanel>
            </div>
            <div className="space-y-4">
               <ChartCard title="Status mix" subtitle="Activities by state" icon={FiPieChart}>
                  {statusMix.length ? (
                     <DonutChart data={statusMix} size={150} centerLabel="Tasks" valueFormat={(v) => String(v)} />
                  ) : (
                     <EmptyState title="No data" message="Status breakdown appears with activities." />
                  )}
               </ChartCard>
               <SectionPanel title="Add activity" subtitle="New work-breakdown line." icon={FiPlus}>
                  <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                     <Field label="Activity name *"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></Field>
                     <Field label="WBS code"><input value={form.wbsCode} onChange={(e) => setForm({ ...form, wbsCode: e.target.value })} className="input font-mono" /></Field>
                     <Field label="Category"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" /></Field>
                     <Field label="Unit"><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input" /></Field>
                     <Field label="Planned qty"><input type="number" value={form.plannedQuantity} onChange={(e) => setForm({ ...form, plannedQuantity: e.target.value })} className="input font-mono" /></Field>
                     <Field label="Weight"><input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input font-mono" /></Field>
                     <Field label="Planned start"><input type="date" value={form.plannedStart} onChange={(e) => setForm({ ...form, plannedStart: e.target.value })} className="input" /></Field>
                     <Field label="Planned end"><input type="date" value={form.plannedEnd} onChange={(e) => setForm({ ...form, plannedEnd: e.target.value })} className="input" /></Field>
                     <Field label="Planned %"><input type="number" value={form.plannedPercentage} onChange={(e) => setForm({ ...form, plannedPercentage: e.target.value })} className="input font-mono" /></Field>
                     <Field label="Actual %"><input type="number" value={form.actualPercentage} onChange={(e) => setForm({ ...form, actualPercentage: e.target.value })} className="input font-mono" /></Field>
                     <Field label="Status">
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select">
                           {ACTIVITY_STATUSES.filter((s) => s !== "all").map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
                        </select>
                     </Field>
                     <div className="flex items-end"><Button variant="primary" type="submit" icon={FiPlus} loading={saving} className="w-full">Add activity</Button></div>
                  </form>
               </SectionPanel>
            </div>
         </div>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

function Progress({ projectId }) {
   const toast = useToast();
   const [dash, setDash] = useState(null);
   const [updates, setUpdates] = useState([]);
   const [activities, setActivities] = useState([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [form, setForm] = useState({ activity: "", newProgress: "", quantityCompleted: "", remarks: "" });

   const load = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
         const d = await getProgressDashboard(projectId);
         setDash(d.data.data);
         setUpdates((await getProgressUpdates(projectId)).data.data || []);
         setActivities((await getActivities(`?project=${projectId}`)).data.data || []);
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not load progress.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createProgressUpdate({
            project: projectId, activity: form.activity,
            newProgress: Number(form.newProgress),
            quantityCompleted: form.quantityCompleted ? Number(form.quantityCompleted) : undefined,
            remarks: form.remarks,
         });
         toast.success("Progress update submitted.");
         setForm({ activity: "", newProgress: "", quantityCompleted: "", remarks: "" });
         load(true);
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not submit update.");
      } finally {
         setSaving(false);
      }
   };

   const decide = async (rowId, action) => {
      try {
         if (action === "approve") await approveProgressUpdate(rowId);
         else await rejectProgressUpdate(rowId);
         toast.success(`Update ${action}d.`);
         load(true);
      } catch (err) {
         toast.error(err.response?.data?.message || "Action failed.");
      }
   };

   if (loading) {
      return (
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
               {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}
            </div>
            <TableSkeleton rows={5} cols={6} />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Overall" value={`${dash?.overallProgress || 0}%`} icon={FiActivity} tone="brand" hint={`Planned ${dash?.plannedProgress || 0}%`} />
            <KpiCard label="Variance" value={`${dash?.variance || 0}%`} icon={FiTrendingUp} tone={(dash?.variance || 0) >= 0 ? "mint" : "danger"} hint={`${dash?.delayDays || 0} delay days`} />
            <KpiCard label="Completed" value={dash?.completed ?? 0} icon={FiCheck} tone="mint" hint={`${dash?.inProgress ?? 0} in progress`} />
            <KpiCard label="Pending updates" value={dash?.pendingUpdates ?? 0} icon={FiClock} tone="amber" hint={`${dash?.delayed ?? 0} delayed`} />
         </div>

         {dash && (dash.history || []).length > 0 && (
            <ChartCard title="Progress history" subtitle="Reported completion over time" icon={FiTrendingUp}>
               <BarChart
                  labels={dash.history.map((h) => new Date(h.date).toLocaleDateString())}
                  series={[{ name: "Progress", data: dash.history.map((h) => Number(h.progress || 0)), color: "#2A7B9B" }]}
                  valueFormat={(v) => `${Math.round(v)}%`}
                  height={240}
               />
            </ChartCard>
         )}

         <SectionPanel title="Submit progress update" subtitle="Sends an activity update for review." icon={FiPlus}>
            <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
               <Field label="Activity">
                  <select required value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} className="select">
                     <option value="">Select activity…</option>
                     {activities.map((a) => <option key={a._id} value={a._id}>{a.activityCode} — {a.name}</option>)}
                  </select>
               </Field>
               <Field label="New progress %"><input required type="number" value={form.newProgress} onChange={(e) => setForm({ ...form, newProgress: e.target.value })} className="input font-mono" /></Field>
               <Field label="Qty completed"><input type="number" value={form.quantityCompleted} onChange={(e) => setForm({ ...form, quantityCompleted: e.target.value })} className="input font-mono" /></Field>
               <Field label="Remarks"><input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="input" /></Field>
               <div className="flex items-end"><Button variant="primary" type="submit" loading={saving} className="w-full">Submit update</Button></div>
            </form>
         </SectionPanel>

         <SectionPanel
            title="Progress updates"
            subtitle={`${updates.length} submitted updates`}
            icon={FiActivity}
            action={<Button variant="secondary" size="sm" icon={FiRefreshCw} onClick={() => load()}>Refresh</Button>}
         >
            <DataTable
               headers={["Activity", "Movement", "Qty", "Updated by", "Status", "Actions"]}
               rows={updates}
               emptyTitle="No updates"
               emptyMessage="Progress updates from site will appear here."
               minWidth="min-w-[860px]"
               renderRow={(u) => (
                  <tr key={u._id}>
                     <td className="font-semibold text-ink-900">{u.activity?.name || "—"}</td>
                     <td className="font-mono text-ink-500">{u.previousProgress ?? 0}% → <span className="font-bold text-ink-900">{u.newProgress ?? 0}%</span></td>
                     <td className="text-right font-mono">{u.quantityCompleted ?? "—"}</td>
                     <td className="text-ink-500">{u.updatedBy?.name || "—"} · {u.updateDate ? new Date(u.updateDate).toLocaleDateString() : "—"}</td>
                     <td><StatusBadge status={u.status} /></td>
                     <td>
                        {u.status === "pending" ? (
                           <RowActions>
                              <Button variant="secondary" size="sm" icon={FiCheck} onClick={() => decide(u._id, "approve")}>Approve</Button>
                              <Button variant="danger" size="sm" icon={FiX} onClick={() => decide(u._id, "reject")}>Reject</Button>
                           </RowActions>
                        ) : <span className="text-xs text-ink-400">—</span>}
                     </td>
                  </tr>
               )}
            />
         </SectionPanel>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/* Budget                                                              */
/* ------------------------------------------------------------------ */

function Budget({ projectId }) {
   const toast = useToast();
   const [analysis, setAnalysis] = useState(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [lines, setLines] = useState([{ category: "materials", description: "", quantity: "", unit: "", rate: "", amount: "" }]);

   const load = async () => {
      setLoading(true);
      try {
         const res = await getBudgetAnalysis(projectId);
         setAnalysis(res.data.data);
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not load budget.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

   const addLine = () => setLines([...lines, { category: "labour", description: "", quantity: "", unit: "", rate: "", amount: "" }]);
   const updateLine = (i, f, value) => {
      const next = [...lines];
      next[i][f] = value;
      if (f === "quantity" || f === "rate") next[i].amount = String(Number(next[i].quantity || 0) * Number(next[i].rate || 0));
      setLines(next);
   };

   const submitBudget = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createBudget({
            project: projectId,
            lines: lines.map((l) => ({
               category: l.category, description: l.description,
               quantity: Number(l.quantity || 0), unit: l.unit,
               rate: Number(l.rate || 0), amount: Number(l.amount || 0),
            })),
         });
         toast.success("Budget version saved.");
         setLines([{ category: "materials", description: "", quantity: "", unit: "", rate: "", amount: "" }]);
         load();
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not save budget.");
      } finally {
         setSaving(false);
      }
   };

   if (loading) {
      return (
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
               {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}
            </div>
            <TableSkeleton rows={6} cols={6} />
         </div>
      );
   }

   if (!analysis) {
      return (
         <div className="surface-card">
            <ErrorState message="Budget analysis is unavailable." onRetry={load} />
         </div>
      );
   }

   const categories = Object.entries(analysis.categories || {});

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Total budget" value={money(analysis.totalBudget)} icon={FiLayers} tone="brand" hint={`${analysis.consumedPct || 0}% consumed`} />
            <KpiCard label="Actual cost" value={money(analysis.totalActual)} icon={FiTrendingUp} tone="amber" hint={`Committed ${money(analysis.totalCommitted)}`} />
            <KpiCard label="Remaining" value={money(analysis.remaining)} icon={FiPieChart} tone="mint" hint={`Variance ${money(analysis.variance)}`} />
            <KpiCard label="Est. final" value={money(analysis.forecast?.estimatedFinalCost)} icon={FiDollarSign} tone="sun" hint={`Margin ${analysis.forecast?.estimatedMargin || 0}%`} />
         </div>

         {(analysis.alerts || []).length > 0 && (
            <div className="surface-card border-[#ecd9a8] bg-[#fdfbea] p-4">
               <h4 className="flex items-center gap-2 font-bold text-ink-900"><FiAlertTriangle size={16} className="text-[#9a721f]" /> Cost alerts</h4>
               <div className="mt-2 space-y-1.5">
                  {analysis.alerts.map((a, i) => (
                     <p key={i} className={`text-sm font-medium ${a.level === "warning" ? "text-[#9a721f]" : "text-[#c23b3b]"}`}>
                        {a.category}: {String(a.level).replaceAll("_", " ")} ({a.consumedPct}% consumed)
                     </p>
                  ))}
               </div>
            </div>
         )}

         <SectionPanel
            title="Budget vs actual by category"
            subtitle={`${categories.length} cost categories`}
            icon={FiDollarSign}
            action={<Button variant="secondary" size="sm" icon={FiRefreshCw} onClick={load}>Refresh</Button>}
         >
            <DataTable
               headers={["Category", "Budget", "Actual", "Committed", "Remaining", "Consumed"]}
               rows={categories}
               emptyTitle="No budget lines"
               emptyMessage="Create the first budget version below."
               minWidth="min-w-[760px]"
               renderRow={([cat, v]) => (
                  <tr key={cat}>
                     <td><StatusBadge status={cat} /></td>
                     <td className="text-right font-mono">{money(v.budget)}</td>
                     <td className="text-right font-mono">{money(v.actual)}</td>
                     <td className="text-right font-mono">{money(v.committed)}</td>
                     <td className="text-right font-mono font-bold">{money(v.remaining)}</td>
                     <td><div className="w-28"><ProgressBar value={Number(v.consumedPct || 0)} gradient /></div></td>
                  </tr>
               )}
            />
         </SectionPanel>

         <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Budget by category" subtitle="Approved allocation" icon={FiPieChart}>
               <BarChart
                  labels={categories.map(([c]) => c.slice(0, 10))}
                  series={[{ name: "Budget", data: categories.map(([, v]) => Number(v.budget || 0)), color: "#2A7B9B" }]}
                  valueFormat={(v) => money(v)}
                  height={240}
               />
            </ChartCard>
            <ChartCard title="Monthly cost trend" subtitle="Actual spend per month" icon={FiTrendingUp}>
               <BarChart
                  labels={(analysis.monthlyTrend || []).map((m) => m.month)}
                  series={[{ name: "Cost", data: (analysis.monthlyTrend || []).map((m) => Number(m.amount || 0)), color: "#57C785" }]}
                  valueFormat={(v) => money(v)}
                  height={240}
               />
            </ChartCard>
         </div>

         <SectionPanel title="Create budget" subtitle="Adds a new versioned budget for this project." icon={FiPlus}>
            <div className="space-y-2">
               {lines.map((l, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-canvas/50 p-3 md:grid-cols-6">
                     <select value={l.category} onChange={(e) => updateLine(i, "category", e.target.value)} className="select">
                        {["labour", "materials", "equipment", "subcontractors", "transportation", "site_overhead", "administration", "other"].map((c) => <option key={c} value={c}>{c}</option>)}
                     </select>
                     <input placeholder="Description" value={l.description} onChange={(e) => updateLine(i, "description", e.target.value)} className="input" />
                     <input type="number" placeholder="Qty" value={l.quantity} onChange={(e) => updateLine(i, "quantity", e.target.value)} className="input font-mono" />
                     <input placeholder="Unit" value={l.unit} onChange={(e) => updateLine(i, "unit", e.target.value)} className="input" />
                     <input type="number" placeholder="Rate" value={l.rate} onChange={(e) => updateLine(i, "rate", e.target.value)} className="input font-mono" />
                     <input type="number" placeholder="Amount" value={l.amount} onChange={(e) => updateLine(i, "amount", e.target.value)} className="input font-mono" />
                  </div>
               ))}
               <div className="flex flex-wrap gap-2 pt-1">
                  <Button variant="secondary" icon={FiPlus} onClick={addLine}>Add line</Button>
                  <Button variant="primary" loading={saving} onClick={submitBudget}>Save budget</Button>
               </div>
            </div>
         </SectionPanel>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/* Costs                                                               */
/* ------------------------------------------------------------------ */

function Costs({ dash }) {
   if (!dash) return <TableSkeleton rows={4} cols={2} />;

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Total expenses" value={money(dash.totalExpenses)} icon={FiDollarSign} tone="brand" hint="All cost heads" />
            <KpiCard label="Material cost" value={money(dash.materialCost)} icon={FiPackage} tone="amber" hint="Store consumption" />
            <KpiCard label="Billed" value={money(dash.amountBilled)} icon={FiFileText} tone="mint" hint={`Received ${money(dash.amountReceived)}`} />
            <KpiCard label="Outstanding" value={money(dash.outstandingAmount)} icon={FiTrendingUp} tone="sun" hint="To collect" />
         </div>
         <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Cost composition" subtitle="Where project money goes" icon={FiPieChart}>
               <DonutChart
                  data={[
                     { name: "Materials", value: Number(dash.materialCost || 0), color: "#2A7B9B" },
                     { name: "Labour", value: Number(dash.labourCost || 0), color: "#57C785" },
                     { name: "Purchases", value: Number(dash.purchaseCost || 0), color: "#EDDD53" },
                  ]}
                  size={160}
                  centerLabel="Costs"
                  valueFormat={(v) => money(v)}
               />
            </ChartCard>
            <SectionPanel title="Ledger detail" subtitle="Billing position for this project." icon={FiFileText}>
               <div className="divide-y divide-[#eef4f2]">
                  <DetailRow label="Total expenses" value={money(dash.totalExpenses)} mono />
                  <DetailRow label="Material cost" value={money(dash.materialCost)} mono />
                  <DetailRow label="Labour cost" value={money(dash.labourCost)} mono />
                  <DetailRow label="Purchase cost" value={money(dash.purchaseCost)} mono />
                  <DetailRow label="Amount billed" value={money(dash.amountBilled)} mono />
                  <DetailRow label="Amount received" value={money(dash.amountReceived)} mono />
                  <DetailRow label="Outstanding" value={money(dash.outstandingAmount)} mono />
               </div>
            </SectionPanel>
         </div>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/* Generic filtered project tables                                     */
/* ------------------------------------------------------------------ */

function Filtered({ projectId, load, title, subtitle, searchPlaceholder, searchKeys = [], headers, headerLabels, renderRow, kpis, chart }) {
   const toast = useToast();
   const [rows, setRows] = useState([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");

   useEffect(() => {
      let active = true;
      setLoading(true);
      load()
         .then((r) => {
            if (!active) return;
            const all = r.data.data || [];
            setRows(all.filter((x) => String(x.project?._id || x.project) === projectId));
         })
         .catch((err) => toast.error(err.response?.data?.message || `Could not load ${title.toLowerCase()}.`))
         .finally(() => active && setLoading(false));
      return () => { active = false; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [projectId]);

   const filtered = useMemo(() => {
      if (!search) return rows;
      const q = search.toLowerCase();
      return rows.filter((r) => {
         if (searchKeys.length === 0) return JSON.stringify(r).toLowerCase().includes(q);
         return searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q));
      });
   }, [rows, search, searchKeys]);

   const kpiItems = kpis ? kpis(filtered) : null;
   const chartNode = chart ? chart(filtered) : null;

   return (
      <div className="space-y-4">
         {kpiItems && (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
               {kpiItems.map((k) => <KpiCard key={k.label} {...k} />)}
            </div>
         )}
         {chartNode && (
            <div className="grid gap-4 lg:grid-cols-3">
               <div className="lg:col-span-1">{chartNode}</div>
            </div>
         )}
         <SectionPanel
            title={title}
            subtitle={`${filtered.length} matching records · ${subtitle}`}
            icon={FiLayers}
            action={<SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchPlaceholder || "Search…"} className="sm:w-64" />}
         >
            {loading ? <TableSkeleton rows={5} cols={headers.length} /> : (
               <DataTable
                  headers={headerLabels || headers}
                  rows={filtered}
                  emptyTitle={`No ${title.toLowerCase()}`}
                  emptyMessage={`Nothing recorded for this project yet.`}
                  renderRow={renderRow}
               />
            )}
         </SectionPanel>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/* Interim payments                                                    */
/* ------------------------------------------------------------------ */

function InterimPayments({ projectId }) {
   const toast = useToast();
   const [rows, setRows] = useState([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [form, setForm] = useState({ grossAmount: "", retention: "", periodFrom: "", periodTo: "", description: "" });

   const load = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
         setRows((await getInterimPayments(projectId)).data.data || []);
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not load interim bills.");
      } finally {
         setLoading(false);
      }
   };
   useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createInterimPayment({
            project: projectId, grossAmount: Number(form.grossAmount),
            retention: Number(form.retention || 0),
            periodFrom: form.periodFrom, periodTo: form.periodTo, description: form.description,
         });
         toast.success("Interim bill created.");
         setForm({ grossAmount: "", retention: "", periodFrom: "", periodTo: "", description: "" });
         load(true);
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not create bill.");
      } finally {
         setSaving(false);
      }
   };

   const move = async (rowId, next) => {
      try {
         await updateInterimPaymentStatus(rowId, next);
         toast.success(`Bill moved to ${next}.`);
         load(true);
      } catch (err) {
         toast.error(err.response?.data?.message || "Status update failed.");
      }
   };

   const totalNet = useMemo(() => rows.reduce((s, r) => s + Number(r.netAmount || 0), 0), [rows]);

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Bills raised" value={rows.length} icon={FiFileText} tone="brand" hint="Draft to paid" />
            <KpiCard label="Net certified" value={money(totalNet)} icon={FiDollarSign} tone="mint" hint="Gross minus retention" />
            <KpiCard label="Paid out" value={money(rows.reduce((s, r) => s + Number(r.paidAmount || 0), 0))} icon={FiCheck} tone="sun" hint="Collected so far" />
         </div>

         <SectionPanel title="Create interim bill" subtitle="Gross amount less retention becomes the net payable." icon={FiPlus}>
            <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
               <Field label="Gross amount *"><input required type="number" value={form.grossAmount} onChange={(e) => setForm({ ...form, grossAmount: e.target.value })} className="input font-mono" /></Field>
               <Field label="Retention"><input type="number" value={form.retention} onChange={(e) => setForm({ ...form, retention: e.target.value })} className="input font-mono" /></Field>
               <Field label="Period from"><input type="date" value={form.periodFrom} onChange={(e) => setForm({ ...form, periodFrom: e.target.value })} className="input" /></Field>
               <Field label="Period to"><input type="date" value={form.periodTo} onChange={(e) => setForm({ ...form, periodTo: e.target.value })} className="input" /></Field>
               <Field label="Description"><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" /></Field>
               <div className="flex items-end"><Button variant="primary" type="submit" icon={FiPlus} loading={saving} className="w-full">Create bill</Button></div>
            </form>
         </SectionPanel>

         <SectionPanel
            title="Interim bills"
            subtitle={`${rows.length} bills for this project`}
            icon={FiFileText}
            action={<Button variant="secondary" size="sm" icon={FiRefreshCw} onClick={() => load()}>Refresh</Button>}
         >
            {loading ? <TableSkeleton rows={5} cols={6} /> : (
               <DataTable
                  headers={["Bill No", "Gross", "Retention", "Net", "Period", "Status", "Actions"]}
                  rows={rows}
                  emptyTitle="No interim bills"
                  emptyMessage="Raise the first running bill above."
                  minWidth="min-w-[880px]"
                  renderRow={(r) => (
                     <tr key={r._id}>
                        <td className="font-mono font-semibold text-ink-900">{r.paymentNo}</td>
                        <td className="text-right font-mono">{money(r.grossAmount)}</td>
                        <td className="text-right font-mono">{money(r.retention)}</td>
                        <td className="text-right font-mono font-bold">{money(r.netAmount)}</td>
                        <td className="whitespace-nowrap text-ink-500">{r.periodFrom || "—"} → {r.periodTo || "—"}</td>
                        <td><StatusBadge status={r.status} /></td>
                        <td>
                           <RowActions>
                              {["draft", "submitted", "approved", "paid"].filter((s) => s !== r.status).map((s) => (
                                 <Button key={s} variant="secondary" size="sm" onClick={() => move(r._id, s)}>{s}</Button>
                              ))}
                           </RowActions>
                        </td>
                     </tr>
                  )}
               />
            )}
         </SectionPanel>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

function Documents({ projectId }) {
   const toast = useToast();
   const [rows, setRows] = useState([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [search, setSearch] = useState("");
   const [form, setForm] = useState({ name: "", category: "", url: "" });

   const load = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
         setRows((await getDocuments(projectId)).data.data || []);
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not load documents.");
      } finally {
         setLoading(false);
      }
   };
   useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

   const filtered = useMemo(() => {
      return rows.filter((r) => `${r.name || ""} ${r.category || ""}`.toLowerCase().includes(search.toLowerCase()));
   }, [rows, search]);

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createDocument({ ...form, project: projectId });
         toast.success("Document registered.");
         setForm({ name: "", category: "", url: "" });
         load(true);
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not add document.");
      } finally {
         setSaving(false);
      }
   };

   const remove = async (rowId) => {
      if (!window.confirm("Delete this document?")) return;
      try {
         await deleteDocument(rowId);
         toast.success("Document deleted.");
         load(true);
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not delete document.");
      }
   };

   const drawings = rows.filter((r) => /drawing/i.test(r.category || "")).length;

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Documents" value={rows.length} icon={FiFolder} tone="brand" hint="Linked files" />
            <KpiCard label="Drawings" value={drawings} icon={FiFileText} tone="mint" hint="Design files" />
            <KpiCard label="In view" value={filtered.length} icon={FiCalendar} tone="sun" hint="Matching search" />
         </div>

         <SectionPanel title="Register document" subtitle="Links a file or URL to this project." icon={FiPlus}>
            <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
               <Field label="Document name *"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></Field>
               <Field label="Category"><input placeholder="drawing, contract…" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" /></Field>
               <Field label="URL / path"><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="input font-mono" /></Field>
               <div className="flex items-end"><Button variant="primary" type="submit" icon={FiPlus} loading={saving} className="w-full">Add document</Button></div>
            </form>
         </SectionPanel>

         <SectionPanel
            title="Project documents"
            subtitle={`${filtered.length} matching records`}
            icon={FiFolder}
            action={<SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents…" className="sm:w-64" />}
         >
            {loading ? <TableSkeleton rows={5} cols={5} /> : (
               <DataTable
                  headers={["Document", "Category", "Uploaded by", "File", "Actions"]}
                  rows={filtered}
                  emptyTitle="No documents"
                  emptyMessage="Register drawings, contracts or site records above."
                  minWidth="min-w-[760px]"
                  renderRow={(r) => (
                     <tr key={r._id}>
                        <td>
                           <span className="flex items-center gap-2.5">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500"><FiFileText size={15} /></span>
                              <span className="font-semibold text-ink-900">{r.name}</span>
                           </span>
                        </td>
                        <td><StatusBadge status={r.category || "general"} /></td>
                        <td className="text-ink-500">{r.uploadedBy?.name || "—"}</td>
                        <td>{r.url ? <a href={r.url} className="font-semibold text-brand-500 hover:underline">Open</a> : <span className="text-ink-400">—</span>}</td>
                        <td>
                           <RowActions>
                              <button type="button" onClick={() => remove(r._id)} className="grid h-8 w-8 place-items-center rounded-xl text-[#c23b3b] transition hover:bg-[rgba(224,82,82,0.1)]" aria-label="Delete document"><FiTrash2 size={14} /></button>
                           </RowActions>
                        </td>
                     </tr>
                  )}
               />
            )}
         </SectionPanel>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

function ReportSummary({ project, dash }) {
   const toast = useToast();
   if (!dash) return <TableSkeleton rows={8} cols={2} />;

   const rows = [
      ["Contract value", money(dash.contractValue)],
      ["Approved budget", money(dash.budget)],
      ["Actual cost", money(dash.actualCost)],
      ["Remaining budget", money(dash.remainingBudget)],
      ["Overall progress", `${dash.overallProgress || 0}%`],
      ["Planned progress", `${dash.plannedProgress || 0}%`],
      ["Schedule variance", `${dash.scheduleVariance || 0}%`],
      ["Total expenses", money(dash.totalExpenses)],
      ["Material cost", money(dash.materialCost)],
      ["Labour cost", money(dash.labourCost)],
      ["Purchase cost", money(dash.purchaseCost)],
      ["Amount billed", money(dash.amountBilled)],
      ["Amount received", money(dash.amountReceived)],
      ["Outstanding", money(dash.outstandingAmount)],
   ];

   const exportCSV = () => {
      const csv = ["Metric,Value", ...rows.map(([k, v]) => `"${k}","${v}"`)].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.projectCode || "project"}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Project report exported.");
   };

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Progress" value={`${dash.overallProgress || 0}%`} icon={FiActivity} tone="brand" hint={`Planned ${dash.plannedProgress || 0}%`} />
            <KpiCard label="Spend" value={money(dash.actualCost)} icon={FiDollarSign} tone="amber" hint={`of ${money(dash.budget)}`} />
            <KpiCard label="Billed" value={money(dash.amountBilled)} icon={FiFileText} tone="mint" hint={`Received ${money(dash.amountReceived)}`} />
            <KpiCard label="Outstanding" value={money(dash.outstandingAmount)} icon={FiTrendingUp} tone="sun" hint="To collect" />
         </div>
         <SectionPanel
            title={`Project report — ${project.name}`}
            subtitle="Consolidated cost, progress and billing snapshot."
            icon={FiCalendar}
            action={<Button variant="secondary" size="sm" icon={FiDownload} onClick={exportCSV}>Export CSV</Button>}
         >
            <DataTable
               headers={["Metric", "Value"]}
               rows={rows}
               emptyTitle="No metrics"
               emptyMessage="Dashboard metrics are unavailable."
               minWidth="min-w-[480px]"
               renderRow={([k, v]) => (
                  <tr key={k}>
                     <td className="font-medium text-ink-700">{k}</td>
                     <td className="text-right font-mono font-semibold text-ink-900">{v}</td>
                  </tr>
               )}
            />
         </SectionPanel>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/* Shared builders                                                     */
/* ------------------------------------------------------------------ */

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

function buildFeed(updates, reports) {
   const items = [
      ...updates.map((u) => ({
         id: `u-${u._id}`, date: u.updateDate || u.createdAt, icon: FiActivity, tone: "brand",
         title: `${u.activity?.name || "Activity"} → ${u.newProgress ?? 0}%`,
         meta: `${u.updatedBy?.name || "Site team"} · ${u.status || "update"}`,
      })),
      ...reports.map((r) => ({
         id: `r-${r._id}`, date: r.reportDate || r.createdAt, icon: FiClipboard, tone: "sun",
         title: `Daily report · ${r.site || "site"}`,
         meta: `${r.siteSupervisor?.name || "Supervisor"} · ${r.status}`,
      })),
   ];
   return items.sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))).slice(0, 8);
}
