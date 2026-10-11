import { useEffect, useState } from "react";
import { getWarehouses, deleteWarehouse } from "../../services/warehouseService";
import WarehouseModal from "./WarehouseModal";

export default function WarehouseManagementTab({ onWarehouseUpdated }) {
   const [warehouses, setWarehouses] = useState([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [statusFilter, setStatusFilter] = useState("all");
   const [selectedWarehouse, setSelectedWarehouse] = useState(null);
   const [showModal, setShowModal] = useState(false);
   const [error, setError] = useState("");

   const loadWarehouses = async () => {
      try {
         setLoading(true);
         const res = await getWarehouses();
         setWarehouses(res.data?.data || []);
      } catch (err) {
         setError("Failed to load warehouses");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadWarehouses();
   }, []);

   const handleDelete = async (id, name) => {
      if (!window.confirm(`Are you sure you want to delete warehouse "${name}"?`)) return;

      try {
         await deleteWarehouse(id);
         loadWarehouses();
         if (onWarehouseUpdated) onWarehouseUpdated();
      } catch (err) {
         alert(err.response?.data?.message || "Failed to delete warehouse");
      }
   };

   const filtered = warehouses.filter((w) => {
      const matchSearch =
         (w.name || "").toLowerCase().includes(search.toLowerCase()) ||
         (w.code || "").toLowerCase().includes(search.toLowerCase()) ||
         (w.location || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || w.status === statusFilter;
      return matchSearch && matchStatus;
   });

   const activeCount = warehouses.filter((w) => w.status === "active").length;
   const projectBoundCount = warehouses.filter((w) => w.project).length;

   return (
      <div className="space-y-6">
         {/* Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="surface-card p-5 flex items-center justify-between">
               <div>
                  <p className="text-label">
                     Total Warehouses / Sites
                  </p>
                  <h3 className="text-2xl font-bold text-ink-900 mt-1">{warehouses.length}</h3>
               </div>
               <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center font-bold text-lg">
                  WH
               </div>
            </div>

            <div className="surface-card p-5 flex items-center justify-between">
               <div>
                  <p className="text-label">
                     Active Sites
                  </p>
                  <h3 className="text-2xl font-bold text-mint-600 mt-1">{activeCount}</h3>
               </div>
               <div className="w-12 h-12 bg-mint-50 text-mint-600 rounded-xl flex items-center justify-center font-bold text-lg">
                  OK
               </div>
            </div>

            <div className="surface-card p-5 flex items-center justify-between">
               <div>
                  <p className="text-label">
                     Project Bound Sites
                  </p>
                  <h3 className="text-2xl font-bold text-brand-500 mt-1">{projectBoundCount}</h3>
               </div>
               <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center font-bold text-lg">
                  PRJ
               </div>
            </div>
         </div>

         {/* Header Controls */}
         <div className="surface-card p-4 flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-3 flex-1 min-w-[280px]">
               <input
                  type="text"
                  placeholder="Search by name, code, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input min-w-[240px]"
               />
               <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select"
               >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
               </select>
            </div>

            <button
               type="button"
               onClick={() => {
                  setSelectedWarehouse(null);
                  setShowModal(true);
               }}
               className="btn btn-primary"
            >
               <span>+</span> Add Warehouse / Site
            </button>
         </div>

         {/* Warehouse Grid / Cards */}
         {loading ? (
            <div className="text-center py-12 text-ink-500">Loading warehouses...</div>
         ) : filtered.length === 0 ? (
            <div className="surface-card p-12 text-center">
               <p className="text-ink-500">No warehouses found matching your filter criteria.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {filtered.map((w) => (
                  <div
                     key={w._id}
                     className="surface-card card-hover p-5 flex flex-col justify-between"
                  >
                     <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                           <div>
                              <h4 className="font-bold text-ink-900 text-base flex items-center gap-2">
                                 {w.name}
                              </h4>
                              {w.code && (
                                 <span className="badge badge-neutral inline-block mt-1 font-mono">
                                    {w.code}
                                 </span>
                              )}
                           </div>
                           <span
                              className={`badge ${
                                 w.status === "active"
                                    ? "badge-success"
                                    : "badge-neutral"
                              }`}
                           >
                              {w.status === "active" ? "Active" : "Inactive"}
                           </span>
                        </div>

                        <div className="space-y-2 text-xs text-ink-700 my-4 border-t border-b border-line py-3">
                           <div className="flex justify-between">
                              <span className="text-ink-400 font-medium">Location:</span>
                              <span className="font-medium text-ink-900 text-right truncate max-w-[200px]">
                                 {w.location || "Not specified"}
                              </span>
                           </div>

                           <div className="flex justify-between">
                              <span className="text-ink-400 font-medium">Bound Project:</span>
                              <span className="font-medium text-brand-500 text-right truncate max-w-[200px]">
                                 {w.project?.name || "General / Company"}
                              </span>
                           </div>

                           <div className="flex justify-between">
                              <span className="text-ink-400 font-medium">Site Manager:</span>
                              <span className="font-medium text-ink-900 text-right truncate max-w-[200px]">
                                 {w.manager?.name || "Unassigned"}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-end gap-2 pt-2">
                        <button
                           type="button"
                           onClick={() => {
                              setSelectedWarehouse(w);
                              setShowModal(true);
                           }}
                           className="btn btn-sm btn-secondary"
                        >
                           Edit
                        </button>
                        <button
                           type="button"
                           onClick={() => handleDelete(w._id, w.name)}
                           className="btn btn-sm btn-danger"
                        >
                           Delete
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Modal */}
         {showModal && (
            <WarehouseModal
               warehouse={selectedWarehouse}
               onClose={() => setShowModal(false)}
               onSuccess={() => {
                  setShowModal(false);
                  loadWarehouses();
                  if (onWarehouseUpdated) onWarehouseUpdated();
               }}
            />
         )}
      </div>
   );
}
