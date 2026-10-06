import { useEffect, useState } from "react";

import { createInventory } from "../../services/inventoryService";
import { getProjects } from "../../services/projectService";
import api from "../../api/axios";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";

const empty = {
   project: "",
   warehouse: "",
   materialName: "",
   category: "",
   unit: "",
   unitPrice: "",
   minimumStock: "",
   reorderLevel: "",
   openingQuantity: "",
};

export default function InventoryForm({ loadInventory }) {
   const toast = useToast();
   const [projects, setProjects] = useState([]);
   const [warehouses, setWarehouses] = useState([]);
   const [form, setForm] = useState(empty);
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      getProjects()
         .then((res) => setProjects(res.data.data || []))
         .catch(() => {});
      api
         .get("/warehouses")
         .then((r) => setWarehouses(r.data.data || []))
         .catch(() => {});
   }, []);

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createInventory({
            ...form,
            unitPrice: Number(form.unitPrice),
            minimumStock: Number(form.minimumStock),
         });
         setForm(empty);
         toast.success("Material added to inventory.");
         loadInventory();
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to add material.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <form onSubmit={submit} className="space-y-5">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Project">
               <select name="project" className="select" value={form.project} onChange={handleChange}>
                  <option value="">Select project</option>
                  {projects.map((project) => (
                     <option key={project._id} value={project._id}>
                        {project.projectCode} — {project.name}
                     </option>
                  ))}
               </select>
            </Field>
            <Field label="Warehouse">
               <select name="warehouse" className="select" value={form.warehouse} onChange={handleChange}>
                  <option value="">Select warehouse</option>
                  {warehouses.map((w) => (
                     <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
               </select>
            </Field>
            <Field label="Material name">
               <input name="materialName" className="input" placeholder="e.g. Cement" value={form.materialName} onChange={handleChange} required />
            </Field>
            <Field label="Category">
               <input name="category" className="input" placeholder="e.g. Construction" value={form.category} onChange={handleChange} />
            </Field>
            <Field label="Unit">
               <select name="unit" className="select" value={form.unit} onChange={handleChange}>
                  <option value="">Select unit</option>
                  <option value="bags">Bags</option>
                  <option value="tons">Tons</option>
                  <option value="pieces">Pieces</option>
                  <option value="kg">Kg</option>
                  <option value="liters">Liters</option>
               </select>
            </Field>
            <Field label="Unit price">
               <input name="unitPrice" type="number" className="input" placeholder="0" value={form.unitPrice} onChange={handleChange} />
            </Field>
            <Field label="Minimum stock">
               <input name="minimumStock" type="number" className="input" placeholder="0" value={form.minimumStock} onChange={handleChange} />
            </Field>
            <Field label="Opening quantity">
               <input name="openingQuantity" type="number" className="input" placeholder="0" value={form.openingQuantity} onChange={handleChange} />
            </Field>
         </div>
         <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
               Add Material
            </Button>
         </div>
      </form>
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
