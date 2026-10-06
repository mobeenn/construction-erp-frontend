import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiBriefcase, FiDollarSign, FiFileText, FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import { getClient } from "../../services/clientService";
import { useToast } from "../../components/ui/ToastContext";
import { formatCurrency } from "../../components/charts/Charts";
import { KpiCard, PageHeader } from "../../components/dashboard/widgets";
import Button from "../../components/ui/Button";
import { ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap, Avatar } from "../../components/ui/TableShell";
import StatusBadge from "../../components/ui/StatusBadge";

const money = (v) => formatCurrency(v).replace("PKR ", "");

export default function ClientDetailsPage() {
   const { id } = useParams();
   const toast = useToast();
   const [client, setClient] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);

   const load = async () => {
      setLoading(true);
      setError(false);
      try {
         const r = await getClient(id);
         setClient(r.data.data);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load client.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [id]);

   if (loading) return <TableSkeleton rows={6} cols={4} />;
   if (error || !client) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load this client." onRetry={load} />
         </div>
      );
   }

   const projects = client.projects || [];
   const contracts = client.contracts || [];
   const contractValue = projects.reduce((s, p) => s + Number(p.contractValue || p.budget || 0), 0);

   return (
      <div className="space-y-4">
         <PageHeader
            title={client.name}
            subtitle={`${client.clientCode || "—"} · ${client.status ? String(client.status).replaceAll("_", " ") : "Client"}`}
            actions={
               <Link to="/clients">
                  <Button variant="secondary" icon={FiArrowLeft}>Back to clients</Button>
               </Link>
            }
         />

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Projects" value={projects.length} icon={FiBriefcase} tone="brand" hint="Linked sites" />
            <KpiCard label="Contracts" value={contracts.length} icon={FiFileText} tone="mint" hint="Signed agreements" />
            <KpiCard label="Portfolio Value" value={money(contractValue)} icon={FiDollarSign} tone="sun" hint="Across projects" />
            <KpiCard label="Status" value={String(client.status || "—").replaceAll("_", " ")} icon={FiUser} tone="neutral" hint={client.paymentTerms || "Standard terms"} />
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="surface-card p-5 lg:col-span-1">
               <div className="flex items-center gap-3">
                  <Avatar name={client.name} />
                  <div className="min-w-0">
                     <h3 className="truncate font-bold text-ink-900">{client.name}</h3>
                     <StatusBadge status={client.status || "active"} />
                  </div>
               </div>
               <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-ink-700"><FiUser size={14} className="text-ink-400" /><span className="text-ink-500">Contact:</span><span className="ml-auto font-medium text-ink-900">{client.contactPerson || "—"}</span></div>
                  <div className="flex items-center gap-2 text-ink-700"><FiMail size={14} className="text-ink-400" /><span className="text-ink-500">Email:</span><span className="ml-auto truncate font-medium text-ink-900">{client.email || "—"}</span></div>
                  <div className="flex items-center gap-2 text-ink-700"><FiPhone size={14} className="text-ink-400" /><span className="text-ink-500">Phone:</span><span className="ml-auto font-medium text-ink-900">{client.phone || "—"}</span></div>
                  <div className="flex items-start gap-2 text-ink-700"><FiMapPin size={14} className="mt-0.5 text-ink-400" /><span className="text-ink-500">Address:</span><span className="ml-auto max-w-[60%] text-right font-medium text-ink-900">{client.address || "—"}</span></div>
                  <div className="flex justify-between border-t border-line pt-2.5"><span className="text-ink-500">Tax info</span><span className="font-medium text-ink-900">{client.taxInformation || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-ink-500">Payment terms</span><span className="font-medium text-ink-900">{client.paymentTerms || "—"}</span></div>
                  {client.notes && <p className="rounded-xl bg-canvas p-3 text-xs text-ink-500">{client.notes}</p>}
               </dl>
            </div>

            <TableShell className="lg:col-span-2">
               <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <h3 className="font-bold text-ink-900">Projects</h3>
                  <span className="badge badge-brand">{projects.length} total</span>
               </div>
               <TableWrap>
                  <table className="data-table min-w-[560px]">
                     <thead><tr><th>Code</th><th>Name</th><th className="text-center">Status</th><th className="text-right">Value</th></tr></thead>
                     <tbody>
                        {projects.map((p) => (
                           <tr key={p._id}>
                              <td><Link to={`/projects/${p._id}`} className="font-mono font-semibold text-brand-500 hover:underline">{p.projectCode}</Link></td>
                              <td className="font-medium text-ink-900">{p.name}</td>
                              <td className="text-center"><StatusBadge status={p.status} /></td>
                              <td className="text-right font-mono">{money(p.contractValue ?? p.budget ?? 0)}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
               {projects.length === 0 && <p className="py-8 text-center text-sm text-ink-400">No projects linked to this client.</p>}
            </TableShell>
         </div>

         <TableShell>
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
               <h3 className="font-bold text-ink-900">Contracts</h3>
               <span className="badge badge-brand">{contracts.length} total</span>
            </div>
            <TableWrap>
               <table className="data-table min-w-[560px]">
                  <thead><tr><th>No</th><th>Type</th><th className="text-right">Value</th><th className="text-center">Status</th></tr></thead>
                  <tbody>
                     {contracts.map((c) => (
                        <tr key={c._id}>
                           <td><Link to={`/contracts/${c._id}`} className="font-mono font-semibold text-brand-500 hover:underline">{c.contractNo}</Link></td>
                           <td className="capitalize">{String(c.type || "—").replaceAll("_", " ")}</td>
                           <td className="text-right font-mono">{money(c.value)}</td>
                           <td className="text-center"><StatusBadge status={c.status} /></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </TableWrap>
            {contracts.length === 0 && <p className="py-8 text-center text-sm text-ink-400">No contracts for this client yet.</p>}
         </TableShell>
      </div>
   );
}
