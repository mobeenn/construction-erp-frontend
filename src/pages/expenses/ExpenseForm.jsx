import { useEffect, useState } from "react";

import { getProjects } from "../../services/projectService";
import { createExpense } from "../../services/expenseService";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";

const empty = { project: "", category: "", amount: "", description: "", paymentMethod: "" };

export default function ExpenseForm({ loadExpenses }) {
   const toast = useToast();
   const [projects, setProjects] = useState([]);
   const [form, setForm] = useState(empty);
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      getProjects()
         .then((r) => setProjects(r.data.data || []))
         .catch(() => {});
   }, []);

   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createExpense({ ...form, amount: Number(form.amount) });
         setForm(empty);
         toast.success("Expense recorded.");
         loadExpenses();
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to record expense.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <form onSubmit={submit} className="space-y-5">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Project">
               <select name="project" className="select" value={form.project} onChange={handleChange}>
                  <option value="">Select project</option>
                  {projects.map((project) => (
                     <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
               </select>
            </Field>
            <Field label="Category">
               <select name="category" className="select" value={form.category} onChange={handleChange}>
                  <option value="">Select category</option>
                  <option value="labour">Labour</option>
                  <option value="fuel">Fuel</option>
                  <option value="equipment">Equipment</option>
                  <option value="office">Office</option>
                  <option value="transport">Transport</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
               </select>
            </Field>
            <Field label="Amount">
               <input name="amount" type="number" className="input" placeholder="0" value={form.amount} onChange={handleChange} required />
            </Field>
            <Field label="Payment method">
               <select name="paymentMethod" className="select" value={form.paymentMethod} onChange={handleChange}>
                  <option value="">Select method</option>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="cheque">Cheque</option>
               </select>
            </Field>
         </div>
         <Field label="Description">
            <input name="description" className="input" placeholder="Expense details" value={form.description} onChange={handleChange} />
         </Field>
         <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
               Create Expense
            </Button>
         </div>
      </form>
   );
}

function Field({ label, children }) {
   return (
      <label className="block">
         <span className="field-label">{label}</span>
         {children}
      </label>
   );
}
