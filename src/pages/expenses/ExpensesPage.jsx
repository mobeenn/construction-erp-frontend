import { useEffect, useState } from "react";
import { FiCreditCard, FiPlus } from "react-icons/fi";

import ExpenseForm from "./ExpenseForm";
import ExpenseTable from "./ExpenseTable";
import { getExpenses } from "../../services/expenseService";
import { useToast } from "../../components/ui/ToastContext";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput } from "../../components/ui/Controls";
import { TableSkeleton } from "../../components/ui/States";

export default function ExpensesPage() {
   const toast = useToast();
   const { user } = useAuth();
   const canCreate = ["admin", "accountant"].includes(user?.role);

   const [expenses, setExpenses] = useState([]);
   const [search, setSearch] = useState("");
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);

   const loadExpenses = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await getExpenses();
         setExpenses(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load expenses.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadExpenses();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = expenses.filter((e) =>
      `${e.expenseNo} ${e.project?.name} ${e.category}`
         .toLowerCase()
         .includes(search.toLowerCase()),
   );

   return (
      <div className="space-y-4">
         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search expenses…"
               className="sm:max-w-sm"
            />
            {canCreate && (
               <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
                  Add Expense
               </Button>
            )}
         </div>

         {loading ? (
            <TableSkeleton rows={5} cols={5} />
         ) : (
            <ExpenseTable expenses={filtered} />
         )}

         <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Record Expense"
            subtitle="Log a new project or operational expense."
            size="md"
         >
            <ExpenseForm
               loadExpenses={() => {
                  setOpen(false);
                  loadExpenses(false);
               }}
            />
         </Modal>
      </div>
   );
}

void FiCreditCard;
