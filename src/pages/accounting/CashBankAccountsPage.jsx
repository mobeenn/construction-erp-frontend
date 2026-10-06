import { useEffect, useMemo, useState } from "react";
import { FiArchive, FiDollarSign, FiPlus, FiRefreshCw } from "react-icons/fi";
import Tabs from "../../components/ui/Tabs";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap } from "../../components/ui/TableShell";
import { KpiCard, PageHeader } from "../../components/dashboard/widgets";
import { useToast } from "../../components/ui/ToastContext";
import { formatCurrency } from "../../components/charts/Charts";
import {
   getCashAccounts,
   createCashAccount,
   getBankAccounts,
   createBankAccount,
} from "../../services/accountService";

const money = (v) => formatCurrency(v).replace("PKR ", "");

export default function CashBankAccountsPage() {
   const toast = useToast();
   const [activeTab, setActiveTab] = useState("cash");
   const [cashAccounts, setCashAccounts] = useState([]);
   const [bankAccounts, setBankAccounts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const [saving, setSaving] = useState(false);
   const [search, setSearch] = useState("");
   const [cashForm, setCashForm] = useState({ name: "", code: "", openingBalance: 0, description: "" });
   const [bankForm, setBankForm] = useState({ name: "", code: "", bankName: "", accountNumber: "", branch: "", openingBalance: 0, description: "" });

   const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
         const [cashRes, bankRes] = await Promise.all([getCashAccounts(), getBankAccounts()]);
         setCashAccounts(cashRes.data.data || []);
         setBankAccounts(bankRes.data.data || []);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load cash & bank accounts.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const handleCreateCash = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createCashAccount(cashForm);
         toast.success("Cash account created.");
         setCashForm({ name: "", code: "", openingBalance: 0, description: "" });
         setShowForm(false);
         loadData();
      } catch (err) {
         toast.error(err.response?.data?.message || "Error creating cash account.");
      } finally {
         setSaving(false);
      }
   };

   const handleCreateBank = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createBankAccount(bankForm);
         toast.success("Bank account created.");
         setBankForm({ name: "", code: "", bankName: "", accountNumber: "", branch: "", openingBalance: 0, description: "" });
         setShowForm(false);
         loadData();
      } catch (err) {
         toast.error(err.response?.data?.message || "Error creating bank account.");
      } finally {
         setSaving(false);
      }
   };

   const totalCash = useMemo(() => cashAccounts.reduce((s, a) => s + Number(a.balance || 0), 0), [cashAccounts]);
   const totalBank = useMemo(() => bankAccounts.reduce((s, a) => s + Number(a.balance || 0), 0), [bankAccounts]);

   const q = search.toLowerCase();
   const filteredCash = cashAccounts.filter((a) => `${a.name} ${a.code}`.toLowerCase().includes(q));
   const filteredBank = bankAccounts.filter((a) => `${a.name} ${a.code} ${a.bankName || ""}`.toLowerCase().includes(q));

   if (loading) return <TableSkeleton rows={6} cols={4} />;
   if (error) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load cash & bank accounts." onRetry={loadData} />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <PageHeader
            title="Cash & Bank Accounts"
            subtitle="Liquid balances across tills and bank vaults."
            actions={
               <>
                  <Button variant="secondary" icon={FiRefreshCw} onClick={loadData}>Refresh</Button>
                  <Button variant="primary" icon={FiPlus} onClick={() => setShowForm(true)}>Add Account</Button>
               </>
            }
         />

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard label="Total Cash" value={money(totalCash)} icon={FiDollarSign} tone="sun" hint={`${cashAccounts.length} tills`} />
            <KpiCard label="Total Bank" value={money(totalBank)} icon={FiArchive} tone="brand" hint={`${bankAccounts.length} accounts`} />
            <KpiCard label="Combined Liquidity" value={money(totalCash + totalBank)} icon={FiDollarSign} tone="mint" hint="Available funds" />
         </div>

         <Tabs
            label="Account type"
            value={activeTab}
            onChange={setActiveTab}
            options={[
               { value: "cash", label: "Cash Accounts" },
               { value: "bank", label: "Bank Accounts" },
            ]}
         />

         <div className="surface-card p-4">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeTab} accounts…`} className="sm:max-w-xs" />
         </div>

         {activeTab === "cash" && (
            <TableShell>
               <TableWrap>
                  <table className="data-table min-w-[640px]">
                     <thead><tr><th>Code</th><th>Account</th><th className="text-right">Balance</th><th>Description</th></tr></thead>
                     <tbody>
                        {filteredCash.map((account) => (
                           <tr key={account._id}>
                              <td className="font-mono font-semibold">{account.code}</td>
                              <td className="font-medium text-ink-900">{account.name}</td>
                              <td className="text-right font-mono font-bold">{money(account.balance || 0)}</td>
                              <td className="text-ink-500">{account.description || "—"}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
               {filteredCash.length === 0 && <EmptyState title="No cash accounts" message="Add your first till to track petty cash." />}
            </TableShell>
         )}

         {activeTab === "bank" && (
            <TableShell>
               <TableWrap>
                  <table className="data-table min-w-[720px]">
                     <thead><tr><th>Code</th><th>Account</th><th>Bank</th><th>Account #</th><th className="text-right">Balance</th></tr></thead>
                     <tbody>
                        {filteredBank.map((account) => (
                           <tr key={account._id}>
                              <td className="font-mono font-semibold">{account.code}</td>
                              <td className="font-medium text-ink-900">{account.name}</td>
                              <td className="text-ink-500">{account.bankName || "—"}</td>
                              <td className="font-mono text-sm">{account.accountNumber || "—"}</td>
                              <td className="text-right font-mono font-bold">{money(account.balance || 0)}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
               {filteredBank.length === 0 && <EmptyState title="No bank accounts" message="Link your first bank account." />}
            </TableShell>
         )}

         <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={`New ${activeTab === "cash" ? "Cash" : "Bank"} Account`} subtitle="Funds post to the ledger on creation." size="lg">
            {activeTab === "cash" ? (
               <form onSubmit={handleCreateCash} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><label className="field-label">Account name</label><input value={cashForm.name} onChange={(e) => setCashForm({ ...cashForm, name: e.target.value })} className="input" required /></div>
                  <div><label className="field-label">Code</label><input value={cashForm.code} onChange={(e) => setCashForm({ ...cashForm, code: e.target.value })} className="input font-mono" required /></div>
                  <div><label className="field-label">Opening balance</label><input type="number" step="0.01" value={cashForm.openingBalance} onChange={(e) => setCashForm({ ...cashForm, openingBalance: parseFloat(e.target.value) || 0 })} className="input font-mono" /></div>
                  <div><label className="field-label">Description</label><input value={cashForm.description} onChange={(e) => setCashForm({ ...cashForm, description: e.target.value })} className="input" /></div>
                  <div className="flex justify-end gap-2 sm:col-span-2">
                     <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                     <Button variant="primary" type="submit" loading={saving}>Create</Button>
                  </div>
               </form>
            ) : (
               <form onSubmit={handleCreateBank} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><label className="field-label">Account name</label><input value={bankForm.name} onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })} className="input" required /></div>
                  <div><label className="field-label">Code</label><input value={bankForm.code} onChange={(e) => setBankForm({ ...bankForm, code: e.target.value })} className="input font-mono" required /></div>
                  <div><label className="field-label">Bank name</label><input value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} className="input" required /></div>
                  <div><label className="field-label">Account number</label><input value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} className="input font-mono" required /></div>
                  <div><label className="field-label">Branch</label><input value={bankForm.branch} onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })} className="input" /></div>
                  <div><label className="field-label">Opening balance</label><input type="number" step="0.01" value={bankForm.openingBalance} onChange={(e) => setBankForm({ ...bankForm, openingBalance: parseFloat(e.target.value) || 0 })} className="input font-mono" /></div>
                  <div className="flex justify-end gap-2 sm:col-span-2">
                     <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                     <Button variant="primary" type="submit" loading={saving}>Create</Button>
                  </div>
               </form>
            )}
         </Modal>
      </div>
   );
}
