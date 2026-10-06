import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
   FiActivity,
   FiAlertTriangle,
   FiArchive,
   FiBox,
   FiClipboard,
   FiDollarSign,
   FiLayers,
   FiPackage,
   FiPieChart,
   FiShoppingCart,
   FiTrendingUp,
   FiTruck,
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
   formatCompact,
   formatCurrency,
} from "../components/charts/Charts";
import { ChartCard, Hero, KpiCard, ListRow, ViewAllLink } from "../components/dashboard/widgets";
import { ErrorState } from "../components/ui/States";

const money = (v) => formatCurrency(v).replace("PKR ", "");

const ROLE_CONFIG = {
   accountant: {
      eyebrow: "Finance Desk",
      title: "Financial Overview",
      subtitle: "Track expenses, receivables and the profitability of every project.",
      icon: FiDollarSign,
      links: [
         { to: "/accountant/expenses", label: "Expenses", icon: FiDollarSign },
         { to: "/accountant/journal-entries", label: "Journal Entries", icon: FiClipboard },
      ],
   },
   purchase_manager: {
      eyebrow: "Procurement Hub",
      title: "Procurement Overview",
      subtitle: "Monitor purchase orders, vendor spend and material requests.",
      icon: FiShoppingCart,
      links: [
         { to: "/purchase-manager/purchase-orders", label: "Purchase Orders", icon: FiShoppingCart },
         { to: "/purchase-manager/vendors", label: "Vendors", icon: FiTruck },
      ],
   },
   store_manager: {
      eyebrow: "Store Room",
      title: "Inventory Overview",
      subtitle: "Keep an eye on stock levels, material movement and warehouse health.",
      icon: FiArchive,
      links: [
         { to: "/store-manager/inventory", label: "Inventory", icon: FiArchive },
         { to: "/store-manager/material-issues", label: "Material Issues", icon: FiPackage },
      ],
   },
};

export default function RoleDashboard({ role }) {
   const { user } = useAuth();
   const toast = useToast();
   const config = ROLE_CONFIG[role] || ROLE_CONFIG.accountant;
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
         toast.error(err.response?.data?.message || "Could not load dashboard data.");
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
            <ErrorState message="We couldn't load your dashboard." onRetry={load} />
         </div>
      );
   }

   const { kpis } = data;

   return (
      <div className="space-y-5">
         <Hero
            eyebrow={config.eyebrow}
            title={`${config.title} · ${user?.name?.split(" ")[0] || ""}`}
            subtitle={config.subtitle}
            actions={config.links.map((l) => (
               <Link key={l.to} to={l.to} className="btn btn-secondary">
                  <l.icon size={16} />
                  {l.label}
               </Link>
            ))}
         />

         {role === "store_manager" && <StoreContent data={data} kpis={kpis} />}
         {role === "purchase_manager" && <PurchaseContent data={data} kpis={kpis} />}
         {role === "accountant" && <AccountantContent data={data} kpis={kpis} />}
      </div>
   );
}

function KpiGrid({ items }) {
   return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
         {items.map((k) => (
            <KpiCard key={k.label} {...k} />
         ))}
      </div>
   );
}

