import { FiPackage } from "react-icons/fi";
import { TableHead, TableShell, TableWrap } from "../../components/ui/TableShell";
import { EmptyState } from "../../components/ui/States";

export default function MaterialIssueTable({ issues }) {
   if (!issues.length) {
      return (
         <TableShell>
            <EmptyState
               icon={FiPackage}
               title="No material issues"
               message="Issue materials from an approved request to see them here."
            />
         </TableShell>
      );
   }

   return (
      <TableShell>
         <TableHead title="Issue Log" subtitle={`${issues.length} records`} icon={FiPackage} />
         <TableWrap>
            <table className="data-table">
               <thead>
                  <tr>
                     <th>Issue No</th>
                     <th>Request</th>
                     <th>Project</th>
                     <th>Issued By</th>
                     <th>Date</th>
                  </tr>
               </thead>
               <tbody>
                  {issues.map((item) => (
                     <tr key={item._id}>
                        <td className="font-semibold text-ink-900">{item.issueNo || "—"}</td>
                        <td>{item.request?.requestNo || "—"}</td>
                        <td>{item.project?.name || "—"}</td>
                        <td>{item.issuedBy?.name || "—"}</td>
                        <td className="text-ink-500">
                           {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </TableWrap>
      </TableShell>
   );
}
