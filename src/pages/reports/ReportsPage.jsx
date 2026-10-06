import { useEffect, useMemo, useState } from "react";
import {
   FiActivity,
   FiArchive,
   FiBarChart2,
   FiDollarSign,
   FiDownload,
   FiLayers,
   FiRefreshCw,
} from "react-icons/fi";
import {
   getAttendanceReport,
   getExpenseReport,
   getInventoryReport,
   getProjectReport,
} from "../../services/reportService";
import { useToast } from "../../components/ui/ToastContext";
import { BarChart, DonutChart, formatCompact, formatCurrency } from "../../components/charts/Charts";
import { ChartCard, KpiCard, PageHeader } from "../../components/dashboard/widgets";
import Button from "../../components/ui/Button";
import { SearchInput } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap } from "../../components/ui/TableShell";
import StatusBadge from "../../components/ui/StatusBadge";

const money = (v) => formatCurrency(v).replace("PKR ", "");
const TABS = [
   { value: "projects", label: "Projects", icon: FiLayers },
   { value: "expenses", label: "Expenses", icon: FiDollarSign },
   { value: "inventory", label: "Inventory", icon: FiArchive },
   { value: "attendance", label: "Attendance", icon: FiActivity },
];

function toCSV(rows) {
   if (!rows.length) return "";
   const headers = Object.keys(rows[0]);
   const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
   return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

export default function ReportsPage() {
   const toast = useToast();
   const [attendance, setAttendance] = useState([]);
   const [expenses, setExpenses] = useState([]);
   const [inventory, setInventory] = useState([]);
   const [projects, setProjects] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const [tab, setTab] = useState("projects");
   const [search, setSearch] = useState("");

   const loadReports = async () => {
      setLoading(true);
      setError(false);
      try {
         const [attendanceRes, expenseRes, inventoryRes, projectRes] = await Promise.all([
            getAttendanceReport(),
            getExpenseReport(),
            getInventoryReport(),
            getProjectReport(),
         ]);
         setAttendance(attendanceRes.data.data || []);
         setExpenses(expenseRes.data.data || []);
         setInventory(inventoryRes.data.data || []);
         setProjects(projectRes.data.data || []);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load reports.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadReports();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const totals = useMemo(() => {
      const expenseTotal = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
      const stockTotal = inventory.reduce((s, i) => s + Number(i.currentStock || 0), 0);
      const budgetTotal = projects.reduce((s, p) => s + Number(p.budget || 0), 0);
      return { expenseTotal, stockTotal, budgetTotal };
   }, [expenses, inventory, projects]);

   const expenseByCategory = useMemo(() => {
      const map = new Map();
      expenses.forEach((e) => {
         const key = e.category || e.project?.name || "General";
         map.set(key, (map.get(key) || 0) + Number(e.amount || 0));
      });
      return [...map.entries()].map(([name, value]) => ({ name: String(name).slice(0, 18), value }));
   }, [expenses]);

   const exportCurrent = () => {
      let rows = [];
      if (tab === "projects") rows = projects.map((p) => ({ Project: p.name, Budget: p.budget, Status: p.status }));
      if (tab === "expenses") rows = expenses.map((e) => ({ Project: e.project?.name || "-", Amount: e.amount, Date: e.date || "" }));
      if (tab === "inventory") rows = inventory.map((i) => ({ Project: i.project?.name || "-", Material: i.materialName, Stock: i.currentStock }));
      if (tab === "attendance") rows = attendance.map((a) => ({ Employee: a.employee?.name || "-", Status: a.status || "", Date: a.date || "" }));
      if (!rows.length) {
         toast.warning("Nothing to export for this report.");
         return;
      }
      const blob = new Blob([toCSV(rows)], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${tab}-report.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`${tab} report exported as CSV.`);
   };

   if (loading) {
      return (
         <div className="space-y-4">
            <div className="skeleton h-24 rounded-3xl" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
               {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-32 rounded-3xl" />
               ))}
            </div>
            <TableSkeleton rows={6} cols={4} />
         </div>
      );
   }

   if (error) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load reports right now." onRetry={loadReports} />
         </div>
      );
   }

   const q = search.toLowerCase();
   const filteredProjects = projects.filter((p) => `${p.name} ${p.status || ""}`.toLowerCase().includes(q));
   const filteredExpenses = expenses.filter((e) => `${e.project?.name || ""} ${e.category || ""}`.toLowerCase().includes(q));
   const filteredInventory = inventory.filter((i) => `${i.materialName} ${i.project?.name || ""}`.toLowerCase().includes(q));
   const filteredAttendance = attendance.filter((a) => `${a.employee?.name || ""} ${a.status || ""}`.toLowerCase().includes(q));

   return (
      <div className="space-y-4">
         <PageHeader
            title="Reports"
            subtitle="Portfolio-wide attendance, expense, inventory and project intelligence."
            actions={
               <>
                  <Button variant="secondary" icon={FiRefreshCw} onClick={loadReports}>
                     Refresh
                  </Button>
                  <Button variant="primary" icon={FiDownload} onClick={exportCurrent}>
                     Export CSV
                  </Button>
               </>
            }
         />

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Projects Tracked" value={projects.length} icon={FiLayers} tone="brand" hint={`${money(totals.budgetTotal)} budgeted`} />
            <KpiCard label="Total Expenses" value={money(totals.expenseTotal)} icon={FiDollarSign} tone="amber" hint={`${expenses.length} records`} />
            <KpiCard label="Stock Units" value={formatCompact(totals.stockTotal)} icon={FiArchive} tone="mint" hint={`${inventory.length} materials`} />
            <KpiCard label="Attendance Rows" value={attendance.length} icon={FiActivity} tone="sun" hint="Daily registers" />
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Project Budgets" subtitle="Top projects" icon={FiLayers} className="lg:col-span-2">
               <BarChart
                  labels={projects.slice(0, 8).map((p) => (p.name || "—").slice(0, 12))}
                  series={[{ name: "Budget", data: projects.slice(0, 8).map((p) => Number(p.budget || 0)), color: "#2A7B9B" }]}
                  valueFormat={(v) => money(v)}
                  height={240}
               />
            </ChartCard>
            <ChartCard title="Expenses" subtitle="By category / project" icon={FiBarChart2}>
               <DonutChart data={expenseByCategory.slice(0, 6)} size={150} centerLabel="Expenses" valueFormat={(v) => money(v)} />
            </ChartCard>
         </div>

         <div className="segmented-tabs">
            {TABS.map((t) => (
               <button
                  key={t.value}
                  type="button"
                  onClick={() => { setTab(t.value); setSearch(""); }}
                  className={`segmented-tab flex items-center gap-2 ${tab === t.value ? "is-active" : ""}`}
               >
                  <t.icon size={15} />
                  {t.label}
               </button>
            ))}
         </div>

         <div className="surface-card p-4">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${tab}…`} className="sm:max-w-xs" />
         </div>

         {tab === "projects" && (
            <TableShell>
               <TableWrap>
                  <table className="data-table min-w-[640px]">
                     <thead><tr><th>Project</th><th className="text-right">Budget</th><th className="text-center">Status</th></tr></thead>
                     <tbody>
                        {filteredProjects.map((item) => (
                           <tr key={item._id}>
                              <td className="font-semibold text-ink-900">{item.name}</td>
                              <td className="text-right font-mono">{money(item.budget)}</td>
                              <td className="text-center"><StatusBadge status={item.status} /></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
               {filteredProjects.length === 0 && <EmptyState title="No projects" message="No projects match this search." />}
            </TableShell>
         )}

         {tab === "expenses" && (
            <TableShell>
               <TableWrap>
                  <table className="data-table min-w-[640px]">
                     <thead><tr><th>Project</th><th className="text-right">Amount</th><th className="text-center">Category</th></tr></thead>
                     <tbody>
                        {filteredExpenses.map((item) => (
                           <tr key={item._id}>
                              <td className="font-semibold text-ink-900">{item.project?.name || "—"}</td>
                              <td className="text-right font-mono">{money(item.amount)}</td>
                              <td className="text-center"><StatusBadge status={item.category || "expense"} /></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
               {filteredExpenses.length === 0 && <EmptyState title="No expenses" message="No expenses match this search." />}
            </TableShell>
         )}

         {tab === "inventory" && (
            <TableShell>
               <TableWrap>
                  <table className="data-table min-w-[680px]">
                     <thead><tr><th>Material</th><th>Project</th><th className="text-right">Stock</th></tr></thead>
                     <tbody>
                        {filteredInventory.map((item) => (
                           <tr key={item._id}>
                              <td className="font-semibold text-ink-900">{item.materialName}</td>
                              <td>{item.project?.name || "—"}</td>
                              <td className="text-right font-mono">{formatCompact(item.currentStock)} </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
               {filteredInventory.length === 0 && <EmptyState title="No inventory" message="No inventory rows match this search." />}
            </TableShell>
         )}

         {tab === "attendance" && (
            <TableShell>
               <TableWrap>
                  <table className="data-table min-w-[640px]">
                     <thead><tr><th>Employee</th><th className="text-center">Status</th><th className="text-right">Date</th></tr></thead>
                     <tbody>
                        {filteredAttendance.map((item) => (
                           <tr key={item._id}>
                              <td className="font-semibold text-ink-900">{item.employee?.name || "—"}</td>
                              <td className="text-center"><StatusBadge status={item.status || "present"} /></td>
                              <td className="text-right text-ink-500">{item.date ? new Date(item.date).toLocaleDateString() : "—"}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
               {filteredAttendance.length === 0 && <EmptyState title="No attendance" message="No attendance rows match this search." />}
            </TableShell>
         )}
      </div>
   );
}
