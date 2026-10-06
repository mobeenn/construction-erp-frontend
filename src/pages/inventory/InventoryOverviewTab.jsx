import { useState } from "react";
import StockActionModal from "./StockActionModal";

export default function InventoryOverviewTab({
   inventory = [],
   warehouses = [],
   projects = [],
   loadInventory,
   onSelectLedgerItem,
}) {
   const [search, setSearch] = useState("");
   const [selectedWarehouse, setSelectedWarehouse] = useState("");
   const [selectedProject, setSelectedProject] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("");
   const [statusFilter, setStatusFilter] = useState("all");

   // Modal states
   const [activeModal, setActiveModal] = useState(null); // { type: 'stock_in'|'stock_out'|'transfer'|'adjustment'|'return', item }

   // Extract unique categories
   const categories = Array.from(
      new Set(inventory.map((i) => i.category).filter(Boolean)),
   );

   const getStockStatus = (item) => {
      const stock = Number(item.currentStock || 0);
      const min = Number(item.minimumStock || 0);
      const reorder = Number(item.reorderLevel || 0);

      if (stock <= 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800 border-red-200", code: "out_of_stock" };
      if (stock <= min) return { label: "Critical Low", color: "bg-orange-100 text-orange-800 border-orange-200", code: "low" };
      if (stock <= reorder) return { label: "Reorder Needed", color: "bg-yellow-100 text-yellow-800 border-yellow-200", code: "reorder" };
      return { label: "Healthy", color: "bg-green-100 text-green-800 border-green-200", code: "healthy" };
   };

   const filtered = inventory.filter((item) => {
      const matchSearch =
         (item.materialName || "").toLowerCase().includes(search.toLowerCase()) ||
         (item.category || "").toLowerCase().includes(search.toLowerCase());

      const matchWarehouse =
         !selectedWarehouse ||
         String(item.warehouse?._id || item.warehouse) === selectedWarehouse;

      const matchProject =
         !selectedProject ||
         String(item.project?._id || item.project) === selectedProject;

      const matchCategory =
         !selectedCategory || (item.category || "").toLowerCase() === selectedCategory.toLowerCase();

      const status = getStockStatus(item);
      const matchStatus =
         statusFilter === "all" ||
         (statusFilter === "alert" && (status.code === "low" || status.code === "out_of_stock" || status.code === "reorder")) ||
         status.code === statusFilter;

      return matchSearch && matchWarehouse && matchProject && matchCategory && matchStatus;
   });

   // Calculate KPIs
   const totalValue = inventory.reduce(
      (sum, item) => sum + (Number(item.currentStock || 0) * Number(item.unitPrice || 0)),
      0,
   );
   const totalUnits = inventory.reduce(
      (sum, item) => sum + Number(item.currentStock || 0),
      0,
   );
   const lowStockCount = inventory.filter((item) => {
      const s = getStockStatus(item);
      return s.code === "low" || s.code === "out_of_stock" || s.code === "reorder";
   }).length;

   return (
      <div className="space-y-6">
         {/* Summary Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Material Items
               </p>
               <h3 className="text-2xl font-bold text-gray-800 mt-1">{inventory.length}</h3>
               <p className="text-xs text-gray-400 mt-1">{categories.length} distinct categories</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Units in Stock
               </p>
               <h3 className="text-2xl font-bold text-blue-600 mt-1">
                  {totalUnits.toLocaleString()}
               </h3>
               <p className="text-xs text-gray-400 mt-1">Across all site warehouses</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Valuation
               </p>
               <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </h3>
               <p className="text-xs text-gray-400 mt-1">Based on current unit prices</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Low Stock / Reorder Alerts
               </p>
               <h3 className="text-2xl font-bold text-orange-600 mt-1">{lowStockCount}</h3>
               <p className="text-xs text-gray-400 mt-1">Items at or below safety threshold</p>
            </div>
         </div>

         {/* Filters & Search Toolbar */}
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
               <input
                  type="text"
                  placeholder="Search material or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
               />

               <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
               >
                  <option value="">All Warehouses</option>
                  {warehouses.map((w) => (
                     <option key={w._id} value={w._id}>
                        {w.name} ({w.code || "WH"})
                     </option>
                  ))}
               </select>

               <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
               >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                     <option key={p._id} value={p._id}>
                        {p.projectCode ? `[${p.projectCode}] ` : ""}{p.name}
                     </option>
                  ))}
               </select>

               <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
               >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                     <option key={c} value={c}>
                        {c}
                     </option>
                  ))}
               </select>

               <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
               >
                  <option value="all">All Stock Statuses</option>
                  <option value="healthy">Healthy Only</option>
                  <option value="reorder">Reorder Needed</option>
                  <option value="low">Critical Low</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="alert">All Alerts (Low + Reorder)</option>
               </select>
            </div>
         </div>

         {/* Stock Matrix Table */}
         <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 uppercase font-semibold tracking-wider">
                     <tr>
                        <th className="px-4 py-3">Material & Category</th>
                        <th className="px-3 py-3">Warehouse & Site</th>
                        <th className="px-3 py-3">Unit</th>
                        <th className="px-3 py-3 text-right">Opening</th>
                        <th className="px-3 py-3 text-right text-green-700">Received</th>
                        <th className="px-3 py-3 text-right text-blue-700">Issued</th>
                        <th className="px-3 py-3 text-right text-purple-700">Transferred</th>
                        <th className="px-3 py-3 text-right font-bold text-gray-900">Current Stock</th>
                        <th className="px-3 py-3 text-center">Status</th>
                        <th className="px-3 py-3 text-right">Min / Reorder</th>
                        <th className="px-3 py-3 text-right">Unit Price</th>
                        <th className="px-3 py-3 text-right">Total Value</th>
                        <th className="px-4 py-3 text-center">Quick Actions</th>
                     </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                     {filtered.length === 0 ? (
                        <tr>
                           <td colSpan="13" className="px-4 py-12 text-center text-gray-400">
                              No inventory items found matching the selected filters.
                           </td>
                        </tr>
                     ) : (
                        filtered.map((item) => {
                           const status = getStockStatus(item);
                           const value = (Number(item.currentStock || 0) * Number(item.unitPrice || 0));

                           return (
                              <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                                 <td className="px-4 py-3">
                                    <div className="font-bold text-gray-900 text-sm">{item.materialName}</div>
                                    <div className="text-[11px] text-gray-500 font-normal">
                                       {item.category || "General"}
                                       {item.project?.name ? ` • Prj: ${item.project.name}` : ""}
                                    </div>
                                 </td>

                                 <td className="px-3 py-3">
                                    <div className="font-semibold text-gray-800">
                                       {item.warehouse?.name || "General WH"}
                                    </div>
                                    {item.warehouse?.code && (
                                       <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                          {item.warehouse.code}
                                       </span>
                                    )}
                                 </td>

                                 <td className="px-3 py-3 font-mono text-gray-600">{item.unit || "units"}</td>

                                 <td className="px-3 py-3 text-right text-gray-500">
                                    {item.openingQuantity || 0}
                                 </td>

                                 <td className="px-3 py-3 text-right text-green-700 font-semibold">
                                    +{item.receivedQuantity || 0}
                                 </td>

                                 <td className="px-3 py-3 text-right text-blue-700 font-semibold">
                                    -{item.issuedQuantity || 0}
                                 </td>

                                 <td className="px-3 py-3 text-right text-purple-700">
                                    {item.transferredQuantity || 0}
                                 </td>

                                 <td className="px-3 py-3 text-right font-bold text-sm text-gray-900">
                                    {item.currentStock || 0}
                                 </td>

                                 <td className="px-3 py-3 text-center">
                                    <span
                                       className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}
                                    >
                                       {status.label}
                                    </span>
                                 </td>

                                 <td className="px-3 py-3 text-right text-[11px] text-gray-500">
                                    {item.minimumStock || 0} / {item.reorderLevel || 0}
                                 </td>

                                 <td className="px-3 py-3 text-right text-gray-700">
                                    ${Number(item.unitPrice || 0).toFixed(2)}
                                 </td>

                                 <td className="px-3 py-3 text-right font-semibold text-emerald-700">
                                    ${value.toFixed(2)}
                                 </td>

                                 <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center items-center gap-1">
                                       <button
                                          title="Stock In"
                                          onClick={() => setActiveModal({ type: "stock_in", item })}
                                          className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-semibold"
                                       >
                                          +In
                                       </button>

                                       <button
                                          title="Stock Out"
                                          onClick={() => setActiveModal({ type: "stock_out", item })}
                                          className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold"
                                       >
                                          -Out
                                       </button>

                                       <button
                                          title="Transfer between Sites"
                                          onClick={() => setActiveModal({ type: "transfer", item })}
                                          className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-semibold"
                                       >
                                          Transfer
                                       </button>

                                       <button
                                          title="Request Stock Adjustment"
                                          onClick={() => setActiveModal({ type: "adjustment", item })}
                                          className="p-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-xs font-semibold"
                                       >
                                          Adj
                                       </button>

                                       <button
                                          title="View Stock Ledger"
                                          onClick={() => onSelectLedgerItem && onSelectLedgerItem(item._id)}
                                          className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-xs font-semibold"
                                       >
                                          Ledger
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           );
                        })
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Action Modal */}
         {activeModal && (
            <StockActionModal
               actionType={activeModal.type}
               item={activeModal.item}
               onClose={() => setActiveModal(null)}
               onSuccess={() => {
                  setActiveModal(null);
                  loadInventory();
               }}
            />
         )}
      </div>
   );
}
