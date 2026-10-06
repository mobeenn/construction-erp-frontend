import { useEffect, useState } from "react";
import { FiCheckCircle, FiRefreshCw, FiSave, FiShield } from "react-icons/fi";
import { getPermissionPoliciesApi, updatePermissionPoliciesApi } from "../api/auth.api";
import { useToast } from "../components/ui/ToastContext";
import { PageHeader } from "../components/dashboard/widgets";
import Button from "../components/ui/Button";
import { FilterSelect } from "../components/ui/Controls";
import { ErrorState } from "../components/ui/States";
import { TableShell } from "../components/ui/TableShell";

const actionNames = {
   view: "View", create: "Create", edit: "Edit", delete: "Delete",
   approve: "Approve", reject: "Reject", export: "Export",
   payment: "Payment", manage: "Manage",
};

export default function PermissionsPage() {
   const toast = useToast();
   const [data, setData] = useState(null);
   const [role, setRole] = useState("");
   const [policies, setPolicies] = useState(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState(false);

   const load = async () => {
      setLoading(true);
      setError(false);
      try {
         const response = await getPermissionPoliciesApi();
         setData(response.data.data);
         setPolicies(response.data.data.policies);
         setRole((current) => current || response.data.data.roles.find((item) => item !== "admin") || "");
      } catch (err) {
         setError(true);
         toast.error(err.response?.data?.message || "Unable to load access policies.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const toggle = (resource, action) => {
      if (role === "admin") return;
      setPolicies((current) => {
         const currentActions = current[role][resource] || [];
         const next = currentActions.includes(action)
            ? currentActions.filter((item) => item !== action)
            : [...currentActions, action];
         return { ...current, [role]: { ...current[role], [resource]: next } };
      });
   };

   const toggleAll = (resource) => {
      if (role === "admin" || !data) return;
      setPolicies((current) => {
         const all = data.actions;
         const hasAll = all.every((a) => (current[role][resource] || []).includes(a));
         return { ...current, [role]: { ...current[role], [resource]: hasAll ? [] : [...all] } };
      });
   };

   const save = async () => {
      setSaving(true);
      try {
         const response = await updatePermissionPoliciesApi(policies);
         setPolicies(response.data.data.policies);
         toast.success("Permission policy saved and enforced.");
      } catch (saveError) {
         toast.error(saveError.response?.data?.message || "Unable to save permission policy.");
      } finally {
         setSaving(false);
      }
   };

   if (loading) {
      return (
         <div className="space-y-4">
            <div className="skeleton h-24 rounded-3xl" />
            <div className="skeleton h-96 rounded-3xl" />
         </div>
      );
   }

   if (error || !data || !policies) {
      return (
         <div className="surface-card">
            <ErrorState message="Permission policies are unavailable." onRetry={load} />
         </div>
      );
   }

   const granted = Object.values(policies[role] || {}).flat().length;
   const total = data.resources.length * data.actions.length;

   return (
      <div className="space-y-4">
         <PageHeader
            title="Role permissions"
            subtitle="Set resource-level permissions. The backend enforces every grant on subsequent requests."
            actions={
               <>
                  <Button variant="secondary" icon={FiRefreshCw} onClick={load}>Reload</Button>
                  <Button variant="primary" icon={FiSave} loading={saving} onClick={save}>
                     {saving ? "Saving…" : "Save policy"}
                  </Button>
               </>
            }
         >
            <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-700">
               <FiShield size={13} /> Security
            </span>
         </PageHeader>

         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
               <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-[#0d222b]">
                  <FiShield size={19} />
               </span>
               <div>
                  <p className="font-bold text-ink-900 capitalize">{role.replaceAll("_", " ")}</p>
                  <p className="text-xs text-ink-500">{granted} of {total} grants enabled</p>
               </div>
            </div>
            <FilterSelect
               value={role}
               onChange={(e) => setRole(e.target.value)}
               options={data.roles.map((r) => ({ value: r, label: r.replaceAll("_", " ") }))}
               className="sm:w-64"
            />
         </div>

         {role === "admin" && (
            <div className="surface-card flex items-center gap-3 border-brand-200 bg-brand-50 p-4 text-sm font-medium text-brand-700">
               <FiCheckCircle size={17} />
               Administrator always retains all permissions to prevent accidental lockout.
            </div>
         )}

         <TableShell>
            <div className="overflow-x-auto">
               <table className="data-table min-w-[900px]">
                  <thead>
                     <tr>
                        <th className="sticky left-0 bg-[#f6faf9]">Resource</th>
                        {data.actions.map((action) => (
                           <th key={action} className="text-center">{actionNames[action] || action}</th>
                        ))}
                        <th className="text-center">All</th>
                     </tr>
                  </thead>
                  <tbody>
                     {data.resources.map((resource) => {
                        const current = policies[role]?.[resource] || [];
                        const allOn = data.actions.every((a) => current.includes(a));
                        return (
                           <tr key={resource}>
                              <th scope="row" className="sticky left-0 bg-white px-4 py-3 text-left font-semibold capitalize text-ink-900">
                                 {resource.replaceAll("_", " ")}
                                 <span className="ml-2 badge badge-neutral">{current.length}</span>
                              </th>
                              {data.actions.map((action) => {
                                 const checked = current.includes(action);
                                 return (
                                    <td key={action} className="text-center">
                                       <button
                                          type="button"
                                          role="switch"
                                          aria-checked={checked}
                                          aria-label={`${role} ${action} ${resource}`}
                                          disabled={role === "admin"}
                                          onClick={() => toggle(resource, action)}
                                          className={`inline-grid h-6 w-11 place-items-center rounded-full transition ${checked ? "bg-brand-gradient" : "bg-[#e3ecea]"} disabled:opacity-70`}
                                       >
                                          <span className={`h-4 w-4 rounded-full bg-white shadow transition ${checked ? "translate-x-2.5" : "-translate-x-2.5"}`} />
                                       </button>
                                    </td>
                                 );
                              })}
                              <td className="text-center">
                                 <button
                                    type="button"
                                    disabled={role === "admin"}
                                    onClick={() => toggleAll(resource)}
                                    className="badge badge-brand hover:brightness-95 disabled:opacity-60"
                                 >
                                    {allOn ? "Clear" : "Grant all"}
                                 </button>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </TableShell>
      </div>
   );
}
