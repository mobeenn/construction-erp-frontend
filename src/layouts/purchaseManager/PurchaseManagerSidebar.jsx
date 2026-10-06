import { NavLink } from "react-router-dom";

export default function PurchaseManagerSidebar() {
   return (
      <div className="w-64 bg-white border-r p-4">
         <h2 className="text-xl font-bold mb-6">Purchase Manager</h2>

         <nav className="flex flex-col gap-2">
            <NavLink to="/purchase-manager" className="p-2 hover:bg-gray-100">
               Dashboard
            </NavLink>

            <NavLink
               to="/purchase-manager/purchase-orders"
               className="p-2 hover:bg-gray-100"
            >
               Purchase Orders
            </NavLink>

            <NavLink
               to="/purchase-manager/material-requests"
               className="p-2 hover:bg-gray-100"
            >
               Material Requests
            </NavLink>

            <NavLink
               to="/purchase-manager/vendors"
               className="p-2 hover:bg-gray-100"
            >
               Vendors
            </NavLink>
         </nav>
      </div>
   );
}
