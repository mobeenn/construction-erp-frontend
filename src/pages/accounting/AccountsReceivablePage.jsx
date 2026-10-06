import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiTrendingUp, FiUsers } from "react-icons/fi";
import { getAccountsReceivable } from "../../services/accountService";
import { useToast } from "../../components/ui/ToastContext";
import { PageHeader, KpiCard } from "../../components/dashboard/widgets";
import { formatCurrency } from "../../components/charts/Charts";
import Button from "../../components/ui/Button";
import { SearchInput } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap, Avatar } from "../../components/ui/TableShell";

const money = (v) => formatCurrency(v).replace("PKR ", "");

export default function AccountsReceivablePage() {
   const toast = useToast();
   const [receivables, setReceivables] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const [search, setSearch] = useState("");

   const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
         const res = await getAccountsReceivable();
         setReceivables(res.data.data || []);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load receivables.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = useMemo(() => {
      return receivables.filter((r) =>
         `${r.client?.name || ""} ${r.client?.clientCode || ""}`.toLowerCase().includes(search.toLowerCase()),
      );
   }, [receivables, search]);

   const totalReceivable = useMemo(() => filtered.reduce((s, r) => s + Number(r.totalAmount || 0), 0), [filtered]);

   if (loading) return <TableSkeleton rows={6} cols={4} />;
   if (error) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load accounts receivable." onRetry={loadData} />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <PageHeader
            title="Accounts Receivable"
            subtitle="Amounts owed by clients across open invoices and bills."
            actions={<Button variant="secondary" icon={FiRefreshCw} onClick={loadData}>Refresh</Button>}
         />

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KpiCard label="Total Receivable" value={money(totalReceivable)} icon={FiTrendingUp} tone="brand" hint={`${filtered.length} clients`} />
            <KpiCard label="Clients Owing" value={filtered.length} icon={FiUsers} tone="mint" hint="Open balances" />
         </div>

         <div className="surface-card p-4">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients…" className="sm:max-w-xs" />
         </div>

         <TableShell>
            <TableWrap>
               <table className="data-table min-w-[640px]">
                  <thead><tr><th>Client</th><th>Code</th><th className="text-right">Outstanding</th><th className="text-center">Payments</th></tr></thead>
                  <tbody>
                     {filtered.map((item, idx) => (
                        <tr key={idx}>
                           <td><span className="flex items-center gap-2.5 font-semibold text-ink-900"><Avatar name={item.client?.name || "Unknown"} />{item.client?.name || "Unknown"}</span></td>
                           <td className="font-mono text-ink-500">{item.client?.clientCode || "—"}</td>
                           <td className="text-right font-mono font-bold text-ink-900">{money(item.totalAmount)}</td>
                           <td className="text-center"><span className="badge badge-neutral">{item.payments?.length || 0} records</span></td>
                        </tr>
                     ))}
                  </tbody>
                  <tfoot><tr className="bg-canvas/60 font-bold"><td colSpan={2} className="p-3 text-sm">Total ({filtered.length} clients)</td><td className="p-3 text-right font-mono text-sm">{money(totalReceivable)}</td><td /></tr></tfoot>
               </table>
            </TableWrap>
            {filtered.length === 0 && <EmptyState title="No receivables" message="No outstanding client balances found." />}
         </TableShell>
      </div>
   );
}
