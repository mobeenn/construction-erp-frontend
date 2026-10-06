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
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
               <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                     Total Warehouses / Sites
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">{warehouses.length}</h3>
               </div>
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
                  WH
               </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
               <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                     Active Sites
                  </p>
                  <h3 className="text-2xl font-bold text-green-600 mt-1">{activeCount}</h3>
               </div>
               <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-bold text-lg">
                  OK
               </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
               <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                     Project Bound Sites
                  </p>
                  <h3 className="text-2xl font-bold text-indigo-600 mt-1">{projectBoundCount}</h3>
               </div>
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">
                  PRJ
               </div>
            </div>
         </div>

         {/* Header Controls */}
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-3 flex-1 min-w-[280px]">
               <input
                  type="text"
                  placeholder="Search by name, code, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden min-w-[240px]"
               />
               <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
               >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
               </select>
            </div>

            <button
               onClick={() => {
                  setSelectedWarehouse(null);
                  setShowModal(true);
               }}
               className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-xs flex items-center gap-2"
            >
               <span>+</span> Add Warehouse / Site
            </button>
         </div>

         {/* Warehouse Grid / Cards */}
         {loading ? (
            <div className="text-center py-12 text-gray-500">Loading warehouses...</div>
         ) : filtered.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-xs">
               <p className="text-gray-500">No warehouses found matching your filter criteria.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {filtered.map((w) => (
                  <div
                     key={w._id}
                     className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                     <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                           <div>
                              <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                                 {w.name}
                              </h4>
                              {w.code && (
                                 <span className="inline-block mt-1 font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                    {w.code}
                                 </span>
                              )}
                           </div>
                           <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                 w.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                           >
                              {w.status === "active" ? "Active" : "Inactive"}
                           </span>
                        </div>

                        <div className="space-y-2 text-xs text-gray-600 my-4 border-t border-b border-gray-100 py-3">
                           <div className="flex justify-between">
                              <span className="text-gray-400 font-medium">Location:</span>
                              <span className="font-medium text-gray-800 text-right truncate max-w-[200px]">
                                 {w.location || "Not specified"}
                              </span>
                           </div>

                           <div className="flex justify-between">
                              <span className="text-gray-400 font-medium">Bound Project:</span>
                              <span className="font-medium text-indigo-600 text-right truncate max-w-[200px]">
                                 {w.project?.name || "General / Company"}
                              </span>
                           </div>

                           <div className="flex justify-between">
                              <span className="text-gray-400 font-medium">Site Manager:</span>
                              <span className="font-medium text-gray-800 text-right truncate max-w-[200px]">
                                 {w.manager?.name || "Unassigned"}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-end gap-2 pt-2">
                        <button
                           onClick={() => {
                              setSelectedWarehouse(w);
                              setShowModal(true);
                           }}
                           className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                           Edit
                        </button>
                        <button
                           onClick={() => handleDelete(w._id, w.name)}
                           className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
