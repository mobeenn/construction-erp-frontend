import { Outlet } from "react-router-dom";
import AccountantSidebar from "./AccountantSidebar";
import AccountantTopbar from "./AccountantTopbar";

export default function AccountantLayout() {
   return (
      <div className="flex h-screen">
         <AccountantSidebar />

         <div className="flex-1 flex flex-col">
            <AccountantTopbar />

            <main className="flex-1 bg-gray-100 p-4 overflow-y-auto">
               <Outlet />
            </main>
         </div>
      </div>
   );
}
