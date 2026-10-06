// import { useAuth } from "../auth/AuthContext";

// export default function Topbar() {
//    const { user, logout } = useAuth();

//    return (
//       <div className="h-14 bg-white border-b flex items-center justify-between px-4">
//          <span>Welcome, {user?.name}</span>

//          <button
//             onClick={logout}
//             className="px-3 py-1 bg-red-500 text-white rounded"
//          >
//             Logout
//          </button>
//       </div>
//    );
// }

import { useAuth } from "../auth/AuthContext";
import NotificationCenter from "../components/notifications/NotificationCenter";

export default function Topbar({ onMenuToggle = () => {} }) {
   const { user, logout } = useAuth();

   return (
      <div className="flex h-16 items-center justify-between border-b bg-white px-3 sm:px-6">
         <div className="flex items-center gap-3">
            <button type="button" aria-label="Open navigation" onClick={onMenuToggle} className="rounded-md border px-3 py-2 text-slate-700 md:hidden">☰</button>
            <h2 className="font-semibold">Welcome {user?.name}</h2>
         </div>

         <div className="flex items-center gap-3">
            <NotificationCenter />
            <button
               onClick={logout}
               className="bg-red-500 text-white px-4 py-2 rounded"
            >
               Logout
            </button>
         </div>
      </div>
   );
}
