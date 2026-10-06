import { useState, useEffect } from "react";

import { createProject } from "../../services/projectService";
import { getClients } from "../../services/clientService";
import { getContracts } from "../../services/contractService";
import { getUsersApi } from "../../api/users.api";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";

const empty = {
   name: "",
   location: "",
   description: "",
   budget: "",
   startDate: "",
   endDate: "",
   client: "",
   contract: "",
   projectManager: "",
   siteSupervisor: "",
   status: "planning",
   priority: "medium",
   contractValue: "",
};

export default function ProjectForm({ loadProjects }) {
   const toast = useToast();
   const [form, setForm] = useState(empty);
   const [clients, setClients] = useState([]);
   const [contracts, setContracts] = useState([]);
   const [users, setUsers] = useState([]);
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      getClients()
         .then((r) => setClients(r.data.data))
         .catch(() => {});
      getContracts()
         .then((r) => setContracts(r.data.data))
         .catch(() => {});
      getUsersApi({ page: 1 })
         .then((r) => setUsers(r.data.data))
         .catch(() => {});
   }, []);

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createProject({
            ...form,
            budget: Number(form.budget),
            contractValue: Number(form.contractValue || 0),
            client: form.client || null,
            contract: form.contract || null,
            projectManager: form.projectManager || undefined,
            siteSupervisor: form.siteSupervisor || undefined,
         });
         setForm(empty);
         toast.success("Project created successfully.");
         loadProjects();
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to create project.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-5">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Project name">
               <input name="name" className="input" placeholder="e.g. Green Valley Apartments" value={form.name} onChange={handleChange} required />
            </Field>
            <Field label="Location">
               <input name="location" className="input" placeholder="City / site" value={form.location} onChange={handleChange} />
            </Field>
            <Field label="Approved budget">
               <input name="budget" type="number" className="input" placeholder="0" value={form.budget} onChange={handleChange} />
            </Field>
            <Field label="Contract value">
               <input name="contractValue" type="number" className="input" placeholder="0" value={form.contractValue} onChange={handleChange} />
            </Field>
            <Field label="Start date">
               <input type="date" name="startDate" className="input" value={form.startDate} onChange={handleChange} />
            </Field>
            <Field label="End date">
               <input type="date" name="endDate" className="input" value={form.endDate} onChange={handleChange} />
            </Field>
            <Field label="Client">
               <select name="client" className="select" value={form.client} onChange={handleChange}>
                  <option value="">Select client</option>
                  {clients.map((c) => (
                     <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
               </select>
            </Field>
            <Field label="Contract">
               <select name="contract" className="select" value={form.contract} onChange={handleChange}>
                  <option value="">Select contract</option>
                  {contracts.map((c) => (
                     <option key={c._id} value={c._id}>{c.contractNo} — {c.project?.name || ""}</option>
                  ))}
               </select>
            </Field>
            <Field label="Project manager">
               <select name="projectManager" className="select" value={form.projectManager} onChange={handleChange}>
                  <option value="">Assign manager</option>
                  {users.map((u) => (
                     <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
               </select>
            </Field>
            <Field label="Site supervisor">
               <select name="siteSupervisor" className="select" value={form.siteSupervisor} onChange={handleChange}>
                  <option value="">Assign supervisor</option>
                  {users.map((u) => (
                     <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
               </select>
            </Field>
            <Field label="Status">
               <select name="status" className="select" value={form.status} onChange={handleChange}>
                  <option value="planning">Planning</option>
                  <option value="tender">Tender</option>
                  <option value="awarded">Awarded</option>
                  <option value="mobilization">Mobilization</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
               </select>
            </Field>
            <Field label="Priority">
               <select name="priority" className="select" value={form.priority} onChange={handleChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
               </select>
            </Field>
         </div>
         <Field label="Description">
            <textarea name="description" className="textarea" rows={3} placeholder="Scope and notes…" value={form.description} onChange={handleChange} />
         </Field>
         <div className="flex justify-end gap-3">
            <Button type="submit" variant="primary" loading={saving}>
               Create Project
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
