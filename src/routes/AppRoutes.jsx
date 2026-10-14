import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import { PageLoader } from "../components/ui/States";

const Login = lazy(() => import("../pages/Login"));
const Forbidden = lazy(() => import("../pages/Forbidden"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Users = lazy(() => import("../pages/Users"));
const ProjectPage = lazy(() => import("../pages/projects/ProjectPage"));
const SupervisorProjectPage = lazy(() => import("../pages/projects/SupervisorProjectPage"));
const ProjectDetailsPage = lazy(() => import("../pages/projects/ProjectDetailsPage"));
const ClientsPage = lazy(() => import("../pages/clients/ClientsPage"));
const ContractsPage = lazy(() => import("../pages/contracts/ContractsPage"));
const ContractDetailsPage = lazy(() => import("../pages/contracts/ContractDetailsPage"));
const InterimPaymentsPage = lazy(() => import("../pages/interimPayments/InterimPaymentsPage"));
const RFQsPage = lazy(() => import("../pages/rfqs/RFQsPage"));
const QuotationsPage = lazy(() => import("../pages/quotations/QuotationsPage"));
const ClientDetailsPage = lazy(() => import("../pages/clients/ClientDetailsPage"));
const AttendancePage = lazy(() => import("../pages/attendance/AttendancePage"));
const EmployeePage = lazy(() => import("../pages/employees/EmployeePage"));
const InventoryPage = lazy(() => import("../pages/inventory/InventoryPage"));
const VendorsPage = lazy(() => import("../pages/vendors/VendorsPage"));
const PurchaseOrdersPage = lazy(() => import("../pages/purchase-orders/PurchaseOrdersPage"));
const GRNPage = lazy(() => import("../pages/grn/GRNPage"));
const MaterialIssuesPage = lazy(() => import("../pages/material-issues/MaterialIssuesPage"));
const MaterialRequestsPage = lazy(() => import("../pages/material-requests/MaterialRequestsPage"));
const ExpensesPage = lazy(() => import("../pages/expenses/ExpensesPage"));
const ReportsPage = lazy(() => import("../pages/reports/ReportsPage"));
const ProfitLossPage = lazy(() => import("../pages/profit-loss/ProfitLossPage"));
const DailyReportsPage = lazy(() => import("../pages/daily-reports/DailyReportsPage"));
const HRManagementPage = lazy(() => import("../pages/hr/HRManagementPage"));
const HRDashboard = lazy(() => import("../pages/hr/HRDashboard"));
const ChartOfAccountsPage = lazy(() => import("../pages/accounting/ChartOfAccountsPage"));
const JournalEntriesPage = lazy(() => import("../pages/accounting/JournalEntriesPage"));
const GeneralLedgerPage = lazy(() => import("../pages/accounting/GeneralLedgerPage"));
const TrialBalancePage = lazy(() => import("../pages/accounting/TrialBalancePage"));
const ProfitLossAccountingPage = lazy(() => import("../pages/accounting/ProfitLossAccountingPage"));
const BalanceSheetPage = lazy(() => import("../pages/accounting/BalanceSheetPage"));
const AccountsReceivablePage = lazy(() => import("../pages/accounting/AccountsReceivablePage"));
const AccountsPayablePage = lazy(() => import("../pages/accounting/AccountsPayablePage"));
const CustomerPaymentsPage = lazy(() => import("../pages/accounting/CustomerPaymentsPage"));
const VendorPaymentsPage = lazy(() => import("../pages/accounting/VendorPaymentsPage"));
const CashBankAccountsPage = lazy(() => import("../pages/accounting/CashBankAccountsPage"));
const ProjectAllocationsPage = lazy(() => import("../pages/accounting/ProjectAllocationsPage"));
const AccountCategoriesPage = lazy(() => import("../pages/accounting/AccountCategoriesPage"));
const DocumentsPage = lazy(() => import("../pages/documents/DocumentsPage"));
const NotificationsPage = lazy(() => import("../pages/notifications/NotificationsPage"));
const RoleDashboard = lazy(() => import("../pages/RoleDashboard"));

function LazyPage({ children }) {
   return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function AppRouter() {
   return (
      <LazyPage>
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
      </LazyPage>
   );
}
