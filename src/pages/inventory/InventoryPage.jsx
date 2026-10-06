import { useEffect, useState } from "react";

import InventoryForm from "./InventoryForm";
import InventoryTable from "./InventoryTable";
import { getInventory } from "../../services/inventoryService";
import { useToast } from "../../components/ui/ToastContext";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput } from "../../components/ui/Controls";
import { TableSkeleton } from "../../components/ui/States";
import { FiPlus } from "react-icons/fi";

export default function InventoryPage() {
   const toast = useToast();
   const { user } = useAuth();
   const canCreate = ["admin", "store_manager"].includes(user?.role);

   const [inventory, setInventory] = useState([]);
   const [search, setSearch] = useState("");
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);

   const loadInventory = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await getInventory();
         setInventory(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load inventory.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadInventory();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = inventory.filter((i) =>
      `${i.materialName} ${i.category} ${i.project?.name}`
         .toLowerCase()
         .includes(search.toLowerCase()),
   );

   return (
      <div className="space-y-4">
         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search materials…"
               className="sm:max-w-sm"
            />
            {canCreate && (
               <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
                  Add Material
               </Button>
            )}
         </div>

         {loading ? (
            <TableSkeleton rows={6} cols={6} />
         ) : (
            <InventoryTable inventory={filtered} loadInventory={loadInventory} />
         )}

         <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Add Material"
            subtitle="Register a new material in the inventory."
            size="lg"
         >
            <InventoryForm
               loadInventory={() => {
                  setOpen(false);
                  loadInventory(false);
               }}
            />
         </Modal>
      </div>
   );
}
