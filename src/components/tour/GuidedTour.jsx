import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheck, FiHelpCircle, FiX } from "react-icons/fi";
import Modal from "../ui/Modal";
import { getTour } from "./tours";

export default function GuidedTour() {
   const location = useLocation();
   const [open, setOpen] = useState(false);
   const [step, setStep] = useState(0);

   const tour = getTour(location.pathname);
   const total = tour.steps.length;
   const current = tour.steps[Math.min(step, total - 1)];

   useEffect(() => {
      setStep(0);
   }, [location.pathname, open]);

   useEffect(() => {
      if (!open) return;
      const onKey = (e) => {
         if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, total - 1));
         if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
   }, [open, total]);

   const close = () => setOpen(false);

   return (
      <>
         <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-ink-500 transition hover:border-brand-300 hover:text-ink-900"
            aria-label="Take a guided tour of this page"
            title="Take a guided tour of this page"
         >
            <FiHelpCircle size={17} />
         </button>

         <Modal
            isOpen={open}
            onClose={close}
            title={tour.title}
            subtitle={`${tour.subtitle} · Step ${Math.min(step + 1, total)} of ${total}`}
            size="lg"
            footer={
               <>
                  <button type="button" onClick={close} className="btn btn-ghost btn-sm">
                     Skip tour
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                     <button
                        type="button"
                        onClick={() => setStep((s) => Math.max(s - 1, 0))}
                        disabled={step === 0}
                        className="btn btn-secondary btn-sm"
                     >
                        <FiArrowLeft size={14} />
                        Back
                     </button>
                     {step < total - 1 ? (
                        <button
                           type="button"
                           onClick={() => setStep((s) => Math.min(s + 1, total - 1))}
                           className="btn btn-primary btn-sm"
                        >
                           Next
                           <FiArrowRight size={14} />
                        </button>
                     ) : (
                        <button type="button" onClick={close} className="btn btn-primary btn-sm">
                           <FiCheck size={14} />
                           Got it
                        </button>
                     )}
                  </div>
               </>
            }
         >
            <div className="mb-4 flex items-center gap-1.5" aria-hidden="true">
               {tour.steps.map((_, i) => (
                  <span
                     key={i}
                     className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-brand-gradient" : "bg-[#e3ecea]"}`}
                  />
               ))}
            </div>

            <div className="rounded-2xl border border-line bg-canvas/60 p-5">
               <div className="flex items-start justify-between gap-3">
                  <div>
                     <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-600">
                        Step {Math.min(step + 1, total)} of {total}
                     </p>
                     <h3 className="mt-1 font-display text-lg font-extrabold text-ink-900">
                        {current.heading}
                     </h3>
                  </div>
                  <button
                     type="button"
                     onClick={close}
                     className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-ink-400 transition hover:bg-white hover:text-ink-900"
                     aria-label="Close tour"
                  >
                     <FiX size={16} />
                  </button>
               </div>
               <p className="mt-2 text-sm leading-relaxed text-ink-700">{current.body}</p>
               {current.action && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-brand-700 shadow-sm">
                     <FiCheck size={13} />
                     {current.action}
                  </p>
               )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
               {tour.steps.map((s, i) => (
                  <button
                     key={s.heading}
                     type="button"
                     onClick={() => setStep(i)}
                     className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${i === step ? "bg-brand-gradient text-[#0d222b]" : "border border-line bg-white text-ink-500 hover:border-brand-300 hover:text-ink-900"}`}
                  >
                     {i + 1}. {s.heading}
                  </button>
               ))}
            </div>
         </Modal>
      </>
   );
}
