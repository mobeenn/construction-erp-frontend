import { useEffect, useState } from "react";
import { FiCheckCircle, FiLayers, FiRefreshCw, FiXCircle } from "react-icons/fi";
import { getBalanceSheet } from "../../services/accountService";
import { useToast } from "../../components/ui/ToastContext";
import { PageHeader, KpiCard } from "../../components/dashboard/widgets";
import { ChartCard } from "../../components/dashboard/widgets";
import { DonutChart, formatCurrency } from "../../components/charts/Charts";
import Button from "../../components/ui/Button";
import { ErrorState } from "../../components/ui/States";
import { TableShell } from "../../components/ui/TableShell";

const money = (v) => formatCurrency(v).replace("PKR ", "");

export default function BalanceSheetPage() {
   const toast = useToast();
   const [report, setReport] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);

   const loadReport = async () => {
      setLoading(true);
      setError(false);
      try {
         const res = await getBalanceSheet();
         setReport(res.data.data);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load balance sheet.");
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
            <ErrorState message="We couldn't load the balance sheet." onRetry={loadReport} />
         </div>
      );
   }

   const sections = [
      { key: "assets", title: "Assets", color: "#2A7B9B", items: report.assets || [], total: report.totalAssets },
      { key: "liabilities", title: "Liabilities", color: "#E05252", items: report.liabilities || [], total: report.totalLiabilities },
      { key: "equity", title: "Equity", color: "#7DBCCD", items: report.equity || [], total: report.totalEquity },
   ];

   return (
      <div className="space-y-4">
         <PageHeader
            title="Balance Sheet"
            subtitle={report.isBalanced ? "Balanced · assets equal liabilities plus equity." : "Out of balance · review journal postings."}
            actions={<Button variant="secondary" icon={FiRefreshCw} onClick={loadReport}>Refresh</Button>}
         />

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard label="Total Assets" value={money(report.totalAssets)} icon={FiLayers} tone="brand" hint={`${(report.assets || []).length} accounts`} />
            <KpiCard label="Total Liabilities" value={money(report.totalLiabilities)} icon={FiLayers} tone="amber" hint={`${(report.liabilities || []).length} accounts`} />
            <KpiCard
               label="Total Equity"
               value={money(report.totalEquity)}
               icon={report.isBalanced ? FiCheckCircle : FiXCircle}
               tone={report.isBalanced ? "mint" : "danger"}
               hint={report.isBalanced ? "Balanced" : "Not balanced"}
            />
         </div>

         <ChartCard title="Capital Structure" subtitle="Assets vs liabilities vs equity" icon={FiLayers}>
            <DonutChart
               data={[
                  { name: "Assets", value: Number(report.totalAssets || 0), color: "#2A7B9B" },
                  { name: "Liabilities", value: Number(report.totalLiabilities || 0), color: "#E05252" },
                  { name: "Equity", value: Number(report.totalEquity || 0), color: "#57C785" },
               ]}
               size={160}
               centerLabel="Balance"
               valueFormat={(v) => money(v)}
            />
         </ChartCard>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {sections.map((section) => (
               <TableShell key={section.key}>
                  <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
                     <span className="h-2.5 w-2.5 rounded-full" style={{ background: section.color }} />
                     <h3 className="font-bold text-ink-900">{section.title}</h3>
                     <span className="badge badge-neutral ml-auto">{section.items.length}</span>
                  </div>
                  <table className="data-table">
                     <tbody>
                        {section.items.map((item, idx) => (
                           <tr key={idx}>
                              <td className="font-medium text-ink-900">{item.account}</td>
                              <td className="text-right font-mono">{money(item.amount)}</td>
                           </tr>
                        ))}
                     </tbody>
                     <tfoot>
                        <tr className="bg-canvas/60 font-bold">
                           <td className="p-3 text-sm">Total {section.title.toLowerCase()}</td>
                           <td className="p-3 text-right font-mono text-sm">{money(section.total)}</td>
                        </tr>
                     </tfoot>
                  </table>
               </TableShell>
            ))}
         </div>
      </div>
   );
}
