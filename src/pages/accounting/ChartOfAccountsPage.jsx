import { useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiEdit2, FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import {
   getAccounts,
   createAccount,
   updateAccount,
   deleteAccount,
   getAccountCategories,
} from "../../services/accountService";
import { useToast } from "../../components/ui/ToastContext";
import { PageHeader } from "../../components/dashboard/widgets";
import { formatCurrency } from "../../components/charts/Charts";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput, FilterSelect } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap, RowActions } from "../../components/ui/TableShell";
import StatusBadge from "../../components/ui/StatusBadge";

const money = (v) => formatCurrency(v).replace("PKR ", "");
const TYPES = ["asset", "liability", "equity", "revenue", "expense"];

export default function ChartOfAccountsPage() {
   const toast = useToast();
   const [accounts, setAccounts] = useState([]);
   const [categories, setCategories] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const [saving, setSaving] = useState(false);
   const [editingAccount, setEditingAccount] = useState(null);
   const [search, setSearch] = useState("");
   const [typeFilter, setTypeFilter] = useState("all");
   const [formData, setFormData] = useState({ name: "", code: "", category: "", type: "asset", openingBalance: 0, description: "", project: "" });

   const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
         const [accRes, catRes] = await Promise.all([getAccounts(), getAccountCategories()]);
         setAccounts(accRes.data.data || []);
         setCategories(catRes.data.data || []);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load chart of accounts.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = useMemo(() => {
      return accounts.filter((a) => {
         const matchesSearch = `${a.name} ${a.code}`.toLowerCase().includes(search.toLowerCase());
         const matchesType = typeFilter === "all" || a.type === typeFilter;
         return matchesSearch && matchesType;
      });
   }, [accounts, search, typeFilter]);

   const totalBalance = useMemo(() => accounts.reduce((s, a) => s + Number(a.currentBalance || 0), 0), [accounts]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         if (editingAccount) await updateAccount(editingAccount._id, formData);
         else await createAccount(formData);
         toast.success(editingAccount ? "Account updated." : "Account created.");
         resetForm();
         loadData();
      } catch (err) {
         toast.error(err.response?.data?.message || "Error saving account.");
      } finally {
         setSaving(false);
      }
   };

   const handleEdit = (account) => {
      setEditingAccount(account);
      setFormData({
         name: account.name, code: account.code,
         category: account.category?._id || account.category,
         type: account.type, openingBalance: account.openingBalance,
         description: account.description || "", project: account.project?._id || account.project || "",
      });
      setShowForm(true);
   };

   const handleDelete = async (id) => {
      if (!window.confirm("Delete this account?")) return;
      try {
         await deleteAccount(id);
         toast.success("Account deleted.");
         loadData();
      } catch (err) {
         toast.error(err.response?.data?.message || "Error deleting account.");
      }
   };

   const resetForm = () => {
      setFormData({ name: "", code: "", category: "", type: "asset", openingBalance: 0, description: "", project: "" });
      setEditingAccount(null);
      setShowForm(false);
   };

   if (loading) return <TableSkeleton rows={7} cols={6} />;
   if (error) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load the chart of accounts." onRetry={loadData} />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <PageHeader
            title="Chart of Accounts"
            subtitle={`Track every ledger account · ${money(totalBalance)} combined balance.`}
            actions={
               <>
                  <Button variant="secondary" icon={FiRefreshCw} onClick={loadData}>Refresh</Button>
                  <Button variant="primary" icon={FiPlus} onClick={() => setShowForm(true)}>Add Account</Button>
               </>
            }
         />

         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search accounts…" className="sm:max-w-xs" />
            <FilterSelect
               value={typeFilter}
               onChange={(e) => setTypeFilter(e.target.value)}
               options={[{ value: "all", label: "All types" }, ...TYPES.map((t) => ({ value: t, label: t }))]}
               className="sm:w-48"
            />
            <span className="badge badge-brand ml-auto">{filtered.length} accounts</span>
         </div>

         <TableShell>
            <TableWrap>
               <table className="data-table min-w-[760px]">
                  <thead><tr><th>Code</th><th>Account</th><th>Category</th><th className="text-center">Type</th><th className="text-right">Balance</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                     {filtered.map((account) => (
                        <tr key={account._id}>
                           <td className="font-mono font-semibold text-ink-900">{account.code}</td>
                           <td><span className="flex items-center gap-2 font-semibold text-ink-900"><span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-500"><FiBookOpen size={14} /></span>{account.name}</span></td>
                           <td className="text-ink-500">{account.category?.name || "—"}</td>
                           <td className="text-center"><StatusBadge status={account.type} /></td>
                           <td className="text-right font-mono font-semibold">{money(account.currentBalance || 0)}</td>
                           <td>
                              <RowActions>
                                 <button type="button" onClick={() => handleEdit(account)} className="grid h-8 w-8 place-items-center rounded-xl text-ink-500 transition hover:bg-canvas hover:text-ink-900" aria-label="Edit"><FiEdit2 size={14} /></button>
                                 <button type="button" onClick={() => handleDelete(account._id)} className="grid h-8 w-8 place-items-center rounded-xl text-[#c23b3b] transition hover:bg-[rgba(224,82,82,0.1)]" aria-label="Delete"><FiTrash2 size={14} /></button>
                              </RowActions>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </TableWrap>
            {filtered.length === 0 && <EmptyState title="No accounts" message="No accounts match the current search." />}
         </TableShell>

         <Modal isOpen={showForm} onClose={resetForm} title={editingAccount ? "Edit Account" : "New Account"} subtitle="Add a ledger account to the chart." size="lg">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               <div><label className="field-label">Account name</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required /></div>
               <div><label className="field-label">Account code</label><input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="input font-mono" required /></div>
               <div><label className="field-label">Category</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="select" required><option value="">Select category</option>{categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name} ({cat.code})</option>)}</select></div>
               <div><label className="field-label">Type</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="select">{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
               <div><label className="field-label">Opening balance</label><input type="number" step="0.01" value={formData.openingBalance} onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })} className="input" /></div>
               <div><label className="field-label">Description</label><input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" /></div>
               <div className="flex justify-end gap-2 sm:col-span-2">
                  <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                  <Button variant="primary" type="submit" loading={saving}>{editingAccount ? "Update" : "Create"}</Button>
               </div>
            </form>
         </Modal>
      </div>
   );
}
