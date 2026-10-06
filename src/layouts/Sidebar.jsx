import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
   const { user } = useAuth();
   const isSupervisor = user?.role === "site_supervisor";
   const isEmployee = user?.role === "employee";
   const canReviewLeave = ["admin", "hr", "project_manager"].includes(user?.role);
   return (
      <>
      {isOpen && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto border-r bg-white p-4 transition-transform md:static md:z-auto md:block md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
         <h1 className="mb-8 text-2xl font-bold">{isSupervisor ? "Site workspace" : isEmployee ? "Employee Portal" : "Admin Panel"}</h1>

         <nav onClick={onClose} className="flex flex-col gap-3">
            {isEmployee ? <>
               <Link to="/employee/leaves">My Leave</Link>
               <Link to="/employee/payslips">My Payslips</Link>
            </> : isSupervisor ? <>
               <Link to="/site-supervisor">Daily Reports</Link>
               <Link to="/projects">Projects</Link>
               <Link to="/manager-leaves">Leave Review</Link>
            </> : <>
            <Link to="/">Dashboard</Link>

            <Link to="/users">Users</Link>

            <Link to="/employees">Employees</Link>

            <Link to="/projects">Projects</Link>

            <Link to="/clients">Clients</Link>

            <Link to="/contracts">Contracts</Link>

            <Link to="/attendance">Attendance</Link>

            <Link to="/inventory">Inventory</Link>

            <Link to="/material-issues">Material Issue</Link>
            <Link to="/material-request">Material Request</Link>

            <Link to="/vendors">Vendors</Link>

            <Link to="/purchase-orders">Purchase Orders</Link>

            <Link to="/rfqs">RFQs</Link>

            <Link to="/quotations">Quotations</Link>

            <Link to="/grns">GRN</Link>

            <Link to="/expenses">Expenses</Link>

            <Link to="/interim-payments">Interim Payments</Link>

            <Link to="/reports">Reports</Link>

            <Link to="/profit-loss">Profit & Loss</Link>
            <Link to="/documents">Documents</Link>
            <Link to="/notifications">Notifications</Link>
            <Link to="/daily-reports">Daily Reports</Link>
            {canReviewLeave && <Link to={user?.role === "admin" || user?.role === "hr" ? "/hr-management" : "/manager-leaves"}>{user?.role === "admin" || user?.role === "hr" ? "HR Management" : "Leave Review"}</Link>}
            </>}
         </nav>
      </aside>
      </>
   );
}
