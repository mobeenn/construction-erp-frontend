import { useEffect, useState } from "react";
import { FiDollarSign, FiPlus } from "react-icons/fi";

import {
   getInterimPayments,
   createInterimPayment,
   updateInterimPaymentStatus,
} from "../../services/interimPaymentService";
import { getProjects } from "../../services/projectService";
import api from "../../api/axios";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput, FilterSelect } from "../../components/ui/Controls";
import { EmptyState, TableSkeleton } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";
import { TableHead, TableShell, TableWrap, RowActions } from "../../components/ui/TableShell";
import { formatMoney } from "../../utils/format";

const STATUS_OPTIONS = [
   { value: "", label: "All statuses" },
   ...["draft", "submitted", "under_review", "approved", "partially_paid", "paid", "rejected"].map(
      (s) => ({ value: s, label: s.replace(/_/g, " ") }),
   ),
];

const emptyForm = {
   project: "",
   currentGrossAmount: "",
   periodFrom: "",
   periodTo: "",
   advanceRecovery: "",
   retention: "",
   tax: "",
   otherDeductions: "",
   description: "",
};

const nextActions = {
   draft: [["submitted", "Submit"]],
   submitted: [["under_review", "Review"], ["rejected", "Reject"]],
   under_review: [["approved", "Approve"], ["rejected", "Reject"]],
   approved: [],
   partially_paid: [],
};

