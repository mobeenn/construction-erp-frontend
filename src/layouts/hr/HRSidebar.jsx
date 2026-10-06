import { NavLink } from "react-router-dom";

export default function HRSidebar({ isOpen = false, onClose = () => {} }) {
   return (
      <>
      {isOpen && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r bg-white p-4 transition-transform md:static md:z-auto md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
         <h1 className="text-xl font-bold mb-6">HR Panel</h1>

         <nav onClick={onClose} className="flex flex-col gap-2">
            <NavLink to="/hr" end className="p-2 hover:bg-gray-100">
               Dashboard
            </NavLink>

            <NavLink to="/hr/employees" className="p-2 hover:bg-gray-100">
               Employees
            </NavLink>

            <NavLink to="/hr/attendance" className="p-2 hover:bg-gray-100">
               Attendance
            </NavLink>

            <NavLink to="/hr/departments" className="p-2 hover:bg-gray-100">
               Departments
            </NavLink>

            <NavLink to="/hr/designations" className="p-2 hover:bg-gray-100">
               Designations
            </NavLink>

            <NavLink to="/hr/leaves" className="p-2 hover:bg-gray-100">
               Leave Management
            </NavLink>

            <NavLink to="/hr/salary" className="p-2 hover:bg-gray-100">
               Salary Structures
            </NavLink>

            <NavLink to="/hr/payroll" className="p-2 hover:bg-gray-100">
               Payroll
            </NavLink>

            <NavLink to="/hr/reports" className="p-2 hover:bg-gray-100">
               Payroll Reports
            </NavLink>
         </nav>
      </aside>
      </>
   );
}
