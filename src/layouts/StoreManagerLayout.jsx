import { Outlet } from "react-router-dom";
import StoreManagerSidebar from "./storeManager/StoreManagerSidebar";
import StoreManagerTopbar from "./storeManager/StoreManagerTopbar";

export default function StoreManagerLayout() {
   return (
      <div className="flex h-screen">
         <StoreManagerSidebar />

         <div className="flex-1 flex flex-col">
            <StoreManagerTopbar />

            <main className="flex-1 bg-gray-100 p-4 overflow-y-auto">
               <Outlet />
            </main>
         </div>
      </div>
   );
}
