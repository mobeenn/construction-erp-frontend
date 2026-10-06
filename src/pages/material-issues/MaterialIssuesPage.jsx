import { useEffect, useState } from "react";
import { FiPackage, FiPlus } from "react-icons/fi";

import MaterialIssueForm from "./MaterialIssueForm";
import MaterialIssueTable from "./MaterialIssueTable";
import { getMaterialIssues } from "../../services/materialIssueService";
import { useToast } from "../../components/ui/ToastContext";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { TableSkeleton } from "../../components/ui/States";

export default function MaterialIssuesPage() {
   const toast = useToast();
   const { user } = useAuth();
   const canCreate = ["admin", "store_manager"].includes(user?.role);

   const [issues, setIssues] = useState([]);
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);

   const loadIssues = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await getMaterialIssues();
         setIssues(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load material issues.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadIssues();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <div className="space-y-4">
         <div className="surface-card flex items-center justify-between p-4">
            <div>
               <h2 className="text-[0.95rem] font-bold text-ink-900">Material Issues</h2>
               <p className="text-xs text-ink-500">Materials issued to site from approved requests.</p>
            </div>
            {canCreate && (
               <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
                  Issue Material
               </Button>
            )}
         </div>

         {loading ? (
            <TableSkeleton rows={4} cols={4} />
         ) : (
            <MaterialIssueTable issues={issues} />
         )}

         <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Issue Material"
            subtitle="Issue materials from an approved request."
            size="sm"
         >
            <MaterialIssueForm
               loadIssues={() => {
                  setOpen(false);
                  loadIssues(false);
               }}
            />
         </Modal>
      </div>
   );
}

void FiPackage;
