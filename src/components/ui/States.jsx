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

/** Content-area skeleton while a lazy page chunk loads (layout stays mounted). */
export function PageContentSkeleton() {
   return (
      <div className="space-y-4">
         <div className="skeleton h-10 w-64 max-w-full rounded-xl" />
         <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="skeleton h-24 rounded-3xl" />
            ))}
         </div>
         <TableSkeleton rows={6} cols={5} />
      </div>
   );
}

/** Full-shell skeleton for auth gate before AppLayout mounts. */
export function AuthShellSkeleton() {
   return (
      <div className="flex h-dvh max-h-dvh overflow-hidden bg-canvas">
         <div className="flex h-full w-full min-w-0 gap-3 px-2 py-2 sm:px-3 sm:py-3">
            <div className="hidden h-full w-64 shrink-0 flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm md:flex">
               <div className="skeleton h-9 w-36 rounded-xl" />
               <div className="mt-4 space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                     <div key={i} className="skeleton h-8 w-full rounded-xl" />
                  ))}
               </div>
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
               <div className="skeleton h-14 w-full rounded-2xl" />
               <div className="min-h-0 flex-1 overflow-hidden p-1">
                  <PageContentSkeleton />
               </div>
            </div>
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
