import { useState } from "react";
import { createUserApi, updateUserApi } from "../../api/users.api";
import { useToast } from "../ui/ToastContext";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const roles = [
   "admin",
   "hr",
   "accountant",
   "store_manager",
   "purchase_manager",
   "project_manager",
   "site_supervisor",
   "employee",
   "management",
];

export default function UserForm({ user, onClose, onSuccess }) {
   const toast = useToast();
   const [saving, setSaving] = useState(false);
   const [form, setForm] = useState(() => ({
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      role: user?.role || "site_supervisor",
   }));

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         if (user) {
            await updateUserApi(user._id, form);
            toast.success("User updated.");
         } else {
            await createUserApi(form);
            toast.success("User created.");
         }
         onSuccess();
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to save user.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <Modal
         isOpen
         onClose={onClose}
         title={user ? "Update User" : "Create User"}
         subtitle={user ? user.email : "Add a new account to the workspace."}
         size="sm"
      >
         <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
               <span className="field-label">Full name</span>
               <input
                  className="input"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
               />
            </label>
            <label className="block">
               <span className="field-label">Email</span>
               <input
                  type="email"
                  className="input"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
               />
            </label>
            {!user && (
               <label className="block">
                  <span className="field-label">Password</span>
                  <input
                     type="password"
                     className="input"
                     placeholder="••••••••"
                     value={form.password}
                     onChange={(e) => setForm({ ...form, password: e.target.value })}
                     required
                  />
               </label>
            )}
            <label className="block">
               <span className="field-label">Role</span>
               <select
                  className="select"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
               >
                  {roles.map((r) => (
                     <option key={r} value={r}>
                        {r.replace(/_/g, " ")}
                     </option>
                  ))}
               </select>
            </label>

            <div className="flex justify-end gap-3 pt-1">
               <Button variant="ghost" onClick={onClose}>
                  Cancel
               </Button>
               <Button type="submit" variant="primary" loading={saving}>
                  {user ? "Save Changes" : "Create User"}
               </Button>
            </div>
         </form>
      </Modal>
   );
}
