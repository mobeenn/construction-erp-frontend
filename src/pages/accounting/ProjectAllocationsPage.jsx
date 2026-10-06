import { useEffect, useState } from "react";
import { FiLayers, FiRefreshCw } from "react-icons/fi";
import Tabs from "../../components/ui/Tabs";
import Button from "../../components/ui/Button";
import { SearchInput } from "../../components/ui/Controls";
import { TableShell, TableWrap } from "../../components/ui/TableShell";
import { EmptyState } from "../../components/ui/States";
import { KpiCard, PageHeader } from "../../components/dashboard/widgets";
import { useToast } from "../../components/ui/ToastContext";
import { formatCurrency } from "../../components/charts/Charts";
import {
   getProjectExpenseAllocation,
   getProjectRevenueAllocation,
} from "../../services/accountService";

const money = (v) => formatCurrency(v).replace("PKR ", "");

export default function ProjectAllocationsPage() {
   const toast = useToast();
   const [activeTab, setActiveTab] = useState("expense");
   const [projectId, setProjectId] = useState("");
   const [allocation, setAllocation] = useState(null);
   const [loading, setLoading] = useState(false);

   const loadAllocation = async () => {
      if (!projectId.trim()) {
         toast.warning("Enter a project ID first.");
         return;
      }
      setLoading(true);
      try {
         const res =
            activeTab === "expense"
               ? await getProjectExpenseAllocation(projectId.trim())
               : await getProjectRevenueAllocation(projectId.trim());
         setAllocation(res.data.data);
      } catch (err) {
         toast.error(err.response?.data?.message || "Could not load allocation.");
         setAllocation(null);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      setAllocation(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [activeTab]);

   const rows = activeTab === "expense" ? allocation?.expenses || [] : allocation?.revenues || [];
   const total = activeTab === "expense" ? allocation?.totalExpense || 0 : allocation?.totalRevenue || 0;

   return (
      <div className="space-y-4">
         <PageHeader
            title="Project Allocations"
            subtitle="Trace journal postings allocated to a single project."
            actions={<Button variant="secondary" icon={FiRefreshCw} onClick={loadAllocation} loading={loading}>Load</Button>}
         />

         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <SearchInput
               value={projectId}
               onChange={(e) => setProjectId(e.target.value)}
               placeholder="Enter project ID…"
               className="sm:max-w-md"
            />
            <Button variant="primary" onClick={loadAllocation} loading={loading}>
               Load allocation
            </Button>
         </div>

         <Tabs
            label="Allocation type"
            value={activeTab}
            onChange={setActiveTab}
            options={[
               { value: "expense", label: "Expense Allocation" },
               { value: "revenue", label: "Revenue Allocation" },
            ]}
         />

         {allocation ? (
            <>
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <KpiCard
                     label={`Total ${activeTab === "expense" ? "Expense" : "Revenue"}`}
                     value={money(total)}
                     icon={FiLayers}
                     tone={activeTab === "expense" ? "amber" : "mint"}
                     hint={`${rows.length} postings`}
                  />
                  <KpiCard label="Postings" value={rows.length} icon={FiLayers} tone="brand" hint={activeTab === "expense" ? "Cost lines" : "Revenue lines"} />
               </div>

               <TableShell>
                  <TableWrap>
                     <table className="data-table min-w-[720px]">
                        <thead><tr><th>Date</th><th>Reference</th><th>Account</th><th className="text-right">Amount</th><th>Description</th></tr></thead>
                        <tbody>
                           {rows.map((item, idx) => (
                              <tr key={idx}>
                                 <td className="whitespace-nowrap">{item.date ? new Date(item.date).toLocaleDateString() : "—"}</td>
                                 <td className="font-mono font-semibold">{item.reference || "—"}</td>
                                 <td className="font-medium text-ink-900">{item.account || "—"}</td>
                                 <td className="text-right font-mono font-semibold">{money(item.amount)}</td>
                                 <td className="max-w-[260px] truncate text-ink-500">{item.description || "—"}</td>
                              </tr>
                           ))}
                        </tbody>
                        <tfoot><tr className="bg-canvas/60 font-bold"><td colSpan={3} className="p-3 text-sm">Total ({rows.length} lines)</td><td className="p-3 text-right font-mono text-sm">{money(total)}</td><td /></tr></tfoot>
                     </table>
                  </TableWrap>
                  {rows.length === 0 && <EmptyState title="No postings" message="No allocations found for this project." />}
               </TableShell>
            </>
         ) : (
            <div className="surface-card">
               <EmptyState
                  icon={FiLayers}
                  title="Select a project"
                  message="Enter a project ID and load its expense or revenue allocation."
                  action={<Button variant="primary" onClick={loadAllocation}>Load allocation</Button>}
               />
            </div>
         )}
      </div>
   );
}
