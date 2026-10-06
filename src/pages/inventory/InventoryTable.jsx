import { useState } from "react";
import { FiArchive, FiArrowDown, FiArrowUp } from "react-icons/fi";
import { stockIn, stockOut } from "../../services/inventoryService";
import { useToast } from "../../components/ui/ToastContext";
import { TableHead, TableShell, TableWrap, RowActions } from "../../components/ui/TableShell";
import { EmptyState } from "../../components/ui/States";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { formatMoney } from "../../utils/format";

export default function InventoryTable({ inventory, loadInventory }) {
   const [modal, setModal] = useState(null); // { item, type }

   if (!inventory.length) {
      return (
         <TableShell>
            <EmptyState
               icon={FiArchive}
               title="No materials found"
               message="Add a material or adjust your search to see stock."
            />
         </TableShell>
      );
   }

   return (
      <>
         <TableShell>
            <TableHead
               title="Inventory"
               subtitle={`${inventory.length} materials`}
               icon={FiArchive}
            />
            <TableWrap>
               <table className="data-table">
                  <thead>
                     <tr>
                        <th>Material</th>
                        <th>Project</th>
                        <th>Stock</th>
                        <th>Unit Price</th>
                        <th>Value</th>
                        <th className="text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {inventory.map((item) => {
                        const low = Number(item.currentStock) <= Number(item.minimumStock);
                        return (
                           <tr key={item._id}>
                              <td>
                                 <p className="font-semibold text-ink-900">{item.materialName}</p>
                                 <span className="text-xs text-ink-500">{item.category || "—"}</span>
                              </td>
                              <td>{item.project?.name || "—"}</td>
                              <td>
                                 <span className={`badge ${low ? "badge-danger" : "badge-success"}`}>
                                    {item.currentStock} {item.unit}
                                 </span>
                              </td>
                              <td>{formatMoney(item.unitPrice)}</td>
                              <td className="font-semibold text-ink-900">
                                 {formatMoney(Number(item.currentStock) * Number(item.unitPrice), {
                                    compact: true,
                                 })}
                              </td>
                              <td>
                                 <RowActions>
                                    <button
                                       type="button"
                                       onClick={() => setModal({ item, type: "in" })}
                                       className="btn btn-secondary btn-sm"
                                    >
                                       <FiArrowDown size={13} /> In
                                    </button>
                                    <button
                                       type="button"
                                       onClick={() => setModal({ item, type: "out" })}
                                       className="btn btn-secondary btn-sm"
                                    >
                                       <FiArrowUp size={13} /> Out
                                    </button>
                                 </RowActions>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </TableWrap>
         </TableShell>

         <StockModal
            state={modal}
            onClose={() => setModal(null)}
            onDone={() => {
               setModal(null);
               loadInventory(false);
            }}
         />
      </>
   );
}

function StockModal({ state, onClose, onDone }) {
   const toast = useToast();
   const [quantity, setQuantity] = useState("");
   const [remarks, setRemarks] = useState("");
   const [saving, setSaving] = useState(false);

   const isIn = state?.type === "in";

   const submit = async (e) => {
      e.preventDefault();
      const payload = { quantity: Number(quantity), remarks };
      setSaving(true);
      try {
         if (isIn) await stockIn(state.item._id, payload);
         else await stockOut(state.item._id, payload);
         toast.success(`Stock ${isIn ? "received" : "issued"} successfully.`);
         setQuantity("");
         setRemarks("");
         onDone();
      } catch (error) {
         toast.error(error.response?.data?.message || "Stock movement failed.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <Modal
         isOpen={Boolean(state)}
         onClose={onClose}
         title={isIn ? "Stock In" : "Stock Out"}
         subtitle={state?.item?.materialName}
         size="sm"
      >
         <form onSubmit={submit} className="space-y-4">
            <label className="block">
               <span className="field-label">Quantity</span>
               <input
                  type="number"
                  className="input"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
               />
            </label>
            <label className="block">
               <span className="field-label">Remarks</span>
               <input
                  className="input"
                  placeholder="Optional note"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
               />
            </label>
            <div className="flex justify-end gap-3">
               <Button variant="ghost" onClick={onClose}>
                  Cancel
               </Button>
               <Button type="submit" variant="primary" loading={saving}>
                  {isIn ? "Add Stock" : "Issue Stock"}
               </Button>
            </div>
         </form>
      </Modal>
   );
}
