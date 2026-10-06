import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Forbidden from "../pages/Forbidden";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import ProjectPage from "../pages/projects/ProjectPage";
import SupervisorProjectPage from "../pages/projects/SupervisorProjectPage";
import ProjectDetailsPage from "../pages/projects/ProjectDetailsPage";
import ClientsPage from "../pages/clients/ClientsPage";
import ContractsPage from "../pages/contracts/ContractsPage";
import ContractDetailsPage from "../pages/contracts/ContractDetailsPage";
import InterimPaymentsPage from "../pages/interimPayments/InterimPaymentsPage";
import RFQsPage from "../pages/rfqs/RFQsPage";
import QuotationsPage from "../pages/quotations/QuotationsPage";
import ClientDetailsPage from "../pages/clients/ClientDetailsPage";
import ProtectedRoute from "../auth/ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import AttendancePage from "../pages/attendance/AttendancePage";
import EmployeePage from "../pages/employees/EmployeePage";
import InventoryPage from "../pages/inventory/InventoryPage";
import VendorsPage from "../pages/vendors/VendorsPage";
import PurchaseOrdersPage from "../pages/purchase-orders/PurchaseOrdersPage";
import GRNPage from "../pages/grn/GRNPage";
import MaterialIssuesPage from "../pages/material-issues/MaterialIssuesPage";
import MaterialRequestsPage from "../pages/material-requests/MaterialRequestsPage";
import ExpensesPage from "../pages/expenses/ExpensesPage";
import ReportsPage from "../pages/reports/ReportsPage";
import ProfitLossPage from "../pages/profit-loss/ProfitLossPage";
import DailyReportsPage from "../pages/daily-reports/DailyReportsPage";
import HRManagementPage from "../pages/hr/HRManagementPage";
import HRDashboard from "../pages/hr/HRDashboard";
import ChartOfAccountsPage from "../pages/accounting/ChartOfAccountsPage";
import JournalEntriesPage from "../pages/accounting/JournalEntriesPage";
import GeneralLedgerPage from "../pages/accounting/GeneralLedgerPage";
import TrialBalancePage from "../pages/accounting/TrialBalancePage";
import ProfitLossAccountingPage from "../pages/accounting/ProfitLossAccountingPage";
import BalanceSheetPage from "../pages/accounting/BalanceSheetPage";
import AccountsReceivablePage from "../pages/accounting/AccountsReceivablePage";
import AccountsPayablePage from "../pages/accounting/AccountsPayablePage";
import CustomerPaymentsPage from "../pages/accounting/CustomerPaymentsPage";
import VendorPaymentsPage from "../pages/accounting/VendorPaymentsPage";
import CashBankAccountsPage from "../pages/accounting/CashBankAccountsPage";
import ProjectAllocationsPage from "../pages/accounting/ProjectAllocationsPage";
import AccountCategoriesPage from "../pages/accounting/AccountCategoriesPage";
import DocumentsPage from "../pages/documents/DocumentsPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import RoleDashboard from "../pages/RoleDashboard";

