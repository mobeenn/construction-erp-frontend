import { useState } from "react";
import { Outlet } from "react-router-dom";
import HRSidebar from "./hr/HRSidebar";
import HRTopbar from "./hr/HRTopbar";

export default function HRLayout() {
   const [menuOpen, setMenuOpen] = useState(false);
   return (
      <div className="flex h-screen">
         <HRSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

         <div className="min-w-0 flex-1 flex flex-col">
            <HRTopbar onMenuToggle={() => setMenuOpen((open) => !open)} />

            <main className="min-w-0 flex-1 overflow-y-auto bg-gray-100 p-3 sm:p-5">
               <Outlet />
            </main>
         </div>
      </div>
   );
}