export default function InterimPaymentsPage() {
   const toast = useToast();
   const [bills, setBills] = useState([]);
   const [projects, setProjects] = useState([]);
   const [filters, setFilters] = useState({ project: "", status: "" });
   const [search, setSearch] = useState("");
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);
   const [payTarget, setPayTarget] = useState(null);
   const [payAmount, setPayAmount] = useState("");
   const [saving, setSaving] = useState(false);
   const [form, setForm] = useState(emptyForm);

   const load = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const params = new URLSearchParams(
            Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
         ).toString();
         const res = await api.get(`/interim-payments?${params}`);
         setBills(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load interim payments.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      getProjects().then((r) => setProjects(r.data.data || [])).catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filters.project, filters.status]);

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createInterimPayment({
            project: form.project,
            currentGrossAmount: Number(form.currentGrossAmount),
            periodFrom: form.periodFrom,
            periodTo: form.periodTo,
            advanceRecovery: Number(form.advanceRecovery || 0),
            retention: Number(form.retention || 0),
            tax: Number(form.tax || 0),
            otherDeductions: Number(form.otherDeductions || 0),
            description: form.description,
         });
         setForm(emptyForm);
         setOpen(false);
         toast.success("Interim payment created.");
         load(false);
      } catch (err) {
         toast.error(err.response?.data?.message || "Failed to create interim payment.");
      } finally {
         setSaving(false);
      }
   };

   const setStatus = async (id, status) => {
      try {
         await updateInterimPaymentStatus(id, status);
         toast.success(`Payment marked ${status.replace(/_/g, " ")}.`);
         load(false);
      } catch (err) {
         toast.error(err.response?.data?.message || "Transition not allowed.");
      }
   };

   const recordPay = async () => {
      try {
         await api.put(`/interim-payments/${payTarget._id}/pay`, { amount: Number(payAmount) });
         toast.success("Payment recorded.");
         setPayAmount("");
         setPayTarget(null);
         load(false);
      } catch (err) {
         toast.error(err.response?.data?.message || "Payment failed.");
      }
   };

   const filtered = bills.filter((b) =>
      `${b.paymentNo} ${b.project?.name}`.toLowerCase().includes(search.toLowerCase()),
   );

   const totals = filtered.reduce(
      (acc, b) => ({
         gross: acc.gross + Number(b.currentGrossAmount || 0),
         approved: acc.approved + Number(b.approvedAmount || 0),
         outstanding: acc.outstanding + Number(b.outstandingAmount || 0),
      }),
      { gross: 0, approved: 0, outstanding: 0 },
   );

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard label="Gross Billed" value={totals.gross} tone="brand" />
            <SummaryCard label="Approved" value={totals.approved} tone="mint" />
            <SummaryCard label="Outstanding" value={totals.outstanding} tone="amber" />
         </div>

         <div className="surface-card flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
               <SearchInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search payments…"
                  className="sm:max-w-xs"
               />
               <FilterSelect
                  value={filters.project}
                  onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                  options={[
                     { value: "", label: "All projects" },
                     ...projects.map((p) => ({ value: p._id, label: p.name })),
                  ]}
                  className="sm:max-w-[12rem]"
               />
               <FilterSelect
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  options={STATUS_OPTIONS}
                  className="sm:max-w-[12rem]"
               />
            </div>
            <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
               New Bill
            </Button>
         </div>

         {loading ? (
            <TableSkeleton rows={5} cols={7} />
         ) : filtered.length === 0 ? (
            <TableShell>
               <EmptyState
                  icon={FiDollarSign}
                  title="No interim payments"
                  message="Create a running bill or adjust your filters."
               />
            </TableShell>
         ) : (
            <TableShell>
               <TableHead
                  title="Interim Payments"
                  subtitle={`${filtered.length} bills`}
                  icon={FiDollarSign}
               />
               <TableWrap>
                  <table className="data-table">
                     <thead>
                        <tr>
                           <th>Bill No</th>
                           <th>Project</th>
                           <th>Period</th>
                           <th>Gross</th>
                           <th>Approved</th>
                           <th>Outstanding</th>
                           <th>Status</th>
                           <th className="text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filtered.map((b) => (
                           <tr key={b._id}>
                              <td className="font-semibold text-ink-900">{b.paymentNo || "—"}</td>
                              <td>{b.project?.name || "—"}</td>
                              <td className="text-xs text-ink-500">
                                 {b.periodFrom || "—"} → {b.periodTo || "—"}
                              </td>
                              <td>{formatMoney(b.currentGrossAmount)}</td>
                              <td className="font-semibold text-ink-900">
                                 {formatMoney(b.approvedAmount)}
                              </td>
                              <td>{formatMoney(b.outstandingAmount)}</td>
                              <td>
                                 <StatusBadge status={b.status} />
                              </td>
                              <td>
                                 <RowActions>
                                    {(nextActions[b.status] || []).map(([s, label]) => (
                                       <button
                                          key={s}
                                          type="button"
                                          onClick={() => setStatus(b._id, s)}
                                          className={`btn btn-secondary btn-sm ${
                                             s === "rejected" ? "!text-[#c23b3b]" : ""
                                          }`}
                                       >
                                          {label}
                                       </button>
                                    ))}
                                    {["approved", "partially_paid"].includes(b.status) && (
                                       <button
                                          type="button"
                                          onClick={() => setPayTarget(b)}
                                          className="btn btn-secondary btn-sm !text-[#1b7f56]"
                                       >
                                          Record Payment
                                       </button>
                                    )}
                                 </RowActions>
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
            title="New Interim Payment"
            subtitle="Create a running bill for a project."
            size="lg"
         >
            <form onSubmit={submit} className="space-y-5">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Project">
                     <select className="select" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} required>
                        <option value="">Select project</option>
                        {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                     </select>
                  </Field>
                  <Field label="Gross amount">
                     <input type="number" className="input" placeholder="0" value={form.currentGrossAmount} onChange={(e) => setForm({ ...form, currentGrossAmount: e.target.value })} required />
                  </Field>
                  <Field label="Period from">
                     <input type="date" className="input" value={form.periodFrom} onChange={(e) => setForm({ ...form, periodFrom: e.target.value })} />
                  </Field>
                  <Field label="Period to">
                     <input type="date" className="input" value={form.periodTo} onChange={(e) => setForm({ ...form, periodTo: e.target.value })} />
                  </Field>
                  <Field label="Advance recovery">
                     <input type="number" className="input" placeholder="0" value={form.advanceRecovery} onChange={(e) => setForm({ ...form, advanceRecovery: e.target.value })} />
                  </Field>
                  <Field label="Retention">
                     <input type="number" className="input" placeholder="0" value={form.retention} onChange={(e) => setForm({ ...form, retention: e.target.value })} />
                  </Field>
                  <Field label="Tax">
                     <input type="number" className="input" placeholder="0" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} />
                  </Field>
                  <Field label="Other deductions">
                     <input type="number" className="input" placeholder="0" value={form.otherDeductions} onChange={(e) => setForm({ ...form, otherDeductions: e.target.value })} />
                  </Field>
               </div>
               <Field label="Description">
                  <input className="input" placeholder="Notes" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
               </Field>
               <div className="flex justify-end">
                  <Button type="submit" variant="primary" loading={saving}>
                     Create Bill
                  </Button>
               </div>
            </form>
         </Modal>

         <Modal
            isOpen={Boolean(payTarget)}
            onClose={() => setPayTarget(null)}
            title="Record Payment"
            subtitle={payTarget ? `${payTarget.paymentNo} · ${payTarget.project?.name || ""}` : ""}
            size="sm"
         >
            <div className="space-y-4">
               <label className="block">
                  <span className="field-label">Amount</span>
                  <input
                     type="number"
                     className="input"
                     placeholder="0"
                     value={payAmount}
                     onChange={(e) => setPayAmount(e.target.value)}
                  />
               </label>
               <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setPayTarget(null)}>
                     Cancel
                  </Button>
                  <Button variant="primary" onClick={recordPay}>
                     Record Payment
                  </Button>
               </div>
            </div>
         </Modal>
      </div>
   );
}

function SummaryCard({ label, value, tone }) {
   const tones = {
      brand: "bg-brand-50 text-brand-500",
      mint: "bg-mint-50 text-mint-600",
      amber: "bg-[rgba(217,164,65,0.13)] text-[#9a721f]",
   };
   return (
      <div className="surface-card card-hover flex items-center gap-3 p-4">
         <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`}>
            <FiDollarSign size={19} />
         </span>
         <div>
            <p className="font-display text-lg font-extrabold text-ink-900">{formatMoney(value, { compact: true })}</p>
            <p className="text-[0.75rem] font-medium text-ink-500">{label}</p>
         </div>
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
