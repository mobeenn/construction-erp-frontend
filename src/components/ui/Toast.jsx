import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX, FiXCircle } from "react-icons/fi";

const CONFIG = {
   success: {
      Icon: FiCheckCircle,
      accent: "#22A06B",
      ring: "rgba(34,160,107,0.18)",
      title: "Success",
   },
   error: {
      Icon: FiXCircle,
      accent: "#E05252",
      ring: "rgba(224,82,82,0.18)",
      title: "Something went wrong",
   },
   warning: {
      Icon: FiAlertTriangle,
      accent: "#D9A441",
      ring: "rgba(217,164,65,0.2)",
      title: "Heads up",
   },
   info: {
      Icon: FiInfo,
      accent: "#2A7B9B",
      ring: "rgba(42,123,155,0.18)",
      title: "Notice",
   },
};

export default function ToastViewport({ toasts, onDismiss }) {
   return (
      <div
         className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-3 p-4 sm:items-end sm:p-6"
         role="region"
         aria-live="polite"
         aria-label="Notifications"
      >
         {toasts.map((toast) => {
            const conf = CONFIG[toast.type] || CONFIG.info;
            const { Icon } = conf;
            return (
               <div
                  key={toast.id}
                  className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-white/95 p-3.5 shadow-[0_18px_44px_-22px_rgba(16,42,54,0.5)] backdrop-blur"
               >
                  <span
                     className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl"
                     style={{ background: conf.ring, color: conf.accent }}
                  >
                     <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                     <p className="text-[0.82rem] font-semibold text-ink-900">
                        {toast.title || conf.title}
                     </p>
                     <p className="mt-0.5 text-[0.82rem] leading-snug text-ink-500 break-words">
                        {toast.message}
                     </p>
                  </div>
                  <button
                     type="button"
                     onClick={() => onDismiss(toast.id)}
                     className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-canvas hover:text-ink-900"
                     aria-label="Dismiss notification"
                  >
                     <FiX size={15} />
                  </button>
                  <span
                     className="absolute bottom-0 left-0 h-0.5 rounded-full"
                     style={{ background: conf.accent }}
                  />
               </div>
            );
         })}
      </div>
   );
}
