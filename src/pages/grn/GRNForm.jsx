import { useEffect, useState } from "react";
import { getPurchaseOrders, createGRN } from "../../services/grnService";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";

export default function GRNForm({ loadGRNs }) {
   const toast = useToast();
   const [purchaseOrders, setPurchaseOrders] = useState([]);
   const [form, setForm] = useState({ purchaseOrder: "", remarks: "" });
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      getPurchaseOrders()
         .then((res) => {
            const approved = (res.data.data || []).filter((po) => po.status === "approved");
            setPurchaseOrders(approved);
         })
         .catch(() => {});
   }, []);

   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createGRN(form);
         toast.success("GRN created and stock updated.");
         setForm({ purchaseOrder: "", remarks: "" });
         loadGRNs();
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to create GRN.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <form onSubmit={submit} className="space-y-5">
         <label className="block">
            <span className="field-label">Approved purchase order</span>
            <select
               name="purchaseOrder"
               className="select"
               value={form.purchaseOrder}
               onChange={handleChange}
               required
            >
               <option value="">Select approved purchase order</option>
               {purchaseOrders.map((po) => (
                  <option key={po._id} value={po._id}>
                     {po.poNumber} — {po.project?.name || ""}
                  </option>
               ))}
            </select>
            {purchaseOrders.length === 0 && (
               <p className="mt-1.5 text-xs text-ink-400">
                  No approved purchase orders available to receive.
               </p>
            )}
         </label>
         <label className="block">
            <span className="field-label">Remarks</span>
            <input
               name="remarks"
               className="input"
               value={form.remarks}
               onChange={handleChange}
               placeholder="Condition, notes…"
            />
         </label>
         <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
               Create GRN
            </Button>
         </div>
      </form>
   );
}
