import { useAuth } from "../../auth/AuthContext";

export default function AccountantTopbar() {
   const { user, logout } = useAuth();

   return (
      <div className="h-14 bg-white border-b flex justify-between items-center px-4">
         <h1 className="font-semibold">Accountant Panel</h1>

         <div className="flex items-center gap-3">
            <span>{user?.name}</span>

            <button
               onClick={logout}
               className="bg-red-500 text-white px-3 py-1"
            >
               Logout
            </button>
         </div>
      </div>
   );
}
