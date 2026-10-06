import { useEffect, useState } from "react";
import {
   FiActivity,
   FiAlertTriangle,
   FiArchive,
   FiBox,
   FiChevronRight,
   FiClipboard,
   FiDollarSign,
   FiLayers,
   FiPackage,
   FiPieChart,
   FiShoppingCart,
   FiTrendingUp,
   FiUsers,
} from "react-icons/fi";
import { getDashboardAnalyticsApi } from "../api/dashboard.api";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/ui/ToastContext";
import {
   BarChart,
   DonutChart,
   LineChart,
   ProgressBar,
   ProgressRing,
   formatCompact,
   formatCurrency,
} from "../components/charts/Charts";
import {
   ChartCard,
   Hero,
   KpiCard,
   ListRow,
   ViewAllLink,
} from "../components/dashboard/widgets";
import { ErrorState } from "../components/ui/States";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import { Link } from "react-router-dom";

const greeting = () => {
   const h = new Date().getHours();
   if (h < 12) return "Good morning";
   if (h < 17) return "Good afternoon";
   return "Good evening";
};

function DashboardSkeleton() {
   return (
      <div className="space-y-5">
         <div className="skeleton h-44 rounded-3xl" />
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="skeleton h-32 rounded-3xl" />
            ))}
         </div>
         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="skeleton h-80 rounded-3xl lg:col-span-2" />
            <div className="skeleton h-80 rounded-3xl" />
         </div>
      </div>
   );
}

