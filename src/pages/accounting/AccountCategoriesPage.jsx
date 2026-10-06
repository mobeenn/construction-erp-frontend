import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiFolder, FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import {
   getAccountCategories,
   createAccountCategory,
   updateAccountCategory,
   deleteAccountCategory,
} from "../../services/accountService";
import { useToast } from "../../components/ui/ToastContext";
import { PageHeader } from "../../components/dashboard/widgets";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput, FilterSelect } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import { TableShell, TableWrap, RowActions } from "../../components/ui/TableShell";
import StatusBadge from "../../components/ui/StatusBadge";

const TYPES = ["asset", "liability", "equity", "revenue", "expense"];

export default function AccountCategoriesPage() {
   const toast = useToast();
   const [categories, setCategories] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const [saving, setSaving] = useState(false);
   const [editingCategory, setEditingCategory] = useState(null);
   const [search, setSearch] = useState("");
   const [typeFilter, setTypeFilter] = useState("all");
   const [formData, setFormData] = useState({ name: "", code: "", type: "asset", description: "" });

   const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
         const res = await getAccountCategories();
         setCategories(res.data.data || []);
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Could not load account categories.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = useMemo(() => {
      return categories.filter((c) => {
         const matchesSearch = `${c.name} ${c.code}`.toLowerCase().includes(search.toLowerCase());
         const matchesType = typeFilter === "all" || c.type === typeFilter;
         return matchesSearch && matchesType;
      });
   }, [categories, search, typeFilter]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         if (editingCategory) await updateAccountCategory(editingCategory._id, formData);
         else await createAccountCategory(formData);
         toast.success(editingCategory ? "Category updated." : "Category created.");
         resetForm();
         loadData();
      } catch (err) {
         toast.error(err.response?.data?.message || "Error saving category.");
      } finally {
         setSaving(false);
      }
   };

   const handleEdit = (category) => {
      setEditingCategory(category);
      setFormData({ name: category.name, code: category.code, type: category.type, description: category.description || "" });
      setShowForm(true);
   };

   const handleDelete = async (id) => {
      if (!window.confirm("Delete this category?")) return;
      try {
         await deleteAccountCategory(id);
         toast.success("Category deleted.");
         loadData();
      } catch (err) {
         toast.error(err.response?.data?.message || "Error deleting category.");
      }
   };

   const resetForm = () => {
      setFormData({ name: "", code: "", type: "asset", description: "" });
      setEditingCategory(null);
      setShowForm(false);
   };

   if (loading) return <TableSkeleton rows={6} cols={5} />;
   if (error) {
      return (
         <div className="surface-card">
            <ErrorState message="We couldn't load account categories." onRetry={loadData} />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <PageHeader
            title="Account Categories"
            subtitle="Group ledger accounts by asset, liability, equity, revenue and expense."
            actions={
               <>
                  <Button variant="secondary" icon={FiRefreshCw} onClick={loadData}>Refresh</Button>
                  <Button variant="primary" icon={FiPlus} onClick={() => setShowForm(true)}>Add Category</Button>
               </>
            }
         />

         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories…" className="sm:max-w-xs" />
            <FilterSelect
               value={typeFilter}
               onChange={(e) => setTypeFilter(e.target.value)}
               options={[{ value: "all", label: "All types" }, ...TYPES.map((t) => ({ value: t, label: t }))]}
               className="sm:w-48"
            />
            <span className="badge badge-brand ml-auto">{filtered.length} categories</span>
         </div>

         <TableShell>
            <TableWrap>
               <table className="data-table min-w-[720px]">
                  <thead><tr><th>Code</th><th>Category</th><th className="text-center">Type</th><th>Description</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                     {filtered.map((category) => (
                        <tr key={category._id}>
                           <td className="font-mono font-semibold text-ink-900">{category.code}</td>
                           <td><span className="flex items-center gap-2 font-semibold text-ink-900"><span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-500"><FiFolder size={14} /></span>{category.name}</span></td>
                           <td className="text-center"><StatusBadge status={category.type} /></td>
                           <td className="text-ink-500">{category.description || "—"}</td>
                           <td>
                              <RowActions>
                                 <button type="button" onClick={() => handleEdit(category)} className="grid h-8 w-8 place-items-center rounded-xl text-ink-500 transition hover:bg-canvas hover:text-ink-900" aria-label="Edit"><FiEdit2 size={14} /></button>
                                 <button type="button" onClick={() => handleDelete(category._id)} className="grid h-8 w-8 place-items-center rounded-xl text-[#c23b3b] transition hover:bg-[rgba(224,82,82,0.1)]" aria-label="Delete"><FiTrash2 size={14} /></button>
                              </RowActions>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </TableWrap>
            {filtered.length === 0 && <EmptyState title="No categories" message="No categories match the current search." />}
         </TableShell>

         <Modal isOpen={showForm} onClose={resetForm} title={editingCategory ? "Edit Category" : "New Category"} subtitle="Organise the chart of accounts.">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               <div><label className="field-label">Category name</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required /></div>
               <div><label className="field-label">Code</label><input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="input font-mono" required /></div>
               <div><label className="field-label">Type</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="select">{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
               <div><label className="field-label">Description</label><input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" /></div>
               <div className="flex justify-end gap-2 sm:col-span-2">
                  <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                  <Button variant="primary" type="submit" loading={saving}>{editingCategory ? "Update" : "Create"}</Button>
               </div>
            </form>
         </Modal>
      </div>
   );
}
