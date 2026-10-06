import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import { getProjects } from "../../services/projectService";
import { getVendors } from "../../services/vendorService";
import { createPurchaseOrder } from "../../services/purchaseOrderService";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";
import { formatMoney } from "../../utils/format";

const emptyItem = { materialName: "", quantity: "", unitPrice: "" };

export default function PurchaseOrderForm({ loadOrders }) {
   const toast = useToast();
   const [projects, setProjects] = useState([]);
   const [vendors, setVendors] = useState([]);
   const [saving, setSaving] = useState(false);
   const [form, setForm] = useState({ vendor: "", project: "", items: [{ ...emptyItem }] });

   useEffect(() => {
      getProjects()
         .then((r) => setProjects(r.data.data || []))
         .catch(() => {});
      getVendors()
         .then((r) => setVendors(r.data.data || []))
         .catch(() => {});
   }, []);

   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

   const handleItem = (index, field, value) => {
      const updated = [...form.items];
      updated[index][field] = value;
      setForm({ ...form, items: updated });
   };

   const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });
   const removeItem = (index) =>
      setForm({ ...form, items: form.items.filter((_, i) => i !== index) });

   const total = form.items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0,
   );

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         const payload = {
            ...form,
            items: form.items.map((item) => ({
               ...item,
               quantity: Number(item.quantity),
               unitPrice: Number(item.unitPrice),
            })),
         };
         await createPurchaseOrder(payload);
         toast.success("Purchase order created.");
         setForm({ vendor: "", project: "", items: [{ ...emptyItem }] });
         loadOrders();
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to create purchase order.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <form onSubmit={submit} className="space-y-5">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
               <span className="field-label">Vendor</span>
               <select name="vendor" className="select" value={form.vendor} onChange={handleChange} required>
                  <option value="">Select vendor</option>
                  {vendors.map((v) => (
                     <option key={v._id} value={v._id}>{v.companyName}</option>
                  ))}
               </select>
            </label>
            <label className="block">
               <span className="field-label">Project</span>
               <select name="project" className="select" value={form.project} onChange={handleChange}>
                  <option value="">Select project</option>
                  {projects.map((p) => (
                     <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
               </select>
            </label>
         </div>

         <div className="space-y-3">
            <div className="flex items-center justify-between">
               <span className="field-label !mb-0">Order Items</span>
               <Button size="sm" variant="secondary" icon={FiPlus} onClick={addItem} type="button">
                  Add item
               </Button>
            </div>
            {form.items.map((item, index) => (
               <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_7rem_9rem_2.5rem]">
                  <input
                     className="input"
                     placeholder="Material"
                     value={item.materialName}
                     onChange={(e) => handleItem(index, "materialName", e.target.value)}
                  />
                  <input
                     className="input"
                     type="number"
                     placeholder="Qty"
                     value={item.quantity}
                     onChange={(e) => handleItem(index, "quantity", e.target.value)}
                  />
                  <input
                     className="input"
                     type="number"
                     placeholder="Unit price"
                     value={item.unitPrice}
                     onChange={(e) => handleItem(index, "unitPrice", e.target.value)}
                  />
                  {form.items.length > 1 ? (
                     <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="grid h-10 w-10 place-items-center rounded-xl text-ink-400 transition hover:bg-[rgba(224,82,82,0.1)] hover:text-[#c23b3b]"
                        aria-label="Remove item"
                     >
                        <FiTrash2 size={16} />
                     </button>
                  ) : (
                     <span />
                  )}
               </div>
            ))}
         </div>

         <div className="flex items-center justify-between rounded-2xl border border-line bg-canvas/60 px-4 py-3">
            <span className="text-sm font-medium text-ink-500">Estimated total</span>
            <span className="font-display text-lg font-extrabold text-ink-900">
               {formatMoney(total)}
            </span>
         </div>

         <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
               Create Purchase Order
            </Button>
         </div>
      </form>
   );
}
