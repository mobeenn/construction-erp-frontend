import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

import Topbar from "./Topbar";

export default function AdminLayout() {
   const [menuOpen, setMenuOpen] = useState(false);
   return (
      <div className="flex h-screen">
         {/* Left Sidebar */}

         <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

         {/* Right Side */}

         <div className="flex-1 flex flex-col overflow-hidden">
            {/* Topbar */}

            <Topbar onMenuToggle={() => setMenuOpen((open) => !open)} />

            {/* Main Content */}

            <main className="min-w-0 flex-1 overflow-y-auto bg-gray-100 p-3 sm:p-5">
               <Outlet />
            </main>
         </div>
      </div>
   );
}
