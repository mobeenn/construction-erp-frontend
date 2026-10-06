import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
   FiActivity,
   FiBarChart2,
   FiCalendar,
   FiClipboard,
   FiCreditCard,
   FiUserCheck,
   FiUsers,
} from "react-icons/fi";
import { getDashboardAnalyticsApi } from "../../api/dashboard.api";
import { getLeaveRequests } from "../../services/employeeService";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/ui/ToastContext";
import {
   BarChart,
   DonutChart,
   LineChart,
   formatCompact,
} from "../../components/charts/Charts";
import { ChartCard, Hero, KpiCard, ListRow, ViewAllLink } from "../../components/dashboard/widgets";
import { ErrorState } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";

export default function HRDashboard() {
   const { user } = useAuth();
   const toast = useToast();
   const [data, setData] = useState(null);
   const [leaves, setLeaves] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);

   const load = async () => {
      setLoading(true);
      setError(false);
      try {
         const [analyticsRes, leaveRes] = await Promise.all([
            getDashboardAnalyticsApi(),
            getLeaveRequests(),
         ]);
         setData(analyticsRes.data.data);
         setLeaves(leaveRes.data?.data || []);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load the HR dashboard.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   if (loading) {
      return (
         <div className="space-y-5">
            <div className="skeleton h-40 rounded-3xl" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
               {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-32 rounded-3xl" />
               ))}
            </div>
            <div className="skeleton h-80 rounded-3xl" />
         </div>
      );
   }

   if (error || !data) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load the HR dashboard." onRetry={load} />
         </div>
      );
   }

   const { kpis } = data;
   const pendingLeaves = leaves.filter((l) =>
      ["pending", "manager_approved", "submitted"].includes(l.status),
   );
   const approvedLeaves = leaves.filter((l) => l.status === "approved");

   return (
      <div className="space-y-5">
         <Hero
            eyebrow="HR Workspace"
            title={`People Overview · ${user?.name?.split(" ")[0] || ""}`}
            subtitle="Workforce health, attendance, leave pipeline and payroll at a glance."
            actions={
               <>
                  <Link to="/hr/employees" className="btn btn-secondary">
                     <FiUserCheck size={16} />
                     Employees
                  </Link>
                  <Link to="/hr/payroll" className="btn bg-[#0d222b] text-white hover:brightness-110">
                     <FiCreditCard size={16} />
                     Run payroll
                  </Link>
               </>
            }
         />

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total Employees" value={kpis.totalEmployees} hint={`${kpis.activeEmployeeCount} active`} icon={FiUsers} tone="brand" />
            <KpiCard label="Present Today" value={kpis.presentToday} delta={`${kpis.presentRate}%`} deltaTone={kpis.presentRate >= 75 ? "success" : "warning"} icon={FiUserCheck} tone="mint" />
            <KpiCard label="Pending Leaves" value={pendingLeaves.length} hint="Awaiting review" icon={FiCalendar} tone="amber" />
            <KpiCard label="Approved Leaves" value={approvedLeaves.length} hint="This period" icon={FiClipboard} tone="sun" />
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Workforce by Designation" subtitle="Headcount distribution" icon={FiUsers} className="lg:col-span-2">
               <BarChart
                  labels={data.workforceByDesignation.map((d) => d.name)}
                  series={[{ name: "Employees", data: data.workforceByDesignation.map((d) => d.value), color: "#2A7B9B" }]}
                  valueFormat={(v) => String(Math.round(v))}
                  height={280}
               />
            </ChartCard>
            <ChartCard title="Attendance Today" subtitle="Status split" icon={FiUserCheck}>
               <DonutChart data={data.attendanceStatus} size={168} valueFormat={(v) => String(v)} />
            </ChartCard>
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Overtime Trend" subtitle="Hours logged per month" icon={FiActivity} className="lg:col-span-2">
               <LineChart
                  labels={data.overtimeTrend.labels}
                  series={data.overtimeTrend.series}
                  valueFormat={(v) => `${formatCompact(v)}h`}
                  height={250}
               />
            </ChartCard>

            <div className="surface-card p-5">
               <div className="flex items-center justify-between">
                  <h3 className="text-[0.95rem] font-bold text-ink-900">Recent Leave Requests</h3>
                  <ViewAllLink to="/hr/leaves" />
               </div>
               <div className="mt-3 space-y-1">
                  {leaves.length === 0 && (
                     <p className="py-6 text-center text-sm text-ink-400">No leave requests.</p>
                  )}
                  {leaves.slice(0, 6).map((leave) => (
                     <ListRow
                        key={leave._id}
                        leading={
                           <span className="grid h-9 w-9 place-items-center rounded-xl bg-canvas text-ink-500">
                              <FiCalendar size={16} />
                           </span>
                        }
                        title={leave.employee?.name || leave.employeeName || "Employee"}
                        meta={`${leave.leaveType || "Leave"} · ${String(leave.startDate || "").slice(0, 10)}`}
                        trailing={<StatusBadge status={leave.status} />}
                     />
                  ))}
               </div>
            </div>
         </div>

         <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
               <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-500">
                  <FiBarChart2 size={19} />
               </span>
               <div>
                  <p className="text-sm font-bold text-ink-900">Payroll & Reports</p>
                  <p className="text-xs text-ink-500">Generate payslips, export payroll and review attendance reports.</p>
               </div>
            </div>
            <div className="flex gap-2">
               <Link to="/hr/reports" className="btn btn-secondary">Payroll reports</Link>
               <Link to="/hr/salary" className="btn btn-primary">Salary structures</Link>
            </div>
         </div>
      </div>
   );
}
