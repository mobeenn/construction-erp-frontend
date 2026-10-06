import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiChevronLeft, FiLogOut, FiX } from "react-icons/fi";
import { useAuth } from "../../auth/AuthContext";
import { getNavigation, COMPANY_META } from "../../layouts/navigation";
import { getUnreadCount } from "../../services/notificationService";

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

export function BrandMark({ compact = false }) {
   return (
      <div className="flex items-center gap-3">
         <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-gradient shadow-[0_10px_24px_-12px_rgba(87,199,133,0.9)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
               <path
                  d="M4 20V9.5L12 4l8 5.5V20"
                  stroke="#0d222b"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
               <path
                  d="M9.5 20v-6h5v6"
                  stroke="#0d222b"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
            </svg>
         </span>
         {!compact && (
            <div className="leading-tight">
               <p className="font-display text-[1.05rem] font-extrabold tracking-tight text-white">
                  {COMPANY_META.name}
               </p>
               <p className="text-[0.68rem] font-medium tracking-wide text-white/45">
                  {COMPANY_META.tagline}
               </p>
            </div>
         )}
      </div>
   );
}

export default function AppSidebar({ isOpen = false, onClose = () => {}, onToggleCollapse, collapsed = false }) {
   const { user, logout } = useAuth();
   const nav = useMemo(() => getNavigation(user?.role), [user?.role]);
   const [unread, setUnread] = useState(0);

   useEffect(() => {
      let alive = true;
      const load = async () => {
         try {
            const res = await getUnreadCount();
            if (alive) setUnread(res.data?.data?.count || 0);
         } catch {
            /* silent */
         }
      };
      load();
      const timer = setInterval(load, 60000);
      return () => {
         alive = false;
         clearInterval(timer);
      };
   }, []);

   const initials = (user?.name || "U")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

   return (
      <>
         {isOpen && (
            <button
               type="button"
               aria-label="Close navigation"
               onClick={onClose}
               className="animate-fade-in fixed inset-0 z-40 bg-ink-900/50 backdrop-blur-[2px] lg:hidden"
            />
         )}

         <aside
            className={`sidebar-shell fixed inset-y-3 left-3 z-50 flex w-[16.5rem] flex-col overflow-hidden rounded-3xl transition-[transform,width] duration-300 lg:sticky lg:top-3 lg:z-auto lg:h-[calc(100vh-1.5rem)] lg:translate-x-0 ${
               collapsed ? "lg:w-[5rem]" : ""
            } ${isOpen ? "translate-x-0" : "-translate-x-[120%]"}`}
         >
            <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-5">
               <BrandMark compact={collapsed} />
               <button
                  type="button"
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
                  aria-label="Close navigation"
               >
                  <FiX size={17} />
               </button>
            </div>

            <div
               className={`mb-3 flex items-center gap-2.5 rounded-2xl border border-white/8 bg-white/5 p-3 ${
                  collapsed ? "mx-3 justify-center" : "mx-4"
               }`}
            >
               <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-bold text-white">
                  {initials}
               </span>
               {!collapsed && (
                  <div className="min-w-0 leading-tight">
                     <p className="truncate text-[0.82rem] font-semibold text-white">
                        {user?.name || "User"}
                     </p>
                     <p className="truncate text-[0.68rem] text-white/45">
                        {ROLE_LABELS[user?.role] || roleLabel(user?.role)}
                     </p>
                  </div>
               )}
            </div>

            <nav className="flex-1 overflow-y-auto px-3 pb-4">
               {nav.groups.map((group) => (
                  <div key={group.label}>
                     {!collapsed && <p className="nav-group-label">{group.label}</p>}
                     {collapsed && <div className="mt-3" />}
                     <div className="flex flex-col gap-1">
                        {group.items.map((item) => (
                           <NavLink
                              key={item.to}
                              to={item.to}
                              end={item.end}
                              onClick={onClose}
                              className={({ isActive }) =>
                                 `nav-item ${isActive ? "is-active" : ""} ${
                                    collapsed ? "lg:justify-center lg:px-0" : ""
                                 }`
                              }
                              title={collapsed ? item.label : undefined}
                           >
                              <span className="nav-icon">
                                 <item.icon size={16} />
                              </span>
                              {!collapsed && <span className="truncate">{item.label}</span>}
                              {!collapsed && item.badge === "unread" && unread > 0 && (
                                 <span className="nav-badge">{unread > 99 ? "99+" : unread}</span>
                              )}
                           </NavLink>
                        ))}
                     </div>
                  </div>
               ))}
            </nav>

            <div className="border-t border-white/8 p-3">
               <div className="flex items-center gap-2">
                  <button
                     type="button"
                     onClick={logout}
                     className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-[0.8rem] font-semibold text-white/70 transition hover:bg-[rgba(224,82,82,0.16)] hover:text-white"
                  >
                     <FiLogOut size={16} />
                     {!collapsed && "Sign out"}
                  </button>
                  {onToggleCollapse && (
                     <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="hidden h-9 w-9 shrink-0 place-items-center rounded-xl text-white/50 transition hover:bg-white/10 hover:text-white lg:grid"
                        aria-label="Collapse navigation"
                     >
                        <FiChevronLeft
                           size={16}
                           className={collapsed ? "rotate-180" : ""}
                        />
                     </button>
                  )}
               </div>
            </div>
         </aside>
      </>
   );
}

function roleLabel(role) {
   return role ? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "User";
}
