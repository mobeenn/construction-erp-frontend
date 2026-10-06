import { FiPackage } from "react-icons/fi";
import { TableHead, TableShell, TableWrap } from "../../components/ui/TableShell";
import { EmptyState } from "../../components/ui/States";

export default function GRNTable({ grns }) {
   if (!grns.length) {
      return (
         <TableShell>
            <EmptyState
               icon={FiPackage}
               title="No goods received"
               message="Create a GRN from an approved purchase order."
            />
         </TableShell>
      );
   }

   return (
      <TableShell>
         <TableHead title="Goods Received" subtitle={`${grns.length} records`} icon={FiPackage} />
         <TableWrap>
            <table className="data-table">
               <thead>
                  <tr>
                     <th>GRN No</th>
                     <th>PO No</th>
                     <th>Project</th>
                     <th>Vendor</th>
                     <th>Remarks</th>
                  </tr>
               </thead>
               <tbody>
                  {grns.map((g) => (
                     <tr key={g._id}>
                        <td className="font-semibold text-ink-900">{g.grnNo || "—"}</td>
                        <td>{g.purchaseOrder?.poNumber || "—"}</td>
                        <td>{g.project?.name || "—"}</td>
                        <td>{g.vendor?.companyName || "—"}</td>
                        <td className="text-ink-500">{g.remarks || "—"}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </TableWrap>
      </TableShell>
   );
}