export default function AppRouter() {
   return (
      <Routes>
         <Route path="/login" element={<Login />} />
         <Route path="/forbidden" element={<Forbidden />} />

         {/* Admin / general workspace */}
         <Route
            path="/"
            element={
               <ProtectedRoute>
                  <AppLayout />
               </ProtectedRoute>
            }
         >
            <Route index element={<Dashboard />} />
            <Route path="daily-reports" element={<DailyReportsPage />} />
            <Route path="manager-leaves" element={<HRManagementPage />} />
            <Route path="users" element={<Users />} />
            <Route path="projects" element={<ProjectPage />} />
            <Route path="projects/:id" element={<ProjectDetailsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:id" element={<ClientDetailsPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="contracts/:id" element={<ContractDetailsPage />} />
            <Route path="employees" element={<EmployeePage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="grns" element={<GRNPage />} />
            <Route path="material-issues" element={<MaterialIssuesPage />} />
            <Route path="material-request" element={<MaterialRequestsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="interim-payments" element={<InterimPaymentsPage />} />
            <Route path="rfqs" element={<RFQsPage />} />
            <Route path="quotations" element={<QuotationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="profit-loss" element={<ProfitLossPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="hr-management/*" element={<HRManagementPage />} />
         </Route>

         {/* HR workspace */}
         <Route
            path="/hr"
            element={
               <ProtectedRoute role="hr">
                  <AppLayout />
               </ProtectedRoute>
            }
         >
            <Route index element={<HRDashboard />} />
            <Route path="employees" element={<HRManagementPage section="employees" />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="departments" element={<HRManagementPage section="departments" />} />
            <Route path="designations" element={<HRManagementPage section="designations" />} />
            <Route path="leaves" element={<HRManagementPage section="leaves" />} />
            <Route path="salary" element={<HRManagementPage section="salary" />} />
            <Route path="payroll" element={<HRManagementPage section="payroll" />} />
            <Route path="reports" element={<HRManagementPage section="reports" />} />
         </Route>

         {/* Accountant workspace */}
         <Route
            path="/accountant"
            element={
               <ProtectedRoute role="accountant">
                  <AppLayout />
               </ProtectedRoute>
            }
         >
            <Route index element={<RoleDashboard role="accountant" />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="account-categories" element={<AccountCategoriesPage />} />
            <Route path="chart-of-accounts" element={<ChartOfAccountsPage />} />
            <Route path="journal-entries" element={<JournalEntriesPage />} />
            <Route path="general-ledger" element={<GeneralLedgerPage />} />
            <Route path="trial-balance" element={<TrialBalancePage />} />
            <Route path="profit-loss" element={<ProfitLossAccountingPage />} />
            <Route path="balance-sheet" element={<BalanceSheetPage />} />
            <Route path="accounts-receivable" element={<AccountsReceivablePage />} />
            <Route path="accounts-payable" element={<AccountsPayablePage />} />
            <Route path="customer-payments" element={<CustomerPaymentsPage />} />
            <Route path="vendor-payments" element={<VendorPaymentsPage />} />
            <Route path="cash-bank-accounts" element={<CashBankAccountsPage />} />
            <Route path="project-allocations" element={<ProjectAllocationsPage />} />
         </Route>

         {/* Purchase manager workspace */}
         <Route
            path="/purchase-manager"
            element={
               <ProtectedRoute role="purchase_manager">
                  <AppLayout />
               </ProtectedRoute>
            }
         >
            <Route index element={<RoleDashboard role="purchase_manager" />} />
            <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="material-requests" element={<MaterialRequestsPage />} />
            <Route path="vendors" element={<VendorsPage />} />
         </Route>

         {/* Store manager workspace */}
         <Route
            path="/store-manager"
            element={
               <ProtectedRoute role="store_manager">
                  <AppLayout />
               </ProtectedRoute>
            }
         >
            <Route index element={<RoleDashboard role="store_manager" />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="material-issues" element={<MaterialIssuesPage />} />
         </Route>

         {/* Site supervisor workspace */}
         <Route
            path="/site-supervisor"
            element={
               <ProtectedRoute role="site_supervisor">
                  <AppLayout />
               </ProtectedRoute>
            }
         >
            <Route index element={<DailyReportsPage />} />
            <Route path="projects" element={<SupervisorProjectPage />} />
         </Route>

         {/* Employee self-service portal (uses general layout) */}
         <Route
            path="/employee"
            element={
               <ProtectedRoute role="employee">
                  <AppLayout />
               </ProtectedRoute>
            }
         >
            <Route path="leaves" element={<HRManagementPage section="leaves" />} />
            <Route path="payslips" element={<HRManagementPage section="payroll" />} />
         </Route>
      </Routes>
   );
}
