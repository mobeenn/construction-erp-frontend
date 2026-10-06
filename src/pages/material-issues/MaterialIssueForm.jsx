import { useEffect, useState } from "react";

import { getMaterialRequests } from "../../services/materialRequestService";
import { createMaterialIssue } from "../../services/materialIssueService";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";

export default function MaterialIssueForm({ loadIssues }) {
   const toast = useToast();
   const [requests, setRequests] = useState([]);
   const [form, setForm] = useState({ requestId: "", remarks: "" });
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      getMaterialRequests()
         .then((res) => {
            setRequests((res.data.data || []).filter((item) => item.status === "approved"));
         })
         .catch(() => {});
   }, []);

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createMaterialIssue(form);
         toast.success("Material issued successfully.");
         setForm({ requestId: "", remarks: "" });
         loadIssues();
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to issue material.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <form onSubmit={submit} className="space-y-5">
         <label className="block">
            <span className="field-label">Approved request</span>
            <select
               name="requestId"
               className="select"
               value={form.requestId}
               onChange={(e) => setForm({ ...form, requestId: e.target.value })}
               required
            >
               <option value="">Select material request</option>
               {requests.map((item) => (
                  <option key={item._id} value={item._id}>{item.requestNo}</option>
               ))}
            </select>
         </label>
         <label className="block">
            <span className="field-label">Remarks</span>
            <input
               name="remarks"
               className="input"
               placeholder="Optional note"
               value={form.remarks}
               onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
         </label>
         <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
               Issue Material
            </Button>
         </div>
      </form>
   );
}
