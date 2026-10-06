import { useEffect, useState } from "react";

import VendorForm from "./VendorForm";
import VendorTable from "./VendorTable";
import { getVendors } from "../../services/vendorService";
import { useToast } from "../../components/ui/ToastContext";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput } from "../../components/ui/Controls";
import { TableSkeleton } from "../../components/ui/States";
import { FiPlus } from "react-icons/fi";

export default function VendorsPage() {
   const toast = useToast();
   const { user } = useAuth();
   const canCreate = ["admin", "purchase_manager"].includes(user?.role);

   const [vendors, setVendors] = useState([]);
   const [search, setSearch] = useState("");
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);

   const loadVendors = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await getVendors();
         setVendors(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load vendors.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadVendors();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = vendors.filter((v) =>
      `${v.companyName} ${v.contactPerson} ${v.vendorCode}`
         .toLowerCase()
         .includes(search.toLowerCase()),
   );

   return (
      <div className="space-y-4">
         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search vendors…"
               className="sm:max-w-sm"
            />
            {canCreate && (
               <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
                  New Vendor
               </Button>
            )}
         </div>

         {loading ? (
            <TableSkeleton rows={5} cols={5} />
         ) : (
            <VendorTable vendors={filtered} />
         )}

         <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Add Vendor"
            subtitle="Register a new supplier or subcontractor."
            size="lg"
         >
            <VendorForm
               loadVendors={() => {
                  setOpen(false);
                  loadVendors(false);
               }}
            />
         </Modal>
      </div>
   );
}
