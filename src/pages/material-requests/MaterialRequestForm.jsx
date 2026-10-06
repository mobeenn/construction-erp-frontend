import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import { getProjects } from "../../services/projectService";
import { getInventory } from "../../services/inventoryService";
import { createMaterialRequest } from "../../services/materialRequestService";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";

const emptyItem = { inventory: "", quantity: "" };

export default function MaterialRequestForm({ loadRequests }) {
   const toast = useToast();
   const [projects, setProjects] = useState([]);
   const [inventories, setInventories] = useState([]);
   const [saving, setSaving] = useState(false);
   const [form, setForm] = useState({ project: "", remarks: "", items: [{ ...emptyItem }] });

   useEffect(() => {
      getProjects()
         .then((r) => setProjects(r.data.data || []))
         .catch(() => {});
      getInventory()
         .then((r) => setInventories(r.data.data || []))
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

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         const payload = {
            ...form,
            items: form.items.map((item) => ({ ...item, quantity: Number(item.quantity) })),
         };
         await createMaterialRequest(payload);
         toast.success("Material request submitted.");
         setForm({ project: "", remarks: "", items: [{ ...emptyItem }] });
         loadRequests();
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to create request.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <form onSubmit={submit} className="space-y-5">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
               <span className="field-label">Project</span>
               <select name="project" className="select" value={form.project} onChange={handleChange} required>
                  <option value="">Select project</option>
                  {projects.map((item) => (
                     <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
               </select>
            </label>
            <label className="block">
               <span className="field-label">Remarks</span>
               <input name="remarks" className="input" placeholder="Optional note" value={form.remarks} onChange={handleChange} />
            </label>
         </div>

         <div className="space-y-3">
            <div className="flex items-center justify-between">
               <span className="field-label !mb-0">Requested Items</span>
               <Button size="sm" variant="secondary" icon={FiPlus} onClick={addItem} type="button">
                  Add item
               </Button>
            </div>
            {form.items.map((item, index) => (
               <div key={index} className="flex items-end gap-3">
                  <label className="block flex-1">
                     <select
                        className="select"
                        value={item.inventory}
                        onChange={(e) => handleItem(index, "inventory", e.target.value)}
                        required
                     >
                        <option value="">Select material</option>
                        {inventories.map((inv) => (
                           <option key={inv._id} value={inv._id}>
                              {inv.materialName} ({inv.currentStock} {inv.unit})
                           </option>
                        ))}
                     </select>
                  </label>
                  <label className="block w-32">
                     <input
                        className="input"
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItem(index, "quantity", e.target.value)}
                        required
                     />
                  </label>
                  {form.items.length > 1 && (
                     <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-400 transition hover:bg-[rgba(224,82,82,0.1)] hover:text-[#c23b3b]"
                        aria-label="Remove item"
                     >
                        <FiTrash2 size={16} />
                     </button>
                  )}
               </div>
            ))}
         </div>

         <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
               Create Request
            </Button>
         </div>
      </form>
   );
}
