import { useEffect, useState } from "react";
import { createWarehouse, updateWarehouse } from "../../services/warehouseService";
import { getProjects } from "../../services/projectService";
import { getUsersApi } from "../../api/users.api";

export default function WarehouseModal({ warehouse, onClose, onSuccess }) {
   const [projects, setProjects] = useState([]);
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   const [form, setForm] = useState({
      name: warehouse?.name || "",
      code: warehouse?.code || "",
      location: warehouse?.location || "",
      project: warehouse?.project?._id || warehouse?.project || "",
      manager: warehouse?.manager?._id || warehouse?.manager || "",
      status: warehouse?.status || "active",
   });

   useEffect(() => {
      loadDependencies();
   }, []);

   const loadDependencies = async () => {
      try {
         const [pRes, uRes] = await Promise.all([
            getProjects().catch(() => ({ data: { data: [] } })),
            getUsersApi({ limit: 100 }).catch(() => ({ data: { data: [] } })),
         ]);
         setProjects(pRes.data?.data || []);
         setUsers(uRes.data?.data || []);
      } catch (err) {
         console.error("Error loading warehouse dependencies", err);
      }
   };

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
         const payload = {
            name: form.name.trim(),
            code: form.code.trim(),
            location: form.location.trim(),
            project: form.project || null,
            manager: form.manager || null,
            status: form.status,
         };

         if (!payload.name) {
            setError("Warehouse name is required");
            setLoading(false);
            return;
         }

         if (warehouse?._id) {
            await updateWarehouse(warehouse._id, payload);
         } else {
            await createWarehouse(payload);
         }

         onSuccess();
      } catch (err) {
         setError(err.response?.data?.message || err.message || "Failed to save warehouse");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
         <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex justify-between items-center">
               <h3 className="text-lg font-bold">
                  {warehouse ? "Edit Site Warehouse" : "Add New Site Warehouse"}
               </h3>
               <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white text-2xl leading-none font-light"
               >
                  &times;
               </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
                     {error}
                  </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                     <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                        Warehouse Name *
                     </label>
                     <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Central Yard A"
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                     />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                     <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                        Warehouse Code
                     </label>
                     <input
                        type="text"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        placeholder="e.g. WH-001"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                     Location / Site Address
                  </label>
                  <input
                     type="text"
                     name="location"
                     value={form.location}
                     onChange={handleChange}
                     placeholder="e.g. Sector 44, Construction Site 2"
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                        Bound Project
                     </label>
                     <select
                        name="project"
                        value={form.project}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                     >
                        <option value="">General (Company Wide)</option>
                        {projects.map((p) => (
                           <option key={p._id} value={p._id}>
                              {p.projectCode ? `[${p.projectCode}] ` : ""}{p.name}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                        Site / Store Manager
                     </label>
                     <select
                        name="manager"
                        value={form.manager}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                     >
                        <option value="">Select Manager</option>
                        {users.map((u) => (
                           <option key={u._id} value={u._id}>
                              {u.name} ({u.role || "staff"})
                           </option>
                        ))}
                     </select>
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                     Status
                  </label>
                  <div className="flex gap-4 items-center mt-1">
                     <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                           type="radio"
                           name="status"
                           value="active"
                           checked={form.status === "active"}
                           onChange={handleChange}
                           className="text-blue-600"
                        />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           Active
                        </span>
                     </label>
                     <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                           type="radio"
                           name="status"
                           value="inactive"
                           checked={form.status === "inactive"}
                           onChange={handleChange}
                           className="text-blue-600"
                        />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                           Inactive
                        </span>
                     </label>
                  </div>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                     type="button"
                     onClick={onClose}
                     className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     disabled={loading}
                     className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
                  >
                     {loading ? "Saving..." : warehouse ? "Update Warehouse" : "Create Warehouse"}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
