import {
   FiActivity,
   FiArchive,
   FiBarChart2,
   FiBookOpen,
   FiBriefcase,
   FiClipboard,
   FiCreditCard,
   FiDollarSign,
   FiFileText,
   FiFolder,
   FiGrid,
   FiHome,
   FiLayers,
   FiPackage,
   FiPieChart,
   FiShoppingCart,
   FiTrendingUp,
   FiTruck,
   FiUserCheck,
   FiUsers,
   FiBriefcase as FiDept,
} from "react-icons/fi";

/*
|--------------------------------------------------------------------------
| Role-driven navigation map
|--------------------------------------------------------------------------
| Each entry: { label, to, icon, end?, badge? }
| Groups: { label, items: [...] }
*/

const adminNav = [
   {
      label: "Overview",
      items: [{ label: "Dashboard", to: "/", icon: FiGrid, end: true }],
   },
   {
      label: "Operations",
      items: [
         { label: "Daily Reports", to: "/daily-reports", icon: FiClipboard },
         { label: "Projects", to: "/projects", icon: FiLayers },
         { label: "Clients", to: "/clients", icon: FiUsers },
         { label: "Contracts", to: "/contracts", icon: FiFileText },
      ],
   },
   {
      label: "Workforce",
      items: [
         { label: "Employees", to: "/employees", icon: FiUserCheck },
         { label: "Attendance", to: "/attendance", icon: FiActivity },
         { label: "Users", to: "/users", icon: FiUsers },
         { label: "HR Management", to: "/hr-management", icon: FiBriefcase },
      ],
   },
   {
      label: "Procurement",
      items: [
         { label: "Vendors", to: "/vendors", icon: FiTruck },
         { label: "Purchase Orders", to: "/purchase-orders", icon: FiShoppingCart },
         { label: "RFQs", to: "/rfqs", icon: FiFileText },
         { label: "Quotations", to: "/quotations", icon: FiDollarSign },
         { label: "GRN", to: "/grns", icon: FiPackage },
      ],
   },
   {
      label: "Inventory",
      items: [
         { label: "Inventory", to: "/inventory", icon: FiArchive },
         { label: "Material Issue", to: "/material-issues", icon: FiPackage },
         { label: "Material Request", to: "/material-request", icon: FiClipboard },
      ],
   },
   {
      label: "Finance",
      items: [
         { label: "Expenses", to: "/expenses", icon: FiCreditCard },
         { label: "Interim Payments", to: "/interim-payments", icon: FiDollarSign },
         { label: "Profit & Loss", to: "/profit-loss", icon: FiTrendingUp },
         { label: "Reports", to: "/reports", icon: FiBarChart2 },
      ],
   },
   {
      label: "System",
      items: [
         { label: "Documents", to: "/documents", icon: FiFolder },
         { label: "Notifications", to: "/notifications", icon: FiBookOpen, badge: "unread" },
      ],
   },
];

const hrNav = [
   {
      label: "Overview",
      items: [{ label: "HR Dashboard", to: "/hr", icon: FiGrid, end: true }],
   },
   {
      label: "People",
      items: [
         { label: "Employees", to: "/hr/employees", icon: FiUserCheck },
         { label: "Attendance", to: "/hr/attendance", icon: FiActivity },
         { label: "Departments", to: "/hr/departments", icon: FiDept },
         { label: "Designations", to: "/hr/designations", icon: FiBriefcase },
      ],
   },
   {
      label: "Payroll",
      items: [
         { label: "Leave Management", to: "/hr/leaves", icon: FiClipboard },
         { label: "Salary Structures", to: "/hr/salary", icon: FiDollarSign },
         { label: "Payroll", to: "/hr/payroll", icon: FiCreditCard },
         { label: "Payroll Reports", to: "/hr/reports", icon: FiBarChart2 },
      ],
   },
];

