import { useEffect, useState } from "react";
import { FiRefreshCw, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { getProfitLossReport } from "../../services/accountService";
import { useToast } from "../../components/ui/ToastContext";
import { PageHeader, KpiCard } from "../../components/dashboard/widgets";
import { ChartCard } from "../../components/dashboard/widgets";
import { DonutChart, ProgressBar, formatCurrency } from "../../components/charts/Charts";
import Button from "../../components/ui/Button";
import { ErrorState } from "../../components/ui/States";
import { TableShell } from "../../components/ui/TableShell";

const money = (v) => formatCurrency(v).replace("PKR ", "");

export default function ProfitLossAccountingPage() {
   const toast = useToast();
   const [report, setReport] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);

   const loadReport = async () => {
      setLoading(true);
      setError(false);
      try {
         const res = await getProfitLossReport();
         setReport(res.data.data);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load P&L statement.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadReport();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   if (loading) {
      return (
         <div className="space-y-4">
            <div className="skeleton h-24 rounded-3xl" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
               {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}
            </div>
            <div className="skeleton h-80 rounded-3xl" />
         </div>
      );
   }

   if (error || !report) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load the profit & loss statement." onRetry={loadReport} />
         </div>
      );
   }

   const margin = report.totalRevenue > 0 ? (report.netProfit / report.totalRevenue) * 100 : 0;

   return (
      <div className="space-y-4">
         <PageHeader
            title="Profit & Loss Statement"
            subtitle="Accrual-based revenue versus expenses from posted journals."
            actions={<Button variant="secondary" icon={FiRefreshCw} onClick={loadReport}>Refresh</Button>}
         />

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard label="Total Revenue" value={money(report.totalRevenue)} icon={FiTrendingUp} tone="mint" hint={`${(report.revenue || []).length} accounts`} />
            <KpiCard label="Total Expenses" value={money(report.totalExpense)} icon={FiTrendingDown} tone="amber" hint={`${(report.expenses || []).length} accounts`} />
            <KpiCard label={report.netProfit >= 0 ? "Net Profit" : "Net Loss"} value={money(Math.abs(report.netProfit))} icon={FiTrendingUp} tone={report.netProfit >= 0 ? "brand" : "danger"} hint={`${margin.toFixed(1)}% margin`} />
         </div>

         <ChartCard title="Net Performance" subtitle="Margin on total revenue" icon={FiTrendingUp}>
            <ProgressBar value={Math.max(Math.min(margin, 100), 0)} gradient label={`${report.netProfit >= 0 ? "Profit" : "Loss"} margin ${margin.toFixed(1)}%`} />
            <div className="mt-4">
               <DonutChart
                  data={[
                     { name: "Revenue", value: Number(report.totalRevenue || 0), color: "#57C785" },
                     { name: "Expenses", value: Number(report.totalExpense || 0), color: "#E05252" },
                  ]}
                  size={160}
                  centerLabel="Turnover"
                  valueFormat={(v) => money(v)}
               />
            </div>
         </ChartCard>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TableShell>
               <div className="border-b border-line px-5 py-4">
                  <h3 className="font-bold text-[#1b7f56]">Revenue</h3>
                  <p className="text-xs text-ink-500">Credits posted to revenue accounts</p>
               </div>
               <table className="data-table">
                  <tbody>
                     {(report.revenue || []).map((item, idx) => (
                        <tr key={idx}>
                           <td className="font-medium text-ink-900">{item.account}</td>
                           <td className="text-right font-mono">{money(item.amount)}</td>
                        </tr>
                     ))}
                  </tbody>
                  <tfoot><tr className="bg-canvas/60 font-bold"><td className="p-3 text-sm">Total revenue</td><td className="p-3 text-right font-mono text-sm">{money(report.totalRevenue)}</td></tr></tfoot>
               </table>
            </TableShell>

            <TableShell>
               <div className="border-b border-line px-5 py-4">
                  <h3 className="font-bold text-[#c23b3b]">Expenses</h3>
                  <p className="text-xs text-ink-500">Debits posted to expense accounts</p>
               </div>
               <table className="data-table">
                  <tbody>
                     {(report.expenses || []).map((item, idx) => (
                        <tr key={idx}>
                           <td className="font-medium text-ink-900">{item.account}</td>
                           <td className="text-right font-mono">{money(item.amount)}</td>
                        </tr>
                     ))}
                  </tbody>
                  <tfoot><tr className="bg-canvas/60 font-bold"><td className="p-3 text-sm">Total expenses</td><td className="p-3 text-right font-mono text-sm">{money(report.totalExpense)}</td></tr></tfoot>
               </table>
            </TableShell>
         </div>

         <div className={`surface-card flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between ${report.netProfit >= 0 ? "" : "border-[#f0c7c7]"}`}>
            <div>
               <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Net {report.netProfit >= 0 ? "profit" : "loss"}</p>
               <p className="text-xs text-ink-500">Revenue minus expenses for the current ledger.</p>
            </div>
            <p className={`font-display text-2xl font-extrabold ${report.netProfit >= 0 ? "text-[#1b7f56]" : "text-[#c23b3b]"}`}>
               {report.netProfit >= 0 ? "+" : "−"}{money(Math.abs(report.netProfit))}
            </p>
         </div>
      </div>
   );
}
