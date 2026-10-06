import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
   FiActivity,
   FiAward,
   FiBriefcase,
   FiCalendar,
   FiCheck,
   FiChevronRight,
   FiClock,
   FiDollarSign,
   FiEdit2,
   FiFileText,
   FiGrid,
   FiPlus,
   FiPrinter,
   FiRefreshCw,
   FiTrash2,
   FiTrendingUp,
   FiUsers,
   FiX,
} from "react-icons/fi";
import { useAuth } from "../../auth/AuthContext";
import { getEmployees, createEmployee, updateEmployee } from "../../services/employeeService";
import { getProjects } from "../../services/projectService";
import {
   approveLeaveRequest,
   createDepartment,
   createDesignation,
   createLeaveRequest,
   createPayrollPeriod,
   createSalaryStructure,
   deleteDepartment,
   deleteDesignation,
   generatePayroll,
   getDepartments,
   getDesignations,
   getLeaveRequests,
   getLeaveEmployees,
   getPayrollEntries,
   getPayrollPeriods,
   getPayrollReport,
   getPayslip,
   getMyPayslips,
   getMyPayslip,
   getSalaryStructures,
   reviewLeaveRequest,
   updatePayrollEntry,
   approvePayrollPeriod,
   updateDepartment,
   updateDesignation,
} from "../../services/employeeService";
import { getUsersApi } from "../../api/users.api";
import AttendancePage from "../attendance/AttendancePage";
import { useToast } from "../../components/ui/ToastContext";
import { BarChart, DonutChart, formatCurrency } from "../../components/charts/Charts";
import { ChartCard, Hero, KpiCard, ViewAllLink } from "../../components/dashboard/widgets";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput, FilterSelect } from "../../components/ui/Controls";
import { EmptyState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap, Avatar, RowActions } from "../../components/ui/TableShell";
import StatusBadge from "../../components/ui/StatusBadge";

const money = (value, currency = "PKR") =>
   new Intl.NumberFormat("en-PK", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value || 0));
const moneyShort = (value) => formatCurrency(value).replace("PKR ", "");
const dateValue = () => new Date().toISOString().slice(0, 10);
const formInput = "input";
const primaryButton = "btn btn-primary";
const secondaryButton = "btn btn-secondary btn-sm";

const SECTION_META = {
   Overview: { hint: "Metrics and shortcuts", icon: FiGrid },
   Employees: { hint: "Directory and profiles", icon: FiUsers },
   Departments: { hint: "Org structure", icon: FiBriefcase },
   Designations: { hint: "Roles and grades", icon: FiAward },
   Leave: { hint: "Requests and approvals", icon: FiCalendar },
   "My payslips": { hint: "Personal salary slips", icon: FiFileText },
   "Salary structures": { hint: "Pay components", icon: FiDollarSign },
   "Payroll periods": { hint: "Cycles and locking", icon: FiClock },
   "Payroll reports": { hint: "Gross-to-net totals", icon: FiTrendingUp },
   Attendance: { hint: "Daily registers", icon: FiActivity },
};

const mainLinks = [
   ["Overview", "/hr"],
   ["Employees", "/hr/employees"],
   ["Departments", "/hr/departments"],
   ["Designations", "/hr/designations"],
   ["Leave", "/hr/leaves"],
   ["My payslips", "/employee/payslips"],
   ["Salary structures", "/hr/salary"],
   ["Payroll periods", "/hr/payroll"],
   ["Payroll reports", "/hr/reports"],
   ["Attendance", "/hr/attendance"],
];

