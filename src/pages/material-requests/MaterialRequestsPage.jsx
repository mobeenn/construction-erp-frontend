import { useEffect, useState } from "react";
import { FiClipboard, FiPlus } from "react-icons/fi";

import MaterialRequestForm from "./MaterialRequestForm";
import MaterialRequestTable from "./MaterialRequestTable";
import { getMaterialRequests } from "../../services/materialRequestService";
import { useToast } from "../../components/ui/ToastContext";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput } from "../../components/ui/Controls";
import { TableSkeleton } from "../../components/ui/States";

export default function MaterialRequestsPage() {
   const toast = useToast();
   const { user } = useAuth();
   const canCreate = ["admin", "site_supervisor"].includes(user?.role);

   const [requests, setRequests] = useState([]);
   const [search, setSearch] = useState("");
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);

   const loadRequests = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await getMaterialRequests();
         setRequests(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load material requests.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadRequests();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = requests.filter((r) =>
      `${r.requestNo} ${r.project?.name}`.toLowerCase().includes(search.toLowerCase()),
   );

   return (
      <div className="space-y-4">
         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search requests…"
               className="sm:max-w-sm"
            />
            {canCreate && (
               <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
                  New Request
               </Button>
            )}
         </div>

         {loading ? (
            <TableSkeleton rows={5} cols={5} />
         ) : (
            <MaterialRequestTable requests={filtered} loadRequests={loadRequests} />
         )}

         <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="New Material Request"
            subtitle="Request materials from the store."
            size="lg"
         >
            <MaterialRequestForm
               loadRequests={() => {
                  setOpen(false);
                  loadRequests(false);
               }}
            />
         </Modal>
      </div>
   );
}

void FiClipboard;
