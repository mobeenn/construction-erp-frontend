import { useEffect, useState } from "react";

import { markAttendance } from "../../services/attendanceService";
import { getEmployees } from "../../services/employeeService";
import { getProjects } from "../../services/projectService";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";

export default function AttendanceForm({ loadAttendance, onDone }) {
   const toast = useToast();
   const [employees, setEmployees] = useState([]);
   const [projects, setProjects] = useState([]);
   const [saving, setSaving] = useState(false);
   const [form, setForm] = useState({
      employee: "",
      project: "",
      date: new Date().toISOString().slice(0, 10),
      status: "present",
      overtimeHours: 0,
   });

   useEffect(() => {
      Promise.all([getEmployees(1, 500, ""), getProjects()])
         .then(([emp, prj]) => {
            setEmployees(emp.data.data || []);
            setProjects(prj.data.data || []);
         })
         .catch(() => {});
   }, []);

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await markAttendance({ ...form, overtimeHours: Number(form.overtimeHours) });
         toast.success("Attendance marked.");
         if (loadAttendance) loadAttendance();
         if (onDone) onDone();
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to mark attendance.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <form onSubmit={submit} className="space-y-5">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Employee">
               <select name="employee" className="select" value={form.employee} onChange={handleChange} required>
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                     <option key={e._id} value={e._id}>{e.name}</option>
                  ))}
               </select>
            </Field>
            <Field label="Project">
               <select name="project" className="select" value={form.project} onChange={handleChange}>
                  <option value="">Select project</option>
                  {projects.map((p) => (
                     <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
               </select>
            </Field>
            <Field label="Date">
               <input type="date" name="date" className="input" value={form.date} onChange={handleChange} required />
            </Field>
            <Field label="Status">
               <select name="status" className="select" value={form.status} onChange={handleChange}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half_day">Half Day</option>
               </select>
            </Field>
            <Field label="Overtime (hours)">
               <input name="overtimeHours" type="number" className="input" value={form.overtimeHours} onChange={handleChange} />
            </Field>
         </div>
         <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
               Mark Attendance
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
