import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

export default function Modal({
   isOpen,
   onClose,
   title,
   subtitle,
   children,
   footer,
   size = "md",
}) {
   useEffect(() => {
      if (!isOpen) return;
      const onKey = (e) => e.key === "Escape" && onClose?.();
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
         document.removeEventListener("keydown", onKey);
         document.body.style.overflow = prev;
      };
   }, [isOpen, onClose]);

   if (!isOpen) return null;

   const widths = {
      sm: "max-w-md",
      md: "max-w-xl",
      lg: "max-w-3xl",
      xl: "max-w-5xl",
   };

   return createPortal(
      <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6">
         <div
            className="animate-fade-in absolute inset-0 bg-ink-900/45 backdrop-blur-[2px]"
            onClick={onClose}
         />
         <div
            className={`animate-scale-in relative z-10 flex max-h-[92vh] w-full ${
               widths[size] || widths.md
            } flex-col overflow-hidden rounded-t-3xl border border-line bg-white shadow-[0_34px_80px_-30px_rgba(16,42,54,0.55)] sm:rounded-3xl`}
            role="dialog"
            aria-modal="true"
         >
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
               <div>
                  <h2 className="text-base font-bold text-ink-900">{title}</h2>
                  {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
               </div>
               <button
                  type="button"
                  onClick={onClose}
                  className="grid h-9 w-9 place-items-center rounded-xl text-ink-500 transition hover:bg-canvas hover:text-ink-900"
                  aria-label="Close dialog"
               >
                  <FiX size={18} />
               </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {footer && (
               <div className="flex items-center justify-end gap-3 border-t border-line bg-canvas/60 px-6 py-4">
                  {footer}
               </div>
            )}
         </div>
      </div>,
      document.body,
   );
}
