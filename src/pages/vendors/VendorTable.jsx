import { FiTruck } from "react-icons/fi";
import { TableHead, TableShell, TableWrap, Avatar } from "../../components/ui/TableShell";
import { EmptyState } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";

export default function VendorTable({ vendors }) {
   if (!vendors.length) {
      return (
         <TableShell>
            <EmptyState
               icon={FiTruck}
               title="No vendors found"
               message="Add a supplier or adjust your search to see results."
            />
         </TableShell>
      );
   }

   return (
      <TableShell>
         <TableHead title="Vendors" subtitle={`${vendors.length} suppliers`} icon={FiTruck} />
         <TableWrap>
            <table className="data-table">
               <thead>
                  <tr>
                     <th>Vendor</th>
                     <th>Contact Person</th>
                     <th>Phone</th>
                     <th>Email</th>
                     <th>Status</th>
                  </tr>
               </thead>
               <tbody>
                  {vendors.map((vendor) => (
                     <tr key={vendor._id}>
                        <td>
                           <div className="flex items-center gap-3">
                              <Avatar name={vendor.companyName} />
                              <div className="min-w-0">
                                 <p className="truncate font-semibold text-ink-900">
                                    {vendor.companyName}
                                 </p>
                                 <span className="text-xs text-ink-500">{vendor.vendorCode}</span>
                              </div>
                           </div>
                        </td>
                        <td>{vendor.contactPerson || "—"}</td>
                        <td>{vendor.phone || "—"}</td>
                        <td className="text-ink-500">{vendor.email || "—"}</td>
                        <td>
                           <StatusBadge status={vendor.status} />
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </TableWrap>
      </TableShell>
   );
}
