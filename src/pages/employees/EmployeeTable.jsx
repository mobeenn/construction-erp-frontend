import { deleteEmployee } from "../../services/employeeService";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/ui/ToastContext";
import { FiTrash2, FiUsers } from "react-icons/fi";
import { TableHead, TableShell, TableWrap, Avatar, RowActions } from "../../components/ui/TableShell";
import { EmptyState } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatMoney } from "../../utils/format";

export default function EmployeeTable({ employees, loadEmployees }) {
   const { user } = useAuth();
   const toast = useToast();
   const isAdmin = user?.role === "admin";

   const remove = async (employee) => {
      if (!window.confirm(`Remove ${employee.name} from the team?`)) return;
      try {
         await deleteEmployee(employee._id);
         toast.success("Employee removed.");
         loadEmployees(false);
      } catch {
         toast.error("Only an administrator can delete employees.");
      }
   };

   if (!employees.length) {
      return (
         <TableShell>
            <EmptyState
               icon={FiUsers}
               title="No employees found"
               message="Add your first team member or adjust your search."
            />
         </TableShell>
      );
   }

   return (
      <TableShell>
         <TableHead
            title="Team Members"
            subtitle={`${employees.length} shown`}
            icon={FiUsers}
         />
         <TableWrap>
            <table className="data-table">
               <thead>
                  <tr>
                     <th>Employee</th>
                     <th>Designation</th>
                     <th>Phone</th>
                     <th>Salary</th>
                     <th>Status</th>
                     {isAdmin && <th className="text-right">Actions</th>}
                  </tr>
               </thead>
               <tbody>
                  {employees.map((item) => (
                     <tr key={item._id}>
                        <td>
                           <div className="flex items-center gap-3">
                              <Avatar name={item.name} />
                              <div className="min-w-0">
                                 <p className="truncate font-semibold text-ink-900">{item.name}</p>
                                 <span className="text-xs text-ink-500">{item.employeeId}</span>
                              </div>
                           </div>
                        </td>
                        <td>{item.designation || "—"}</td>
                        <td>{item.phone || "—"}</td>
                        <td className="font-semibold text-ink-900">
                           {formatMoney(item.salary, { compact: true })}
                        </td>
                        <td>
                           <StatusBadge status={item.status} />
                        </td>
                        {isAdmin && (
                           <td>
                              <RowActions>
                                 <button
                                    type="button"
                                    onClick={() => remove(item)}
                                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-[rgba(224,82,82,0.1)] hover:text-[#c23b3b]"
                                    aria-label="Delete employee"
                                 >
                                    <FiTrash2 size={15} />
                                 </button>
                              </RowActions>
                           </td>
                        )}
                     </tr>
                  ))}
               </tbody>
            </table>
         </TableWrap>
      </TableShell>
   );
}
