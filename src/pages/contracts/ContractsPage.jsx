import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";

import { getContracts, createContract, deleteContract } from "../../services/contractService";
import { getProjects } from "../../services/projectService";
import { getClients } from "../../services/clientService";
import { useToast } from "../../components/ui/ToastContext";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { EmptyState, TableSkeleton } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";
import { TableHead, TableShell, TableWrap, RowActions } from "../../components/ui/TableShell";
import { formatMoney } from "../../utils/format";

const empty = {
   type: "client",
   client: "",
   project: "",
   title: "",
   value: "",
   retentionPercent: "",
   advancePercentage: "",
   paymentTerms: "",
   tax: "",
   approvedVariations: "",
   startDate: "",
   endDate: "",
   status: "draft",
   terms: "",
};

export default function ContractsPage() {
   const toast = useToast();
   const { user } = useAuth();
   const canManage = user?.role === "admin";

   const [contracts, setContracts] = useState([]);
   const [projects, setProjects] = useState([]);
   const [clients, setClients] = useState([]);
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);
   const [saving, setSaving] = useState(false);
   const [form, setForm] = useState(empty);

   const load = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await getContracts();
         setContracts(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load contracts.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
      getProjects().then((r) => setProjects(r.data.data || [])).catch(() => {});
      getClients().then((r) => setClients(r.data.data || [])).catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createContract({
            ...form,
            value: Number(form.value),
            retentionPercent: Number(form.retentionPercent || 0),
            advancePercentage: Number(form.advancePercentage || 0),
            tax: Number(form.tax || 0),
            approvedVariations: Number(form.approvedVariations || 0),
            client: form.type === "client" ? form.client || null : null,
         });
         setForm(empty);
         setOpen(false);
         toast.success("Contract created.");
         load(false);
      } catch (err) {
         toast.error(err.response?.data?.message || "Failed to create contract.");
      } finally {
         setSaving(false);
      }
   };

   const remove = async (contract) => {
      if (!window.confirm("Delete this contract?")) return;
      try {
         await deleteContract(contract._id);
         toast.success("Contract deleted.");
         load(false);
      } catch (err) {
         toast.error(err.response?.data?.message || "Failed to delete contract.");
      }
   };

   return (
      <div className="space-y-4">
         <div className="surface-card flex items-center justify-between p-4">
            <div>
               <h2 className="text-[0.95rem] font-bold text-ink-900">Contracts</h2>
               <p className="text-xs text-ink-500">Client contracts and subcontracts with retention.</p>
            </div>
            {canManage && (
               <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
                  New Contract
               </Button>
            )}
         </div>

         {loading ? (
            <TableSkeleton rows={5} cols={6} />
         ) : contracts.length === 0 ? (
            <TableShell>
               <EmptyState
                  icon={FiFileText}
                  title="No contracts yet"
                  message="Create a client contract or subcontract to get started."
                  action={canManage ? <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>New Contract</Button> : null}
               />
            </TableShell>
         ) : (
            <TableShell>
               <TableHead title="Contract Register" subtitle={`${contracts.length} contracts`} icon={FiFileText} />
               <TableWrap>
                  <table className="data-table">
                     <thead>
                        <tr>
                           <th>Contract No</th>
                           <th>Type</th>
                           <th>Client</th>
                           <th>Project</th>
                           <th>Value</th>
                           <th>Retention</th>
                           <th>Status</th>
                           {canManage && <th className="text-right">Actions</th>}
                        </tr>
                     </thead>
                     <tbody>
                        {contracts.map((c) => (
                           <tr key={c._id}>
                              <td className="font-semibold text-ink-900">{c.contractNo || "—"}</td>
                              <td>
                                 <span className="badge badge-neutral">{c.type || "—"}</span>
                              </td>
                              <td>{c.client?.name || "—"}</td>
                              <td>
                                 <Link
                                    to={`/contracts/${c._id}`}
                                    className="font-medium text-brand-500 hover:underline"
                                 >
                                    {c.project?.name || "—"}
                                 </Link>
                              </td>
                              <td className="font-semibold text-ink-900">
                                 {formatMoney(c.value, { compact: true })}
                              </td>
                              <td>{c.retentionPercent || 0}%</td>
                              <td>
                                 <StatusBadge status={c.status} />
                              </td>
                              {canManage && (
                                 <td>
                                    <RowActions>
                                       <button
                                          type="button"
                                          onClick={() => remove(c)}
                                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-[rgba(224,82,82,0.1)] hover:text-[#c23b3b]"
                                          aria-label="Delete contract"
                                       >
                                          <FiTrash2 size={15} />
                                       </button>
                                    </RowActions>
                                 </td>
                              )}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
            </TableShell>
         )}

         <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="New Contract"
            subtitle="Create a client contract or subcontract."
            size="lg"
         >
            <form onSubmit={submit} className="space-y-5">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Contract type">
                     <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                        <option value="client">Client Contract</option>
                        <option value="subcontract">Subcontract</option>
                     </select>
                  </Field>
                  <Field label="Client">
                     <select className="select" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })}>
                        <option value="">Select client</option>
                        {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                     </select>
                  </Field>
                  <Field label="Project">
                     <select className="select" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
                        <option value="">Select project</option>
                        {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                     </select>
                  </Field>
                  <Field label="Title">
                     <input className="input" placeholder="Contract title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </Field>
                  <Field label="Value">
                     <input type="number" className="input" placeholder="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                  </Field>
                  <Field label="Retention %">
                     <input type="number" className="input" placeholder="0" value={form.retentionPercent} onChange={(e) => setForm({ ...form, retentionPercent: e.target.value })} />
                  </Field>
                  <Field label="Advance %">
                     <input type="number" className="input" placeholder="0" value={form.advancePercentage} onChange={(e) => setForm({ ...form, advancePercentage: e.target.value })} />
                  </Field>
                  <Field label="Tax %">
                     <input type="number" className="input" placeholder="0" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} />
                  </Field>
                  <Field label="Approved variations">
                     <input type="number" className="input" placeholder="0" value={form.approvedVariations} onChange={(e) => setForm({ ...form, approvedVariations: e.target.value })} />
                  </Field>
                  <Field label="Status">
                     <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        {["draft", "submitted", "approved", "active", "suspended", "completed", "terminated"].map((s) => (
                           <option key={s} value={s}>{s}</option>
                        ))}
                     </select>
                  </Field>
                  <Field label="Start date">
                     <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </Field>
                  <Field label="End date">
                     <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </Field>
                  <Field label="Payment terms">
                     <input className="input" placeholder="e.g. Net 30" value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} />
                  </Field>
               </div>
               <div className="flex justify-end">
                  <Button type="submit" variant="primary" loading={saving}>
                     Add Contract
                  </Button>
               </div>
            </form>
         </Modal>
      </div>
   );
}

function Field({ label, children }) {
   return (
      <label className="block">
         <span className="field-label">{label}</span>
         {children}
      </label>
   );
}
