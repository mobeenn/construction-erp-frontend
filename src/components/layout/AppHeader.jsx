import { FiBell, FiChevronDown, FiLogOut, FiMenu, FiSettings, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import GlobalSearch from "./GlobalSearch";
import NotificationCenter from "../notifications/NotificationCenter";
import GuidedTour from "../tour/GuidedTour";
import { Dropdown, DropdownItem } from "../ui/Controls";

const ROLE_LABELS = {
   admin: "Administrator",
   hr: "HR Manager",
   accountant: "Accountant",
   purchase_manager: "Purchase Manager",
   store_manager: "Store Manager",
   project_manager: "Project Manager",
   site_supervisor: "Site Supervisor",
   management: "Management",
   employee: "Employee",
};

export default function AppHeader({
   onMenuToggle = () => {},
   title,
   subtitle,
}) {
   const { user, logout } = useAuth();
   const navigate = useNavigate();

   const initials = (user?.name || "U")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

   return (
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 px-4 py-3 backdrop-blur-xl sm:px-6 lg:static lg:rounded-3xl lg:border lg:bg-white/85 lg:shadow-[0_1px_2px_rgba(16,42,54,0.04)]">
         <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
               <button
                  type="button"
                  onClick={onMenuToggle}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-white text-ink-700 transition hover:border-brand-300 hover:text-ink-900 lg:hidden"
                  aria-label="Open navigation"
               >
                  <FiMenu size={18} />
               </button>

               <div className="min-w-0">
                  {title && (
                     <h1 className="truncate font-display text-[1.05rem] font-extrabold text-ink-900 sm:text-lg">
                        {title}
                     </h1>
                  )}
                  {subtitle && (
                     <p className="hidden truncate text-xs text-ink-500 sm:block">{subtitle}</p>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-2">
               <GlobalSearch />

               <NotificationCenter />
               <GuidedTour />

               <Dropdown
                  trigger={
                     <button
                        type="button"
                        className="flex items-center gap-2.5 rounded-xl border border-line bg-white py-1.5 pl-1.5 pr-2.5 transition hover:border-brand-300"
                     >
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-[0.72rem] font-bold text-[#0d222b]">
                           {initials}
                        </span>
                        <span className="hidden text-left leading-tight sm:block">
                           <span className="block max-w-[9rem] truncate text-[0.78rem] font-semibold text-ink-900">
                              {user?.name}
                           </span>
                           <span className="block text-[0.66rem] text-ink-500">
                              {ROLE_LABELS[user?.role] || roleLabel(user?.role)}
                           </span>
                        </span>
                        <FiChevronDown size={15} className="text-ink-400" />
                     </button>
                  }
               >
                  <div className="border-b border-line px-3 py-2 sm:hidden">
                     <p className="text-sm font-semibold text-ink-900">{user?.name}</p>
                     <p className="text-xs text-ink-500">{user?.email}</p>
                  </div>
                  <DropdownItem icon={FiUser}>My profile</DropdownItem>
                  <DropdownItem icon={FiSettings}>Preferences</DropdownItem>
                  <DropdownItem
                     icon={FiBell}
                     onClick={() => navigate("/notifications")}
                  >
                     Notifications
                  </DropdownItem>
                  <div className="my-1 border-t border-line" />
                  <DropdownItem icon={FiLogOut} danger onClick={logout}>
                     Sign out
                  </DropdownItem>
               </Dropdown>
            </div>
         </div>
      </header>
   );
}
