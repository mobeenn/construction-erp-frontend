import { useEffect, useState } from "react";
import { FiFileText, FiPlus } from "react-icons/fi";

import api from "../../api/axios";
import { getProjects } from "../../services/projectService";
import { useToast } from "../../components/ui/ToastContext";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { EmptyState, TableSkeleton } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";
import { TableHead, TableShell, TableWrap } from "../../components/ui/TableShell";

const empty = { project: "", dueDate: "", remarks: "", itemsText: "Cement:200:bags\nSand:50:tons" };

export default function RFQsPage() {
   const toast = useToast();
   const { user } = useAuth();
   const canCreate = ["admin", "purchase_manager"].includes(user?.role);

   const [rfqs, setRfqs] = useState([]);
   const [projects, setProjects] = useState([]);
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);
   const [saving, setSaving] = useState(false);
   const [form, setForm] = useState(empty);

   const load = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await api.get("/rfqs");
         setRfqs(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load RFQs.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
      getProjects().then((r) => setProjects(r.data.data || [])).catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         const items = form.itemsText
            .split("\n")
            .filter(Boolean)
            .map((line) => {
               const [materialName, quantity, unit] = line.split(":");
               return { materialName, quantity: Number(quantity), unit: unit || "" };
            });
         await api.post("/rfqs", {
            project: form.project,
            dueDate: form.dueDate,
            remarks: form.remarks,
            items,
         });
         setForm(empty);
         setOpen(false);
         toast.success("RFQ created.");
         load(false);
      } catch (err) {
         toast.error(err.response?.data?.message || "Failed to create RFQ.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <div className="space-y-4">
         <div className="surface-card flex items-center justify-between p-4">
            <div>
               <h2 className="text-[0.95rem] font-bold text-ink-900">Requests for Quotation</h2>
               <p className="text-xs text-ink-500">Request prices from vendors for project materials.</p>
            </div>
            {canCreate && (
               <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
                  New RFQ
               </Button>
            )}
         </div>

         {loading ? (
            <TableSkeleton rows={4} cols={5} />
         ) : rfqs.length === 0 ? (
            <TableShell>
               <EmptyState
                  icon={FiFileText}
                  title="No RFQs yet"
                  message="Create a request for quotation to invite vendor bids."
               />
            </TableShell>
         ) : (
            <TableShell>
               <TableHead title="RFQ Register" subtitle={`${rfqs.length} requests`} icon={FiFileText} />
               <TableWrap>
                  <table className="data-table">
                     <thead>
                        <tr>
                           <th>RFQ No</th>
                           <th>Project</th>
                           <th>Items</th>
                           <th>Due Date</th>
                           <th>Status</th>
                        </tr>
                     </thead>
                     <tbody>
                        {rfqs.map((r) => (
                           <tr key={r._id}>
                              <td className="font-semibold text-ink-900">{r.rfqNo || "—"}</td>
                              <td>{r.project?.name || "—"}</td>
                              <td className="max-w-xs truncate text-ink-500">
                                 {(r.items || [])
                                    .map((i) => `${i.materialName} ×${i.quantity}`)
                                    .join(", ") || "—"}
                              </td>
                              <td>{r.dueDate || "—"}</td>
                              <td>
                                 <StatusBadge status={r.status} />
                              </td>
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
            title="New RFQ"
            subtitle="Create a request for quotation."
            size="md"
         >
            <form onSubmit={submit} className="space-y-5">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Project">
                     <select className="select" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
                        <option value="">Select project</option>
                        {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                     </select>
                  </Field>
                  <Field label="Due date">
                     <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                  </Field>
               </div>
               <Field label="Remarks">
                  <input className="input" placeholder="Optional note" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
               </Field>
               <Field label="Items (Material:Qty:Unit, one per line)">
                  <textarea className="textarea" rows={4} placeholder="Cement:200:bags" value={form.itemsText} onChange={(e) => setForm({ ...form, itemsText: e.target.value })} />
               </Field>
               <div className="flex justify-end">
                  <Button type="submit" variant="primary" loading={saving}>
                     Create RFQ
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
