import { useEffect, useMemo, useState } from "react";
import { FiCreditCard, FiRefreshCw, FiTruck } from "react-icons/fi";
import { getAccountsPayable } from "../../services/accountService";
import { useToast } from "../../components/ui/ToastContext";
import { PageHeader, KpiCard } from "../../components/dashboard/widgets";
import { formatCurrency } from "../../components/charts/Charts";
import Button from "../../components/ui/Button";
import { SearchInput } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap, Avatar } from "../../components/ui/TableShell";

const money = (v) => formatCurrency(v).replace("PKR ", "");

export default function AccountsPayablePage() {
   const toast = useToast();
   const [payables, setPayables] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const [search, setSearch] = useState("");

   const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
         const res = await getAccountsPayable();
         setPayables(res.data.data || []);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load payables.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = useMemo(() => {
      return payables.filter((p) =>
         `${p.vendor?.name || ""} ${p.vendor?.vendorCode || ""}`.toLowerCase().includes(search.toLowerCase()),
      );
   }, [payables, search]);

   const totalPayable = useMemo(() => filtered.reduce((s, p) => s + Number(p.totalAmount || 0), 0), [filtered]);

   if (loading) return <TableSkeleton rows={6} cols={4} />;
   if (error) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load accounts payable." onRetry={loadData} />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <PageHeader
            title="Accounts Payable"
            subtitle="Amounts owed to vendors and subcontractors."
            actions={<Button variant="secondary" icon={FiRefreshCw} onClick={loadData}>Refresh</Button>}
         />

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KpiCard label="Total Payable" value={money(totalPayable)} icon={FiCreditCard} tone="amber" hint={`${filtered.length} vendors`} />
            <KpiCard label="Vendors Awaiting Payment" value={filtered.length} icon={FiTruck} tone="brand" hint="Open balances" />
         </div>

         <div className="surface-card p-4">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors…" className="sm:max-w-xs" />
         </div>

         <TableShell>
            <TableWrap>
               <table className="data-table min-w-[640px]">
                  <thead><tr><th>Vendor</th><th>Code</th><th className="text-right">Outstanding</th><th className="text-center">Payments</th></tr></thead>
                  <tbody>
                     {filtered.map((item, idx) => (
                        <tr key={idx}>
                           <td><span className="flex items-center gap-2.5 font-semibold text-ink-900"><Avatar name={item.vendor?.name || "Unknown"} />{item.vendor?.name || "Unknown"}</span></td>
                           <td className="font-mono text-ink-500">{item.vendor?.vendorCode || "—"}</td>
                           <td className="text-right font-mono font-bold text-[#9a721f]">{money(item.totalAmount)}</td>
                           <td className="text-center"><span className="badge badge-neutral">{item.payments?.length || 0} records</span></td>
                        </tr>
                     ))}
                  </tbody>
                  <tfoot><tr className="bg-canvas/60 font-bold"><td colSpan={2} className="p-3 text-sm">Total ({filtered.length} vendors)</td><td className="p-3 text-right font-mono text-sm">{money(totalPayable)}</td><td /></tr></tfoot>
               </table>
            </TableWrap>
            {filtered.length === 0 && <EmptyState title="No payables" message="No outstanding vendor balances found." />}
         </TableShell>
      </div>
   );
}