export default function Dashboard() {
   const { user } = useAuth();
   const toast = useToast();
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);

   const load = async () => {
      setLoading(true);
      setError(false);
      try {
         const res = await getDashboardAnalyticsApi();
         setData(res.data.data);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load dashboard analytics.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   if (loading) return <DashboardSkeleton />;
   if (error || !data) {
      return (
         <div className="surface-card">
            <ErrorState
               message="The analytics service is unavailable right now."
               onRetry={load}
            />
         </div>
      );
   }

   const { kpis } = data;
   const budgetPct =
      kpis.totalBudget > 0
         ? Math.round((kpis.totalActualCost / kpis.totalBudget) * 100)
         : 0;

   return (
      <div className="space-y-5">
         <Hero
            eyebrow="Command Center"
            title={`${greeting()}, ${user?.name?.split(" ")[0] || "there"}`}
            subtitle="A live view of projects, workforce, procurement and finance across your construction portfolio."
            actions={
               <>
                  <Link to="/projects" className="btn btn-secondary">
                     <FiLayers size={16} />
                     Projects
                  </Link>
                  <Link to="/reports" className="btn bg-[#0d222b] text-white hover:brightness-110">
                     <FiTrendingUp size={16} />
                     View reports
                  </Link>
               </>
            }
         >
            <div className="flex items-center gap-4 rounded-2xl bg-[#0d222b]/12 p-4 backdrop-blur-sm">
               <ProgressRing
                  value={budgetPct}
                  size={104}
                  thickness={10}
                  sublabel="Budget used"
                  gradientId="hero-ring"
               />
               <div className="hidden text-[#0d222b] sm:block">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                     Portfolio budget
                  </p>
                  <p className="font-display text-lg font-extrabold">
                     {formatMoneyShort(kpis.totalBudget)}
                  </p>
                  <p className="mt-1 text-xs font-medium opacity-80">
                     {formatMoneyShort(kpis.totalActualCost)} spent to date
                  </p>
               </div>
            </div>
         </Hero>

         {/* KPI grid */}
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
               label="Active Projects"
               value={kpis.activeProjects}
               hint={`${kpis.totalProjects} total in portfolio`}
               icon={FiLayers}
               tone="brand"
            />
            <KpiCard
               label="Present Today"
               value={kpis.presentToday}
               delta={`${kpis.presentRate}%`}
               deltaTone={kpis.presentRate >= 75 ? "success" : "warning"}
               hint={`${kpis.totalEmployees} employees`}
               icon={FiUsers}
               tone="mint"
            />
            <KpiCard
               label="Inventory Value"
               value={formatMoneyShort(kpis.inventoryValue)}
               hint={`${kpis.materialsTracked} materials tracked`}
               icon={FiPackage}
               tone="sun"
            />
            <KpiCard
               label="Monthly Expense"
               value={formatMoneyShort(kpis.monthlyExpense)}
               hint="Current calendar month"
               icon={FiDollarSign}
               tone="amber"
            />
         </div>

         {/* Secondary quick stats */}
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QuickStat
               icon={FiClipboard}
               label="Pending Requests"
               value={kpis.pendingRequests}
               to="/material-request"
               tone="text-[#D9A441]"
            />
            <QuickStat
               icon={FiShoppingCart}
               label="Draft Purchase Orders"
               value={kpis.pendingPO}
               to="/purchase-orders"
               tone="text-brand-500"
            />
            <QuickStat
               icon={FiAlertTriangle}
               label="Low Stock Items"
               value={kpis.lowStockCount}
               to="/inventory"
               tone="text-[#E05252]"
            />
         </div>

         {/* Charts */}
         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard
               title="Revenue vs Expenses"
               subtitle="Last 6 months"
               icon={FiTrendingUp}
               className="lg:col-span-2"
            >
               <LineChart
                  labels={data.revenueVsExpense.labels}
                  series={data.revenueVsExpense.series}
                  valueFormat={(v) => formatMoneyShort(v)}
                  height={280}
               />
            </ChartCard>

            <ChartCard title="Project Status" subtitle="Distribution" icon={FiPieChart}>
               <DonutChart
                  data={data.projectStatus}
                  size={168}
                  valueFormat={(v) => String(v)}
               />
            </ChartCard>
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard
               title="Project Budget vs Actual"
               subtitle="Top projects by budget"
               icon={FiLayers}
               className="lg:col-span-2"
            >
               <BarChart
                  labels={data.budgetVsActual.labels}
                  series={data.budgetVsActual.series}
                  valueFormat={(v) => formatMoneyShort(v)}
                  height={280}
               />
            </ChartCard>

            <ChartCard title="Procurement Status" subtitle="Purchase orders" icon={FiShoppingCart}>
               <DonutChart data={data.procurementStatus} size={168} valueFormat={(v) => String(v)} />
            </ChartCard>
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Workforce Composition" subtitle="By designation" icon={FiUsers}>
               <BarChart
                  labels={data.workforceByDesignation.map((d) => d.name)}
                  series={[
                     {
                        name: "Employees",
                        data: data.workforceByDesignation.map((d) => d.value),
                        color: "#2A7B9B",
                     },
                  ]}
                  valueFormat={(v) => String(Math.round(v))}
                  height={250}
               />
            </ChartCard>

            <ChartCard
               title="Material Usage"
               subtitle="Received vs issued"
               icon={FiBox}
            >
               <BarChart
                  labels={data.materialUsage.labels}
                  series={data.materialUsage.series}
                  valueFormat={(v) => formatCompact(v)}
                  height={250}
               />
            </ChartCard>

            <ChartCard
               title="Monthly Performance"
               subtitle="Procurement vs expenses"
               icon={FiActivity}
            >
               <LineChart
                  labels={data.monthlyPerformance.labels}
                  series={data.monthlyPerformance.series}
                  area={false}
                  valueFormat={(v) => formatMoneyShort(v)}
                  height={250}
               />
            </ChartCard>
         </div>

         {/* Lists */}
         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="surface-card p-5 lg:col-span-2">
               <div className="flex items-center justify-between">
                  <h3 className="text-[0.95rem] font-bold text-ink-900">Top Projects</h3>
                  <ViewAllLink to="/projects" />
               </div>
               <div className="mt-3 space-y-1">
                  {data.topProjects.length === 0 && (
                     <p className="py-6 text-center text-sm text-ink-400">No projects yet.</p>
                  )}
                  {data.topProjects.map((p) => (
                     <ListRow
                        key={p.code}
                        to={`/projects`}
                        leading={
                           <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient font-display text-xs font-extrabold text-[#0d222b]">
                              {p.progress}%
                           </span>
                        }
                        title={p.name}
                        meta={`${p.code} · Budget ${formatMoneyShort(p.budget)}`}
                        trailing={
                           <div className="hidden w-36 sm:block">
                              <ProgressBar
                                 value={
                                    p.budget > 0 ? Math.min((p.spent / p.budget) * 100, 100) : 0
                                 }
                                 gradient
                              />
                              <p className="mt-1 text-right text-[0.65rem] text-ink-400">
                                 {formatMoneyShort(p.spent)} spent
                              </p>
                           </div>
                        }
                     />
                  ))}
               </div>
            </div>

            <div className="surface-card p-5">
               <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-[0.95rem] font-bold text-ink-900">
                     <FiAlertTriangle size={16} className="text-[#D9A441]" />
                     Low Stock Alerts
                  </h3>
                  <ViewAllLink to="/inventory" />
               </div>
               <div className="mt-3 space-y-1">
                  {data.lowStock.length === 0 && (
                     <p className="py-6 text-center text-sm text-ink-400">
                        All materials are above reorder level.
                     </p>
                  )}
                  {data.lowStock.map((item, i) => (
                     <div
                        key={`${item.name}-${i}`}
                        className="flex items-center justify-between rounded-xl px-2.5 py-2.5 transition hover:bg-canvas"
                     >
                        <div className="min-w-0">
                           <p className="truncate text-[0.82rem] font-semibold text-ink-900">
                              {item.name}
                           </p>
                           <p className="text-[0.72rem] text-ink-500">
                              Min {item.minimum} {item.unit}
                           </p>
                        </div>
                        <span className="badge badge-danger">
                           {item.stock} {item.unit}
                        </span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Expense breakdown */}
         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard
               title="Expense Breakdown"
               subtitle="By category"
               icon={FiDollarSign}
               className="lg:col-span-1"
            >
               <DonutChart
                  data={data.expenseBreakdown}
                  size={168}
                  centerLabel="Expenses"
                  valueFormat={(v) => formatMoneyShort(v)}
               />
            </ChartCard>

            <div className="surface-card flex flex-col p-5 lg:col-span-2">
               <h3 className="text-[0.95rem] font-bold text-ink-900">Project Progress</h3>
               <p className="mb-3 text-xs text-ink-500">Delivery status across active sites</p>
               <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                  {data.projectProgress.slice(0, 6).map((p) => (
                     <div key={p.code}>
                        <div className="mb-1.5 flex items-center justify-between">
                           <span className="flex items-center gap-2 text-[0.8rem] font-semibold text-ink-700">
                              <span className="h-2 w-2 rounded-full bg-brand-400" />
                              {p.name}
                           </span>
                           <StatusBadge status={p.status} />
                        </div>
                        <ProgressBar value={p.progress} gradient />
                     </div>
                  ))}
                  {data.projectProgress.length === 0 && (
                     <p className="py-6 text-center text-sm text-ink-400">No projects yet.</p>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}

function QuickStat({ icon: Icon, label, value, to, tone }) {
   return (
      <Link
         to={to}
         className="surface-card card-hover flex items-center justify-between p-4"
      >
         <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-canvas">
               <Icon size={19} className={tone} />
            </span>
            <div>
               <p className="font-display text-xl font-extrabold text-ink-900">{value}</p>
               <p className="text-[0.75rem] font-medium text-ink-500">{label}</p>
            </div>
         </div>
         <FiChevronRight className="text-ink-400" />
      </Link>
   );
}

function formatMoneyShort(value) {
   return formatCurrency(value).replace("PKR ", "");
}

void formatCompact;