export default function HRManagementPage({ section } = {}) {
   const { user } = useAuth();
   const location = useLocation();
   const toast = useToast();
   const [employees, setEmployees] = useState([]);
   const [projects, setProjects] = useState([]);
   const [departments, setDepartments] = useState([]);
   const [designations, setDesignations] = useState([]);
   const [leaveRequests, setLeaveRequests] = useState([]);
   const [salaryStructures, setSalaryStructures] = useState([]);
   const [periods, setPeriods] = useState([]);
   const [entries, setEntries] = useState([]);
   const [report, setReport] = useState(null);
   const [selectedPeriod, setSelectedPeriod] = useState("");
   const [search, setSearch] = useState("");
   const [error, setError] = useState("");
   const [notice, setNotice] = useState("");
   const [loading, setLoading] = useState(true);
   const [formOpen, setFormOpen] = useState(false);
   const [users, setUsers] = useState([]);
   const isHR = ["hr", "admin"].includes(user?.role);
   const isManager = ["project_manager", "site_supervisor", "hr", "admin"].includes(user?.role);
   const rawPath = section ? `/hr/${section}` : location.pathname;
   const path = rawPath === "/hr/employees" && user?.role === "admin" && section ? "/hr-management/employees" : rawPath;
   const sectionBase = user?.role === "admin" ? "/hr-management" : "/hr";

   const load = useCallback(async () => {
      const [projectRes, employeeRes] = await Promise.all([
         getProjects(),
         isHR ? getEmployees(1, 1000, search) : Promise.resolve(null),
      ]);
      const data = { employees: employeeRes ? apiData(employeeRes) : [], projects: apiData(projectRes) };
      if (isHR) {
         const [departmentRes, designationRes, leaveRes, salaryRes, periodRes] = await Promise.all([
            getDepartments(), getDesignations(), getLeaveRequests(), getSalaryStructures(),
            getPayrollPeriods(),
         ]);
         data.departments = apiData(departmentRes);
         data.designations = apiData(designationRes);
         data.leaveRequests = apiData(leaveRes);
         data.salaryStructures = apiData(salaryRes);
         data.periods = apiData(periodRes);
         // User directory (department heads, portal accounts) is auxiliary:
         // it must never fail the whole HR workspace if access is restricted.
         try {
            data.users = apiData(await getUsersApi({ limit: 1000 }));
         } catch {
            data.users = [];
         }
      } else {
         const [leaveRes, leaveEmployeeRes] = await Promise.all([getLeaveRequests(), getLeaveEmployees()]);
         data.leaveRequests = apiData(leaveRes);
         data.employees = apiData(leaveEmployeeRes);
      }
      return data;
   }, [isHR, search]);

   const applyData = useCallback((data) => {
      setError("");
      setEmployees(data.employees);
      setProjects(data.projects);
      if (data.departments) setDepartments(data.departments);
      if (data.designations) setDesignations(data.designations);
      if (data.leaveRequests) setLeaveRequests(data.leaveRequests);
      if (data.salaryStructures) setSalaryStructures(data.salaryStructures);
      if (data.periods) setPeriods(data.periods);
      if (data.users) setUsers(data.users);
   }, []);

   const refresh = useCallback(async () => {
      const data = await load();
      applyData(data);
   }, [applyData, load]);

   useEffect(() => {
      let active = true;
      setLoading(true);
      load().then((data) => {
         if (active) applyData(data);
      }).catch((loadError) => {
         if (active) setError(loadError.response?.data?.message || "Unable to load HR data.");
      }).finally(() => {
         if (active) setLoading(false);
      });
      return () => { active = false; };
   }, [applyData, load]);

   useEffect(() => {
      if (!selectedPeriod) return;
      let active = true;
      getPayrollEntries(selectedPeriod)
         .then((response) => { if (active) setEntries(apiData(response)); })
         .catch((loadError) => { if (active) setError(loadError.response?.data?.message || "Unable to load payroll entries."); });
      return () => { active = false; };
   }, [selectedPeriod]);

   const run = async (action, successMessage) => {
      setError("");
      setNotice("");
      try {
         await action();
         setNotice(successMessage);
         toast.success(successMessage);
         await refresh();
         return true;
      } catch (actionError) {
         const message = actionError.response?.data?.message || actionError.message || "The requested action failed.";
         setError(message);
         toast.error(message);
         return false;
      }
   };

   const openReport = async (params = {}) => {
      try {
         setReport(apiData(await getPayrollReport(params)));
      } catch (loadError) {
         setError(loadError.response?.data?.message || "Unable to load payroll report.");
      }
   };

   const currentPeriod = periods.find((period) => period._id === selectedPeriod);
   const pendingLeaves = leaveRequests.filter((item) => user?.role === "admin"
      ? ["pending_manager", "pending_hr"].includes(item.status)
      : item.status === (user?.role === "hr" ? "pending_hr" : "pending_manager")).length;
   const thisMonth = dateValue().slice(0, 7);
   const activePayroll = periods.find((period) => period.startDate?.slice(0, 7) === thisMonth);
   const shownEmployees = employees.filter((employee) =>
      [employee.name, employee.employeeId, employee.designation, employee.assignedSite]
         .some((value) => String(value || "").toLowerCase().includes(search.toLowerCase())),
   );
   const activeEmployees = employees.filter((e) => e.status === "active").length;
   const isEmployeeRoute = path.endsWith("/employees");
   const activeSection = mainLinks.find(([, href]) => {
      const dest = href.replace(/^\/hr/, sectionBase);
      return path === dest || path === href;
   })?.[0] || "Overview";
   const activeMeta = SECTION_META[activeSection] || SECTION_META.Overview;

   const visibleLinks = mainLinks.filter(([, href]) => isHR
      ? href !== "/employee/payslips"
      : href === "/hr/leaves" || (user?.role === "employee" && href === "/employee/payslips"));

   return (
      <div className="space-y-5">
         <Hero
            eyebrow="People operations"
            title={`Human resources · ${user?.name?.split(" ")[0] || "team"}`}
            subtitle={`Workforce, leave and payroll across every project · ${activeEmployees} active · ${departments.length} departments · ${pendingLeaves} leave decisions pending.`}
            actions={
               <>
                  {isEmployeeRoute && isHR && (
                     <button type="button" onClick={() => setFormOpen(true)} className="btn btn-secondary">
                        <FiPlus size={16} />
                        Add employee
                     </button>
                  )}
                  <button type="button" onClick={refresh} className="btn bg-[#0d222b] text-white hover:brightness-110">
                     <FiRefreshCw size={16} />
                     Refresh data
                  </button>
               </>
            }
         >
            <div className="hidden items-center gap-5 rounded-2xl bg-[#0d222b]/12 p-4 backdrop-blur-sm xl:flex">
               <HeroMini label="Headcount" value={String(employees.length)} />
               <span className="h-10 w-px bg-[#0d222b]/15" />
               <HeroMini label="Active" value={String(activeEmployees)} />
               <span className="h-10 w-px bg-[#0d222b]/15" />
               <HeroMini label="On leave queue" value={String(pendingLeaves)} />
            </div>
         </Hero>

         <nav aria-label="HR sections" className="surface-card flex gap-1.5 overflow-x-auto p-2">
            {visibleLinks.map(([title, href]) => {
               const destination = !isHR && href === "/hr/leaves"
                  ? user?.role === "employee" ? "/employee/leaves" : "/manager-leaves"
                  : href === "/employee/payslips" ? href
                  : isHR ? href.replace(/^\/hr/, sectionBase) : href;
               const active = path === destination || (path === "/manager-leaves" && href === "/hr/leaves");
               const Icon = (SECTION_META[title] || {}).icon || FiGrid;
               return (
                  <Link
                     key={destination}
                     to={destination}
                     className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${active ? "bg-brand-gradient text-[#0d222b] shadow-[0_8px_18px_-10px_rgba(42,123,155,0.8)]" : "text-ink-500 hover:bg-canvas hover:text-ink-900"}`}
                  >
                     <Icon size={15} />
                     {title}
                  </Link>
               );
            })}
         </nav>

         <div className="flex items-center gap-2 text-xs text-ink-400">
            <activeMeta.icon size={13} />
            <span className="font-semibold uppercase tracking-wide">{activeSection}</span>
            <span>·</span>
            <span>{activeMeta.hint}</span>
         </div>

         {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
         {notice && <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}
         {loading ? (
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}
               </div>
               <div className="skeleton h-80 rounded-3xl" />
            </div>
         ) : <>
            {(path === sectionBase || path === "/hr") && (
               <Dashboard
                  employees={employees} departments={departments} designations={designations}
                  leaveRequests={leaveRequests} leaveCount={pendingLeaves} activePayroll={activePayroll}
                  periods={periods} salaryStructures={salaryStructures} onReport={openReport} report={report}
                  sectionBase={sectionBase}
               />
            )}
            {isEmployeeRoute && isHR && <Employees employees={shownEmployees} departments={departments} designations={designations} projects={projects} users={users} search={search} setSearch={setSearch} run={run} open={formOpen} setOpen={setFormOpen} />}
            {path.endsWith("/departments") && <Departments departments={departments} users={users} run={run} />}
            {path.endsWith("/designations") && <Designations designations={designations} departments={departments} run={run} />}
            {(path.endsWith("/leaves") || path.endsWith("/manager-leaves")) && <Leaves requests={leaveRequests} employees={employees} projects={projects} user={user} canManagerReview={isManager} run={run} />}
            {path.endsWith("/attendance") && <AttendancePage />}
            {path.endsWith("/payslips") && user?.role === "employee" && <MyPayslips />}
            {path.endsWith("/salary") && <SalaryStructures employees={employees} structures={salaryStructures} departments={departments} run={run} />}
            {path.endsWith("/payroll") && <Payroll periods={periods} selected={selectedPeriod} setSelected={setSelectedPeriod} entries={entries} period={currentPeriod} employees={employees} run={run} setEntries={setEntries} />}
            {path.endsWith("/reports") && <PayrollReports departments={departments} report={report} onReport={openReport} />}
         </>}
      </div>
   );
}

function HeroMini({ label, value }) {
   return (
      <div className="text-[#0d222b]">
         <p className="font-display text-xl font-extrabold leading-none">{value}</p>
         <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      </div>
   );
}

const apiData = (response) => response.data?.data || [];

function Dashboard({ employees, departments, designations, leaveRequests, leaveCount, activePayroll, periods, salaryStructures, onReport, report, sectionBase }) {
   const activeEmployees = employees.filter((employee) => employee.status === "active").length;
   const monthNet = activePayroll?.totals?.netSalary || report?.totals?.netSalary || 0;

   const deptMix = useMemo(() => {
      const map = new Map();
      employees.forEach((e) => {
         const name = e.department?.name || departments.find((d) => d._id === e.department)?.name || "Unassigned";
         map.set(name, (map.get(name) || 0) + 1);
      });
      return [...map.entries()].map(([name, value]) => ({ name: String(name).slice(0, 16), value }));
   }, [employees, departments]);

   const leaveMix = useMemo(() => {
      const count = (s) => leaveRequests.filter((r) => r.status === s).length;
      return [
         { name: "Manager review", value: count("pending_manager"), color: "#D9A441" },
         { name: "HR review", value: count("pending_hr"), color: "#2A7B9B" },
         { name: "Approved", value: count("approved"), color: "#57C785" },
         { name: "Rejected", value: leaveRequests.filter((r) => String(r.status).includes("reject")).length, color: "#E05252" },
      ].filter((s) => s.value > 0);
   }, [leaveRequests]);

   const shortcuts = [
      { title: "Employees", href: `${sectionBase}/employees`, desc: "Directory, profiles and assignments", icon: FiUsers },
      { title: "Attendance", href: "/hr/attendance", desc: "Daily registers and overtime", icon: FiActivity },
      { title: "Leave", href: `${sectionBase}/leaves`, desc: `${leaveCount} decisions waiting`, icon: FiCalendar },
      { title: "Payroll", href: `${sectionBase === "/hr-management" ? "/hr/payroll" : "/hr/payroll"}`, desc: activePayroll ? `${activePayroll.name} · ${activePayroll.status}` : "Create the monthly cycle", icon: FiDollarSign },
   ];

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
            <KpiCard label="Total employees" value={employees.length} icon={FiUsers} tone="brand" hint="All records" />
            <KpiCard label="Active employees" value={activeEmployees} icon={FiCheck} tone="mint" hint="On duty" />
            <KpiCard label="Departments" value={departments.length} icon={FiBriefcase} tone="sun" hint={`${designations.length} designations`} />
            <KpiCard label="Leave decisions" value={leaveCount} icon={FiCalendar} tone="amber" hint="Awaiting review" />
            <KpiCard label="Payroll periods" value={periods.length} icon={FiClock} tone="neutral" hint={activePayroll?.name || "None this month"} />
            <KpiCard label="Month net payroll" value={moneyShort(monthNet)} icon={FiDollarSign} tone={monthNet > 0 ? "mint" : "neutral"} hint={activePayroll?.status || "Not generated"} />
         </div>

         <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="Workforce by department" subtitle="Headcount distribution" icon={FiUsers} className="lg:col-span-1">
               {deptMix.length ? (
                  <DonutChart data={deptMix.slice(0, 6)} size={150} centerLabel="Staff" valueFormat={(v) => String(v)} />
               ) : (
                  <EmptyState title="No department data" message="Departments will appear once employees are assigned." />
               )}
            </ChartCard>
            <ChartCard title="Leave pipeline" subtitle="Requests by stage" icon={FiCalendar} className="lg:col-span-1">
               {leaveMix.length ? (
                  <DonutChart data={leaveMix} size={150} centerLabel="Leaves" valueFormat={(v) => String(v)} />
               ) : (
                  <EmptyState title="No leave requests" message="New requests will show up here instantly." />
               )}
            </ChartCard>
            <div className="surface-card p-5">
               <div className="flex items-center justify-between">
                  <h3 className="text-[0.95rem] font-bold text-ink-900">Workflows</h3>
                  <ViewAllLink to={`${sectionBase}/employees`} label="Directory" />
               </div>
               <div className="mt-3 space-y-1">
                  {shortcuts.map((s) => (
                     <Link key={s.title} to={s.href} className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-canvas">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500">
                           <s.icon size={17} />
                        </span>
                        <span className="min-w-0 flex-1">
                           <span className="block truncate text-[0.82rem] font-semibold text-ink-900">{s.title}</span>
                           <span className="block truncate text-[0.72rem] text-ink-500">{s.desc}</span>
                        </span>
                        <FiChevronRight size={15} className="shrink-0 text-ink-400" />
                     </Link>
                  ))}
               </div>
            </div>
         </div>

         {report && <TotalsPanel totals={report.totals} />}
         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
               <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-500"><FiTrendingUp size={19} /></span>
               <div>
                  <p className="font-bold text-ink-900">Year-to-date payroll totals</p>
                  <p className="text-xs text-ink-500">Gross-to-net summary for {new Date().getFullYear()}</p>
               </div>
            </div>
            <Button variant="secondary" icon={FiTrendingUp} onClick={() => onReport({ from: `${new Date().getFullYear()}-01-01` })}>
               Load totals
            </Button>
         </div>
      </div>
   );
}

function Panel({ title, subtitle, children, action, icon: Icon }) {
   return (
      <section className="surface-card overflow-hidden p-0">
         <header className="flex flex-col gap-2 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
               {Icon && (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500">
                     <Icon size={17} />
                  </span>
               )}
               <div>
                  <h2 className="text-[0.95rem] font-bold text-ink-900">{title}</h2>
                  {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
               </div>
            </div>
            {action}
         </header>
         <div className="p-4 sm:p-5">{children}</div>
      </section>
   );
}

function Employees({ employees, departments, designations, projects, users, search, setSearch, run, open, setOpen }) {
   const [editing, setEditing] = useState(null);
   const [statusFilter, setStatusFilter] = useState("all");
   const filtered = employees.filter((e) => statusFilter === "all" || e.status === statusFilter);
   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Directory size" value={employees.length} icon={FiUsers} tone="brand" hint="Matching filters" />
            <KpiCard label="Active" value={employees.filter((e) => e.status === "active").length} icon={FiCheck} tone="mint" hint="On duty" />
            <KpiCard label="On leave" value={employees.filter((e) => e.status === "on_leave").length} icon={FiCalendar} tone="amber" hint="Away today" />
            <KpiCard label="Departments" value={departments.length} icon={FiBriefcase} tone="sun" hint="Org units" />
         </div>
         <Panel
            title="Employee directory"
            subtitle={`${filtered.length} matching records`}
            icon={FiUsers}
            action={
               <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees…" className="sm:w-64" />
                  <FilterSelect
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                     options={[
                        { value: "all", label: "All statuses" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                        { value: "on_leave", label: "On leave" },
                        { value: "terminated", label: "Terminated" },
                     ]}
                     className="sm:w-44"
                  />
               </div>
            }
         >
            <TableShell>
               <TableWrap>
                  <table className="data-table min-w-[950px]">
                     <thead><tr><th>Employee</th><th>Department</th><th>Project</th><th className="text-right">Salary</th><th className="text-center">Status</th><th className="text-right">Actions</th></tr></thead>
                     <tbody>
                        {filtered.map((employee) => (
                           <tr key={employee._id}>
                              <td>
                                 <span className="flex items-center gap-2.5">
                                    <Avatar name={employee.name} />
                                    <span>
                                       <span className="block font-semibold text-ink-900">{employee.name}</span>
                                       <span className="block font-mono text-xs text-ink-400">{employee.employeeId} · {employee.phone}</span>
                                    </span>
                                 </span>
                              </td>
                              <td>
                                 <span className="block font-medium text-ink-900">{employee.department?.name || departments.find((item) => item._id === employee.department)?.name || "—"}</span>
                                 <span className="block text-xs text-ink-500">{employee.designationId?.title || employee.designation}</span>
                              </td>
                              <td>
                                 <span className="block font-medium text-ink-900">{employee.assignedProject?.name || projects.find((item) => item._id === employee.assignedProject)?.name || "—"}</span>
                                 <span className="block text-xs text-ink-500">{employee.assignedSite || "—"}</span>
                              </td>
                              <td className="text-right font-mono font-semibold">{money(employee.salary)}</td>
                              <td className="text-center"><StatusBadge status={employee.status || "active"} /></td>
                              <td>
                                 <RowActions>
                                    <Button variant="secondary" size="sm" icon={FiEdit2} onClick={() => { setEditing(employee); setOpen(true); }}>Edit</Button>
                                 </RowActions>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
               {filtered.length === 0 && <EmptyState title="No employees" message="No employee records match the current search." />}
            </TableShell>
         </Panel>
         <Modal
            isOpen={open}
            onClose={() => { setOpen(false); setEditing(null); }}
            title={editing ? "Update employee profile" : "Add employee"}
            subtitle="HR, project and payroll details."
            size="xl"
         >
            <EmployeeForm
               key={editing?._id || "new"}
               employee={editing} departments={departments} designations={designations} projects={projects} users={users}
               onClose={() => { setOpen(false); setEditing(null); }}
               onSave={async (data) => {
                  const saved = await run(() => editing ? updateEmployee(editing._id, data) : createEmployee(data), editing ? "Employee profile updated." : "Employee added.");
                  if (saved) { setOpen(false); setEditing(null); }
               }}
            />
         </Modal>
      </div>
   );
}

function EmployeeForm({ employee, departments, designations, projects, users, onClose, onSave }) {
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState("");
   const [form, setForm] = useState({
      name: employee?.name || "", cnic: employee?.cnic || "", phone: employee?.phone || "",
      email: employee?.email || "", designation: employee?.designation || "", department: employee?.department?._id || employee?.department || "",
      designationId: employee?.designationId?._id || employee?.designationId || "",
      userAccount: employee?.userAccount?._id || employee?.userAccount || "",
      salary: employee?.salary ?? "", assignedSite: employee?.assignedSite || "",
      assignedProject: employee?.assignedProject?._id || employee?.assignedProject || "",
      employeeType: employee?.employeeType || "permanent", status: employee?.status || "active",
      joiningDate: employee?.joiningDate?.slice(0, 10) || dateValue(),
      bankName: employee?.bankName || "", bankAccount: employee?.bankAccount || "",
      emergencyContact: employee?.emergencyContact || "",
      leaveBalance: employee?.leaveBalance ?? 12,
   });
   const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
   const submit = async (event) => {
      event.preventDefault(); setSaving(true); setError("");
      try {
         await onSave({ ...form, salary: Number(form.salary), leaveBalance: Number(form.leaveBalance), projectAssignments: form.assignedProject ? [form.assignedProject] : [] });
      } catch (saveError) {
         setError(saveError.response?.data?.message || "Unable to save employee.");
      } finally { setSaving(false); }
   };
   return (
      <form onSubmit={submit} className="space-y-4">
         {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
         <FormSection title="Identity">
            {field("Full name *", <input required minLength="3" value={form.name} onChange={(event) => set("name", event.target.value)} className={formInput} />)}
            {field("CNIC *", <input required pattern="[0-9]{5}-[0-9]{7}-[0-9]{1}" placeholder="12345-1234567-1" value={form.cnic} onChange={(event) => set("cnic", event.target.value)} className={formInput} />)}
            {field("Phone *", <input required pattern="03[0-9]{9}" placeholder="03xxxxxxxxx" value={form.phone} onChange={(event) => set("phone", event.target.value)} className={formInput} />)}
            {field("Email", <input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} className={formInput} />)}
            {field("Emergency contact", <input value={form.emergencyContact} onChange={(event) => set("emergencyContact", event.target.value)} className={formInput} />)}
            {field("Joining date", <input type="date" value={form.joiningDate} onChange={(event) => set("joiningDate", event.target.value)} className={formInput} />)}
         </FormSection>
         <FormSection title="Organization">
            {field("Department", select(form.department, (event) => set("department", event.target.value), departments.map((item) => ({ value: item._id, label: item.name }))))}
            {field("Designation catalogue", select(form.designationId, (event) => {
               const designationId = event.target.value;
               const selected = designations.find((item) => item._id === designationId);
               setForm((current) => ({ ...current, designationId, ...(selected ? { designation: selected.title } : {}) }));
            }, designations.map((item) => ({ value: item._id, label: `${item.title}${item.level ? ` · ${item.level}` : ""}` })), "Select designation…"))}
            {field("Designation *", <input required value={form.designation} onChange={(event) => set("designation", event.target.value)} className={formInput} />)}
            {field("Employee type", select(form.employeeType, (event) => set("employeeType", event.target.value), ["permanent", "contract", "daily_wage", "temporary"].map((item) => ({ value: item, label: item.replace("_", " ") }))))}
            {field("Employment status", select(form.status, (event) => set("status", event.target.value), ["active", "inactive", "on_leave", "terminated"].map((item) => ({ value: item, label: item.replace("_", " ") }))))}
            {field("Annual leave balance (days)", <input type="number" min="0" step="any" value={form.leaveBalance} onChange={(event) => set("leaveBalance", event.target.value)} className={formInput} />)}
         </FormSection>
         <FormSection title="Posting and payroll">
            {field("Assigned project", select(form.assignedProject, (event) => set("assignedProject", event.target.value), projects.map((item) => ({ value: item._id, label: `${item.projectCode} · ${item.name}` })), "No project"))}
            {field("Assigned site", <input value={form.assignedSite} onChange={(event) => set("assignedSite", event.target.value)} className={formInput} />)}
            {field("Employee portal account", select(form.userAccount, (event) => set("userAccount", event.target.value), users.filter((item) => item.role === "employee" && item.isActive).map((item) => ({ value: item._id, label: `${item.name} · ${item.email}` })), "No portal account"))}
            {field("Basic salary (PKR) *", <input required type="number" min="0" step="any" value={form.salary} onChange={(event) => set("salary", event.target.value)} className={formInput} />)}
            {field("Bank name", <input value={form.bankName} onChange={(event) => set("bankName", event.target.value)} className={formInput} />)}
            {field("Bank account / IBAN", <input value={form.bankAccount} onChange={(event) => set("bankAccount", event.target.value)} className={formInput} />)}
         </FormSection>
         <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>{saving ? "Saving…" : "Save employee"}</Button>
         </div>
      </form>
   );
}

function FormSection({ title, children }) {
   return (
      <div className="rounded-2xl border border-line bg-canvas/50 p-4">
         <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-500">{title}</h3>
         <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      </div>
   );
}

function Departments({ departments, users, run }) {
   const [form, setForm] = useState({ name: "", code: "", description: "", head: "" });
   const [editing, setEditing] = useState(null);
   const reset = () => { setEditing(null); setForm({ name: "", code: "", description: "", head: "" }); };
   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Departments" value={departments.length} icon={FiBriefcase} tone="brand" hint="Org units" />
            <KpiCard label="With heads" value={departments.filter((d) => d.head).length} icon={FiUsers} tone="mint" hint="Assigned leads" />
         </div>
         <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
            <Panel title="Departments" subtitle={`${departments.length} departments configured`} icon={FiBriefcase}>
               <div className="divide-y divide-[#eef4f2]">
                  {departments.map((item) => (
                     <div key={item._id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                        <span className="flex items-center gap-2.5">
                           <Avatar name={item.name} />
                           <span>
                              <span className="block font-semibold text-ink-900">{item.name}</span>
                              <span className="block font-mono text-xs text-ink-400">{item.code} · {item.head?.name || "No department head"}</span>
                           </span>
                        </span>
                        <RowActions>
                           <Button variant="secondary" size="sm" icon={FiEdit2} onClick={() => { setEditing(item); setForm({ name: item.name, code: item.code, description: item.description || "", head: item.head?._id || item.head || "" }); }}>Edit</Button>
                           <Button variant="danger" size="sm" icon={FiTrash2} onClick={() => run(() => deleteDepartment(item._id), "Department deleted.")}>Delete</Button>
                        </RowActions>
                     </div>
                  ))}
               </div>
               {departments.length === 0 && <EmptyState title="No departments" message="Create the first department to organize roles." />}
            </Panel>
            <Panel title={editing ? "Edit department" : "Add department"} subtitle="Structure the organization." icon={FiPlus}>
               <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); run(async () => { if (editing) await updateDepartment(editing._id, form); else await createDepartment(form); reset(); }, editing ? "Department updated." : "Department added."); }}>
                  {field("Department name *", <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={formInput} />)}
                  {field("Department code *", <input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} className={`${formInput} font-mono`} />)}
                  {field("Department head", select(form.head, (event) => setForm({ ...form, head: event.target.value }), users.map((item) => ({ value: item._id, label: item.name })), "Unassigned"))}
                  {field("Description", <textarea rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={formInput} />)}
                  <div className="flex gap-2">
                     <Button variant="primary" type="submit">{editing ? "Save department" : "Add department"}</Button>
                     {editing && <Button variant="secondary" onClick={reset}>Cancel</Button>}
                  </div>
               </form>
            </Panel>
         </div>
      </div>
   );
}

function Designations({ designations, departments, run }) {
   const [form, setForm] = useState({ title: "", code: "", department: "", level: "", description: "" });
   const [editing, setEditing] = useState(null);
   const reset = () => { setEditing(null); setForm({ title: "", code: "", department: "", level: "", description: "" }); };
   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Designations" value={designations.length} icon={FiAward} tone="brand" hint="Role titles" />
            <KpiCard label="Departments covered" value={new Set(designations.map((d) => d.department?._id || d.department).filter(Boolean)).size} icon={FiBriefcase} tone="mint" hint="Mapped units" />
         </div>
         <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
            <Panel title="Designations" subtitle="Role titles grouped by department" icon={FiAward}>
               <div className="divide-y divide-[#eef4f2]">
                  {designations.map((item) => (
                     <div key={item._id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                        <div>
                           <b className="text-ink-900">{item.title}</b>
                           <span className="ml-2 badge badge-neutral">{item.code}</span>
                           <small className="ml-2 text-slate-500">{item.department?.name || departments.find((department) => department._id === item.department)?.name || "Unassigned"}{item.level ? ` · ${item.level}` : ""}</small>
                        </div>
                        <RowActions>
                           <Button variant="secondary" size="sm" icon={FiEdit2} onClick={() => { setEditing(item); setForm({ title: item.title, code: item.code, department: item.department?._id || item.department || "", level: item.level || "", description: item.description || "" }); }}>Edit</Button>
                           <Button variant="danger" size="sm" icon={FiTrash2} onClick={() => run(() => deleteDesignation(item._id), "Designation deleted.")}>Delete</Button>
                        </RowActions>
                     </div>
                  ))}
               </div>
               {designations.length === 0 && <EmptyState title="No designations" message="Add role titles to catalogue the workforce." />}
            </Panel>
            <Panel title={editing ? "Edit designation" : "Add designation"} subtitle="Grades and role titles." icon={FiPlus}>
               <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); run(async () => { if (editing) await updateDesignation(editing._id, form); else await createDesignation(form); reset(); }, editing ? "Designation updated." : "Designation added."); }}>
                  {field("Title *", <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={formInput} />)}
                  {field("Code *", <input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} className={`${formInput} font-mono`} />)}
                  {field("Department", select(form.department, (event) => setForm({ ...form, department: event.target.value }), departments.map((item) => ({ value: item._id, label: item.name }))))}
                  {field("Level / grade", <input value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} className={formInput} />)}
                  <div className="flex gap-2">
                     <Button variant="primary" type="submit">{editing ? "Save designation" : "Add designation"}</Button>
                     {editing && <Button variant="secondary" onClick={reset}>Cancel</Button>}
                  </div>
               </form>
            </Panel>
         </div>
      </div>
   );
}

function Leaves({ requests, employees, projects, user, canManagerReview, run }) {
   const [form, setForm] = useState({ employee: "", project: "", type: "annual", startDate: dateValue(), endDate: dateValue(), reason: "" });
   const [statusFilter, setStatusFilter] = useState("all");
   const isHR = ["hr", "admin"].includes(user?.role);
   const filtered = requests.filter((r) => statusFilter === "all" || r.status === statusFilter);
   const pending = requests.filter((r) => r.status === "pending_manager" || r.status === "pending_hr").length;
   const request = async (event) => {
      event.preventDefault();
      await run(() => createLeaveRequest(form), "Leave request submitted for manager review.");
   };
   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Total requests" value={requests.length} icon={FiCalendar} tone="brand" hint="All time" />
            <KpiCard label="Pending review" value={pending} icon={FiClock} tone="amber" hint="Needs decision" />
            <KpiCard label="Approved" value={requests.filter((r) => r.status === "approved").length} icon={FiCheck} tone="mint" hint="Granted leaves" />
            <KpiCard label="This view" value={filtered.length} icon={FiFileText} tone="sun" hint="Filtered rows" />
         </div>
         <Panel title="Submit a leave request" subtitle="Employee → manager review → HR decision" icon={FiPlus}>
            <form onSubmit={request} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
               {field("Employee *", <select required value={form.employee} onChange={(event) => {
                  const employeeId = event.target.value;
                  const employee = employees.find((item) => item._id === employeeId);
                  setForm({ ...form, employee: employeeId, ...(user?.role === "employee" ? { project: employee?.assignedProject?._id || "" } : {}) });
               }} className={formInput}><option value="">Select employee…</option>{employees.map((item) => <option key={item._id} value={item._id}>{item.employeeId} · {item.name}</option>)}</select>)}
               {user?.role !== "employee" && field("Project", select(form.project, (event) => setForm({ ...form, project: event.target.value }), projects.map((item) => ({ value: item._id, label: item.name })), "Use employee project"))}
               {field("Leave type", select(form.type, (event) => setForm({ ...form, type: event.target.value }), ["annual", "sick", "casual", "unpaid", "maternity", "paternity", "bereavement", "other"].map((item) => ({ value: item, label: item }))))}
               {field("From *", <input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className={formInput} />)}
               {field("To *", <input required type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className={formInput} />)}
               {field("Reason *", <input required minLength="5" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className={formInput} />)}
               <div className="flex items-end sm:col-span-2 lg:col-span-3"><Button variant="primary" type="submit" icon={FiPlus}>Submit leave request</Button></div>
            </form>
         </Panel>
         <Panel
            title="Leave workflow"
            subtitle="Manager review is required before the HR decision"
            icon={FiCalendar}
            action={
               <FilterSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                     { value: "all", label: "All statuses" },
                     { value: "pending_manager", label: "Pending manager" },
                     { value: "pending_hr", label: "Pending HR" },
                     { value: "approved", label: "Approved" },
                     { value: "rejected", label: "Rejected" },
                  ]}
                  className="sm:w-52"
               />
            }
         >
            <div className="space-y-3">
               {filtered.map((item) => (
                  <div key={item._id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-[#bfd7d0] hover:shadow-[var(--shadow-card)] lg:flex-row lg:items-center lg:justify-between">
                     <div className="flex min-w-0 items-start gap-3">
                        <Avatar name={item.employee?.name || "Employee"} />
                        <div className="min-w-0">
                           <div className="flex flex-wrap items-center gap-2">
                              <b className="text-ink-900">{item.employee?.name || "Employee"}</b>
                              <StatusBadge status={item.status} />
                           </div>
                           <p className="mt-1 text-sm text-slate-600">{item.type} · {item.startDate} to {item.endDate} · {item.days} day(s)</p>
                           <p className="text-sm text-slate-500">{item.reason} · {item.project?.name || item.employee?.assignedProject?.name || "No project"}</p>
                           {item.managerReviewNote && <p className="mt-1 text-xs text-slate-500">Manager: {item.managerReviewNote}</p>}
                           {item.hrReviewNote && <p className="text-xs text-slate-500">HR: {item.hrReviewNote}</p>}
                        </div>
                     </div>
                     <div className="flex shrink-0 flex-wrap gap-2">
                        {canManagerReview && item.status === "pending_manager" && (
                           <>
                              <Button variant="primary" size="sm" icon={FiCheck} onClick={() => run(() => reviewLeaveRequest(item._id, "approve"), "Leave moved to HR approval.")}>Manager approve</Button>
                              <Button variant="danger" size="sm" icon={FiX} onClick={() => run(() => reviewLeaveRequest(item._id, "reject"), "Leave rejected at manager review.")}>Reject</Button>
                           </>
                        )}
                        {isHR && item.status === "pending_hr" && (
                           <>
                              <Button variant="primary" size="sm" icon={FiCheck} onClick={() => run(() => approveLeaveRequest(item._id, "approve"), "Leave approved.")}>HR approve</Button>
                              <Button variant="danger" size="sm" icon={FiX} onClick={() => run(() => approveLeaveRequest(item._id, "reject"), "Leave rejected.")}>Reject</Button>
                           </>
                        )}
                     </div>
                  </div>
               ))}
               {!filtered.length && <EmptyState title="No leave requests" message="No requests match the current filter." />}
            </div>
         </Panel>
      </div>
   );
}

function SalaryStructures({ employees, structures, departments, run }) {
   const [employee, setEmployee] = useState("");
   const [basicSalary, setBasicSalary] = useState("");
   const [overtimeRate, setOvertimeRate] = useState("");
   const [effectiveFrom, setEffectiveFrom] = useState(dateValue());
   const [allowances, setAllowances] = useState([{ name: "Transport", amount: "", type: "fixed" }]);
   const [deductions, setDeductions] = useState([{ name: "Tax", amount: "", type: "fixed" }]);
   const [search, setSearch] = useState("");
   const filtered = structures.filter((s) => `${s.employee?.name || ""}`.toLowerCase().includes(search.toLowerCase()));
   const lineRows = (lines, setLines, label) => (
      <div className="space-y-2">
         <div className="flex items-center justify-between">
            <b className="text-sm text-ink-900">{label}</b>
            <Button variant="secondary" size="sm" icon={FiPlus} onClick={() => setLines([...lines, { name: "", amount: "", type: "fixed" }])}>Add line</Button>
         </div>
         {lines.map((line, index) => (
            <div key={`${label}-${index}`} className="grid grid-cols-[1fr_6rem_7rem_auto] items-center gap-2">
               <input aria-label={`${label} name`} placeholder="Name" value={line.name} onChange={(event) => setLines(lines.map((item, row) => row === index ? { ...item, name: event.target.value } : item))} className={formInput} />
               <input aria-label={`${label} amount`} type="number" min="0" step="any" placeholder="Amount" value={line.amount} onChange={(event) => setLines(lines.map((item, row) => row === index ? { ...item, amount: event.target.value } : item))} className={formInput} />
               <select aria-label={`${label} calculation`} value={line.type} onChange={(event) => setLines(lines.map((item, row) => row === index ? { ...item, type: event.target.value } : item))} className={formInput}>
                  <option value="fixed">Fixed PKR</option>
                  <option value="percentage">% of base</option>
               </select>
               <button type="button" className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-700" aria-label="Remove line" onClick={() => setLines(lines.filter((_, row) => row !== index))}><FiX size={15} /></button>
            </div>
         ))}
      </div>
   );
   const submit = async (event) => {
      event.preventDefault();
      const saved = await run(() => createSalaryStructure({
         employee, basicSalary: Number(basicSalary), overtimeRate: Number(overtimeRate),
         currency: "PKR", payFrequency: "monthly", effectiveFrom,
         allowances: allowances.filter((line) => line.name && line.amount !== "").map((line) => ({ ...line, amount: Number(line.amount) })),
         deductions: deductions.filter((line) => line.name && line.amount !== "").map((line) => ({ ...line, amount: Number(line.amount) })),
      }), "Salary structure saved; this structure applies to future payroll periods.");
      if (saved) { setEmployee(""); setBasicSalary(""); setOvertimeRate(""); }
   };
   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Structures" value={structures.length} icon={FiDollarSign} tone="brand" hint="Effective-dated" />
            <KpiCard label="Avg. basic" value={moneyShort(structures.reduce((s, x) => s + Number(x.basicSalary || 0), 0) / Math.max(structures.length, 1))} icon={FiTrendingUp} tone="mint" hint="Monthly base" />
         </div>
         <Panel
            title="Salary structures"
            subtitle="Effective-dated salaries with recurring allowances and deductions"
            icon={FiDollarSign}
            action={<SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee…" className="sm:w-64" />}
         >
            <TableShell>
               <TableWrap>
                  <table className="data-table min-w-[760px]">
                     <thead><tr><th>Employee</th><th>Department</th><th className="text-right">Basic</th><th>Allowances</th><th>Deductions</th><th className="text-right">OT rate</th><th className="text-center">Status</th></tr></thead>
                     <tbody>
                        {filtered.map((item) => (
                           <tr key={item._id}>
                              <td>
                                 <span className="flex items-center gap-2.5">
                                    <Avatar name={item.employee?.name || "—"} />
                                    <span>
                                       <span className="block font-semibold text-ink-900">{item.employee?.name || "—"}</span>
                                       <span className="block text-xs text-ink-400">from {item.effectiveFrom}</span>
                                    </span>
                                 </span>
                              </td>
                              <td className="text-ink-500">{departments.find((dept) => dept._id === item.employee?.department)?.name || "—"}</td>
                              <td className="text-right font-mono font-semibold">{money(item.basicSalary)}</td>
                              <td className="max-w-[220px] truncate text-xs text-ink-500">{(item.allowances || []).map((line) => `${line.name}: ${line.type === "percentage" ? `${line.amount}%` : money(line.amount)}`).join(", ") || "—"}</td>
                              <td className="max-w-[220px] truncate text-xs text-ink-500">{(item.deductions || []).map((line) => `${line.name}: ${line.type === "percentage" ? `${line.amount}%` : money(line.amount)}`).join(", ") || "—"}</td>
                              <td className="text-right font-mono">{money(item.overtimeRate)}/hr</td>
                              <td className="text-center"><StatusBadge status={item.status || "active"} /></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
               {filtered.length === 0 && <EmptyState title="No structures" message="Create the first salary structure below." />}
            </TableShell>
         </Panel>
         <Panel title="Create salary structure" subtitle="Applies to future payroll periods." icon={FiPlus}>
            <form onSubmit={submit} className="space-y-4">
               <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {field("Employee *", select(employee, (event) => setEmployee(event.target.value), employees.map((item) => ({ value: item._id, label: `${item.employeeId} · ${item.name}` }))))}
                  {field("Basic monthly salary (PKR) *", <input required type="number" min="0" step="any" value={basicSalary} onChange={(event) => setBasicSalary(event.target.value)} className={formInput} />)}
                  {field("Overtime rate per hour *", <input required type="number" min="0" step="any" value={overtimeRate} onChange={(event) => setOvertimeRate(event.target.value)} className={formInput} />)}
                  {field("Effective from *", <input required type="date" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.target.value)} className={formInput} />)}
               </div>
               <div className="grid gap-4 lg:grid-cols-2">{lineRows(allowances, setAllowances, "Allowances")}{lineRows(deductions, setDeductions, "Deductions")}</div>
               <Button variant="primary" type="submit" icon={FiCheck}>Save salary structure</Button>
            </form>
         </Panel>
      </div>
   );
}

function Payroll({ periods, selected, setSelected, entries, period, employees, run, setEntries }) {
   const [form, setForm] = useState({ name: "", startDate: "", endDate: "", payDate: "" });
   const [overtimeEdits, setOvertimeEdits] = useState({});
   const [slip, setSlip] = useState(null);
   const locked = !period || period.locked || period.status !== "draft";
   return (
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Payroll periods" value={periods.length} icon={FiClock} tone="brand" hint="All cycles" />
            <KpiCard label="Locked" value={periods.filter((p) => p.locked || p.status !== "draft").length} icon={FiCheck} tone="mint" hint="Approved cycles" />
            <KpiCard label="Draft" value={periods.filter((p) => !p.locked && p.status === "draft").length} icon={FiFileText} tone="amber" hint="Open cycles" />
            <KpiCard label="Period net" value={moneyShort(period?.totals?.netSalary || 0)} icon={FiDollarSign} tone="sun" hint={period?.name || "Select a period"} />
         </div>
         <Panel
            title="Payroll periods"
            subtitle="Create pay cycles, calculate payroll and lock approved periods"
            icon={FiClock}
            action={
               <FilterSelect
                  value={selected}
                  onChange={(event) => setSelected(event.target.value)}
                  options={[{ value: "", label: "Select period" }, ...periods.map((item) => ({ value: item._id, label: `${item.name} · ${item.status}` }))]}
                  className="sm:w-64"
               />
            }
         >
            <div className="flex flex-wrap gap-2">
               {periods.map((item) => (
                  <button
                     type="button"
                     key={item._id}
                     onClick={() => setSelected(item._id)}
                     className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${selected === item._id ? "bg-brand-gradient text-[#0d222b] shadow-[0_8px_18px_-10px_rgba(42,123,155,0.8)]" : "bg-canvas text-ink-500 hover:bg-[#e3ecea] hover:text-ink-900"}`}
                  >
                     {item.name} · {item.status}
                  </button>
               ))}
            </div>
            {periods.length === 0 && <EmptyState title="No payroll periods" message="Create the first pay cycle below." />}
         </Panel>
         <Panel title="Create a payroll period" subtitle="Monthly pay cycles with a fixed pay date." icon={FiPlus}>
            <form onSubmit={(event) => { event.preventDefault(); run(async () => { await createPayrollPeriod(form); setForm({ name: "", startDate: "", endDate: "", payDate: "" }); }, "Payroll period created."); }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
               {field("Period name *", <input required placeholder="October 2026 payroll" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={formInput} />)}
               {field("Period start *", <input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className={formInput} />)}
               {field("Period end *", <input required type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className={formInput} />)}
               {field("Pay date *", <input required type="date" value={form.payDate} onChange={(event) => setForm({ ...form, payDate: event.target.value })} className={formInput} />)}
               <div className="flex items-end"><Button variant="primary" type="submit" icon={FiPlus}>Create period</Button></div>
            </form>
         </Panel>
         {period && (
            <Panel
               title={`${period.name} payroll`}
               subtitle={`${period.startDate} to ${period.endDate} · Pay date ${period.payDate}`}
               icon={FiDollarSign}
               action={
                  <div className="flex flex-wrap items-center gap-2">
                     {!entries.length && <Button variant="secondary" size="sm" onClick={() => run(async () => { await generatePayroll(period._id); setEntries(apiData(await getPayrollEntries(period._id))); }, "Payroll calculated from active salary structures and attendance overtime.")}>Generate payroll</Button>}
                     {entries.length > 0 && !locked && <Button variant="primary" size="sm" icon={FiCheck} onClick={() => run(async () => { await approvePayrollPeriod(period._id); setEntries(apiData(await getPayrollEntries(period._id))); }, "Payroll approved and locked.")}>Approve & lock</Button>}
                     <StatusBadge status={period.locked ? "locked" : period.status} />
                  </div>
               }
            >
               <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {Object.entries(period.totals || {}).map(([key, value]) => (
                     <div key={key} className="rounded-xl border border-line bg-canvas/60 p-3">
                        <small className="block text-xs capitalize text-ink-500">{key.replace(/([A-Z])/g, " $1")}</small>
                        <b className="font-mono text-sm text-ink-900">{money(value)}</b>
                     </div>
                  ))}
               </div>
               <TableShell>
                  <TableWrap>
                     <table className="data-table min-w-[1000px]">
                        <thead><tr><th>Employee</th><th className="text-right">Basic</th><th className="text-right">Allowances</th><th className="text-center">Overtime</th><th className="text-right">Deductions</th><th className="text-right">Net salary</th><th className="text-right">Slip</th></tr></thead>
                        <tbody>
                           {entries.map((entry) => {
                              const employee = entry.employee || employees.find((item) => item._id === entry.employee);
                              return (
                                 <tr key={entry._id}>
                                    <td>
                                       <span className="flex items-center gap-2.5">
                                          <Avatar name={employee?.name || "Employee"} />
                                          <span>
                                             <span className="block font-semibold text-ink-900">{employee?.name || "Employee"}</span>
                                             <span className="block font-mono text-xs text-ink-400">{employee?.employeeId} · {employee?.assignedSite}</span>
                                          </span>
                                       </span>
                                    </td>
                                    <td className="text-right font-mono">{money(entry.basicSalary)}</td>
                                    <td className="text-right font-mono">{money(entry.allowancesTotal)}</td>
                                    <td className="text-center">
                                       {locked ? (
                                          <span className="font-mono font-semibold">{entry.overtimeHours}h</span>
                                       ) : (
                                          <span className="flex items-center justify-center gap-1.5">
                                             <input aria-label="Overtime hours" type="number" min="0" step="any" value={overtimeEdits[entry._id] ?? entry.overtimeHours} onChange={(event) => setOvertimeEdits({ ...overtimeEdits, [entry._id]: event.target.value })} className="input w-20 py-1.5 text-center font-mono" />
                                             <Button variant="secondary" size="sm" onClick={() => run(async () => { await updatePayrollEntry(entry._id, { overtimeHours: Number(overtimeEdits[entry._id] ?? entry.overtimeHours) }); setEntries(apiData(await getPayrollEntries(period._id))); }, "Payroll entry updated.")}>Save</Button>
                                          </span>
                                       )}
                                       <span className="block text-xs text-ink-400">× {money(entry.overtimeRate)}</span>
                                    </td>
                                    <td className="text-right font-mono">{money(entry.deductionsTotal)}</td>
                                    <td className="text-right font-mono font-bold">{money(entry.netSalary, entry.currency)}</td>
                                    <td className="text-right">
                                       <Button variant="secondary" size="sm" onClick={async () => { try { const response = await getPayslip(entry._id); setSlip(response.data.data); } catch (error) { setSlip({ error: error.response?.data?.message || "Unable to retrieve payslip." }); } }}>View</Button>
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </TableWrap>
                  {entries.length === 0 && <EmptyState title="No payroll entries" message="Generate payroll to calculate active employees' pay." />}
               </TableShell>
            </Panel>
         )}
         {slip && <Payslip slip={slip} onClose={() => setSlip(null)} />}
      </div>
   );
}

function Payslip({ slip, onClose }) {
   if (slip.error) {
      return (
         <Modal isOpen onClose={onClose} title="Salary slip" subtitle="Unable to load this slip.">
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{slip.error}</p>
            <div className="mt-4 flex justify-end"><Button variant="secondary" onClick={onClose}>Close</Button></div>
         </Modal>
      );
   }
   const employee = slip.employee || {};
   const period = slip.period || {};
   return (
      <Modal isOpen onClose={onClose} title="Salary slip" subtitle={`${period.name || ""} · Pay date ${period.payDate || "—"}`} size="lg">
         <div className="mb-4 flex flex-wrap gap-2 print:hidden">
            <Button variant="primary" size="sm" icon={FiPrinter} onClick={() => window.print()}>Print / Save PDF</Button>
            <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
         </div>
         <div className="grid gap-3 rounded-2xl border border-line bg-canvas/60 p-4 sm:grid-cols-2">
            <PayslipLine label="Employee" value={employee.name} />
            <PayslipLine label="Employee ID" value={employee.employeeId} mono />
            <PayslipLine label="Designation" value={employee.designation} />
            <PayslipLine label="Site" value={employee.assignedSite || "—"} />
            <PayslipLine label="Attendance days" value={slip.attendanceDays} />
            <PayslipLine label="Overtime hours" value={slip.overtimeHours} />
         </div>
         <div className="mt-4 space-y-2 border-t border-line pt-4">
            {[["Basic salary", slip.basicSalary], ["Allowances", slip.allowancesTotal], ["Overtime pay", slip.overtimePay], ["Deductions", -slip.deductionsTotal]].map(([label, value]) => (
               <div key={label} className="flex justify-between text-sm"><span className="text-ink-500">{label}</span><b className="font-mono">{money(value, slip.currency)}</b></div>
            ))}
            <div className="flex justify-between border-t border-line pt-3 text-lg"><b>Net salary</b><b className="font-display">{money(slip.netSalary, slip.currency)}</b></div>
         </div>
         <h2 className="mt-5 text-sm font-bold text-ink-900">Pay components</h2>
         <ul className="mt-2 space-y-1 text-sm text-ink-600">
            {(slip.allowances || []).map((line) => <li key={line.name}>Allowance · {line.name}: {line.type === "percentage" ? `${line.amount}%` : money(line.amount)}</li>)}
            {(slip.deductions || []).map((line) => <li key={line.name}>Deduction · {line.name}: {line.type === "percentage" ? `${line.amount}%` : money(line.amount)}</li>)}
         </ul>
      </Modal>
   );
}

function PayslipLine({ label, value, mono = false }) {
   return <p className="text-sm"><span className="text-ink-500">{label}: </span><b className={mono ? "font-mono" : ""}>{value ?? "—"}</b></p>;
}

function MyPayslips() {
   const [payslips, setPayslips] = useState([]);
   const [slip, setSlip] = useState(null);
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(true);
   useEffect(() => {
      let active = true;
      getMyPayslips().then((response) => {
         if (active) setPayslips(apiData(response));
      }).catch((loadError) => {
         if (active) setError(loadError.response?.data?.message || "Unable to load your payslips.");
      }).finally(() => {
         if (active) setLoading(false);
      });
      return () => { active = false; };
   }, []);
   return (
      <div className="space-y-4">
         {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
         <Panel title="My salary slips" subtitle="Approved payroll history" icon={FiFileText}>
            {loading ? <TableSkeleton rows={4} cols={5} /> : payslips.length ? (
               <TableShell>
                  <TableWrap>
                     <table className="data-table min-w-[720px]">
                        <thead><tr><th>Period</th><th>Pay date</th><th className="text-right">Basic</th><th className="text-right">Allowances</th><th className="text-right">Overtime</th><th className="text-right">Deductions</th><th className="text-right">Net salary</th><th className="text-right">Slip</th></tr></thead>
                        <tbody>
                           {payslips.map((item) => (
                              <tr key={item._id}>
                                 <td className="font-semibold text-ink-900">{item.period?.name}</td>
                                 <td className="text-ink-500">{item.period?.payDate}</td>
                                 <td className="text-right font-mono">{money(item.basicSalary, item.currency)}</td>
                                 <td className="text-right font-mono">{money(item.allowancesTotal, item.currency)}</td>
                                 <td className="text-right font-mono">{money(item.overtimePay, item.currency)}</td>
                                 <td className="text-right font-mono">{money(item.deductionsTotal, item.currency)}</td>
                                 <td className="text-right font-mono font-bold">{money(item.netSalary, item.currency)}</td>
                                 <td className="text-right">
                                    <Button variant="secondary" size="sm" onClick={async () => { try { setSlip(apiData(await getMyPayslip(item._id))); } catch (loadError) { setError(loadError.response?.data?.message || "Unable to retrieve payslip."); } }}>View</Button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </TableWrap>
               </TableShell>
            ) : (
               <EmptyState title="No payslips" message="No approved payroll slips have been issued for your account." />
            )}
         </Panel>
         {slip && <Payslip slip={slip} onClose={() => setSlip(null)} />}
      </div>
   );
}

function PayrollReports({ departments, report, onReport }) {
   const [filters, setFilters] = useState({ from: `${new Date().getFullYear()}-01-01`, to: dateValue(), department: "", site: "" });
   return (
      <div className="space-y-4">
         <Panel title="Payroll reports" subtitle="Summarize gross-to-net payroll by period, department and site" icon={FiTrendingUp}>
            <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={(event) => { event.preventDefault(); onReport(filters); }}>
               {field("From", <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} className={formInput} />)}
               {field("To", <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} className={formInput} />)}
               {field("Department", select(filters.department, (event) => setFilters({ ...filters, department: event.target.value }), departments.map((item) => ({ value: item._id, label: item.name })), "All departments"))}
               {field("Site", <input value={filters.site} onChange={(event) => setFilters({ ...filters, site: event.target.value })} className={formInput} />)}
               <div className="flex items-end"><Button variant="primary" type="submit" icon={FiTrendingUp}>Run report</Button></div>
            </form>
         </Panel>
         {report && (
            <div className="space-y-4">
               <TotalsPanel totals={report.totals} />
               <Panel title="Period summary" subtitle={`${report.periods?.length || 0} payroll cycles`} icon={FiClock}>
                  <TableShell>
                     <TableWrap>
                        <table className="data-table min-w-[640px]">
                           <thead><tr><th>Period</th><th>Date range</th><th className="text-center">Status</th><th className="text-right">Employees</th><th className="text-right">Net payroll</th></tr></thead>
                           <tbody>
                              {report.periods?.map((period) => (
                                 <tr key={period._id}>
                                    <td className="font-semibold text-ink-900">{period.name}</td>
                                    <td className="text-ink-500">{period.startDate} – {period.endDate}</td>
                                    <td className="text-center"><StatusBadge status={period.locked ? "locked" : period.status} /></td>
                                    <td className="text-right font-mono">{period.employeeCount}</td>
                                    <td className="text-right font-mono font-bold">{money(period.totals?.netSalary)}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </TableWrap>
                  </TableShell>
               </Panel>
            </div>
         )}
      </div>
   );
}

function TotalsPanel({ totals = {} }) {
   return (
      <Panel title="Payroll totals" subtitle="Gross-to-net summary" icon={FiDollarSign}>
         <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {[["Employees", totals.employees, true], ["Basic salary", totals.basicSalary], ["Allowances", totals.allowances], ["Overtime", totals.overtime], ["Deductions", totals.deductions], ["Net salary", totals.netSalary]].map(([label, value, isCount]) => (
               <div key={label} className="rounded-xl border border-line bg-canvas/60 p-3">
                  <small className="block text-xs text-ink-500">{label}</small>
                  <b className="font-mono text-sm text-ink-900">{label === "Employees" || isCount ? value || 0 : money(value)}</b>
               </div>
            ))}
         </div>
      </Panel>
   );
}

const field = (label, control) => <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700"><span>{label}</span>{control}</label>;
const select = (value, onChange, options, placeholder) => <select value={value} onChange={onChange} className={formInput}><option value="">{placeholder || "Select…"}</option>{options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>;

void FiX;
