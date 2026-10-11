import { useEffect, useState } from "react";
import { createInventory } from "../../services/inventoryService";
import { getProjects } from "../../services/projectService";
import { getWarehouses } from "../../services/warehouseService";

export default function InventoryFormModal({ onClose, onSuccess }) {
   const [projects, setProjects] = useState([]);
   const [warehouses, setWarehouses] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   const [form, setForm] = useState({
      project: "",
      warehouse: "",
      materialName: "",
      category: "",
      unit: "pieces",
      unitPrice: "",
      openingQuantity: "",
      minimumStock: "50",
      reorderLevel: "100",
   });

   useEffect(() => {
      loadDependencies();
   }, []);

   const loadDependencies = async () => {
      try {
         const [pRes, wRes] = await Promise.all([
            getProjects().catch(() => ({ data: { data: [] } })),
            getWarehouses().catch(() => ({ data: { data: [] } })),
         ]);
         setProjects(pRes.data?.data || []);
         setWarehouses(wRes.data?.data || []);
      } catch (err) {
         console.error("Error loading inventory dependencies", err);
      }
   };

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      if (!form.materialName.trim()) {
         setError("Material Name is required");
         return;
      }

      setLoading(true);

      try {
         await createInventory({
            materialName: form.materialName.trim(),
            category: form.category.trim() || "General Materials",
            unit: form.unit.trim() || "units",
            project: form.project || null,
            warehouse: form.warehouse || null,
            unitPrice: Number(form.unitPrice || 0),
            openingQuantity: Number(form.openingQuantity || 0),
            minimumStock: Number(form.minimumStock || 0),
            reorderLevel: Number(form.reorderLevel || 0),
         });

         onSuccess();
      } catch (err) {
         setError(err.response?.data?.message || err.message || "Failed to create material");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
         <div className="surface-card max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 shadow-[0_34px_80px_-30px_rgba(16,42,54,0.55)]">
            <div className="bg-brand-gradient text-[#0d222b] px-6 py-4 flex justify-between items-center">
               <div>
                  <h3 className="text-lg font-bold">Add New Stock Material</h3>
                  <p className="text-xs text-ink-700/80 mt-0.5">
                     Create and register material in site warehouse inventory
                  </p>
               </div>
               <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost text-ink-900 text-2xl leading-none font-light px-2 py-1"
               >
                  &times;
               </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               {error && (
                  <div className="alert alert-error text-xs" role="alert">
                     {error}
                  </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="text-label block mb-1">
                        Material / Item Name *
                     </label>
                     <input
                        type="text"
                        name="materialName"
                        value={form.materialName}
                        onChange={handleChange}
                        placeholder="e.g. Portland Cement (50kg)"
                        required
                        className="input"
                     />
                  </div>

                  <div>
                     <label className="text-label block mb-1">
                        Category
                     </label>
                     <input
                        type="text"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        placeholder="e.g. Structural, Masonry, Finishing"
                        className="input"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="text-label block mb-1">
                        Site Warehouse *
                     </label>
                     <select
                        name="warehouse"
                        value={form.warehouse}
                        onChange={handleChange}
                        className="select"
                     >
                        <option value="">Select Warehouse / Storage</option>
                        {warehouses.map((w) => (
                           <option key={w._id} value={w._id}>
                              {w.name} ({w.code || "WH"}) {w.project?.name ? `- ${w.project.name}` : ""}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div>
                     <label className="text-label block mb-1">
                        Associated Project
                     </label>
                     <select
                        name="project"
                        value={form.project}
                        onChange={handleChange}
                        className="select"
                     >
                        <option value="">General (Company Wide)</option>
                        {projects.map((p) => (
                           <option key={p._id} value={p._id}>
                              {p.projectCode ? `[${p.projectCode}] ` : ""}{p.name}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                     <label className="text-label block mb-1">
                        Unit of Measure *
                     </label>
                     <select
                        name="unit"
                        value={form.unit}
                        onChange={handleChange}
                        className="select"
                     >
                        <option value="bags">Bags</option>
                        <option value="tons">Tons</option>
                        <option value="pieces">Pieces</option>
                        <option value="kg">Kg</option>
                        <option value="liters">Liters</option>
                        <option value="meters">Meters</option>
                        <option value="sqft">Sq. Ft</option>
                        <option value="cum">Cu. M (Cum)</option>
                        <option value="boxes">Boxes</option>
                        <option value="rolls">Rolls</option>
                        <option value="units">Units</option>
                     </select>
                  </div>

                  <div>
                     <label className="text-label block mb-1">
                        Unit Price ($)
                     </label>
                     <input
                        type="number"
                        step="any"
                        name="unitPrice"
                        value={form.unitPrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="input"
                     />
                  </div>

                  <div>
                     <label className="text-label block mb-1">
                        Opening Quantity
                     </label>
                     <input
                        type="number"
                        step="any"
                        name="openingQuantity"
                        value={form.openingQuantity}
                        onChange={handleChange}
                        placeholder="0"
                        className="input"
                     />
                  </div>

                  <div>
                     <label className="text-label block mb-1">
                        Minimum Stock
                     </label>
                     <input
                        type="number"
                        step="any"
                        name="minimumStock"
                        value={form.minimumStock}
                        onChange={handleChange}
                        placeholder="50"
                        className="input"
                     />
                  </div>
               </div>

               <div>
                  <label className="text-label block mb-1">
                     Reorder Alert Level
                  </label>
                  <input
                     type="number"
                     step="any"
                     name="reorderLevel"
                     value={form.reorderLevel}
                     onChange={handleChange}
                     placeholder="100"
                     className="input"
                  />
                  <p className="text-muted mt-1">
                     Triggers automatic reorder warnings when available stock drops to or below this threshold.
                  </p>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-line">
                  <button
                     type="button"
                     onClick={onClose}
                     className="btn btn-secondary"
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     disabled={loading}
                     className="btn btn-primary"
                  >
                     {loading ? "Creating..." : "Save Material to Stock"}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