const accountantNav = [
   {
      label: "Overview",
      items: [
         { label: "Dashboard", to: "/accountant", icon: FiGrid, end: true },
         { label: "Expenses", to: "/accountant/expenses", icon: FiCreditCard, end: true },
      ],
   },
   {
      label: "Accounting",
      items: [
         { label: "Account Categories", to: "/accountant/account-categories", icon: FiFolder },
         { label: "Chart of Accounts", to: "/accountant/chart-of-accounts", icon: FiBookOpen },
         { label: "Journal Entries", to: "/accountant/journal-entries", icon: FiFileText },
         { label: "General Ledger", to: "/accountant/general-ledger", icon: FiPieChart },
         { label: "Trial Balance", to: "/accountant/trial-balance", icon: FiBarChart2 },
         { label: "Profit & Loss", to: "/accountant/profit-loss", icon: FiTrendingUp },
         { label: "Balance Sheet", to: "/accountant/balance-sheet", icon: FiLayers },
      ],
   },
   {
      label: "Receivables & Payables",
      items: [
         { label: "Accounts Receivable", to: "/accountant/accounts-receivable", icon: FiTrendingUp },
         { label: "Accounts Payable", to: "/accountant/accounts-payable", icon: FiCreditCard },
         { label: "Customer Payments", to: "/accountant/customer-payments", icon: FiDollarSign },
         { label: "Vendor Payments", to: "/accountant/vendor-payments", icon: FiShoppingCart },
      ],
   },
   {
      label: "Cash & Projects",
      items: [
         { label: "Cash & Bank", to: "/accountant/cash-bank-accounts", icon: FiArchive },
         { label: "Project Allocations", to: "/accountant/project-allocations", icon: FiLayers },
      ],
   },
];

const purchaseNav = [
   {
      label: "Overview",
      items: [{ label: "Dashboard", to: "/purchase-manager", icon: FiGrid, end: true }],
   },
   {
      label: "Procurement",
      items: [
         { label: "Purchase Orders", to: "/purchase-manager/purchase-orders", icon: FiShoppingCart },
         { label: "Material Requests", to: "/purchase-manager/material-requests", icon: FiClipboard },
         { label: "Vendors", to: "/purchase-manager/vendors", icon: FiTruck },
      ],
   },
];

const storeNav = [
   {
      label: "Overview",
      items: [{ label: "Dashboard", to: "/store-manager", icon: FiGrid, end: true }],
   },
   {
      label: "Store",
      items: [
         { label: "Inventory", to: "/store-manager/inventory", icon: FiArchive },
         { label: "Material Issues", to: "/store-manager/material-issues", icon: FiPackage },
      ],
   },
];

const supervisorNav = [
   {
      label: "Site",
      items: [
         { label: "Daily Reports", to: "/site-supervisor", icon: FiClipboard, end: true },
         { label: "Projects", to: "/site-supervisor/projects", icon: FiLayers },
         { label: "Leave Review", to: "/manager-leaves", icon: FiUserCheck },
      ],
   },
];

const employeeNav = [
   {
      label: "My Portal",
      items: [
         { label: "My Leave", to: "/employee/leaves", icon: FiClipboard },
         { label: "My Payslips", to: "/employee/payslips", icon: FiDollarSign },
      ],
   },
];

export function getNavigation(role) {
   switch (role) {
      case "hr":
         return { title: "HR Workspace", subtitle: "People & payroll", groups: hrNav };
      case "accountant":
         return { title: "Finance Desk", subtitle: "Accounting & ledgers", groups: accountantNav };
      case "purchase_manager":
         return { title: "Procurement", subtitle: "Sourcing & vendors", groups: purchaseNav };
      case "store_manager":
         return { title: "Store Room", subtitle: "Inventory control", groups: storeNav };
      case "site_supervisor":
         return { title: "Site Workspace", subtitle: "Field operations", groups: supervisorNav };
      case "employee":
         return { title: "Employee Portal", subtitle: "Self service", groups: employeeNav };
      default:
         return { title: "BuildFlow", subtitle: "Construction ERP", groups: adminNav };
   }
}

export const COMPANY_META = {
   name: "BuildFlow",
   tagline: "Construction ERP",
};

export { FiHome };
