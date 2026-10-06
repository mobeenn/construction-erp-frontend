import { useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiDownload, FiRefreshCw } from "react-icons/fi";
import { getGeneralLedger, getAccounts } from "../../services/accountService";
import { useToast } from "../../components/ui/ToastContext";
import { PageHeader } from "../../components/dashboard/widgets";
import { formatCurrency } from "../../components/charts/Charts";
import Button from "../../components/ui/Button";
import { SearchInput, FilterSelect } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap } from "../../components/ui/TableShell";

const money = (v) => formatCurrency(v).replace("PKR ", "");

export default function GeneralLedgerPage() {
   const toast = useToast();
   const [ledger, setLedger] = useState([]);
   const [accounts, setAccounts] = useState([]);
   const [selectedAccount, setSelectedAccount] = useState("");
   const [search, setSearch] = useState("");
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);

   const loadLedger = async (accountId = "") => {
      setLoading(true);
      setError(false);
      try {
         const res = await getGeneralLedger(accountId ? { account: accountId } : {});
         setLedger(res.data.data || []);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load general ledger.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      (async () => {
         try {
            const res = await getAccounts();
            setAccounts(res.data.data || []);
         } catch (err) {
            toast.error("Could not load accounts.");
         }
      })();
      loadLedger();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = useMemo(() => {
      return ledger.filter((entry) =>
         `${entry.description || ""} ${entry.journalEntry?.reference || ""} ${entry.account?.name || ""}`.toLowerCase().includes(search.toLowerCase()),
      );
   }, [ledger, search]);

   const totals = useMemo(() => {
      return filtered.reduce(
         (acc, e) => ({ debit: acc.debit + Number(e.debit || 0), credit: acc.credit + Number(e.credit || 0) }),
         { debit: 0, credit: 0 },
      );
   }, [filtered]);

   const exportCSV = () => {
      if (!filtered.length) {
         toast.warning("Nothing to export.");
         return;
      }
      const rows = filtered.map((e) => ({
         Date: e.journalEntry?.date ? new Date(e.journalEntry.date).toLocaleDateString() : "",
         Reference: e.journalEntry?.reference || "",
         Account: e.account?.name || "",
         Description: e.description || "",
         Debit: e.debit || 0,
         Credit: e.credit || 0,
      }));
      const headers = Object.keys(rows[0]);
      const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h]).replaceAll('"', '""')}"`).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "general-ledger.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Ledger exported as CSV.");
   };

   if (loading) return <TableSkeleton rows={7} cols={6} />;
   if (error) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load the general ledger." onRetry={() => loadLedger(selectedAccount)} />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <PageHeader
            title="General Ledger"
            subtitle={`Every debit and credit · D ${money(totals.debit)} / C ${money(totals.credit)}`}
            actions={
               <>
                  <Button variant="secondary" icon={FiRefreshCw} onClick={() => loadLedger(selectedAccount)}>Refresh</Button>
                  <Button variant="secondary" icon={FiDownload} onClick={exportCSV}>Export</Button>
               </>
            }
         />

         <div className="surface-card flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
            <FilterSelect
               value={selectedAccount}
               onChange={(e) => { setSelectedAccount(e.target.value); loadLedger(e.target.value); }}
               options={[{ value: "", label: "All accounts" }, ...accounts.map((a) => ({ value: a._id, label: `${a.code} - ${a.name}` }))]}
               className="lg:w-72"
            />
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search narration or reference…" className="lg:max-w-xs" />
            <span className="badge badge-brand ml-auto">{filtered.length} lines</span>
         </div>

         <TableShell>
            <TableWrap>
               <table className="data-table min-w-[820px]">
                  <thead><tr><th>Date</th><th>Reference</th><th>Account</th><th>Narration</th><th className="text-right">Debit</th><th className="text-right">Credit</th></tr></thead>
                  <tbody>
                     {filtered.map((entry, idx) => (
                        <tr key={idx}>
                           <td className="whitespace-nowrap">{entry.journalEntry?.date ? new Date(entry.journalEntry.date).toLocaleDateString() : "—"}</td>
                           <td className="font-mono font-semibold">{entry.journalEntry?.reference || "—"}</td>
                           <td><span className="flex items-center gap-2 font-medium text-ink-900"><span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-500"><FiBookOpen size={13} /></span>{entry.account?.name || "—"}</span></td>
                           <td className="max-w-[260px] truncate text-ink-500">{entry.description || "—"}</td>
                           <td className="text-right font-mono">{Number(entry.debit) > 0 ? money(entry.debit) : "—"}</td>
                           <td className="text-right font-mono">{Number(entry.credit) > 0 ? money(entry.credit) : "—"}</td>
                        </tr>
                     ))}
                  </tbody>
                  <tfoot>
                     <tr className="bg-canvas/60 font-bold">
                        <td colSpan={4} className="p-3 text-sm">Totals ({filtered.length} lines)</td>
                        <td className="p-3 text-right font-mono text-sm">{money(totals.debit)}</td>
                        <td className="p-3 text-right font-mono text-sm">{money(totals.credit)}</td>
                     </tr>
                  </tfoot>
               </table>
            </TableWrap>
            {filtered.length === 0 && <EmptyState title="No ledger lines" message="Try a different account or search term." />}
         </TableShell>
      </div>
   );
}