function StoreContent({ data, kpis }) {
   return (
      <>
         <KpiGrid
            items={[
               { label: "Inventory Value", value: money(kpis.inventoryValue), icon: FiBox, tone: "brand", hint: `${kpis.materialsTracked} materials` },
               { label: "Low Stock Items", value: kpis.lowStockCount, icon: FiAlertTriangle, tone: "amber", hint: "At or below minimum" },
               { label: "Units Issued", value: formatCompact(kpis.totalIssued), icon: FiPackage, tone: "mint", hint: "All time" },
               { label: "Active Projects", value: kpis.activeProjects, icon: FiLayers, tone: "sun", hint: "Supplied sites" },
            ]}
         />

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Material Usage" subtitle="Received vs issued" icon={FiBox} className="lg:col-span-2">
               <BarChart
                  labels={data.materialUsage.labels}
                  series={data.materialUsage.series}
                  valueFormat={(v) => formatCompact(v)}
                  height={280}
               />
            </ChartCard>
            <ChartCard title="Stock Value" subtitle="By material" icon={FiPieChart}>
               <DonutChart data={data.materialValueDonut} size={168} valueFormat={(v) => money(v)} />
            </ChartCard>
         </div>

         <div className="surface-card p-5">
            <div className="flex items-center justify-between">
               <h3 className="flex items-center gap-2 text-[0.95rem] font-bold text-ink-900">
                  <FiAlertTriangle size={16} className="text-[#D9A441]" />
                  Reorder Watchlist
               </h3>
               <ViewAllLink to="/store-manager/inventory" />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
               {data.lowStock.length === 0 && (
                  <p className="py-6 text-center text-sm text-ink-400 sm:col-span-2">
                     Everything is well stocked.
                  </p>
               )}
               {data.lowStock.map((item, i) => (
                  <div key={`${item.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-line p-3">
                     <span className="grid h-9 w-9 place-items-center rounded-xl bg-[rgba(217,164,65,0.14)] text-[#9a721f]">
                        <FiBox size={16} />
                     </span>
                     <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.82rem] font-semibold text-ink-900">{item.name}</p>
                        <p className="text-[0.72rem] text-ink-500">Minimum {item.minimum} {item.unit}</p>
                     </div>
                     <span className="badge badge-danger">{item.stock} {item.unit}</span>
                  </div>
               ))}
            </div>
         </div>
      </>
   );
}

function PurchaseContent({ data, kpis }) {
   const vendorLabels = data.procurementByVendor.map((_, i) => `V${i + 1}`);
   return (
      <>
         <KpiGrid
            items={[
               { label: "Draft POs", value: kpis.pendingPO, icon: FiShoppingCart, tone: "brand", hint: "Awaiting approval" },
               { label: "Pending Requests", value: kpis.pendingRequests, icon: FiClipboard, tone: "amber", hint: "Material requests" },
               { label: "Delivered Value", value: money(kpis.deliveredPOValue), icon: FiTruck, tone: "mint", hint: "Received POs" },
               { label: "Monthly Spend", value: money(kpis.monthlyExpense), icon: FiDollarSign, tone: "sun", hint: "This month" },
            ]}
         />

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Monthly Procurement" subtitle="PO value over time" icon={FiTrendingUp} className="lg:col-span-2">
               <LineChart
                  labels={data.monthlyPerformance.labels}
                  series={[data.monthlyPerformance.series[0]]}
                  valueFormat={(v) => money(v)}
                  height={280}
               />
            </ChartCard>
            <ChartCard title="PO Status" subtitle="Pipeline" icon={FiPieChart}>
               <DonutChart data={data.procurementStatus} size={168} valueFormat={(v) => String(v)} />
            </ChartCard>
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Top Vendor Spend" subtitle="Highest PO value" icon={FiTruck} className="lg:col-span-2">
               <BarChart
                  labels={vendorLabels.length ? vendorLabels : ["No data"]}
                  series={[
                     {
                        name: "PO Value",
                        data: data.procurementByVendor.length ? data.procurementByVendor : [0],
                        color: "#2A7B9B",
                     },
                  ]}
                  valueFormat={(v) => money(v)}
                  height={260}
               />
            </ChartCard>
            <ChartCard title="Budget vs Actual" subtitle="Per project" icon={FiLayers}>
               <BarChart
                  labels={data.budgetVsActual.labels}
                  series={data.budgetVsActual.series}
                  valueFormat={(v) => money(v)}
                  height={260}
               />
            </ChartCard>
         </div>
      </>
   );
}

function AccountantContent({ data, kpis }) {
   return (
      <>
         <KpiGrid
            items={[
               { label: "Total Expenses", value: money(kpis.totalExpenses), icon: FiDollarSign, tone: "brand", hint: "All recorded" },
               { label: "Monthly Expense", value: money(kpis.monthlyExpense), icon: FiActivity, tone: "amber", hint: "Current month" },
               { label: "Outstanding", value: money(kpis.outstanding), icon: FiTrendingUp, tone: "danger", hint: "Unpaid interim" },
               { label: "Received Revenue", value: money(kpis.totalReceived), icon: FiLayers, tone: "mint", hint: "From clients" },
            ]}
         />

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Revenue vs Expenses" subtitle="Last 6 months" icon={FiTrendingUp} className="lg:col-span-2">
               <LineChart
                  labels={data.revenueVsExpense.labels}
                  series={data.revenueVsExpense.series}
                  valueFormat={(v) => money(v)}
                  height={280}
               />
            </ChartCard>
            <ChartCard title="Expense Breakdown" subtitle="By category" icon={FiPieChart}>
               <DonutChart data={data.expenseBreakdown} size={168} valueFormat={(v) => money(v)} />
            </ChartCard>
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Budget vs Actual" subtitle="Top projects" icon={FiLayers} className="lg:col-span-2">
               <BarChart
                  labels={data.budgetVsActual.labels}
                  series={data.budgetVsActual.series}
                  valueFormat={(v) => money(v)}
                  height={260}
               />
            </ChartCard>
            <div className="surface-card p-5">
               <h3 className="text-[0.95rem] font-bold text-ink-900">Project Profitability</h3>
               <div className="mt-3 space-y-2">
                  {data.topProjects.map((p) => {
                     const profit = p.received - p.spent;
                     return (
                        <div key={p.code} className="rounded-xl border border-line p-3">
                           <div className="flex items-center justify-between">
                              <p className="truncate text-[0.82rem] font-semibold text-ink-900">{p.name}</p>
                              <span className={`badge ${profit >= 0 ? "badge-success" : "badge-danger"}`}>
                                 {money(Math.abs(profit))}
                              </span>
                           </div>
                           <div className="mt-2">
                              <ProgressBar
                                 value={p.contractValue > 0 ? Math.min((p.received / p.contractValue) * 100, 100) : 0}
                                 gradient
                              />
                           </div>
                           <p className="mt-1 text-[0.68rem] text-ink-400">
                              {money(p.received)} received of {money(p.contractValue)}
                           </p>
                        </div>
                     );
                  })}
                  {data.topProjects.length === 0 && (
                     <p className="py-6 text-center text-sm text-ink-400">No project data.</p>
                  )}
               </div>
            </div>
         </div>
      </>
   );
}

void ListRow;
void FiUsers;
