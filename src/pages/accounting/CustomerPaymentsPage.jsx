import { useEffect, useMemo, useState } from "react";
import { FiDollarSign, FiPlus, FiRefreshCw } from "react-icons/fi";
import { getCustomerPayments, createCustomerPayment, getAccounts } from "../../services/accountService";
import { useToast } from "../../components/ui/ToastContext";
import { PageHeader, KpiCard } from "../../components/dashboard/widgets";
import { formatCurrency } from "../../components/charts/Charts";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput, FilterSelect } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap } from "../../components/ui/TableShell";
import StatusBadge from "../../components/ui/StatusBadge";

const money = (v) => formatCurrency(v).replace("PKR ", "");

export default function CustomerPaymentsPage() {
   const toast = useToast();
   const [payments, setPayments] = useState([]);
   const [accounts, setAccounts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const [saving, setSaving] = useState(false);
   const [search, setSearch] = useState("");
   const [methodFilter, setMethodFilter] = useState("all");
   const [formData, setFormData] = useState({
      date: new Date().toISOString().split("T")[0], reference: "", client: "", amount: 0,
      paymentMethod: "bank", account: "", project: "", description: "",
   });

   const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
         const [paymentsRes, accountsRes] = await Promise.all([getCustomerPayments(), getAccounts()]);
         setPayments(paymentsRes.data.data || []);
         setAccounts(accountsRes.data.data || []);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load customer payments.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = useMemo(() => {
      return payments.filter((p) => {
         const matchesSearch = `${p.reference || ""} ${p.client?.name || ""}`.toLowerCase().includes(search.toLowerCase());
         const matchesMethod = methodFilter === "all" || p.paymentMethod === methodFilter;
         return matchesSearch && matchesMethod;
      });
   }, [payments, search, methodFilter]);

   const total = useMemo(() => filtered.reduce((s, p) => s + Number(p.amount || 0), 0), [filtered]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createCustomerPayment(formData);
         toast.success("Customer payment recorded.");
         resetForm();
         loadData();
      } catch (err) {
         toast.error(err.response?.data?.message || "Error creating payment.");
      } finally {
         setSaving(false);
      }
   };

   const resetForm = () => {
      setFormData({
         date: new Date().toISOString().split("T")[0], reference: "", client: "", amount: 0,
         paymentMethod: "bank", account: "", project: "", description: "",
      });
      setShowForm(false);
   };

   if (loading) return <TableSkeleton rows={6} cols={6} />;
   if (error) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load customer payments." onRetry={loadData} />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <PageHeader
            title="Customer Payments"
            subtitle="Cash collected from clients against invoices and bills."
            actions={
               <>
                  <Button variant="secondary" icon={FiRefreshCw} onClick={loadData}>Refresh</Button>
                  <Button variant="primary" icon={FiPlus} onClick={() => setShowForm(true)}>Record Payment</Button>
               </>
            }
         />

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KpiCard label="Collected" value={money(total)} icon={FiDollarSign} tone="mint" hint={`${filtered.length} receipts`} />
            <KpiCard label="This Period" value={money(total)} icon={FiDollarSign} tone="brand" hint="Filtered total" />
         </div>

         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reference or client…" className="sm:max-w-xs" />
            <FilterSelect
               value={methodFilter}
               onChange={(e) => setMethodFilter(e.target.value)}
               options={[{ value: "all", label: "All methods" }, { value: "cash", label: "Cash" }, { value: "bank", label: "Bank" }, { value: "cheque", label: "Cheque" }]}
               className="sm:w-48"
            />
         </div>

         <TableShell>
            <TableWrap>
               <table className="data-table min-w-[760px]">
                  <thead><tr><th>Date</th><th>Reference</th><th>Client</th><th className="text-right">Amount</th><th className="text-center">Method</th><th className="text-center">Status</th></tr></thead>
                  <tbody>
                     {filtered.map((payment) => (
                        <tr key={payment._id}>
                           <td className="whitespace-nowrap">{payment.date ? new Date(payment.date).toLocaleDateString() : "—"}</td>
                           <td className="font-mono font-semibold">{payment.reference}</td>
                           <td className="font-medium text-ink-900">{payment.client?.name || "Unknown"}</td>
                           <td className="text-right font-mono font-bold text-[#1b7f56]">{money(payment.amount)}</td>
                           <td className="text-center capitalize text-ink-500">{payment.paymentMethod}</td>
                           <td className="text-center"><StatusBadge status={payment.status || "received"} /></td>
                        </tr>
                     ))}
                  </tbody>
                  <tfoot><tr className="bg-canvas/60 font-bold"><td colSpan={3} className="p-3 text-sm">Total ({filtered.length} receipts)</td><td className="p-3 text-right font-mono text-sm">{money(total)}</td><td colSpan={2} /></tr></tfoot>
               </table>
            </TableWrap>
            {filtered.length === 0 && <EmptyState title="No payments" message="No customer payments match this search." />}
         </TableShell>

         <Modal isOpen={showForm} onClose={resetForm} title="Record Customer Payment" subtitle="Receipts post to the selected ledger account." size="lg">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               <div><label className="field-label">Date</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input" required /></div>
               <div><label className="field-label">Reference</label><input value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} className="input font-mono" required /></div>
               <div><label className="field-label">Client ID</label><input value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} className="input" required /></div>
               <div><label className="field-label">Amount</label><input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} className="input font-mono" required /></div>
               <div><label className="field-label">Payment method</label><select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="select"><option value="cash">Cash</option><option value="bank">Bank</option><option value="cheque">Cheque</option></select></div>
               <div><label className="field-label">Account</label><select value={formData.account} onChange={(e) => setFormData({ ...formData, account: e.target.value })} className="select" required><option value="">Select account</option>{accounts.map((acc) => <option key={acc._id} value={acc._id}>{acc.code} - {acc.name}</option>)}</select></div>
               <div className="sm:col-span-2"><label className="field-label">Description</label><input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" /></div>
               <div className="flex justify-end gap-2 sm:col-span-2">
                  <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                  <Button variant="primary" type="submit" loading={saving}>Record payment</Button>
               </div>
            </form>
         </Modal>
      </div>
   );
}
