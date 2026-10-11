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
         <div className="surface-card p-5 flex flex-wrap justify-between items-center gap-4">
            <div>
               <h3 className="text-section-title">Stock Adjustments & Approval Workflow</h3>
               <p className="text-muted mt-0.5">
                  Audit, calibrate, and adjust physical stock counts with managerial approval
               </p>
            </div>

            <div className="flex items-center gap-3">
               {pendingCount > 0 && (
                  <span className="badge badge-warning flex items-center gap-1.5">
                     <span className="w-2 h-2 rounded-full bg-[#d9a441] animate-pulse" />
                     {pendingCount} Pending Approval
                  </span>
               )}

               <button
                  type="button"
                  onClick={() => setShowNewModal(true)}
                  className="btn btn-primary"
               >
                  <span>+</span> Request Adjustment
               </button>
            </div>
         </div>

         {error && (
            <div className="alert alert-error text-xs" role="alert">
               {error}
            </div>
         )}

         {/* Filters toolbar */}
         <div className="surface-card p-4 flex flex-wrap justify-between items-center gap-3">
            <div className="flex flex-wrap gap-2">
               {["all", "pending", "approved", "rejected"].map((st) => (
                  <button
                     type="button"
                     key={st}
                     onClick={() => setStatusFilter(st)}
                     className={`btn btn-sm capitalize ${
                        statusFilter === st
                           ? "bg-brand-500 text-white"
                           : "bg-canvas text-ink-500"
                     }`}
                  >
                     {st}
                  </button>
               ))}
            </div>

            <span className="text-muted shrink-0">
               Showing {filtered.length} of {adjustments.length} records
            </span>
         </div>

         {/* Adjustment Table */}
         <div className="surface-card overflow-hidden p-0">
            <div className="overflow-x-auto">
               <table className="data-table w-full text-xs">
                  <thead>
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

                  <tbody className="text-body font-medium">
                     {loading ? (
                        <tr>
                           <td colSpan="9" className="px-4 py-12 text-center text-ink-400">
                              Loading adjustment logs...
                           </td>
                        </tr>
                     ) : filtered.length === 0 ? (
                        <tr>
                           <td colSpan="9" className="px-4 py-12 text-center text-ink-400">
                              No stock adjustments found matching your filter.
                           </td>
                        </tr>
                     ) : (
                        filtered.map((adj) => {
                           const isPositive = Number(adj.quantity || 0) > 0;
                           return (
                              <tr key={adj._id}>
                                 <td className="px-4 py-3">
                                    <span className="badge badge-brand font-mono">
                                       {adj.adjustmentNo || adj._id?.slice(-6).toUpperCase()}
                                    </span>
                                 </td>

                                 <td className="px-3 py-3">
                                    <div className="font-bold text-ink-900">
                                       {adj.inventory?.materialName || "Material"}
                                    </div>
                                    <div className="text-[11px] text-ink-400 font-normal">
                                       {adj.inventory?.category || "General"}
                                    </div>
                                 </td>

                                 <td className="px-3 py-3 font-semibold text-ink-700">
                                    {adj.inventory?.warehouse?.name || "General WH"}
                                 </td>

                                 <td className="px-3 py-3 text-right font-bold text-sm">
                                    <span
                                       className={
                                          isPositive ? "text-mint-600" : "text-[#c23b3b]"
                                       }
                                    >
                                       {isPositive ? `+${adj.quantity}` : adj.quantity}
                                    </span>{" "}
                                    <span className="text-ink-400 text-xs font-normal">
                                       {adj.inventory?.unit || "units"}
                                    </span>
                                 </td>

                                 <td className="px-3 py-3 text-center">
                                    <span
                                       className={`badge uppercase ${
                                          adj.status === "approved"
                                             ? "badge-success"
                                             : adj.status === "rejected"
                                             ? "badge-danger"
                                             : "badge-warning"
                                       }`}
                                    >
                                       {adj.status}
                                    </span>
                                 </td>

                                 <td className="px-3 py-3 text-ink-700 max-w-xs truncate">
                                    {adj.reason || "—"}
                                 </td>

                                 <td className="px-3 py-3 text-ink-500">
                                    <div>{adj.createdBy?.name || "Staff"}</div>
                                    <div className="text-[10px] text-ink-400 font-normal">
                                       {new Date(adj.createdAt).toLocaleDateString()}
                                    </div>
                                 </td>

                                 <td className="px-3 py-3 text-ink-500">
                                    {adj.approvedBy?.name ? (
                                       <>
                                          <div>{adj.approvedBy.name}</div>
                                          <div className="text-[10px] text-ink-400 font-normal">
                                             {adj.reviewedAt ? new Date(adj.reviewedAt).toLocaleDateString() : ""}
                                          </div>
                                       </>
                                    ) : (
                                       <span className="text-ink-400 italic">Pending</span>
                                    )}
                                 </td>

                                 <td className="px-4 py-3 text-center">
                                    {adj.status === "pending" ? (
                                       <div className="flex justify-center items-center gap-1.5">
                                          <button
                                             type="button"
                                             onClick={() => handleReview(adj._id, "approve")}
                                             className="btn btn-sm btn-primary"
                                          >
                                             Approve
                                          </button>
                                          <button
                                             type="button"
                                             onClick={() => handleReview(adj._id, "reject")}
                                             className="btn btn-sm btn-danger"
                                          >
                                             Reject
                                          </button>
                                       </div>
                                    ) : (
                                       <span className="text-ink-400 text-xs font-medium">Closed</span>
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
               <div className="surface-card max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 shadow-[0_34px_80px_-30px_rgba(16,42,54,0.55)]">
                  <div className="bg-brand-gradient text-[#0d222b] px-6 py-4 flex justify-between items-center">
                     <div>
                        <h3 className="text-base font-bold">Request Stock Count Adjustment</h3>
                        <p className="text-xs text-ink-700/80 mt-0.5">
                           Submit physical inventory audit discrepancy for approval
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

                  <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                     {formError && (
                        <div className="alert alert-error text-xs" role="alert">
                           {formError}
                        </div>
                     )}

                     <div>
                        <label className="text-label block mb-1">
                           Target Stock Material *
                        </label>
                        <select
                           value={selectedItem}
                           onChange={(e) => setSelectedItem(e.target.value)}
                           required
                           className="select"
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
                        <div className="alert alert-info text-xs flex-col items-stretch gap-1">
                           <div className="flex justify-between">
                              <span className="font-medium">Warehouse:</span>
                              <span className="font-bold text-ink-900">{currentItemObj.warehouse?.name || "General WH"}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="font-medium">Current System Stock:</span>
                              <span className="font-bold text-ink-900">{currentItemObj.currentStock} {currentItemObj.unit}</span>
                           </div>
                        </div>
                     )}

                     <div>
                        <label className="text-label block mb-1">
                           Adjustment Delta (+ / -) ({currentItemObj?.unit || "units"}) *
                        </label>
                        <input
                           type="number"
                           step="any"
                           value={quantityDelta}
                           onChange={(e) => setQuantityDelta(e.target.value)}
                           placeholder="e.g. +15 or -10"
                           required
                           className="input"
                        />
                        <p className="text-muted mt-1">
                           Use positive numbers to add stock (e.g. found stock: 15) or negative numbers to deduct (e.g. damaged: -10).
                        </p>
                     </div>

                     <div>
                        <label className="text-label block mb-1">
                           Audit Reason & Justification *
                        </label>
                        <textarea
                           value={reason}
                           onChange={(e) => setReason(e.target.value)}
                           rows={3}
                           placeholder="e.g. Annual physical count audit showed 5 extra bags undamaged in rear bay..."
                           required
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
