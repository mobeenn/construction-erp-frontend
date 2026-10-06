import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiFileText, FiLayers, FiPackage, FiSearch, FiShoppingCart, FiTruck, FiUser, FiUsers, FiX } from "react-icons/fi";
import { useAuth } from "../../auth/AuthContext";
import { getNavigation } from "../../layouts/navigation";
import { getProjects } from "../../services/projectService";
import { getClients } from "../../services/clientService";
import { getVendors } from "../../services/vendorService";
import { getEmployees } from "../../services/employeeService";
import { getInventory } from "../../services/inventoryService";
import { getPurchaseOrders } from "../../services/purchaseOrderService";
import Modal from "../ui/Modal";

const readList = (res) => res?.data?.data || [];

export default function GlobalSearch() {
   const { user } = useAuth();
   const navigate = useNavigate();
   const [open, setOpen] = useState(false);
   const [query, setQuery] = useState("");
   const [loading, setLoading] = useState(false);
   const [activeIndex, setActiveIndex] = useState(0);
   const [data, setData] = useState({ projects: [], clients: [], vendors: [], employees: [], materials: [], orders: [] });
   const inputRef = useRef(null);

   useEffect(() => {
      const onKey = (e) => {
         const tag = String(e.target?.tagName || "").toLowerCase();
         const typing = tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable;
         if (e.key === "/" && !open && !typing) {
            e.preventDefault();
            setOpen(true);
         }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
   }, [open ]);

   useEffect(() => {
      if (!open) {
         setQuery("");
         setActiveIndex(0);
         return;
      }
      let active = true;
      setLoading(true);
      Promise.allSettled([
         getProjects(),
         getClients(),
         getVendors(),
         getEmployees(1, 100, ""),
         getInventory(),
         getPurchaseOrders(),
      ]).then((results) => {
         if (!active) return;
         const [projects, clients, vendors, employees, inventory, orders] = results.map((r) =>
            r.status === "fulfilled" ? readList(r.value) : [],
         );
         const empList = Array.isArray(employees) ? employees : readList(employees) || employees?.employees || [];
         setData({
            projects: Array.isArray(projects) ? projects : [],
            clients: Array.isArray(clients) ? clients : [],
            vendors: Array.isArray(vendors) ? vendors : [],
            employees: Array.isArray(empList) ? empList : [],
            materials: Array.isArray(inventory) ? inventory : [],
            orders: Array.isArray(orders) ? orders : [],
         });
         setLoading(false);
      });
      return () => { active = false; };
   }, [open ]);

   useEffect(() => {
      if (open) {
         const t = setTimeout(() => inputRef.current?.focus(), 60);
         return () => clearTimeout(t);
      }
      return undefined;
   }, [open ]);

   const pages = useMemo(() => {
      const nav = getNavigation(user?.role);
      return nav.groups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));
   }, [user?.role]);

   const results = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (q.length < 2) return [];
      const out = [];
      pages
         .filter((p) => p.label.toLowerCase().includes(q))
         .slice(0, 5)
         .forEach((p) => out.push({ key: `page-${p.to}`, icon: FiFileText, title: p.label, meta: `${p.group} · Page`, to: p.to }));
      data.projects
         .filter((p) => `${p.name || ""} ${p.projectCode || ""}`.toLowerCase().includes(q))
         .slice(0, 4)
         .forEach((p) => out.push({ key: `proj-${p._id}`, icon: FiLayers, title: p.name, meta: `${p.projectCode || "Project"} · Open details`, to: `/projects/${p._id}` }));
      data.clients
         .filter((c) => `${c.name || ""} ${c.clientCode || ""}`.toLowerCase().includes(q))
         .slice(0, 3)
         .forEach((c) => out.push({ key: `cli-${c._id}`, icon: FiUsers, title: c.name, meta: `${c.clientCode || "Client"} · Open profile`, to: `/clients/${c._id}` }));
      data.vendors
         .filter((v) => `${v.companyName || ""} ${v.vendorCode || ""}`.toLowerCase().includes(q))
         .slice(0, 3)
         .forEach((v) => out.push({ key: `ven-${v._id}`, icon: FiTruck, title: v.companyName, meta: `${v.vendorCode || "Vendor"} · Vendors`, to: "/vendors" }));
      data.employees
         .filter((e) => `${e.name || ""} ${e.employeeId || ""}`.toLowerCase().includes(q))
         .slice(0, 3)
         .forEach((e) => out.push({ key: `emp-${e._id}`, icon: FiUser, title: e.name, meta: `${e.employeeId || "Employee"} · Directory`, to: "/employees" }));
      data.materials
         .filter((m) => `${m.materialName || ""}`.toLowerCase().includes(q))
         .slice(0, 3)
         .forEach((m) => out.push({ key: `mat-${m._id}`, icon: FiPackage, title: m.materialName, meta: "Inventory · Stock", to: "/inventory" }));
      data.orders
         .filter((o) => `${o.poNumber || ""}`.toLowerCase().includes(q))
         .slice(0, 3)
         .forEach((o) => out.push({ key: `po-${o._id}`, icon: FiShoppingCart, title: o.poNumber, meta: "Purchase order", to: "/purchase-orders" }));
      return out.slice(0, 20);
   }, [query, pages, data]);

   useEffect(() => { setActiveIndex(0); }, [query]);

   const go = (to) => {
      setOpen(false);
      if (to) navigate(to);
   };

   const onInputKey = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && results[activeIndex]) { e.preventDefault(); go(results[activeIndex].to); }
   };

   return (
      <>
         <button
            type="button"
            onClick={() => setOpen(true)}
            className="hidden items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink-400 transition hover:border-brand-300 md:flex md:w-56 lg:w-64"
            aria-label="Search across the ERP"
         >
            <FiSearch size={15} />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[0.65rem] font-semibold text-ink-400">
               /
            </kbd>
         </button>

         <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Search the ERP"
            subtitle="Pages, projects, clients, vendors, people and stock"
         >
            <div className="relative">
               <span className="field-icon"><FiSearch size={16} /></span>
               <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKey}
                  placeholder="Type at least 2 characters…"
                  className="input input-with-icon pr-10"
                  aria-label="Search across the ERP"
               />
               {query && (
                  <button
                     type="button"
                     onClick={() => setQuery("")}
                     className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-400 transition hover:text-ink-900"
                     aria-label="Clear search"
                  >
                     <FiX size={16} />
                  </button>
               )}
            </div>

            <div className="mt-3 min-h-[16rem]">
               {loading ? (
                  <div className="space-y-2">
                     {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
                  </div>
               ) : query.trim().length < 2 ? (
                  <div className="py-8 text-center">
                     <p className="text-sm font-semibold text-ink-900">Search pages and records</p>
                     <p className="mx-auto mt-1 max-w-xs text-xs text-ink-500">
                        Try a project name, client, vendor, employee, material or PO number. Use ↑ ↓ and Enter to navigate.
                     </p>
                  </div>
               ) : results.length === 0 ? (
                  <div className="py-8 text-center">
                     <p className="text-sm font-semibold text-ink-900">No results for “{query.trim()}”</p>
                     <p className="mt-1 text-xs text-ink-500">Check the spelling or try a code like PRJ-0001, PO-0003 or CLI-0002.</p>
                  </div>
               ) : (
                  <ul className="space-y-1" role="listbox" aria-label="Search results">
                     {results.map((r, i) => (
                        <li key={r.key}>
                           <button
                              type="button"
                              role="option"
                              aria-selected={i === activeIndex}
                              onMouseEnter={() => setActiveIndex(i)}
                              onClick={() => go(r.to)}
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${i === activeIndex ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-canvas"}`}
                           >
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-canvas text-ink-500">
                                 <r.icon size={16} />
                              </span>
                              <span className="min-w-0 flex-1">
                                 <span className="block truncate text-sm font-semibold text-ink-900">{r.title}</span>
                                 <span className="block truncate text-xs text-ink-500">{r.meta}</span>
                              </span>
                              <FiArrowRight size={14} className="shrink-0 text-ink-400" />
                           </button>
                        </li>
                     ))}
                  </ul>
               )}
            </div>
            <p className="mt-3 text-center text-[0.7rem] text-ink-400">
               {results.length > 0 ? `${results.length} result${results.length > 1 ? "s" : ""} · ↑ ↓ to move · Enter to open · Esc to close` : "Esc to close"}
            </p>
         </Modal>
      </>
   );
}
