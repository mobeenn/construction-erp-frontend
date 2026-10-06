import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";

export function SearchInput({ value, onChange, placeholder = "Search…", className = "" }) {
   return (
      <div className={`relative ${className}`}>
         <span className="field-icon">
            <FiSearch size={16} />
         </span>
         <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="input input-with-icon"
         />
      </div>
   );
}

export function FilterSelect({ value, onChange, options, className = "" }) {
   return (
      <select value={value} onChange={onChange} className={`select ${className}`}>
         {options.map((o) => (
            <option key={o.value} value={o.value}>
               {o.label}
            </option>
         ))}
      </select>
   );
}

export function Pagination({ page, pages, onChange }) {
   if (!pages || pages <= 1) return null;

   const items = [];
   for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
         items.push(i);
      } else if (items[items.length - 1] !== "…") {
         items.push("…");
      }
   }

   return (
      <div className="flex items-center justify-center gap-1.5">
         <button
            type="button"
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white text-ink-500 transition hover:border-brand-300 hover:text-ink-900 disabled:opacity-40"
            aria-label="Previous page"
         >
            <FiChevronLeft size={16} />
         </button>
         {items.map((item, idx) =>
            item === "…" ? (
               <span key={`gap-${idx}`} className="px-1 text-sm text-ink-400">
                  …
               </span>
            ) : (
               <button
                  key={item}
                  type="button"
                  onClick={() => onChange(item)}
                  className={`h-9 min-w-9 rounded-xl px-2.5 text-sm font-semibold transition ${
                     item === page
                        ? "bg-brand-gradient text-[#0d222b] shadow-[0_8px_18px_-10px_rgba(42,123,155,0.8)]"
                        : "border border-line bg-white text-ink-500 hover:border-brand-300 hover:text-ink-900"
                  }`}
               >
                  {item}
               </button>
            ),
         )}
         <button
            type="button"
            onClick={() => onChange(Math.min(pages, page + 1))}
            disabled={page >= pages}
            className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white text-ink-500 transition hover:border-brand-300 hover:text-ink-900 disabled:opacity-40"
            aria-label="Next page"
         >
            <FiChevronRight size={16} />
         </button>
      </div>
   );
}

export function Dropdown({ trigger, children, align = "right", className = "" }) {
   const [open, setOpen] = useState(false);
   const ref = useRef(null);

   useEffect(() => {
      const onClick = (e) => {
         if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", onClick);
      return () => document.removeEventListener("mousedown", onClick);
   }, []);

   return (
      <div ref={ref} className={`relative ${className}`}>
         <div className="cursor-pointer" onClick={() => setOpen((o) => !o)}>{trigger}</div>
         {open && (
            <div
               className={`animate-scale-in absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[0_24px_56px_-28px_rgba(16,42,54,0.5)] ${
                  align === "right" ? "right-0" : "left-0"
               }`}
               onClick={() => setOpen(false)}
            >
               {children}
            </div>
         )}
      </div>
   );
}

export function DropdownItem({ icon: Icon, children, danger = false, ...rest }) {
   return (
      <button
         type="button"
         className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
            danger
               ? "text-[#c23b3b] hover:bg-[rgba(224,82,82,0.08)]"
               : "text-ink-700 hover:bg-canvas hover:text-ink-900"
         }`}
         {...rest}
      >
         {Icon && <Icon size={15} />}
         {children}
      </button>
   );
}
