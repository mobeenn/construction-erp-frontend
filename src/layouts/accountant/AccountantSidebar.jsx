import { NavLink } from "react-router-dom";

export default function AccountantSidebar() {
   return (
      <div className="w-64 bg-white border-r p-4">
         <h2 className="text-xl font-bold mb-6">Accountant Panel</h2>

         <nav className="flex flex-col gap-2">
            <NavLink to="/accountant" className="p-2 hover:bg-gray-100">
               Dashboard
            </NavLink>

            <NavLink
               to="/accountant/expenses"
               className="p-2 hover:bg-gray-100"
            >
               Expenses
            </NavLink>

            <div className="mt-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
               Accounting
            </div>

            <NavLink
               to="/accountant/account-categories"
               className="p-2 hover:bg-gray-100"
            >
               Account Categories
            </NavLink>

            <NavLink
               to="/accountant/chart-of-accounts"
               className="p-2 hover:bg-gray-100"
            >
               Chart of Accounts
            </NavLink>

            <NavLink
               to="/accountant/journal-entries"
               className="p-2 hover:bg-gray-100"
            >
               Journal Entries
            </NavLink>

            <NavLink
               to="/accountant/general-ledger"
               className="p-2 hover:bg-gray-100"
            >
               General Ledger
            </NavLink>

            <NavLink
               to="/accountant/trial-balance"
               className="p-2 hover:bg-gray-100"
            >
               Trial Balance
            </NavLink>

            <NavLink
               to="/accountant/profit-loss"
               className="p-2 hover:bg-gray-100"
            >
               Profit & Loss
            </NavLink>

            <NavLink
               to="/accountant/balance-sheet"
               className="p-2 hover:bg-gray-100"
            >
               Balance Sheet
            </NavLink>

            <div className="mt-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
               Receivables & Payables
            </div>

            <NavLink
               to="/accountant/accounts-receivable"
               className="p-2 hover:bg-gray-100"
            >
               Accounts Receivable
            </NavLink>

            <NavLink
               to="/accountant/accounts-payable"
               className="p-2 hover:bg-gray-100"
            >
               Accounts Payable
            </NavLink>

            <NavLink
               to="/accountant/customer-payments"
               className="p-2 hover:bg-gray-100"
            >
               Customer Payments
            </NavLink>

            <NavLink
               to="/accountant/vendor-payments"
               className="p-2 hover:bg-gray-100"
            >
               Vendor Payments
            </NavLink>

            <div className="mt-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
               Cash & Bank
            </div>

            <NavLink
               to="/accountant/cash-bank-accounts"
               className="p-2 hover:bg-gray-100"
            >
               Cash & Bank Accounts
            </NavLink>

            <div className="mt-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
               Projects
            </div>

            <NavLink
               to="/accountant/project-allocations"
               className="p-2 hover:bg-gray-100"
            >
               Project Allocations
            </NavLink>
         </nav>
      </div>
   );
}
