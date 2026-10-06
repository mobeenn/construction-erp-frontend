import { useEffect, useState } from "react";
import { getTransfers, transferStock } from "../../services/inventoryService";

export default function StockTransferTab({
   inventory = [],
   warehouses = [],
   loadInventory,
}) {
   const [transfers, setTransfers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [showNewModal, setShowNewModal] = useState(false);

   // Form state
   const [selectedItem, setSelectedItem] = useState("");
   const [targetWarehouse, setTargetWarehouse] = useState("");
   const [quantity, setQuantity] = useState("");
   const [remarks, setRemarks] = useState("");
   const [submitting, setSubmitting] = useState(false);
   const [formError, setFormError] = useState("");

   const loadTransfers = async () => {
      try {
         setLoading(true);
         const res = await getTransfers();
         setTransfers(res.data?.data || []);
      } catch (err) {
         setError("Failed to load transfer history");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadTransfers();
   }, []);

   const currentItemObj = inventory.find((i) => String(i._id) === selectedItem);
   const availableStock = currentItemObj ? Number(currentItemObj.currentStock || 0) : 0;
   const availableWarehouses = warehouses.filter(
      (w) => String(w._id) !== String(currentItemObj?.warehouse?._id || currentItemObj?.warehouse),
   );

   const handleTransferSubmit = async (e) => {
      e.preventDefault();
      setFormError("");
      const qty = Number(quantity);

      if (!selectedItem) {
         setFormError("Please select a material item to transfer");
         return;
      }
      if (!targetWarehouse) {
         setFormError("Please select a destination warehouse");
         return;
      }
      if (isNaN(qty) || qty <= 0) {
         setFormError("Please enter a valid positive transfer quantity");
         return;
      }
      if (qty > availableStock) {
         setFormError(`Transfer quantity cannot exceed current available stock (${availableStock} ${currentItemObj?.unit || "units"})`);
         return;
      }

      setSubmitting(true);
      try {
         await transferStock({
            inventoryId: selectedItem,
            toWarehouseId: targetWarehouse,
            quantity: qty,
            remarks: remarks.trim(),
         });

         setShowNewModal(false);
         setSelectedItem("");
         setTargetWarehouse("");
         setQuantity("");
         setRemarks("");
         loadTransfers();
         if (loadInventory) loadInventory();
      } catch (err) {
         setFormError(err.response?.data?.message || err.message || "Failed to process transfer");
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="space-y-6">
         {/* Top Header Card */}
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex flex-wrap justify-between items-center gap-4">
            <div>
               <h3 className="text-lg font-bold text-gray-800">Inter-Warehouse Stock Transfers</h3>
               <p className="text-xs text-gray-500 mt-0.5">
                  Transfer materials between site warehouses with dual-entry audit logging
               </p>
            </div>

            <button
               onClick={() => setShowNewModal(true)}
               className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-xs flex items-center gap-2"
            >
               <span>+</span> New Stock Transfer
            </button>
         </div>

         {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs border border-red-200">
               {error}
            </div>
         )}

         {/* Transfer History Table */}
         <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
               <h4 className="font-bold text-gray-800 text-sm">Transfer History Logs</h4>
               <span className="text-xs text-gray-400">Total {transfers.length} transfers executed</span>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 uppercase font-semibold tracking-wider">
                     <tr>
                        <th className="px-4 py-3">Transfer Ref #</th>
                        <th className="px-3 py-3">Material & Details</th>
                        <th className="px-3 py-3">From Warehouse</th>
                        <th className="px-3 py-3">To Warehouse</th>
                        <th className="px-3 py-3 text-right">Quantity</th>
                        <th className="px-3 py-3">Project Reference</th>
                        <th className="px-3 py-3">Remarks</th>
                        <th className="px-4 py-3">Date & Operator</th>
                     </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                     {loading ? (
                        <tr>
                           <td colSpan="8" className="px-4 py-12 text-center text-gray-400">
                              Loading transfer logs...
                           </td>
                        </tr>
                     ) : transfers.length === 0 ? (
                        <tr>
                           <td colSpan="8" className="px-4 py-12 text-center text-gray-400">
                              No inter-warehouse transfers recorded yet.
                           </td>
                        </tr>
                     ) : (
                        transfers.map((trf) => (
                           <tr key={trf._id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3">
                                 <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                    {trf.transferNo || trf._id?.slice(-6).toUpperCase()}
                                 </span>
                              </td>

                              <td className="px-3 py-3">
                                 <div className="font-bold text-gray-900">
                                    {trf.inventory?.materialName || "Material"}
                                 </div>
                                 <div className="text-[11px] text-gray-400 font-normal">
                                    {trf.inventory?.category || "General"}
                                 </div>
                              </td>

                              <td className="px-3 py-3 font-semibold text-gray-700">
                                 {trf.fromWarehouse?.name || "Source WH"}
                                 {trf.fromWarehouse?.code && (
                                    <span className="ml-1 text-[10px] font-mono text-gray-400">
                                       ({trf.fromWarehouse.code})
                                    </span>
                                 )}
                              </td>

                              <td className="px-3 py-3 font-semibold text-indigo-700">
                                 {trf.toWarehouse?.name || "Destination WH"}
                                 {trf.toWarehouse?.code && (
                                    <span className="ml-1 text-[10px] font-mono text-indigo-400">
                                       ({trf.toWarehouse.code})
                                    </span>
                                 )}
                              </td>

                              <td className="px-3 py-3 text-right font-bold text-gray-900 text-sm">
                                 {trf.quantity} {trf.inventory?.unit || "units"}
                              </td>

                              <td className="px-3 py-3 text-gray-600">
                                 {trf.project?.name || "General / Central"}
                              </td>

                              <td className="px-3 py-3 text-gray-500 max-w-xs truncate">
                                 {trf.remarks || "—"}
                              </td>

                              <td className="px-4 py-3 text-gray-500">
                                 <div>{new Date(trf.createdAt).toLocaleDateString()}</div>
                                 <div className="text-[10px] text-gray-400 font-normal">
                                    {new Date(trf.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    {trf.createdBy?.name ? ` • by ${trf.createdBy.name}` : ""}
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* New Transfer Modal */}
         {showNewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
               <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-gradient-to-r from-indigo-700 to-blue-800 text-white px-6 py-4 flex justify-between items-center">
                     <div>
                        <h3 className="text-base font-bold">New Inter-Site Stock Transfer</h3>
                        <p className="text-xs text-indigo-200 mt-0.5">
                           Move verified physical material to another site warehouse
                        </p>
                     </div>
                     <button
                        onClick={() => setShowNewModal(false)}
                        className="text-white/80 hover:text-white text-2xl leading-none font-light"
                     >
                        &times;
                     </button>
                  </div>

                  <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
                     {formError && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs border border-red-200">
                           {formError}
                        </div>
                     )}

                     <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                           Source Stock Item *
                        </label>
                        <select
                           value={selectedItem}
                           onChange={(e) => {
                              setSelectedItem(e.target.value);
                              setTargetWarehouse("");
                           }}
                           required
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        >
                           <option value="">Select Material to Transfer</option>
                           {inventory
                              .filter((i) => Number(i.currentStock || 0) > 0)
                              .map((i) => (
                                 <option key={i._id} value={i._id}>
                                    {i.materialName} ({i.category || "General"}) - Available: {i.currentStock} {i.unit} [WH: {i.warehouse?.name || "General"}]
                                 </option>
                              ))}
                        </select>
                     </div>

                     {currentItemObj && (
                        <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-lg text-xs space-y-1">
                           <div className="flex justify-between">
                              <span className="text-indigo-800 font-medium">Source Warehouse:</span>
                              <span className="font-bold text-indigo-900">{currentItemObj.warehouse?.name || "General WH"}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-indigo-800 font-medium">Available Quantity:</span>
                              <span className="font-bold text-indigo-900">{currentItemObj.currentStock} {currentItemObj.unit}</span>
                           </div>
                        </div>
                     )}

                     <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                           Destination Warehouse / Site *
                        </label>
                        <select
                           value={targetWarehouse}
                           onChange={(e) => setTargetWarehouse(e.target.value)}
                           required
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        >
                           <option value="">Select Destination Warehouse</option>
                           {availableWarehouses.map((w) => (
                              <option key={w._id} value={w._id}>
                                 {w.name} ({w.code || "WH"}) - {w.location || "General Location"}
                              </option>
                           ))}
                        </select>
                     </div>

                     <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                           Transfer Quantity ({currentItemObj?.unit || "units"}) *
                        </label>
                        <input
                           type="number"
                           step="any"
                           value={quantity}
                           onChange={(e) => setQuantity(e.target.value)}
                           placeholder="e.g. 50"
                           required
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                           Transfer Remarks & Dispatch Reference
                        </label>
                        <textarea
                           value={remarks}
                           onChange={(e) => setRemarks(e.target.value)}
                           rows={2}
                           placeholder="e.g. Dispatched via truck TR-442 to North Site Phase 2..."
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                     </div>

                     <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                           type="button"
                           onClick={() => setShowNewModal(false)}
                           className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={submitting}
                           className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
                        >
                           {submitting ? "Processing Transfer..." : "Execute Transfer"}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
