import { useEffect, useState } from "react";

import { createEmployee } from "../../services/employeeService";
import { getProjects } from "../../services/projectService";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";

export default function EmployeeForm({ loadEmployees }) {
   const toast = useToast();
   const empty = {
      name: "",
      cnic: "",
      phone: "",
      email: "",
      designation: "",
      salary: "",
      assignedSite: "",
      assignedProject: "",
   };
   const [form, setForm] = useState(empty);
   const [projects, setProjects] = useState([]);
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      getProjects()
         .then((res) => setProjects(res.data.data || []))
         .catch(() => {});
   }, []);

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createEmployee({ ...form, salary: Number(form.salary) });
         setForm(empty);
         toast.success("Employee created successfully.");
         loadEmployees();
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to create employee.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <form onSubmit={submit} className="space-y-5">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name">
               <input name="name" className="input" placeholder="Employee name" value={form.name} onChange={handleChange} required />
            </Field>
            <Field label="CNIC">
               <input name="cnic" className="input" placeholder="xxxxx-xxxxxxx-x" value={form.cnic} onChange={handleChange} />
            </Field>
            <Field label="Phone">
               <input name="phone" className="input" placeholder="03xxxxxxxxx" value={form.phone} onChange={handleChange} />
            </Field>
            <Field label="Email">
               <input name="email" type="email" className="input" placeholder="name@company.com" value={form.email} onChange={handleChange} />
            </Field>
            <Field label="Designation">
               <input name="designation" className="input" placeholder="e.g. Civil Engineer" value={form.designation} onChange={handleChange} />
            </Field>
            <Field label="Salary">
               <input name="salary" type="number" className="input" placeholder="0" value={form.salary} onChange={handleChange} />
            </Field>
            <Field label="Assigned site">
               <input name="assignedSite" className="input" placeholder="Site name" value={form.assignedSite} onChange={handleChange} />
            </Field>
            <Field label="Assigned project">
               <select name="assignedProject" className="select" value={form.assignedProject} onChange={handleChange}>
                  <option value="">Select project</option>
                  {projects.map((project) => (
                     <option key={project._id} value={project._id}>
                        {project.projectCode} — {project.name}
                     </option>
                  ))}
               </select>
            </Field>
         </div>
         <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
               Create Employee
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
