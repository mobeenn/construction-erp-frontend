import { useState, useEffect } from "react";
import {
   stockIn,
   stockOut,
   transferStock,
   requestAdjustment,
   returnMaterial,
} from "../../services/inventoryService";
import { getWarehouses } from "../../services/warehouseService";

export default function StockActionModal({ actionType, item, onClose, onSuccess }) {
   const [quantity, setQuantity] = useState("");
   const [remarks, setRemarks] = useState("");
   const [targetWarehouse, setTargetWarehouse] = useState("");
   const [warehouses, setWarehouses] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   useEffect(() => {
      if (actionType === "transfer") {
         getWarehouses()
            .then((res) => {
               const list = (res.data?.data || []).filter(
                  (w) => String(w._id) !== String(item.warehouse?._id || item.warehouse),
               );
               setWarehouses(list);
            })
            .catch(() => {});
      }
   }, [actionType, item]);

   const getTitle = () => {
      switch (actionType) {
         case "stock_in":
            return `Stock In: ${item.materialName}`;
         case "stock_out":
            return `Stock Out: ${item.materialName}`;
         case "transfer":
            return `Transfer Stock: ${item.materialName}`;
         case "adjustment":
            return `Request Adjustment: ${item.materialName}`;
         case "return":
            return `Material Return: ${item.materialName}`;
         default:
            return "Inventory Action";
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      const qty = Number(quantity);

      if (isNaN(qty) || qty <= 0 && actionType !== "adjustment") {
         setError("Please enter a valid positive quantity");
         return;
      }

      if (actionType === "stock_out" && qty > (item.currentStock || 0)) {
         setError(`Cannot stock out more than available stock (${item.currentStock} ${item.unit || "units"})`);
         return;
      }

      if (actionType === "transfer") {
         if (!targetWarehouse) {
            setError("Please select destination warehouse");
            return;
         }
         if (qty > (item.currentStock || 0)) {
            setError(`Cannot transfer more than available stock (${item.currentStock} ${item.unit || "units"})`);
            return;
         }
      }

      if (actionType === "adjustment" && (!remarks || !remarks.trim())) {
         setError("A reason is required for stock adjustments");
         return;
      }

      setLoading(true);

      try {
         if (actionType === "stock_in") {
            await stockIn(item._id, { quantity: qty, remarks: remarks.trim() });
         } else if (actionType === "stock_out") {
            await stockOut(item._id, { quantity: qty, remarks: remarks.trim() });
         } else if (actionType === "transfer") {
            await transferStock({
               inventoryId: item._id,
               toWarehouseId: targetWarehouse,
               quantity: qty,
               remarks: remarks.trim(),
            });
         } else if (actionType === "adjustment") {
            await requestAdjustment({
               inventoryId: item._id,
               quantity: qty, // can be positive or negative
               reason: remarks.trim(),
            });
         } else if (actionType === "return") {
            await returnMaterial({
               inventoryId: item._id,
               quantity: qty,
               reason: remarks.trim(),
            });
         }

         onSuccess();
      } catch (err) {
         setError(err.response?.data?.message || err.message || "Operation failed");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
         <div className="surface-card max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 shadow-[0_34px_80px_-30px_rgba(16,42,54,0.55)]">
            <div className="bg-brand-gradient text-[#0d222b] px-6 py-4 flex justify-between items-center">
               <div>
                  <h3 className="text-base font-bold">{getTitle()}</h3>
                  <p className="text-xs text-ink-700/80 mt-0.5">
                     Current Stock: <span className="font-semibold text-ink-900">{item.currentStock || 0}</span> {item.unit} | WH: {item.warehouse?.name || "Default"}
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

               {actionType === "transfer" && (
                  <div>
                     <label className="text-label block mb-1">
                        Destination Warehouse *
                     </label>
                     <select
                        value={targetWarehouse}
                        onChange={(e) => setTargetWarehouse(e.target.value)}
                        required
                        className="select"
                     >
                        <option value="">Select Destination Warehouse</option>
                        {warehouses.map((w) => (
                           <option key={w._id} value={w._id}>
                              {w.name} ({w.code || "WH"}) - {w.location || "General"}
                           </option>
                        ))}
                     </select>
                  </div>
               )}

               <div>
                  <label className="text-label block mb-1">
                     {actionType === "adjustment"
                        ? "Adjustment Quantity Delta (+ / -) *"
                        : `Quantity (${item.unit || "units"}) *`}
                  </label>
                  <input
                     type="number"
                     step="any"
                     value={quantity}
                     onChange={(e) => setQuantity(e.target.value)}
                     placeholder={actionType === "adjustment" ? "e.g. +10 or -5" : "e.g. 25"}
                     required
                     className="input"
                  />
                  {actionType === "adjustment" && (
                     <p className="text-muted mt-1">
                        Positive adds stock (e.g. 10), negative reduces stock (e.g. -5). Requires admin approval.
                     </p>
                  )}
               </div>

               <div>
                  <label className="text-label block mb-1">
                     {actionType === "adjustment" || actionType === "return" ? "Reason *" : "Remarks / Reference"}
                  </label>
                  <textarea
                     value={remarks}
                     onChange={(e) => setRemarks(e.target.value)}
                     rows={3}
                     placeholder={
                        actionType === "adjustment"
                           ? "Explain reason for stock count discrepancy (audit, damage, calibration)..."
                           : actionType === "return"
                           ? "State reason for returning material back to inventory..."
                           : "Optional remarks or PO / invoice reference..."
                     }
                     required={actionType === "adjustment" || actionType === "return"}
                     className="textarea"
                  />
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
                     {loading ? "Processing..." : "Confirm Action"}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
