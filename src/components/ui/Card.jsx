export function Card({ children, className = "", hover = false, padded = true, ...rest }) {
   return (
      <div
         className={`surface-card ${hover ? "card-hover" : ""} ${
            padded ? "p-5" : ""
         } ${className}`}
         {...rest}
      >
         {children}
      </div>
   );
}

export function CardHeader({ title, subtitle, icon: Icon, action, className = "" }) {
   return (
      <div className={`flex items-start justify-between gap-4 ${className}`}>
         <div className="flex min-w-0 items-center gap-3">
            {Icon && (
               <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500">
                  <Icon size={18} />
               </span>
            )}
            <div className="min-w-0">
               <h3 className="truncate text-[0.95rem] font-bold text-ink-900">{title}</h3>
               {subtitle && (
                  <p className="mt-0.5 truncate text-xs text-ink-500">{subtitle}</p>
               )}
            </div>
         </div>
         {action}
      </div>
   );
}

export default Card;
