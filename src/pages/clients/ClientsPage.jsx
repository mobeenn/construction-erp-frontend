import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiTrash2, FiUsers } from "react-icons/fi";

import { getClients, createClient, deleteClient } from "../../services/clientService";
import { useToast } from "../../components/ui/ToastContext";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput } from "../../components/ui/Controls";
import { EmptyState, TableSkeleton } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";
import { TableHead, TableShell, TableWrap, Avatar, RowActions } from "../../components/ui/TableShell";

const empty = { name: "", contactPerson: "", phone: "", email: "", address: "", taxNo: "" };

export default function ClientsPage() {
   const toast = useToast();
   const { user } = useAuth();
   const canManage = user?.role === "admin";

   const [clients, setClients] = useState([]);
   const [search, setSearch] = useState("");
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);
   const [form, setForm] = useState(empty);
   const [saving, setSaving] = useState(false);

   const load = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await getClients();
         setClients(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load clients.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createClient(form);
         setForm(empty);
         setOpen(false);
         toast.success("Client created.");
         load(false);
      } catch (err) {
         toast.error(err.response?.data?.message || "Failed to create client.");
      } finally {
         setSaving(false);
      }
   };

   const remove = async (client) => {
      if (!window.confirm(`Delete client "${client.name}"?`)) return;
      try {
         await deleteClient(client._id);
         toast.success("Client deleted.");
         load(false);
      } catch (err) {
         toast.error(err.response?.data?.message || "Failed to delete client.");
      }
   };

   const filtered = clients.filter((c) =>
      `${c.name} ${c.clientCode} ${c.contactPerson}`.toLowerCase().includes(search.toLowerCase()),
   );

   return (
      <div className="space-y-4">
         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search clients…"
               className="sm:max-w-sm"
            />
            {canManage && (
               <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
                  New Client
               </Button>
            )}
         </div>

         {loading ? (
            <TableSkeleton rows={5} cols={5} />
         ) : filtered.length === 0 ? (
            <TableShell>
               <EmptyState
                  icon={FiUsers}
                  title="No clients found"
                  message="Add a client or adjust your search."
                  action={canManage ? <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>New Client</Button> : null}
               />
            </TableShell>
         ) : (
            <TableShell>
               <TableHead title="Clients" subtitle={`${filtered.length} clients`} icon={FiUsers} />
               <TableWrap>
                  <table className="data-table">
                     <thead>
                        <tr>
                           <th>Client</th>
                           <th>Contact</th>
                           <th>Phone</th>
                           <th>Email</th>
                           <th>Status</th>
                           {canManage && <th className="text-right">Actions</th>}
                        </tr>
                     </thead>
                     <tbody>
                        {filtered.map((c) => (
                           <tr key={c._id}>
                              <td>
                                 <div className="flex items-center gap-3">
                                    <Avatar name={c.name} />
                                    <div className="min-w-0">
                                       <Link
                                          to={`/clients/${c._id}`}
                                          className="block truncate font-semibold text-ink-900 hover:text-brand-500"
                                       >
                                          {c.name}
                                       </Link>
                                       <span className="text-xs text-ink-500">{c.clientCode}</span>
                                    </div>
                                 </div>
                              </td>
                              <td>{c.contactPerson || "—"}</td>
                              <td>{c.phone || "—"}</td>
                              <td className="text-ink-500">{c.email || "—"}</td>
                              <td>
                                 <StatusBadge status={c.status || "active"} />
                              </td>
                              {canManage && (
                                 <td>
                                    <RowActions>
                                       <button
                                          type="button"
                                          onClick={() => remove(c)}
                                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-[rgba(224,82,82,0.1)] hover:text-[#c23b3b]"
                                          aria-label="Delete client"
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
            title="New Client"
            subtitle="Register a client company."
            size="lg"
         >
            <form onSubmit={submit} className="space-y-5">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Client name">
                     <input className="input" placeholder="Company name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </Field>
                  <Field label="Contact person">
                     <input className="input" placeholder="Full name" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                  </Field>
                  <Field label="Phone">
                     <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </Field>
                  <Field label="Email">
                     <input className="input" type="email" placeholder="name@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </Field>
                  <Field label="Tax number">
                     <input className="input" placeholder="Tax no" value={form.taxNo} onChange={(e) => setForm({ ...form, taxNo: e.target.value })} />
                  </Field>
                  <Field label="Address">
                     <input className="input" placeholder="Street, city" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </Field>
               </div>
               <div className="flex justify-end">
                  <Button type="submit" variant="primary" loading={saving}>
                     Add Client
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
