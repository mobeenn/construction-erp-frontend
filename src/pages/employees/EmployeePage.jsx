import { useEffect, useState } from "react";

import { getEmployees } from "../../services/employeeService";
import { useToast } from "../../components/ui/ToastContext";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import { FiPlus } from "react-icons/fi";
import Modal from "../../components/ui/Modal";
import { SearchInput, Pagination } from "../../components/ui/Controls";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";
import { TableSkeleton } from "../../components/ui/States";

export default function EmployeePage() {
   const toast = useToast();
   const { user } = useAuth();
   const canCreate = ["admin", "hr"].includes(user?.role);

   const [employees, setEmployees] = useState([]);
   const [page, setPage] = useState(1);
   const [pages, setPages] = useState(1);
   const [search, setSearch] = useState("");
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);

   const loadEmployees = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await getEmployees(page, 10, search);
         setEmployees(res.data.data || []);
         setPages(res.data.pages || 1);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load employees.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadEmployees();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [page, search]);

   useEffect(() => {
      setPage(1);
   }, [search]);

   return (
      <div className="space-y-4">
         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search employees…"
               className="sm:max-w-sm"
            />
            {canCreate && (
               <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
                  Add Employee
               </Button>
            )}
         </div>

         {loading ? (
            <TableSkeleton rows={6} cols={5} />
         ) : (
            <EmployeeTable employees={employees} loadEmployees={loadEmployees} />
         )}

         <Pagination page={page} pages={pages} onChange={setPage} />

         <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Add Employee"
            subtitle="Register a new team member."
            size="lg"
         >
            <EmployeeForm
               loadEmployees={() => {
                  setOpen(false);
                  loadEmployees(false);
               }}
            />
         </Modal>
      </div>
   );
}
