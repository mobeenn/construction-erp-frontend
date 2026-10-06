import { useEffect, useState } from "react";
import { FiPackage, FiPlus } from "react-icons/fi";
import GRNForm from "./GRNForm";
import GRNTable from "./GRNTable";
import { getGRNs } from "../../services/grnService";
import { useToast } from "../../components/ui/ToastContext";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { TableSkeleton } from "../../components/ui/States";

export default function GRNPage() {
   const toast = useToast();
   const { user } = useAuth();
   const canCreate = ["admin", "store_manager"].includes(user?.role);

   const [grns, setGrns] = useState([]);
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);

   const loadGRNs = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await getGRNs();
         setGrns(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load GRNs.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadGRNs();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <div className="space-y-4">
         <div className="surface-card flex items-center justify-between p-4">
            <div>
               <h2 className="text-[0.95rem] font-bold text-ink-900">Goods Received Notes</h2>
               <p className="text-xs text-ink-500">Receive materials against approved purchase orders.</p>
            </div>
            {canCreate && (
               <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
                  New GRN
               </Button>
            )}
         </div>

         {loading ? (
            <TableSkeleton rows={4} cols={5} />
         ) : (
            <GRNTable grns={grns} />
         )}

         <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Create GRN"
            subtitle="Record a goods receipt against an approved PO."
            size="md"
         >
            <GRNForm
               loadGRNs={() => {
                  setOpen(false);
                  loadGRNs(false);
               }}
            />
         </Modal>
      </div>
   );
}

void FiPackage;
