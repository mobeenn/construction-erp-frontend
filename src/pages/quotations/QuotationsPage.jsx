import { useEffect, useState } from "react";
import { FiAward, FiDollarSign, FiPlus } from "react-icons/fi";

import api from "../../api/axios";
import { getVendors } from "../../services/vendorService";
import { useToast } from "../../components/ui/ToastContext";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { EmptyState, TableSkeleton } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";
import { TableHead, TableShell, TableWrap, RowActions } from "../../components/ui/TableShell";
import { formatMoney } from "../../utils/format";

const empty = {
   vendor: "",
   rfq: "",
   item: "",
   quantity: "",
   unitPrice: "",
   tax: "",
   discount: "",
   deliveryTime: "",
   validity: "",
};

export default function QuotationsPage() {
   const toast = useToast();
   const { user } = useAuth();
   const canCreate = ["admin", "purchase_manager", "site_supervisor"].includes(user?.role);

   const [quotations, setQuotations] = useState([]);
   const [rfqs, setRfqs] = useState([]);
   const [vendors, setVendors] = useState([]);
   const [compareRfq, setCompareRfq] = useState("");
   const [comparison, setComparison] = useState(null);
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);
   const [saving, setSaving] = useState(false);
   const [form, setForm] = useState(empty);

   const load = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await api.get("/quotations");
         setQuotations(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load quotations.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
      api.get("/rfqs").then((r) => setRfqs(r.data.data || [])).catch(() => {});
      getVendors().then((r) => setVendors(r.data.data || [])).catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await api.post("/quotations", {
            ...form,
            quantity: Number(form.quantity),
            unitPrice: Number(form.unitPrice),
            tax: Number(form.tax || 0),
            discount: Number(form.discount || 0),
         });
         setForm(empty);
         setOpen(false);
         toast.success("Quotation added.");
         load(false);
      } catch (err) {
         toast.error(err.response?.data?.message || "Failed to add quotation.");
      } finally {
         setSaving(false);
      }
   };

   const compare = async (rfqId) => {
      setCompareRfq(rfqId);
      if (!rfqId) {
         setComparison(null);
         return;
      }
      try {
         const res = await api.get(`/quotations/compare/${rfqId}`);
         setComparison(res.data.data);
      } catch {
         toast.error("Failed to load comparison.");
      }
   };

   const select = async (id) => {
      try {
         await api.put(`/quotations/${id}/select`);
         toast.success("Quotation selected.");
         load(false);
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not select quotation.");
      }
   };

   return (
      <div className="space-y-4">
         <div className="surface-card flex items-center justify-between p-4">
            <div>
               <h2 className="text-[0.95rem] font-bold text-ink-900">Vendor Quotations</h2>
               <p className="text-xs text-ink-500">Compare quotes and select the winning vendor bid.</p>
            </div>
            {canCreate && (
               <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
                  Add Quotation
               </Button>
            )}
         </div>

         {loading ? (
            <TableSkeleton rows={5} cols={7} />
         ) : quotations.length === 0 ? (
            <TableShell>
               <EmptyState
                  icon={FiDollarSign}
                  title="No quotations"
                  message="Add vendor quotations to compare pricing."
               />
            </TableShell>
         ) : (
            <TableShell>
               <TableHead title="Quotations" subtitle={`${quotations.length} quotes`} icon={FiDollarSign} />
               <TableWrap>
                  <table className="data-table">
                     <thead>
                        <tr>
                           <th>Quote No</th>
                           <th>Vendor</th>
                           <th>Item</th>
                           <th>Qty</th>
                           <th>Unit Price</th>
                           <th>Total</th>
                           <th>Status</th>
                           <th className="text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {quotations.map((q) => (
                           <tr key={q._id}>
                              <td className="font-semibold text-ink-900">{q.quotationNo || "—"}</td>
                              <td>{q.vendor?.companyName || "—"}</td>
                              <td>{q.item || "—"}</td>
                              <td>{q.quantity}</td>
                              <td>{formatMoney(q.unitPrice)}</td>
                              <td className="font-semibold text-ink-900">{formatMoney(q.total)}</td>
                              <td>
                                 <StatusBadge status={q.status} />
                              </td>
                              <td>
                                 <RowActions>
                                    {q.status !== "selected" && (
                                       <button
                                          type="button"
                                          onClick={() => select(q._id)}
                                          className="btn btn-secondary btn-sm !text-[#1b7f56]"
                                       >
                                          <FiAward size={13} /> Select
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

         <div className="surface-card p-5">
            <h3 className="text-[0.95rem] font-bold text-ink-900">Quotation Comparison</h3>
            <p className="mb-3 text-xs text-ink-500">Compare vendor quotes side by side for an RFQ.</p>
            <select
               className="select max-w-xs"
               value={compareRfq}
               onChange={(e) => compare(e.target.value)}
            >
               <option value="">Select an RFQ to compare…</option>
               {rfqs.map((r) => (
                  <option key={r._id} value={r._id}>{r.rfqNo}</option>
               ))}
            </select>

            {comparison &&
               Object.entries(comparison).map(([item, quotes]) => (
                  <div key={item} className="mt-5">
                     <h4 className="mb-2 text-sm font-bold text-ink-900">{item}</h4>
                     <div className="table-card overflow-hidden rounded-2xl border border-line">
                        <TableWrap>
                           <table className="data-table">
                              <thead>
                                 <tr>
                                    <th>Vendor</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Tax</th>
                                    <th>Discount</th>
                                    <th>Total</th>
                                    <th>Delivery</th>
                                    <th>Status</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {quotes.map((q, i) => (
                                    <tr key={q._id} className={i === 0 ? "bg-mint-50" : ""}>
                                       <td className="font-semibold text-ink-900">
                                          {q.vendor}
                                          {i === 0 && (
                                             <span className="ml-2 badge badge-success">Best</span>
                                          )}
                                       </td>
                                       <td>{q.quantity}</td>
                                       <td>{formatMoney(q.unitPrice)}</td>
                                       <td>{formatMoney(q.tax)}</td>
                                       <td>{formatMoney(q.discount)}</td>
                                       <td className="font-semibold text-ink-900">{formatMoney(q.total)}</td>
                                       <td>{q.deliveryTime || "—"}</td>
                                       <td>
                                          <StatusBadge status={q.status} />
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </TableWrap>
                     </div>
                  </div>
               ))}
         </div>

         <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Add Quotation"
            subtitle="Record a vendor quotation."
            size="lg"
         >
            <form onSubmit={submit} className="space-y-5">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="RFQ">
                     <select className="select" value={form.rfq} onChange={(e) => setForm({ ...form, rfq: e.target.value })}>
                        <option value="">Select RFQ</option>
                        {rfqs.map((r) => <option key={r._id} value={r._id}>{r.rfqNo}</option>)}
                     </select>
                  </Field>
                  <Field label="Vendor">
                     <select className="select" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })}>
                        <option value="">Select vendor</option>
                        {vendors.map((v) => <option key={v._id} value={v._id}>{v.companyName}</option>)}
                     </select>
                  </Field>
                  <Field label="Item">
                     <input className="input" placeholder="Material" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
                  </Field>
                  <Field label="Quantity">
                     <input type="number" className="input" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                  </Field>
                  <Field label="Unit price">
                     <input type="number" className="input" placeholder="0" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
                  </Field>
                  <Field label="Tax">
                     <input type="number" className="input" placeholder="0" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} />
                  </Field>
                  <Field label="Discount">
                     <input type="number" className="input" placeholder="0" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
                  </Field>
                  <Field label="Delivery time">
                     <input className="input" placeholder="e.g. 7 days" value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} />
                  </Field>
                  <Field label="Validity">
                     <input className="input" placeholder="e.g. 30 days" value={form.validity} onChange={(e) => setForm({ ...form, validity: e.target.value })} />
                  </Field>
               </div>
               <div className="flex justify-end">
                  <Button type="submit" variant="primary" loading={saving}>
                     Add Quotation
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
