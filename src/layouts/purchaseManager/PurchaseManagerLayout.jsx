import { Outlet } from "react-router-dom";
import PurchaseManagerSidebar from "./PurchaseManagerSidebar";
import PurchaseManagerTopbar from "./PurchaseManagerTopbar";

export default function PurchaseManagerLayout() {
   return (
      <div className="flex h-screen">
         <PurchaseManagerSidebar />

         <div className="flex-1 flex flex-col">
            <PurchaseManagerTopbar />

            <main className="flex-1 bg-gray-100 p-4 overflow-y-auto">
               <Outlet />
            </main>
         </div>
      </div>
   );
}
