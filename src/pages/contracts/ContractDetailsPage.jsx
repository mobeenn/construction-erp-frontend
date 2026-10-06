import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiDollarSign, FiFileText, FiFolder, FiLayers, FiPieChart } from "react-icons/fi";
import { getContract } from "../../services/contractService";
import { useToast } from "../../components/ui/ToastContext";
import { ProgressBar, formatCurrency } from "../../components/charts/Charts";
import { KpiCard, PageHeader } from "../../components/dashboard/widgets";
import Button from "../../components/ui/Button";
import { ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap } from "../../components/ui/TableShell";
import StatusBadge from "../../components/ui/StatusBadge";

const money = (v) => formatCurrency(v).replace("PKR ", "");

export default function ContractDetailsPage() {
   const { id } = useParams();
   const toast = useToast();
   const [contract, setContract] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);

   const load = async () => {
      setLoading(true);
      setError(false);
      try {
         const r = await getContract(id);
         setContract(r.data.data);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load contract.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [id]);

   if (loading) return <TableSkeleton rows={6} cols={4} />;
   if (error || !contract) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load this contract." onRetry={load} />
         </div>
      );
   }

   const s = contract.summary || {};
   const billed = Number(s.billed || 0);
   const revised = Number(s.revisedValue || s.contractValue || contract.value || 0);
   const billedPct = revised > 0 ? Math.min((billed / revised) * 100, 100) : 0;
   const bills = contract.bills || [];
   const docs = contract.documents || [];

   return (
      <div className="space-y-4">
         <PageHeader
            title={`${contract.contractNo || "Contract"} · ${contract.title || ""}`}
            subtitle={`${String(contract.type || "—").replaceAll("_", " ")} · ${contract.client?.name || "—"}`}
            actions={
               <Link to="/contracts">
                  <Button variant="secondary" icon={FiArrowLeft}>Back to contracts</Button>
               </Link>
            }
         />

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Revised Value" value={money(revised)} icon={FiDollarSign} tone="brand" hint={`Base ${money(contract.value)}`} />
            <KpiCard label="Billed" value={money(billed)} icon={FiFileText} tone="mint" hint={`${Math.round(billedPct)}% of revised`} />
            <KpiCard label="Received" value={money(s.received || 0)} icon={FiPieChart} tone="sun" hint={`Outstanding ${money(s.outstanding || 0)}`} />
            <KpiCard label="Status" value={String(contract.status || "—").replaceAll("_", " ")} icon={FiLayers} tone="neutral" hint={`${bills.length} interim bills`} />
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="surface-card space-y-2.5 p-5 lg:col-span-1">
               <h3 className="font-bold text-ink-900">Contract details</h3>
               <Detail label="Client" value={contract.client?.name} />
               <Detail
                  label="Project"
                  value={contract.project?.name}
                  to={contract.project?._id ? `/projects/${contract.project._id}` : undefined}
               />
               <Detail label="Title" value={contract.title} />
               <Detail label="Contract value" value={money(contract.value)} mono />
               <Detail label="Approved variations" value={money(contract.approvedVariations)} mono />
               <Detail label="Schedule" value={`${contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "—"} → ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "—"}`} />
               <Detail label="Retention" value={`${contract.retentionPercent ?? "—"}% · Advance ${contract.advancePercentage ?? "—"}%`} />
               <Detail label="Payment terms" value={contract.paymentTerms || "—"} />
               <Detail label="Tax" value={contract.tax != null ? `${contract.tax}%` : "—"} />
               <div className="flex items-center justify-between border-t border-line pt-2.5">
                  <span className="text-sm text-ink-500">Status</span>
                  <StatusBadge status={contract.status} />
               </div>
               {contract.notes && <p className="rounded-xl bg-canvas p-3 text-xs text-ink-500">{contract.notes}</p>}
            </div>

            <div className="surface-card p-5 lg:col-span-2">
               <h3 className="font-bold text-ink-900">Financial summary</h3>
               <p className="text-xs text-ink-500">Billing progress against the revised contract value.</p>
               <div className="mt-3">
                  <ProgressBar value={billedPct} gradient label={`${money(billed)} billed of ${money(revised)}`} />
               </div>
               <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniStat label="Revised value" value={money(revised)} />
                  <MiniStat label="Advance" value={money(s.advanceAmount)} />
                  <MiniStat label="Received" value={money(s.received)} />
                  <MiniStat label="Outstanding" value={money(s.outstanding)} danger />
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <TableShell className="lg:col-span-2">
               <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <h3 className="flex items-center gap-2 font-bold text-ink-900"><FiFileText size={16} className="text-brand-500" /> Interim bills</h3>
                  <span className="badge badge-brand">{bills.length} bills</span>
               </div>
               <TableWrap>
                  <table className="data-table min-w-[560px]">
                     <thead><tr><th>No</th><th className="text-right">Gross</th><th className="text-right">Retention</th><th className="text-right">Net</th><th className="text-center">Status</th></tr></thead>
                     <tbody>
                        {bills.map((b) => (
                           <tr key={b._id}>
                              <td className="font-mono font-semibold text-ink-900">{b.paymentNo}</td>
                              <td className="text-right font-mono">{money(b.grossAmount)}</td>
                              <td className="text-right font-mono">{money(b.retention)}</td>
                              <td className="text-right font-mono font-bold">{money(b.netAmount)}</td>
                              <td className="text-center"><StatusBadge status={b.status} /></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
               {bills.length === 0 && <p className="py-8 text-center text-sm text-ink-400">No interim bills raised yet.</p>}
            </TableShell>

            <div className="surface-card p-5">
               <h3 className="flex items-center gap-2 font-bold text-ink-900"><FiFolder size={16} className="text-brand-500" /> Documents</h3>
               <div className="mt-3 space-y-2">
                  {docs.length === 0 && <p className="py-6 text-center text-sm text-ink-400">No documents attached.</p>}
                  {docs.map((d, i) => (
                     <div key={i} className="flex items-center gap-2.5 rounded-xl border border-line p-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500"><FiFileText size={15} /></span>
                        <div className="min-w-0">
                           {d.url ? <a href={d.url} className="truncate text-sm font-semibold text-brand-500 hover:underline">{d.name}</a> : <p className="truncate text-sm font-semibold text-ink-900">{d.name}</p>}
                           <p className="text-xs text-ink-400">Attachment {i + 1}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}

function Detail({ label, value, to, mono = false }) {
   return (
      <div className="flex items-center justify-between gap-3 text-sm">
         <span className="shrink-0 text-ink-500">{label}</span>
         {to ? (
            <Link to={to} className={`truncate font-medium text-brand-500 hover:underline ${mono ? "font-mono" : ""}`}>{value || "—"}</Link>
         ) : (
            <span className={`truncate font-medium text-ink-900 ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
         )}
      </div>
   );
}

function MiniStat({ label, value, danger = false }) {
   return (
      <div className="rounded-2xl border border-line bg-canvas/60 p-3">
         <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
         <p className={`mt-1 font-display text-sm font-extrabold ${danger ? "text-[#c23b3b]" : "text-ink-900"}`}>{value ?? "—"}</p>
      </div>
   );
}
