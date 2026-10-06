import { useEffect, useState } from "react";
import {
   getAdjustments,
   requestAdjustment,
   reviewAdjustment,
} from "../../services/inventoryService";

export default function StockAdjustmentTab({ inventory = [], loadInventory }) {
   const [adjustments, setAdjustments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [statusFilter, setStatusFilter] = useState("all");
   const [error, setError] = useState("");
   const [showNewModal, setShowNewModal] = useState(false);

   // Form states
   const [selectedItem, setSelectedItem] = useState("");
   const [quantityDelta, setQuantityDelta] = useState("");
   const [reason, setReason] = useState("");
   const [submitting, setSubmitting] = useState(false);
   const [formError, setFormError] = useState("");

   const loadAdjustmentsList = async () => {
      try {
         setLoading(true);
         const res = await getAdjustments();
         setAdjustments(res.data?.data || []);
      } catch (err) {
         setError("Failed to load stock adjustments");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadAdjustmentsList();
   }, []);

   const currentItemObj = inventory.find((i) => String(i._id) === selectedItem);

   const handleRequestSubmit = async (e) => {
      e.preventDefault();
      setFormError("");
      const delta = Number(quantityDelta);

      if (!selectedItem) {
         setFormError("Please select an inventory item");
         return;
      }
      if (isNaN(delta) || delta === 0) {
         setFormError("Quantity adjustment delta cannot be zero");
         return;
      }
      if (!reason.trim()) {
         setFormError("A justified reason is required for stock adjustments");
         return;
      }

      setSubmitting(true);
      try {
         await requestAdjustment({
            inventoryId: selectedItem,
            quantity: delta,
            reason: reason.trim(),
         });

         setShowNewModal(false);
         setSelectedItem("");
         setQuantityDelta("");
         setReason("");
         loadAdjustmentsList();
      } catch (err) {
         setFormError(err.response?.data?.message || err.message || "Failed to submit adjustment");
      } finally {
         setSubmitting(false);
      }
   };

   const handleReview = async (id, action) => {
      if (!window.confirm(`Are you sure you want to ${action.toUpperCase()} this stock adjustment request?`)) return;

      try {
         await reviewAdjustment(id, action);
         loadAdjustmentsList();
         if (loadInventory) loadInventory();
      } catch (err) {
         alert(err.response?.data?.message || err.message || `Failed to ${action} adjustment`);
      }
   };

   const filtered = adjustments.filter((adj) => {
      return statusFilter === "all" || adj.status === statusFilter;
   });

   const pendingCount = adjustments.filter((a) => a.status === "pending").length;

   return (
      <div className="space-y-6">
         {/* Header / Summary Card */}
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex flex-wrap justify-between items-center gap-4">
            <div>
               <h3 className="text-lg font-bold text-gray-800">Stock Adjustments & Approval Workflow</h3>
               <p className="text-xs text-gray-500 mt-0.5">
                  Audit, calibrate, and adjust physical stock counts with managerial approval
               </p>
            </div>

            <div className="flex items-center gap-3">
               {pendingCount > 0 && (
                  <span className="bg-orange-100 text-orange-800 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
                     <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                     {pendingCount} Pending Approval
                  </span>
               )}

               <button
                  onClick={() => setShowNewModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-xs flex items-center gap-2"
               >
                  <span>+</span> Request Adjustment
               </button>
            </div>
         </div>

         {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs border border-red-200">
               {error}
            </div>
         )}

         {/* Filters toolbar */}
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex justify-between items-center">
            <div className="flex gap-2">
               {["all", "pending", "approved", "rejected"].map((st) => (
                  <button
                     key={st}
                     onClick={() => setStatusFilter(st)}
                     className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                        statusFilter === st
                           ? "bg-purple-600 text-white shadow-xs"
                           : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                     }`}
                  >
                     {st}
                  </button>
               ))}
            </div>

            <span className="text-xs text-gray-400">
               Showing {filtered.length} of {adjustments.length} records
            </span>
         </div>

         {/* Adjustment Table */}
         <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 uppercase font-semibold tracking-wider">
                     <tr>
                        <th className="px-4 py-3">Adj Ref #</th>
                        <th className="px-3 py-3">Material Item</th>
                        <th className="px-3 py-3">Warehouse & Site</th>
                        <th className="px-3 py-3 text-right">Adjustment Delta</th>
                        <th className="px-3 py-3 text-center">Status</th>
                        <th className="px-3 py-3">Audit Reason</th>
                        <th className="px-3 py-3">Requested By</th>
                        <th className="px-3 py-3">Reviewed By</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                     </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                     {loading ? (
                        <tr>
                           <td colSpan="9" className="px-4 py-12 text-center text-gray-400">
                              Loading adjustment logs...
                           </td>
                        </tr>
                     ) : filtered.length === 0 ? (
                        <tr>
                           <td colSpan="9" className="px-4 py-12 text-center text-gray-400">
                              No stock adjustments found matching your filter.
                           </td>
                        </tr>
                     ) : (
                        filtered.map((adj) => {
                           const isPositive = Number(adj.quantity || 0) > 0;
                           return (
                              <tr key={adj._id} className="hover:bg-slate-50/80 transition-colors">
                                 <td className="px-4 py-3">
                                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                       {adj.adjustmentNo || adj._id?.slice(-6).toUpperCase()}
                                    </span>
                                 </td>

                                 <td className="px-3 py-3">
                                    <div className="font-bold text-gray-900">
                                       {adj.inventory?.materialName || "Material"}
                                    </div>
                                    <div className="text-[11px] text-gray-400 font-normal">
                                       {adj.inventory?.category || "General"}
                                    </div>
                                 </td>

                                 <td className="px-3 py-3 font-semibold text-gray-700">
                                    {adj.inventory?.warehouse?.name || "General WH"}
                                 </td>

                                 <td className="px-3 py-3 text-right font-bold text-sm">
                                    <span
                                       className={
                                          isPositive ? "text-green-600" : "text-red-600"
                                       }
                                    >
                                       {isPositive ? `+${adj.quantity}` : adj.quantity}
                                    </span>{" "}
                                    <span className="text-gray-400 text-xs font-normal">
                                       {adj.inventory?.unit || "units"}
                                    </span>
                                 </td>

                                 <td className="px-3 py-3 text-center">
                                    <span
                                       className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                          adj.status === "approved"
                                             ? "bg-green-50 text-green-700 border-green-200"
                                             : adj.status === "rejected"
                                             ? "bg-red-50 text-red-700 border-red-200"
                                             : "bg-orange-50 text-orange-700 border-orange-200"
                                       }`}
                                    >
                                       {adj.status}
                                    </span>
                                 </td>

                                 <td className="px-3 py-3 text-gray-600 max-w-xs truncate">
                                    {adj.reason || "—"}
                                 </td>

                                 <td className="px-3 py-3 text-gray-500">
                                    <div>{adj.createdBy?.name || "Staff"}</div>
                                    <div className="text-[10px] text-gray-400 font-normal">
                                       {new Date(adj.createdAt).toLocaleDateString()}
                                    </div>
                                 </td>

                                 <td className="px-3 py-3 text-gray-500">
                                    {adj.approvedBy?.name ? (
                                       <>
                                          <div>{adj.approvedBy.name}</div>
                                          <div className="text-[10px] text-gray-400 font-normal">
                                             {adj.reviewedAt ? new Date(adj.reviewedAt).toLocaleDateString() : ""}
                                          </div>
                                       </>
                                    ) : (
                                       <span className="text-gray-400 italic">Pending</span>
                                    )}
                                 </td>

                                 <td className="px-4 py-3 text-center">
                                    {adj.status === "pending" ? (
                                       <div className="flex justify-center items-center gap-1.5">
                                          <button
                                             onClick={() => handleReview(adj._id, "approve")}
                                             className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                                          >
                                             Approve
                                          </button>
                                          <button
                                             onClick={() => handleReview(adj._id, "reject")}
                                             className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                                          >
                                             Reject
                                          </button>
                                       </div>
                                    ) : (
                                       <span className="text-gray-400 text-xs font-medium">Closed</span>
                                    )}
                                 </td>
                              </tr>
                           );
                        })
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Request Adjustment Modal */}
         {showNewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
               <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-6 py-4 flex justify-between items-center">
                     <div>
                        <h3 className="text-base font-bold">Request Stock Count Adjustment</h3>
                        <p className="text-xs text-purple-200 mt-0.5">
                           Submit physical inventory audit discrepancy for approval
                        </p>
                     </div>
                     <button
                        onClick={() => setShowNewModal(false)}
                        className="text-white/80 hover:text-white text-2xl leading-none font-light"
                     >
                        &times;
                     </button>
                  </div>

                  <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                     {formError && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs border border-red-200">
                           {formError}
                        </div>
                     )}

                     <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                           Target Stock Material *
                        </label>
                        <select
                           value={selectedItem}
                           onChange={(e) => setSelectedItem(e.target.value)}
                           required
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                        >
                           <option value="">Select Material Item</option>
                           {inventory.map((i) => (
                              <option key={i._id} value={i._id}>
                                 {i.materialName} ({i.category || "General"}) - Current: {i.currentStock} {i.unit} [WH: {i.warehouse?.name || "WH"}]
                              </option>
                           ))}
                        </select>
                     </div>

                     {currentItemObj && (
                        <div className="bg-purple-50/80 border border-purple-100 p-3 rounded-lg text-xs space-y-1">
                           <div className="flex justify-between">
                              <span className="text-purple-800 font-medium">Warehouse:</span>
                              <span className="font-bold text-purple-900">{currentItemObj.warehouse?.name || "General WH"}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-purple-800 font-medium">Current System Stock:</span>
                              <span className="font-bold text-purple-900">{currentItemObj.currentStock} {currentItemObj.unit}</span>
                           </div>
                        </div>
                     )}

                     <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                           Adjustment Delta (+ / -) ({currentItemObj?.unit || "units"}) *
                        </label>
                        <input
                           type="number"
                           step="any"
                           value={quantityDelta}
                           onChange={(e) => setQuantityDelta(e.target.value)}
                           placeholder="e.g. +15 or -10"
                           required
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">
                           Use positive numbers to add stock (e.g. found stock: 15) or negative numbers to deduct (e.g. damaged: -10).
                        </p>
                     </div>

                     <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                           Audit Reason & Justification *
                        </label>
                        <textarea
                           value={reason}
                           onChange={(e) => setReason(e.target.value)}
                           rows={3}
                           placeholder="e.g. Annual physical count audit showed 5 extra bags undamaged in rear bay..."
                           required
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
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
                           className="px-5 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
                        >
                           {submitting ? "Submitting..." : "Submit Adjustment Request"}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
