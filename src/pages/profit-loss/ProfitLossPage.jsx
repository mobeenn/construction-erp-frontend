import { useEffect, useMemo, useState } from "react";
import { FiDollarSign, FiPieChart, FiRefreshCw, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { getProfitLoss } from "../../services/profitLossService";
import { useToast } from "../../components/ui/ToastContext";
import { BarChart, DonutChart, ProgressBar, formatCompact, formatCurrency } from "../../components/charts/Charts";
import { ChartCard, KpiCard, PageHeader } from "../../components/dashboard/widgets";
import Button from "../../components/ui/Button";
import { SearchInput, FilterSelect } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap } from "../../components/ui/TableShell";
import StatusBadge from "../../components/ui/StatusBadge";

const money = (v) => formatCurrency(v).replace("PKR ", "");
const moneyShort = (v) => formatCompact(v);

export default function ProfitLossPage() {
   const toast = useToast();
   const [reports, setReports] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const [search, setSearch] = useState("");
   const [status, setStatus] = useState("all");

   const loadProfitLoss = async () => {
      setLoading(true);
      setError(false);
      try {
         const res = await getProfitLoss();
         setReports(res.data.data || []);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load profit & loss.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadProfitLoss();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = useMemo(() => {
      return reports.filter((item) => {
         const matchesSearch = `${item.projectName || ""}`.toLowerCase().includes(search.toLowerCase());
         const profit = Number(item.profit || 0);
         const matchesStatus =
            status === "all" ||
            (status === "profit" && profit >= 0) ||
            (status === "loss" && profit < 0);
         return matchesSearch && matchesStatus;
      });
   }, [reports, search, status]);

   const totals = useMemo(() => {
      const revenue = reports.reduce((s, r) => s + Number(r.revenue || 0), 0);
      const expense = reports.reduce((s, r) => s + Number(r.expense || 0), 0);
      const profit = reports.reduce((s, r) => s + Number(r.profit || 0), 0);
      const profitable = reports.filter((r) => Number(r.profit || 0) >= 0).length;
      return { revenue, expense, profit, profitable };
   }, [reports]);

   const margin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;

   if (loading) {
      return (
         <div className="space-y-4">
            <div className="skeleton h-24 rounded-3xl" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
               {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-32 rounded-3xl" />
               ))}
            </div>
            <TableSkeleton rows={6} cols={5} />
         </div>
      );
   }

   if (error) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load the profit & loss report." onRetry={loadProfitLoss} />
         </div>
      );
   }

   const chartLabels = filtered.slice(0, 8).map((r) => (r.projectName || "—").slice(0, 12));
   const profitData = filtered.slice(0, 8).map((r) => Math.max(Number(r.profit || 0), 0));
   const lossData = filtered.slice(0, 8).map((r) => Math.abs(Math.min(Number(r.profit || 0), 0)));

   return (
      <div className="space-y-4">
         <PageHeader
            title="Profit & Loss"
            subtitle="Revenue, cost and margin across every project in the portfolio."
            actions={
               <Button variant="secondary" icon={FiRefreshCw} onClick={loadProfitLoss}>
                  Refresh
               </Button>
            }
         />

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total Revenue" value={money(totals.revenue)} icon={FiDollarSign} tone="brand" hint={`${reports.length} projects`} />
            <KpiCard label="Total Expense" value={money(totals.expense)} icon={FiTrendingDown} tone="amber" hint="All recorded costs" />
            <KpiCard
               label="Net Profit"
               value={money(totals.profit)}
               icon={FiTrendingUp}
               tone={totals.profit >= 0 ? "mint" : "danger"}
               hint={`${margin.toFixed(1)}% margin`}
            />
            <KpiCard label="Profitable Projects" value={`${totals.profitable}/${reports.length}`} icon={FiPieChart} tone="sun" hint="Above break-even" />
         </div>

         {reports.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
               <ChartCard title="Profit vs Loss" subtitle="Top projects" icon={FiTrendingUp} className="lg:col-span-2">
                  <BarChart
                     labels={chartLabels.length ? chartLabels : ["No data"]}
                     series={[
                        { name: "Profit", data: profitData.length ? profitData : [0], color: "#57C785" },
                        { name: "Loss", data: lossData.length ? lossData : [0], color: "#E05252" },
                     ]}
                     valueFormat={(v) => moneyShort(v)}
                     height={260}
                  />
               </ChartCard>
               <ChartCard title="Margin Health" subtitle="Net margin" icon={FiPieChart}>
                  <div className="flex flex-col gap-3">
                     <ProgressBar value={Math.max(Math.min(margin, 100), 0)} gradient label={`Net margin ${margin.toFixed(1)}%`} />
                     <DonutChart
                        data={[
                           { name: "Profitable", value: totals.profitable, color: "#57C785" },
                           { name: "Loss making", value: Math.max(reports.length - totals.profitable, 0), color: "#E05252" },
                        ]}
                        size={150}
                        centerLabel="Projects"
                        valueFormat={(v) => String(v)}
                     />
                  </div>
               </ChartCard>
            </div>
         )}

         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…" className="sm:max-w-xs" />
            <FilterSelect
               value={status}
               onChange={(e) => setStatus(e.target.value)}
               options={[
                  { value: "all", label: "All projects" },
                  { value: "profit", label: "Profitable only" },
                  { value: "loss", label: "Loss making only" },
               ]}
               className="sm:w-52"
            />
         </div>

         <TableShell>
            <TableWrap>
               <table className="data-table min-w-[760px]">
                  <thead>
                     <tr>
                        <th>Project</th>
                        <th className="text-right">Revenue</th>
                        <th className="text-right">Expense</th>
                        <th className="text-right">Profit</th>
                        <th className="text-center">Health</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filtered.map((item, index) => {
                        const profit = Number(item.profit || 0);
                        const rev = Number(item.revenue || 0);
                        const pct = rev > 0 ? Math.min(Math.abs(profit / rev) * 100, 100) : 0;
                        return (
                           <tr key={item.projectName || index}>
                              <td>
                                 <p className="font-semibold text-ink-900">{item.projectName}</p>
                                 <p className="text-xs text-ink-400">{item.status ? String(item.status).replaceAll("_", " ") : "—"}</p>
                              </td>
                              <td className="text-right font-mono">{money(item.revenue)}</td>
                              <td className="text-right font-mono">{money(item.expense)}</td>
                              <td className={`text-right font-mono font-bold ${profit >= 0 ? "text-[#1b7f56]" : "text-[#c23b3b]"}`}>
                                 {profit >= 0 ? "+" : "−"}{money(Math.abs(profit))}
                              </td>
                              <td>
                                 <div className="flex items-center justify-center gap-2">
                                    <div className="w-24">
                                       <ProgressBar value={pct} color={profit >= 0 ? "#57C785" : "#E05252"} />
                                    </div>
                                    <StatusBadge status={profit >= 0 ? "profit" : "loss"} />
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </TableWrap>
            {filtered.length === 0 && (
               <EmptyState title="No results" message="No projects match the current search or filter." />
            )}
         </TableShell>
      </div>
   );
}
