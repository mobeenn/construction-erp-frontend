export function TableShell({ children, className = "" }) {
   return (
      <div className={`surface-card table-card overflow-hidden ${className}`}>
         {children}
      </div>
   );
}

export function TableHead({ title, subtitle, action, icon: Icon }) {
   return (
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
         <div className="flex items-center gap-3">
            {Icon && (
               <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-500">
                  <Icon size={17} />
               </span>
            )}
            <div>
               <h3 className="text-[0.92rem] font-bold text-ink-900">{title}</h3>
               {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
            </div>
         </div>
         {action}
      </div>
   );
}

export function TableWrap({ children }) {
   return <div className="min-w-0 overflow-x-auto">{children}</div>;
}

export function Avatar({ name = "", color = "brand", size = "md" }) {
   const text = name
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
   const dims = size === "sm" ? "h-8 w-8 text-[0.65rem]" : "h-10 w-10 text-xs";
   return (
      <span
         className={`grid shrink-0 place-items-center rounded-xl font-bold ${dims} ${
            color === "brand"
               ? "bg-brand-gradient text-[#0d222b]"
               : "bg-canvas text-ink-500"
         }`}
      >
         {text || "—"}
      </span>
   );
}

export function RowActions({ children, className = "" }) {
   return (
      <div className={`flex items-center justify-end gap-1.5 ${className}`}>
         {children}
      </div>
   );
}
