import { Suspense, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getNavigation } from "./navigation";
import AppSidebar from "../components/layout/AppSidebar";
import AppHeader from "../components/layout/AppHeader";
import { PageContentSkeleton } from "../components/ui/States";

function resolveTitle(nav, pathname) {
   const items = nav.groups.flatMap((g) => g.items);
   const exact = items.find((i) => i.to === pathname);
   if (exact) return exact.label;
   const prefix = items
      .filter((i) => i.to !== "/" && pathname.startsWith(i.to))
      .sort((a, b) => b.to.length - a.to.length)[0];
   if (prefix) return prefix.label;
   const root = items.find((i) => i.end && i.to !== "/");
   if (pathname !== "/" && root && pathname.startsWith(root.to)) return root.label;
   return nav.title;
}

export default function AppLayout() {
   const [menuOpen, setMenuOpen] = useState(false);
   const [collapsed, setCollapsed] = useState(false);
   const { user } = useAuth();
   const location = useLocation();

   const nav = useMemo(() => getNavigation(user?.role), [user?.role]);
   const title = useMemo(
      () => resolveTitle(nav, location.pathname),
      [nav, location.pathname],
   );

   return (
      <div className="flex h-dvh max-h-dvh overflow-hidden bg-canvas">
         <div className="flex h-full w-full min-w-0 gap-3 px-2 py-2 sm:px-3 sm:py-3">
            <AppSidebar
               isOpen={menuOpen}
               onClose={() => setMenuOpen(false)}
               collapsed={collapsed}
               onToggleCollapse={() => setCollapsed((c) => !c)}
            />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
               <AppHeader
                  onMenuToggle={() => setMenuOpen((o) => !o)}
                  title={title}
                  subtitle={nav.subtitle}
               />

               <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-4">
                  <div key={location.pathname} className="page-shell animate-fade-up">
                     <Suspense fallback={<PageContentSkeleton />}>
                        <Outlet />
                     </Suspense>
                  </div>
               </main>
            </div>
         </div>
      </div>
   );
}
