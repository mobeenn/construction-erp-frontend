import { useAuth } from "../../auth/AuthContext";

export default function HRTopbar({ onMenuToggle = () => {} }) {
   const { user, logout } = useAuth();

   return (
      <div className="flex h-14 items-center justify-between border-b bg-white px-3 sm:px-4">
         <div className="flex items-center gap-3">
            <button type="button" aria-label="Open navigation" onClick={onMenuToggle} className="rounded-md border px-3 py-2 text-slate-700 md:hidden">☰</button>
            <h2 className="font-semibold">HR Dashboard</h2>
         </div>

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
