import { NavLink } from "react-router-dom";

export default function StoreManagerSidebar() {
   return (
      <div className="w-64 bg-white border-r p-4">
         <h2 className="text-xl font-bold mb-6">Store Manager</h2>

         <nav className="flex flex-col gap-2">
            <NavLink to="/store-manager" className="p-2 hover:bg-gray-100">
               Dashboard
            </NavLink>

            <NavLink
               to="/store-manager/inventory"
               className="p-2 hover:bg-gray-100"
            >
               Inventory
            </NavLink>

            <NavLink
               to="/store-manager/material-issues"
               className="p-2 hover:bg-gray-100"
            >
               Material Issues
            </NavLink>
         </nav>
      </div>
   );
}
