import { FiInbox, FiRefreshCw, FiWifiOff } from "react-icons/fi";
import Button from "./Button";

export function PageLoader({ label = "Loading workspace…" }) {
   return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-ink-500">
         <div className="relative h-12 w-12">
            <span className="absolute inset-0 rounded-full border-[3px] border-line" />
            <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-brand-500 border-r-mint-400" />
         </div>
         <p className="text-sm font-medium">{label}</p>
      </div>
   );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
   return (
      <div className="surface-card table-card overflow-hidden">
         <div className="flex items-center gap-4 border-b border-line bg-[#f6faf9] px-4 py-3">
            {Array.from({ length: cols }).map((_, i) => (
               <div key={i} className="skeleton h-3 flex-1" />
            ))}
         </div>
         <div className="divide-y divide-[#eef4f2]">
            {Array.from({ length: rows }).map((_, r) => (
               <div key={r} className="flex items-center gap-4 px-4 py-4">
                  {Array.from({ length: cols }).map((_, c) => (
                     <div
                        key={c}
                        className="skeleton h-3.5 flex-1"
                        style={{ maxWidth: c === 0 ? "38%" : undefined }}
                     />
                  ))}
               </div>
            ))}
         </div>
      </div>
   );
}

export function EmptyState({
   icon: Icon = FiInbox,
   title = "Nothing here yet",
   message = "There is no data to display right now.",
   action,
}) {
   return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
         <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-mint-50 text-brand-400">
            <Icon size={28} />
         </span>
         <h3 className="text-base font-bold text-ink-900">{title}</h3>
         <p className="max-w-sm text-sm text-ink-500">{message}</p>
         {action}
      </div>
   );
}

export function ErrorState({ message = "We couldn't load this data.", onRetry }) {
   return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
         <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[rgba(224,82,82,0.1)] text-[#E05252]">
            <FiWifiOff size={26} />
         </span>
         <h3 className="text-base font-bold text-ink-900">Unable to load</h3>
         <p className="max-w-sm text-sm text-ink-500">{message}</p>
         {onRetry && (
            <Button variant="secondary" icon={FiRefreshCw} onClick={onRetry} className="mt-1">
               Try again
            </Button>
         )}
      </div>
   );
}
