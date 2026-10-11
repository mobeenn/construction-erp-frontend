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

      if (stock <= 0) return { label: "Out of Stock", color: "badge-danger", code: "out_of_stock" };
      if (stock <= min) return { label: "Critical Low", color: "badge-danger", code: "low" };
      if (stock <= reorder) return { label: "Reorder Needed", color: "badge-warning", code: "reorder" };
      return { label: "Healthy", color: "badge-success", code: "healthy" };
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
            <div className="surface-card p-5">
               <p className="text-label">
                  Total Material Items
               </p>
               <h3 className="text-2xl font-bold text-ink-900 mt-1">{inventory.length}</h3>
               <p className="text-muted mt-1">{categories.length} distinct categories</p>
            </div>

            <div className="surface-card p-5">
               <p className="text-label">
                  Total Units in Stock
               </p>
               <h3 className="text-2xl font-bold text-brand-500 mt-1">
                  {totalUnits.toLocaleString()}
               </h3>
               <p className="text-muted mt-1">Across all site warehouses</p>
            </div>

            <div className="surface-card p-5">
               <p className="text-label">
                  Total Valuation
               </p>
               <h3 className="text-2xl font-bold text-mint-600 mt-1">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </h3>
               <p className="text-muted mt-1">Based on current unit prices</p>
            </div>

            <div className="surface-card p-5">
               <p className="text-label">
                  Low Stock / Reorder Alerts
               </p>
               <h3 className="text-2xl font-bold text-[#9a721f] mt-1">{lowStockCount}</h3>
               <p className="text-muted mt-1">Items at or below safety threshold</p>
            </div>
         </div>

         {/* Filters & Search Toolbar */}
         <div className="surface-card p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
               <input
                  type="text"
                  placeholder="Search material or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input"
               />

               <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="select"
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
                  className="select"
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
                  className="select"
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
                  className="select"
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
         <div className="surface-card overflow-hidden p-0">
            <div className="overflow-x-auto">
               <table className="data-table w-full text-xs">
                  <thead>
                     <tr>
                        <th className="px-4 py-3">Material & Category</th>
                        <th className="px-3 py-3">Warehouse & Site</th>
                        <th className="px-3 py-3">Unit</th>
                        <th className="px-3 py-3 text-right">Opening</th>
                        <th className="px-3 py-3 text-right text-mint-600">Received</th>
                        <th className="px-3 py-3 text-right text-brand-500">Issued</th>
                        <th className="px-3 py-3 text-right text-ink-700">Transferred</th>
                        <th className="px-3 py-3 text-right font-bold text-ink-900">Current Stock</th>
                        <th className="px-3 py-3 text-center">Status</th>
                        <th className="px-3 py-3 text-right">Min / Reorder</th>
                        <th className="px-3 py-3 text-right">Unit Price</th>
                        <th className="px-3 py-3 text-right">Total Value</th>
                        <th className="px-4 py-3 text-center">Quick Actions</th>
                     </tr>
                  </thead>

                  <tbody className="text-body font-medium">
                     {filtered.length === 0 ? (
                        <tr>
                           <td colSpan="13" className="px-4 py-12 text-center text-ink-400">
                              No inventory items found matching the selected filters.
                           </td>
                        </tr>
                     ) : (
                        filtered.map((item) => {
                           const status = getStockStatus(item);
                           const value = (Number(item.currentStock || 0) * Number(item.unitPrice || 0));

                           return (
                              <tr key={item._id}>
                                 <td className="px-4 py-3">
                                    <div className="font-bold text-ink-900 text-sm">{item.materialName}</div>
                                    <div className="text-[11px] text-ink-500 font-normal">
                                       {item.category || "General"}
                                       {item.project?.name ? ` • Prj: ${item.project.name}` : ""}
                                    </div>
                                 </td>

                                 <td className="px-3 py-3">
                                    <div className="font-semibold text-ink-900">
                                       {item.warehouse?.name || "General WH"}
                                    </div>
                                    {item.warehouse?.code && (
                                       <span className="badge badge-neutral text-[10px] font-mono">
                                          {item.warehouse.code}
                                       </span>
                                    )}
                                 </td>

                                 <td className="px-3 py-3 font-mono text-ink-700">{item.unit || "units"}</td>

                                 <td className="px-3 py-3 text-right text-ink-500">
                                    {item.openingQuantity || 0}
                                 </td>

                                 <td className="px-3 py-3 text-right text-mint-600 font-semibold">
                                    +{item.receivedQuantity || 0}
                                 </td>

                                 <td className="px-3 py-3 text-right text-brand-500 font-semibold">
                                    -{item.issuedQuantity || 0}
                                 </td>

                                 <td className="px-3 py-3 text-right text-ink-700">
                                    {item.transferredQuantity || 0}
                                 </td>

                                 <td className="px-3 py-3 text-right font-bold text-sm text-ink-900">
                                    {item.currentStock || 0}
                                 </td>

                                 <td className="px-3 py-3 text-center">
                                    <span className={`badge ${status.color}`}>
                                       {status.label}
                                    </span>
                                 </td>

                                 <td className="px-3 py-3 text-right text-[11px] text-ink-500">
                                    {item.minimumStock || 0} / {item.reorderLevel || 0}
                                 </td>

                                 <td className="px-3 py-3 text-right text-ink-700">
                                    ${Number(item.unitPrice || 0).toFixed(2)}
                                 </td>

                                 <td className="px-3 py-3 text-right font-semibold text-mint-600">
                                    ${value.toFixed(2)}
                                 </td>

                                 <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center items-center gap-1 flex-wrap">
                                       <button
                                          type="button"
                                          title="Stock In"
                                          onClick={() => setActiveModal({ type: "stock_in", item })}
                                          className="btn btn-sm bg-mint-50 text-mint-600 hover:bg-mint-50/80"
                                       >
                                          +In
                                       </button>

                                       <button
                                          type="button"
                                          title="Stock Out"
                                          onClick={() => setActiveModal({ type: "stock_out", item })}
                                          className="btn btn-sm bg-brand-50 text-brand-500 hover:bg-brand-50/80"
                                       >
                                          -Out
                                       </button>

                                       <button
                                          type="button"
                                          title="Transfer between Sites"
                                          onClick={() => setActiveModal({ type: "transfer", item })}
                                          className="btn btn-sm btn-secondary"
                                       >
                                          Transfer
                                       </button>

                                       <button
                                          type="button"
                                          title="Request Stock Adjustment"
                                          onClick={() => setActiveModal({ type: "adjustment", item })}
                                          className="btn btn-sm btn-secondary"
                                       >
                                          Adj
                                       </button>

                                       <button
                                          type="button"
                                          title="View Stock Ledger"
                                          onClick={() => onSelectLedgerItem && onSelectLedgerItem(item._id)}
                                          className="btn btn-sm btn-ghost"
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
