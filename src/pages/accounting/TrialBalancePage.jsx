import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiPieChart, FiRefreshCw, FiXCircle } from "react-icons/fi";
import { getTrialBalance } from "../../services/accountService";
import { useToast } from "../../components/ui/ToastContext";
import { PageHeader, KpiCard } from "../../components/dashboard/widgets";
import { DonutChart, formatCurrency } from "../../components/charts/Charts";
import { ChartCard } from "../../components/dashboard/widgets";
import Button from "../../components/ui/Button";
import { SearchInput } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap } from "../../components/ui/TableShell";

const money = (v) => formatCurrency(v).replace("PKR ", "");

export default function TrialBalancePage() {
   const toast = useToast();
   const [trialBalance, setTrialBalance] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const [search, setSearch] = useState("");

   const loadTrialBalance = async () => {
      setLoading(true);
      setError(false);
      try {
         const res = await getTrialBalance();
         setTrialBalance(res.data.data);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load trial balance.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadTrialBalance();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const rows = useMemo(() => {
      if (!trialBalance) return [];
      return (trialBalance.accounts || []).filter((r) =>
         `${r.account} ${r.code}`.toLowerCase().includes(search.toLowerCase()),
      );
   }, [trialBalance, search]);

   if (loading) {
      return (
         <div className="space-y-4">
            <div className="skeleton h-24 rounded-3xl" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
               {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}
            </div>
            <TableSkeleton rows={7} cols={6} />
         </div>
      );
   }

   if (error || !trialBalance) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load the trial balance." onRetry={loadTrialBalance} />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <PageHeader
            title="Trial Balance"
            subtitle="Debits and credits across every ledger account."
            actions={<Button variant="secondary" icon={FiRefreshCw} onClick={loadTrialBalance}>Refresh</Button>}
         />

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard label="Total Debit" value={money(trialBalance.totalDebit)} icon={FiPieChart} tone="brand" hint={`${rows.length} accounts`} />
            <KpiCard label="Total Credit" value={money(trialBalance.totalCredit)} icon={FiPieChart} tone="mint" hint="Balanced ledger" />
            <KpiCard
               label="Balance Check"
               value={trialBalance.isBalanced ? "Balanced" : "Out of balance"}
               icon={trialBalance.isBalanced ? FiCheckCircle : FiXCircle}
               tone={trialBalance.isBalanced ? "mint" : "danger"}
               hint={trialBalance.isBalanced ? "Debits equal credits" : "Review journal entries"}
            />
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Debit vs Credit" subtitle="Ledger totals" icon={FiPieChart} className="lg:col-span-1">
               <DonutChart
                  data={[
                     { name: "Debit", value: Number(trialBalance.totalDebit || 0), color: "#2A7B9B" },
                     { name: "Credit", value: Number(trialBalance.totalCredit || 0), color: "#57C785" },
                  ]}
                  size={150}
                  centerLabel="Total"
                  valueFormat={(v) => money(v)}
               />
            </ChartCard>
            <div className="surface-card p-4 lg:col-span-2">
               <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search accounts…" className="sm:max-w-xs" />
               <p className="mt-2 text-xs text-ink-500">Showing {rows.length} of {(trialBalance.accounts || []).length} accounts.</p>
            </div>
         </div>

         <TableShell>
            <TableWrap>
               <table className="data-table min-w-[760px]">
                  <thead><tr><th>Code</th><th>Account</th><th>Category</th><th className="text-center">Type</th><th className="text-right">Debit</th><th className="text-right">Credit</th></tr></thead>
                  <tbody>
                     {rows.map((row, idx) => (
                        <tr key={idx}>
                           <td className="font-mono font-semibold">{row.code}</td>
                           <td className="font-medium text-ink-900">{row.account}</td>
                           <td className="text-ink-500">{row.category}</td>
                           <td className="text-center capitalize text-ink-500">{row.type}</td>
                           <td className="text-right font-mono">{row.debit > 0 ? money(row.debit) : "—"}</td>
                           <td className="text-right font-mono">{row.credit > 0 ? money(row.credit) : "—"}</td>
                        </tr>
                     ))}
                  </tbody>
                  <tfoot>
                     <tr className="bg-canvas/60 font-bold">
                        <td colSpan={4} className="p-3 text-sm">Totals</td>
                        <td className="p-3 text-right font-mono text-sm">{money(trialBalance.totalDebit)}</td>
                        <td className="p-3 text-right font-mono text-sm">{money(trialBalance.totalCredit)}</td>
                     </tr>
                  </tfoot>
               </table>
            </TableWrap>
            {rows.length === 0 && <EmptyState title="No accounts" message="No accounts match this search." />}
         </TableShell>
      </div>
   );
}
