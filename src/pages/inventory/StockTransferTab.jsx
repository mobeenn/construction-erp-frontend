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
         <div className="surface-card p-5 flex flex-wrap justify-between items-center gap-4">
            <div>
               <h3 className="text-section-title">Inter-Warehouse Stock Transfers</h3>
               <p className="text-muted mt-0.5">
                  Transfer materials between site warehouses with dual-entry audit logging
               </p>
            </div>

            <button
               type="button"
               onClick={() => setShowNewModal(true)}
               className="btn btn-primary"
            >
               <span>+</span> New Stock Transfer
            </button>
         </div>

         {error && (
            <div className="alert alert-error text-xs" role="alert">
               {error}
            </div>
         )}

         {/* Transfer History Table */}
         <div className="surface-card overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-line flex justify-between items-center">
               <h4 className="text-section-title text-sm">Transfer History Logs</h4>
               <span className="text-muted">Total {transfers.length} transfers executed</span>
            </div>

            <div className="overflow-x-auto">
               <table className="data-table w-full text-xs">
                  <thead>
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

                  <tbody className="text-body font-medium">
                     {loading ? (
                        <tr>
                           <td colSpan="8" className="px-4 py-12 text-center text-ink-400">
                              Loading transfer logs...
                           </td>
                        </tr>
                     ) : transfers.length === 0 ? (
                        <tr>
                           <td colSpan="8" className="px-4 py-12 text-center text-ink-400">
                              No inter-warehouse transfers recorded yet.
                           </td>
                        </tr>
                     ) : (
                        transfers.map((trf) => (
                           <tr key={trf._id}>
                              <td className="px-4 py-3">
                                 <span className="badge badge-brand font-mono">
                                    {trf.transferNo || trf._id?.slice(-6).toUpperCase()}
                                 </span>
                              </td>

                              <td className="px-3 py-3">
                                 <div className="font-bold text-ink-900">
                                    {trf.inventory?.materialName || "Material"}
                                 </div>
                                 <div className="text-[11px] text-ink-400 font-normal">
                                    {trf.inventory?.category || "General"}
                                 </div>
                              </td>

                              <td className="px-3 py-3 font-semibold text-ink-700">
                                 {trf.fromWarehouse?.name || "Source WH"}
                                 {trf.fromWarehouse?.code && (
                                    <span className="ml-1 text-[10px] font-mono text-ink-400">
                                       ({trf.fromWarehouse.code})
                                    </span>
                                 )}
                              </td>

                              <td className="px-3 py-3 font-semibold text-brand-500">
                                 {trf.toWarehouse?.name || "Destination WH"}
                                 {trf.toWarehouse?.code && (
                                    <span className="ml-1 text-[10px] font-mono text-ink-400">
                                       ({trf.toWarehouse.code})
                                    </span>
                                 )}
                              </td>

                              <td className="px-3 py-3 text-right font-bold text-ink-900 text-sm">
                                 {trf.quantity} {trf.inventory?.unit || "units"}
                              </td>

                              <td className="px-3 py-3 text-ink-700">
                                 {trf.project?.name || "General / Central"}
                              </td>

                              <td className="px-3 py-3 text-ink-500 max-w-xs truncate">
                                 {trf.remarks || "—"}
                              </td>

                              <td className="px-4 py-3 text-ink-500">
                                 <div>{new Date(trf.createdAt).toLocaleDateString()}</div>
                                 <div className="text-[10px] text-ink-400 font-normal">
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
               <div className="surface-card max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 shadow-[0_34px_80px_-30px_rgba(16,42,54,0.55)]">
                  <div className="bg-brand-gradient text-[#0d222b] px-6 py-4 flex justify-between items-center">
                     <div>
                        <h3 className="text-base font-bold">New Inter-Site Stock Transfer</h3>
                        <p className="text-xs text-ink-700/80 mt-0.5">
                           Move verified physical material to another site warehouse
                        </p>
                     </div>
                     <button
                        type="button"
                        onClick={() => setShowNewModal(false)}
                        className="btn btn-ghost text-ink-900 text-2xl leading-none font-light px-2 py-1"
                     >
                        &times;
                     </button>
                  </div>

                  <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
                     {formError && (
                        <div className="alert alert-error text-xs" role="alert">
                           {formError}
                        </div>
                     )}

                     <div>
                        <label className="text-label block mb-1">
                           Source Stock Item *
                        </label>
                        <select
                           value={selectedItem}
                           onChange={(e) => {
                              setSelectedItem(e.target.value);
                              setTargetWarehouse("");
                           }}
                           required
                           className="select"
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
                        <div className="alert alert-info text-xs flex-col items-stretch gap-1">
                           <div className="flex justify-between">
                              <span className="font-medium">Source Warehouse:</span>
                              <span className="font-bold text-ink-900">{currentItemObj.warehouse?.name || "General WH"}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="font-medium">Available Quantity:</span>
                              <span className="font-bold text-ink-900">{currentItemObj.currentStock} {currentItemObj.unit}</span>
                           </div>
                        </div>
                     )}

                     <div>
                        <label className="text-label block mb-1">
                           Destination Warehouse / Site *
                        </label>
                        <select
                           value={targetWarehouse}
                           onChange={(e) => setTargetWarehouse(e.target.value)}
                           required
                           className="select"
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
                        <label className="text-label block mb-1">
                           Transfer Quantity ({currentItemObj?.unit || "units"}) *
                        </label>
                        <input
                           type="number"
                           step="any"
                           value={quantity}
                           onChange={(e) => setQuantity(e.target.value)}
                           placeholder="e.g. 50"
                           required
                           className="input"
                        />
                     </div>

                     <div>
                        <label className="text-label block mb-1">
                           Transfer Remarks & Dispatch Reference
                        </label>
                        <textarea
                           value={remarks}
                           onChange={(e) => setRemarks(e.target.value)}
                           rows={2}
                           placeholder="e.g. Dispatched via truck TR-442 to North Site Phase 2..."
                           className="textarea"
                        />
                     </div>

                     <div className="flex justify-end gap-3 pt-4 border-t border-line">
                        <button
                           type="button"
                           onClick={() => setShowNewModal(false)}
                           className="btn btn-secondary"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={submitting}
                           className="btn btn-primary"
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
