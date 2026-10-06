import { FiCheck, FiShoppingCart } from "react-icons/fi";
import { approvePurchaseOrder } from "../../services/purchaseOrderService";
import { useToast } from "../../components/ui/ToastContext";
import { TableHead, TableShell, TableWrap, RowActions } from "../../components/ui/TableShell";
import { EmptyState } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatMoney } from "../../utils/format";

export default function PurchaseOrderTable({ orders, loadOrders }) {
   const toast = useToast();

   const approve = async (id) => {
      try {
         await approvePurchaseOrder(id);
         toast.success("Purchase order approved.");
         loadOrders(false);
      } catch (error) {
         toast.error(error.response?.data?.message || "Approval failed.");
      }
   };

   if (!orders.length) {
      return (
         <TableShell>
            <EmptyState
               icon={FiShoppingCart}
               title="No purchase orders"
               message="Create a purchase order or adjust your search."
            />
         </TableShell>
      );
   }

   return (
      <TableShell>
         <TableHead title="Purchase Orders" subtitle={`${orders.length} orders`} icon={FiShoppingCart} />
         <TableWrap>
            <table className="data-table">
               <thead>
                  <tr>
                     <th>PO No</th>
                     <th>Vendor</th>
                     <th>Project</th>
                     <th>Total</th>
                     <th>Status</th>
                     <th className="text-right">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {orders.map((order) => (
                     <tr key={order._id}>
                        <td className="font-semibold text-ink-900">{order.poNumber || "—"}</td>
                        <td>{order.vendor?.companyName || "—"}</td>
                        <td>{order.project?.name || "—"}</td>
                        <td className="font-semibold text-ink-900">
                           {formatMoney(order.grandTotal)}
                        </td>
                        <td>
                           <StatusBadge status={order.status} />
                        </td>
                        <td>
                           {order.status === "draft" ? (
                              <RowActions>
                                 <button
                                    type="button"
                                    onClick={() => approve(order._id)}
                                    className="btn btn-secondary btn-sm !text-[#1b7f56]"
                                 >
                                    <FiCheck size={13} /> Approve
                                 </button>
                              </RowActions>
                           ) : (
                              <p className="text-right text-xs text-ink-400">No action</p>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </TableWrap>
      </TableShell>
   );
}
