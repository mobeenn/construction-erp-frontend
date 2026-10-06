import { FiCreditCard } from "react-icons/fi";
import { TableHead, TableShell, TableWrap } from "../../components/ui/TableShell";
import { EmptyState } from "../../components/ui/States";
import { humanize } from "../../components/ui/StatusBadge";
import { formatMoney } from "../../utils/format";

export default function ExpenseTable({ expenses }) {
   if (!expenses.length) {
      return (
         <TableShell>
            <EmptyState
               icon={FiCreditCard}
               title="No expenses recorded"
               message="Record an expense or adjust your search."
            />
         </TableShell>
      );
   }

   const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

   return (
      <TableShell>
         <TableHead
            title="Expenses"
            subtitle={`${expenses.length} records · ${formatMoney(total, { compact: true })} total`}
            icon={FiCreditCard}
         />
         <TableWrap>
            <table className="data-table">
               <thead>
                  <tr>
                     <th>Expense No</th>
                     <th>Project</th>
                     <th>Category</th>
                     <th>Amount</th>
                     <th>Payment</th>
                     <th>Date</th>
                  </tr>
               </thead>
               <tbody>
                  {expenses.map((item) => (
                     <tr key={item._id}>
                        <td className="font-semibold text-ink-900">{item.expenseNo || "—"}</td>
                        <td>{item.project?.name || "—"}</td>
                        <td>
                           <span className="badge badge-neutral">{humanize(item.category)}</span>
                        </td>
                        <td className="font-semibold text-ink-900">{formatMoney(item.amount)}</td>
                        <td>{humanize(item.paymentMethod)}</td>
                        <td className="text-ink-500">
                           {item.expenseDate ? new Date(item.expenseDate).toLocaleDateString() : "—"}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </TableWrap>
      </TableShell>
   );
}
