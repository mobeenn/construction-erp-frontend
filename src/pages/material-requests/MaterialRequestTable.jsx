import { FiCheck, FiClipboard, FiX } from "react-icons/fi";
import {
   approveMaterialRequest,
   rejectMaterialRequest,
} from "../../services/materialRequestService";
import { useToast } from "../../components/ui/ToastContext";
import { TableHead, TableShell, TableWrap, RowActions } from "../../components/ui/TableShell";
import { EmptyState } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";

export default function MaterialRequestTable({ requests, loadRequests }) {
   const toast = useToast();

   const approve = async (id) => {
      try {
         await approveMaterialRequest(id);
         toast.success("Material request approved.");
         loadRequests(false);
      } catch (error) {
         toast.error(error.response?.data?.message || "Approval failed.");
      }
   };

   const reject = async (id) => {
      try {
         await rejectMaterialRequest(id);
         toast.info("Material request rejected.");
         loadRequests(false);
      } catch (error) {
         toast.error(error.response?.data?.message || "Rejection failed.");
      }
   };

   if (!requests.length) {
      return (
         <TableShell>
            <EmptyState
               icon={FiClipboard}
               title="No material requests"
               message="Create a request or adjust your filter to see results."
            />
         </TableShell>
      );
   }

   return (
      <TableShell>
         <TableHead
            title="Material Requests"
            subtitle={`${requests.length} requests`}
            icon={FiClipboard}
         />
         <TableWrap>
            <table className="data-table">
               <thead>
                  <tr>
                     <th>Request</th>
                     <th>Project</th>
                     <th>Items</th>
                     <th>Status</th>
                     <th className="text-right">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {requests.map((item) => (
                     <tr key={item._id}>
                        <td className="font-semibold text-ink-900">{item.requestNo || "—"}</td>
                        <td>{item.project?.name || "—"}</td>
                        <td>
                           <span className="badge badge-neutral">
                              {item.items?.length || 0} item{(item.items?.length || 0) === 1 ? "" : "s"}
                           </span>
                        </td>
                        <td>
                           <StatusBadge status={item.status} />
                        </td>
                        <td>
                           {item.status === "pending" ? (
                              <RowActions>
                                 <button
                                    type="button"
                                    onClick={() => approve(item._id)}
                                    className="btn btn-secondary btn-sm !text-[#1b7f56]"
                                 >
                                    <FiCheck size={13} /> Approve
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => reject(item._id)}
                                    className="btn btn-secondary btn-sm !text-[#c23b3b]"
                                 >
                                    <FiX size={13} /> Reject
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
