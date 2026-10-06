/* Route-aware guided tour content. Each tour: title, subtitle, steps[]. */

function steps(...list) {
   return list.map(([heading, body, action]) => ({ heading, body, action }));
}

const TOURS = [
   {
      match: (p) => p === "/",
      title: "Dashboard tour",
      subtitle: "Your command center for the whole portfolio.",
      steps: steps(
         ["Welcome to the Dashboard", "This page gives you a live view of projects, workforce, procurement and finance. Use it every morning to spot what needs attention.", "Scan the KPIs first"],
         ["KPI cards", "Active Projects, Present Today, Inventory Value and Monthly Expense summarize the whole business. Pending Requests, Draft POs and Low Stock highlight what needs action today.", "Click a quick-stat card to jump there"],
         ["Revenue, budget and procurement charts", "Revenue vs Expenses, Budget vs Actual and Procurement Status show trends over the last months. Hover any chart for exact values.", "Hover charts for details"],
         ["Top projects and stock alerts", "Top Projects links straight to delivery status, and Low Stock Alerts warn you before a site runs out of material.", "Follow View all to act"],
      ),
   },
   {
      match: (p) => /^\/projects\/[^/]+$/.test(p),
      title: "Project details tour",
      subtitle: "Everything about one site, in 13 tabs.",
      steps: steps(
         ["Project header", "The header shows the project code, client, location, status, priority and overall progress, plus contract value and approved budget.", "Use Back to Projects to return"],
         ["The 13 tabs", "Switch between Overview, Activities, Progress, Budget, Costs, Materials, Purchase Orders, GRNs, Material Issues, Expenses, Interim Payments, Documents and Reports. The tab bar scrolls sideways on small screens.", "Click each tab to explore"],
         ["Plan and track work", "Activities holds the work-breakdown lines with quantities and status. Progress collects site updates that you approve or reject, and Budget compares approved cost against actual spend.", "Add an activity, then submit a progress update"],
         ["Materials and procurement", "Materials shows site stock, Purchase Orders and GRNs trace buying and deliveries, Material Issues records what left the store, and Expenses logs site costs.", "Use the search box inside each tab to filter"],
         ["Billing and records", "Interim Payments manages running bills from draft to paid. Documents stores drawings and contracts, and Reports gives a one-page cost and billing snapshot you can export as CSV.", "Create a bill, then export the report"],
      ),
   },
   {
      match: (p) => p === "/projects",
      title: "Projects tour",
      subtitle: "Every construction site in one register.",
      steps: steps(
         ["Project register", "Each row is one site with its code, client, location, budget, progress and status.", "Scan status badges for health"],
         ["Search and filter", "Use the search box and the status filter to narrow the list, for example to see only in-progress sites.", "Type a site name to filter"],
         ["Open a project", "Click a project name or code to open its details workspace with 13 tabs for delivery, cost and billing.", "Click any row to drill in"],
         ["Create and edit", "Admins can add a project with the New Project button and update budget, status or revenue from the row actions.", "Try New Project"],
      ),
   },
   {
      match: (p) => p === "/daily-reports",
      title: "Daily reports tour",
      subtitle: "Field updates from site supervisors.",
      steps: steps(
         ["Report feed", "Each card is one day on site: weather, work performed, manpower, equipment and materials used.", "Filter by status or project"],
         ["Submit a report", "Site supervisors fill the form with site, date, weather and work performed, plus manpower and equipment lines.", "Fill the form and submit"],
         ["Review workflow", "Managers approve or reject pending reports. Approved updates can roll into activity progress and inventory.", "Approve a pending report"],
      ),
   },
   {
      match: (p) => p.startsWith("/clients"),
      title: "Clients tour",
      subtitle: "The developers and owners you build for.",
      steps: steps(
         ["Client directory", "Each client shows contact person, phone, email and linked projects and contracts.", "Search by name or code"],
         ["Client details", "Open a client to see profile info, all its projects with values, and every signed contract.", "Click a client name"],
         ["Add or edit", "Keep contact, tax and payment-term details current so billing and reports stay accurate.", "Use New Client"],
      ),
   },
   {
      match: (p) => p.startsWith("/contracts"),
      title: "Contracts tour",
      subtitle: "Agreements behind every project.",
      steps: steps(
         ["Contract register", "Track contract number, type, value, retention, advance and status across client and subcontract agreements.", "Filter by status"],
         ["Contract details", "Open a contract for full terms, the revised value, billed vs received amounts, attached documents and interim bills.", "Click a contract number"],
         ["Create a contract", "Link it to a client and project, set value, retention and schedule, then move it from draft to active.", "Try New Contract"],
      ),
   },
   {
      match: (p) => p === "/employees" || p === "/hr/employees",
      title: "Employees tour",
      subtitle: "Everyone on the workforce.",
      steps: steps(
         ["Employee directory", "Profiles show designation, department, site, project, salary and status.", "Search by name or ID"],
         ["Add and edit", "HR can add employees with CNIC, phone, salary and project assignment, and update profiles later.", "Open the employee form"],
         ["Connected records", "Attendance, leave, salary structures and payslips all link back to these profiles.", "Open HR leaves or payroll next"],
      ),
   },
   {
      match: (p) => p === "/attendance" || p === "/hr/attendance",
      title: "Attendance tour",
      subtitle: "Daily presence and overtime.",
      steps: steps(
         ["Daily register", "Pick a date to see who was present, absent or on half day, plus overtime hours.", "Change the date picker"],
         ["Summary cards", "Present, Absent, Half Day and Overtime totals update automatically for the selected day.", "Check the summary row"],
         ["Mark attendance", "HR and supervisors mark the register per employee and project. It feeds payroll overtime.", "Use Mark Attendance"],
      ),
   },
   {
      match: (p) => p === "/users",
      title: "Users tour",
      subtitle: "Login accounts and roles.",
      steps: steps(
         ["User list", "Each login shows name, email, role and active state. Roles control which workspaces open.", "Search by name or email"],
         ["Create users", "Admins create accounts per role: HR, accountant, store or purchase manager, supervisor, employee.", "Use New User"],
         ["Activate or remove", "Deactivate leavers instead of deleting, so history stays intact.", "Use row actions"],
      ),
   },
   {
      match: (p) => p === "/inventory" || p === "/store-manager/inventory",
      title: "Inventory tour",
      subtitle: "Stock across every site store.",
      steps: steps(
         ["Stock table", "Each material shows project, warehouse, current stock, minimum level, unit and price. Low-stock rows are flagged.", "Watch the reorder badges"],
         ["Search and filter", "Filter by project or warehouse, or search by material name to find stock fast.", "Try the filters"],
         ["Move stock", "Use Stock In, Stock Out, Transfer and Adjustment from the actions. Every movement writes a transaction.", "Open a material row"],
      ),
   },
   {
      match: (p) => p === "/vendors" || p === "/purchase-manager/vendors",
      title: "Vendors tour",
      subtitle: "Suppliers and subcontractors.",
      steps: steps(
         ["Vendor directory", "Company, contact person, phone and vendor code for everyone you buy from.", "Search by company"],
         ["Vendor details", "Open a vendor for purchase history, payables and linked quotations.", "Click a vendor"],
         ["Add vendors", "Purchase managers register new suppliers so they appear in RFQ and PO dropdowns.", "Use New Vendor"],
      ),
   },
   {
      match: (p) => p === "/purchase-orders" || p === "/purchase-manager/purchase-orders",
      title: "Purchase orders tour",
      subtitle: "From request to delivered material.",
      steps: steps(
         ["PO pipeline", "Draft, approved and delivered orders with vendor, project, totals and status.", "Filter by status"],
         ["Create a PO", "Pick a vendor and project, add material lines with quantities and prices. Totals calculate automatically.", "Try New Purchase Order"],
         ["Approve and receive", "Approve drafts, then receive them through GRNs which update stock automatically.", "Open a PO to continue"],
      ),
   },
   {
      match: (p) => p === "/rfqs",
      title: "RFQs tour",
      subtitle: "Get competitive prices first.",
      steps: steps(
         ["RFQ list", "Open and awarded requests with project, items and quantities.", "Check the status column"],
         ["Create an RFQ", "List the materials and quantities you need, then invite vendors to quote.", "Use New RFQ"],
         ["Compare quotations", "Open an RFQ to compare vendor prices side by side and select the winner.", "Open Quotations"],
      ),
   },
   {
      match: (p) => p === "/quotations",
      title: "Quotations tour",
      subtitle: "Vendor prices compared.",
      steps: steps(
         ["Quotation list", "Every vendor price against its RFQ, with totals and status.", "Search by vendor or RFQ"],
         ["Record a quotation", "Enter vendor, RFQ and line prices. The lowest compliant quote is easy to spot.", "Use New Quotation"],
         ["Select winner", "Mark the winning quote so purchasing can convert it into a PO.", "Use row actions"],
      ),
   },
   {
      match: (p) => p === "/grns",
      title: "GRNs tour",
      subtitle: "Goods received notes.",
      steps: steps(
         ["Receipt list", "Every delivery against a purchase order with quantities actually received.", "Search by GRN or PO number"],
         ["Receive a PO", "Choose an approved PO and confirm received quantities. Stock increases instantly.", "Use Receive Goods"],
         ["Track variances", "Ordered vs received quantities stay visible for audit.", "Open a GRN row"],
      ),
   },
   {
      match: (p) => p === "/material-request" || p === "/purchase-manager/material-requests",
      title: "Material requests tour",
      subtitle: "Site asks, store responds.",
      steps: steps(
         ["Request queue", "Pending, approved, rejected and issued requests per project.", "Filter by status"],
         ["New request", "Supervisors request material with quantity and required date.", "Use New Request"],
         ["Approve and issue", "Purchase or store approves, then issues stock which deducts inventory.", "Approve a pending row"],
      ),
   },
   {
      match: (p) => p === "/material-issues" || p === "/store-manager/material-issues",
      title: "Material issues tour",
      subtitle: "What left the store.",
      steps: steps(
         ["Issue register", "Every approved request that was issued, with quantity, issuer and date.", "Search by issue number"],
         ["Issue stock", "Issue only against approved requests so stock always balances.", "Use New Issue"],
      ),
   },
   {
      match: (p) => p === "/expenses" || p === "/accountant/expenses",
      title: "Expenses tour",
      subtitle: "Every rupee spent on site.",
      steps: steps(
         ["Expense list", "Labour, fuel, equipment and other costs with project, amount and payment method.", "Filter by category"],
         ["Record an expense", "Pick the project, enter category, amount and description. It feeds budgets and P&L.", "Use New Expense"],
         ["Watch totals", "KPI cards and charts show monthly spend and category breakdown.", "Check the summary cards"],
      ),
   },
   {
      match: (p) => p === "/interim-payments",
      title: "Interim payments tour",
      subtitle: "Running bills to the client.",
      steps: steps(
         ["Bill pipeline", "Draft, submitted, approved, partially paid and paid bills with gross, retention and net.", "Filter by status"],
         ["Create a bill", "Enter gross amount and retention for the period. Net calculates automatically.", "Use New Bill"],
         ["Move the workflow", "Submit, approve and mark paid as the client certifies and pays.", "Use row actions"],
      ),
   },
   {
      match: (p) => p === "/reports",
      title: "Reports tour",
      subtitle: "Portfolio intelligence in tabs.",
      steps: steps(
         ["Four reports in one", "Switch between Projects, Expenses, Inventory and Attendance tabs.", "Click each tab"],
         ["KPIs and charts", "Budgets, spend and stock totals plus visual breakdowns update with the data.", "Hover charts for values"],
         ["Search and export", "Search inside any tab, then export the current view as CSV for sharing.", "Try Export CSV"],
      ),
   },
   {
      match: (p) => p === "/profit-loss" || p === "/accountant/profit-loss",
      title: "Profit and loss tour",
      subtitle: "Is each project making money?",
      steps: steps(
         ["Project margins", "Revenue, expense and profit per project with a health badge.", "Sort by profit mentally"],
         ["Profit vs loss chart", "Top projects compared visually, plus overall margin health.", "Hover the bars"],
         ["Filter the view", "Show profitable or loss-making projects only, or search by name.", "Try the filter"],
      ),
   },
   {
      match: (p) => p === "/documents",
      title: "Documents tour",
      subtitle: "Drawings, contracts and records.",
      steps: steps(
         ["Document library", "Filter by entity type: project, contract, client, PO, GRN and more.", "Use the entity filter"],
         ["Upload a document", "Attach a file with a name, category and linked record.", "Use Upload"],
         ["Download anytime", "Open or download the file from the row actions.", "Click a row"],
      ),
   },
   {
      match: (p) => p === "/notifications",
      title: "Notifications tour",
      subtitle: "Never miss an approval.",
      steps: steps(
         ["Inbox", "Low stock, approvals, bills and reports arrive here with type icons.", "Filter by type"],
         ["Stay current", "Mark items read individually or clear all at once.", "Try Mark all read"],
         ["Act fast", "Many notifications link directly to the record needing you.", "Click a notification"],
      ),
   },
   {
      match: (p) => p === "/hr" || p === "/hr-management",
      title: "HR workspace tour",
      subtitle: "People, leave and payroll.",
      steps: steps(
         ["HR sections", "Use the tab bar for Employees, Attendance, Departments, Designations, Leaves, Salary, Payroll and Reports.", "Click each section tab"],
         ["Workforce stats", "Active headcount, pending leave decisions and current payroll status at a glance.", "Check the stat cards"],
         ["Workflows", "Submit leave, review as manager then HR, build salary structures, generate and lock payroll.", "Follow a leave request through"],
      ),
   },
   {
      match: (p) => p.startsWith("/hr/"),
      title: "HR section tour",
      subtitle: "One step of the people workflow.",
      steps: steps(
         ["Section panel", "Each HR section lives in panels with a header, filters and an action button.", "Read the panel subtitle counts"],
         ["Search and act", "Search the table, then use Add, Edit, Approve or Generate depending on the section.", "Try the primary button"],
         ["Linked data", "Employees link to departments, leaves link to projects, payroll links to salary structures.", "Follow the links across sections"],
      ),
   },
   {
      match: (p) => p.startsWith("/accountant"),
      title: "Finance desk tour",
      subtitle: "Ledgers, receivables and cash.",
      steps: steps(
         ["Accounting sections", "Use the sidebar for categories, chart of accounts, journals, ledger, trial balance, P&L, balance sheet, receivables, payables, payments, cash and allocations.", "Pick a section from the sidebar"],
         ["Double-entry discipline", "Journal debits must equal credits. Ledger, trial balance and statements always reflect posted journals.", "Post a balanced entry"],
         ["Money in and out", "Record customer receipts and vendor payments against the right ledger account and project.", "Try Record Payment"],
      ),
   },
   {
      match: (p) => p.startsWith("/purchase-manager"),
      title: "Procurement tour",
      subtitle: "Sourcing and vendors.",
      steps: steps(
         ["Procurement hub", "Dashboard plus Purchase Orders, Material Requests and Vendors.", "Check the KPI cards first"],
         ["Buying flow", "Request material, raise a PO, approve it, then receive via GRN.", "Follow one request end to end"],
      ),
   },
   {
      match: (p) => p.startsWith("/store-manager"),
      title: "Store room tour",
      subtitle: "Inventory control.",
      steps: steps(
         ["Store overview", "Inventory value, low-stock count and material usage charts.", "Check the reorder watchlist"],
         ["Daily store work", "Receive stock, issue against approved requests, and adjust or transfer between warehouses.", "Open Inventory"],
      ),
   },
   {
      match: (p) => p.startsWith("/site-supervisor") || p === "/manager-leaves",
      title: "Site workspace tour",
      subtitle: "Field operations.",
      steps: steps(
         ["Daily reporting", "Submit manpower, equipment and work performed every day.", "Fill the report form"],
         ["Leave reviews", "Review team leave before it goes to HR.", "Open Leave Review"],
      ),
   },
   {
      match: (p) => p.startsWith("/employee/"),
      title: "Employee portal tour",
      subtitle: "Your self service.",
      steps: steps(
         ["My leave", "Submit requests and track manager and HR decisions.", "Submit a request"],
         ["My payslips", "View approved salary slips for every locked payroll.", "Open a payslip"],
      ),
   },
];

const FALLBACK = {
   title: "Page tour",
   subtitle: "How to use this workspace.",
   steps: steps(
      ["What is this page?", "This workspace groups one part of the ERP: its stats, tables and actions all belong to the same workflow.", "Read the page subtitle"],
      ["Stats first, details second", "KPI cards at the top summarize everything. Tables below hold the full records.", "Scan top to bottom"],
      ["Search, filter and act", "Use the search box and filters to narrow down, then the primary button to create and row actions to edit.", "Try the buttons"],
   ),
};

export function getTour(pathname) {
   const found = TOURS.find((t) => {
      try {
         return t.match(pathname);
      } catch {
         return false;
      }
   });
   return found || FALLBACK;
}
