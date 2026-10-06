import { useEffect, useMemo, useState } from "react";
import { FiFileText, FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { getJournalEntries, createJournalEntry, deleteJournalEntry, getAccounts } from "../../services/accountService";
import { useToast } from "../../components/ui/ToastContext";
import { PageHeader } from "../../components/dashboard/widgets";
import { formatCurrency } from "../../components/charts/Charts";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap, RowActions } from "../../components/ui/TableShell";
import StatusBadge from "../../components/ui/StatusBadge";

const money = (v) => formatCurrency(v).replace("PKR ", "");

export default function JournalEntriesPage() {
   const toast = useToast();
   const [entries, setEntries] = useState([]);
   const [accounts, setAccounts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const [saving, setSaving] = useState(false);
   const [search, setSearch] = useState("");
   const [formData, setFormData] = useState({
      date: new Date().toISOString().split("T")[0], reference: "", description: "", project: "",
      lines: [{ account: "", debit: 0, credit: 0, description: "" }, { account: "", debit: 0, credit: 0, description: "" }],
   });

   const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
         const [entriesRes, accountsRes] = await Promise.all([getJournalEntries(), getAccounts()]);
         setEntries(entriesRes.data.data || []);
         setAccounts(accountsRes.data.data || []);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load journal entries.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = useMemo(() => {
      return entries.filter((e) => `${e.reference || ""} ${e.description || ""}`.toLowerCase().includes(search.toLowerCase()));
   }, [entries, search]);

   const getTotalDebit = () => formData.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
   const getTotalCredit = () => formData.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
   const isBalanced = () => Math.abs(getTotalDebit() - getTotalCredit()) < 0.001 && getTotalDebit() > 0;

   const addLine = () => setFormData({ ...formData, lines: [...formData.lines, { account: "", debit: 0, credit: 0, description: "" }] });
   const removeLine = (index) => setFormData({ ...formData, lines: formData.lines.filter((_, i) => i !== index) });
   const updateLine = (index, field, value) => {
      const newLines = [...formData.lines];
      newLines[index][field] = field === "debit" || field === "credit" ? parseFloat(value) || 0 : value;
      setFormData({ ...formData, lines: newLines });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!isBalanced()) {
         toast.warning("Journal entry must be balanced (debit = credit).");
         return;
      }
      setSaving(true);
      try {
         await createJournalEntry(formData);
         toast.success("Journal entry posted.");
         resetForm();
         loadData();
      } catch (err) {
         toast.error(err.response?.data?.message || "Error creating journal entry.");
      } finally {
         setSaving(false);
      }
   };

   const handleDelete = async (id) => {
      if (!window.confirm("Delete this journal entry?")) return;
      try {
         await deleteJournalEntry(id);
         toast.success("Entry deleted.");
         loadData();
      } catch (err) {
         toast.error(err.response?.data?.message || "Error deleting entry.");
      }
   };

   const resetForm = () => {
      setFormData({
         date: new Date().toISOString().split("T")[0], reference: "", description: "", project: "",
         lines: [{ account: "", debit: 0, credit: 0, description: "" }, { account: "", debit: 0, credit: 0, description: "" }],
      });
      setShowForm(false);
   };

   if (loading) return <TableSkeleton rows={7} cols={6} />;
   if (error) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load journal entries." onRetry={loadData} />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <PageHeader
            title="Journal Entries"
            subtitle="Double-entry postings across every ledger account."
            actions={
               <>
                  <Button variant="secondary" icon={FiRefreshCw} onClick={loadData}>Refresh</Button>
                  <Button variant="primary" icon={FiPlus} onClick={() => setShowForm(true)}>New Entry</Button>
               </>
            }
         />

         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reference or narration…" className="sm:max-w-xs" />
            <span className="badge badge-brand ml-auto">{filtered.length} entries</span>
         </div>

         <TableShell>
            <TableWrap>
               <table className="data-table min-w-[820px]">
                  <thead><tr><th>Date</th><th>Reference</th><th>Narration</th><th className="text-right">Debit</th><th className="text-right">Credit</th><th className="text-center">Status</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                     {filtered.map((entry) => (
                        <tr key={entry._id}>
                           <td className="whitespace-nowrap">{entry.date ? new Date(entry.date).toLocaleDateString() : "—"}</td>
                           <td className="font-mono font-semibold text-ink-900">{entry.reference}</td>
                           <td className="max-w-[240px] truncate text-ink-500">{entry.description || "—"}</td>
                           <td className="text-right font-mono">{money(entry.totalDebit)}</td>
                           <td className="text-right font-mono">{money(entry.totalCredit)}</td>
                           <td className="text-center"><StatusBadge status={entry.status || "posted"} /></td>
                           <td>
                              <RowActions>
                                 <button type="button" onClick={() => handleDelete(entry._id)} className="grid h-8 w-8 place-items-center rounded-xl text-[#c23b3b] transition hover:bg-[rgba(224,82,82,0.1)]" aria-label="Delete"><FiTrash2 size={14} /></button>
                              </RowActions>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </TableWrap>
            {filtered.length === 0 && <EmptyState icon={FiFileText} title="No journal entries" message="Post your first balanced entry to get started." />}
         </TableShell>

         <Modal isOpen={showForm} onClose={resetForm} title="New Journal Entry" subtitle="Debits must equal credits before posting." size="xl">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div><label className="field-label">Date</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input" required /></div>
                  <div><label className="field-label">Reference</label><input value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} className="input font-mono" required /></div>
                  <div><label className="field-label">Narration</label><input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" /></div>
               </div>

               <div className="overflow-x-auto rounded-2xl border border-line">
                  <table className="data-table min-w-[640px]">
                     <thead><tr><th>Account</th><th className="text-right">Debit</th><th className="text-right">Credit</th><th>Memo</th><th /></tr></thead>
                     <tbody>
                        {formData.lines.map((line, index) => (
                           <tr key={index}>
                              <td><select value={line.account} onChange={(e) => updateLine(index, "account", e.target.value)} className="select min-w-[180px]" required><option value="">Select account</option>{accounts.map((acc) => <option key={acc._id} value={acc._id}>{acc.code} - {acc.name}</option>)}</select></td>
                              <td><input type="number" step="0.01" value={line.debit} onChange={(e) => updateLine(index, "debit", e.target.value)} className="input text-right font-mono" /></td>
                              <td><input type="number" step="0.01" value={line.credit} onChange={(e) => updateLine(index, "credit", e.target.value)} className="input text-right font-mono" /></td>
                              <td><input value={line.description} onChange={(e) => updateLine(index, "description", e.target.value)} className="input" /></td>
                              <td>{formData.lines.length > 2 && <button type="button" onClick={() => removeLine(index)} className="text-xs font-semibold text-[#c23b3b] hover:underline">Remove</button>}</td>
                           </tr>
                        ))}
                     </tbody>
                     <tfoot>
                        <tr className="bg-canvas/60 font-bold">
                           <td className="p-3 text-sm">Totals</td>
                           <td className="p-3 text-right font-mono text-sm">{money(getTotalDebit())}</td>
                           <td className="p-3 text-right font-mono text-sm">{money(getTotalCredit())}</td>
                           <td colSpan={2} className="p-3"><span className={`badge ${isBalanced() ? "badge-success" : "badge-warning"}`}>{isBalanced() ? "Balanced" : "Not balanced"}</span></td>
                        </tr>
                     </tfoot>
                  </table>
               </div>

               <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="secondary" onClick={addLine}>Add line</Button>
                  <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                  <Button variant="primary" type="submit" loading={saving} disabled={!isBalanced()}>Post entry</Button>
               </div>
            </form>
         </Modal>
      </div>
   );
}
