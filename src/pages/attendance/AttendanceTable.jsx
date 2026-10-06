import { FiActivity } from "react-icons/fi";
import { TableHead, TableShell, TableWrap, Avatar } from "../../components/ui/TableShell";
import { EmptyState } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";

export default function AttendanceTable({ attendance }) {
   if (!attendance.length) {
      return (
         <TableShell>
            <EmptyState
               icon={FiActivity}
               title="No attendance recorded"
               message="No attendance has been marked for the selected date."
            />
         </TableShell>
      );
   }

   return (
      <TableShell>
         <TableHead title="Attendance Log" subtitle={`${attendance.length} records`} icon={FiActivity} />
         <TableWrap>
            <table className="data-table">
               <thead>
                  <tr>
                     <th>Employee</th>
                     <th>Designation</th>
                     <th>Status</th>
                     <th>Overtime</th>
                  </tr>
               </thead>
               <tbody>
                  {attendance.map((item) => (
                     <tr key={item._id}>
                        <td>
                           <div className="flex items-center gap-3">
                              <Avatar name={item.employee?.name} size="sm" />
                              <span className="font-semibold text-ink-900">
                                 {item.employee?.name || "—"}
                              </span>
                           </div>
                        </td>
                        <td>{item.employee?.designation || "—"}</td>
                        <td>
                           <StatusBadge status={item.status} />
                        </td>
                        <td className="font-semibold text-ink-900">
                           {item.overtimeHours || 0} hrs
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </TableWrap>
      </TableShell>
   );
}
