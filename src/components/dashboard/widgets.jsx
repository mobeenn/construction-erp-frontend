import { Link } from "react-router-dom";
import { FiArrowUpRight, FiChevronRight } from "react-icons/fi";
import { Sparkline } from "../charts/Charts";

const TONES = {
   brand: { bg: "bg-brand-50", fg: "text-brand-500" },
   mint: { bg: "bg-mint-50", fg: "text-mint-600" },
   sun: { bg: "bg-sun-50", fg: "text-[#b08a1f]" },
   amber: { bg: "bg-[rgba(217,164,65,0.12)]", fg: "text-[#9a721f]" },
   danger: { bg: "bg-[rgba(224,82,82,0.1)]", fg: "text-[#c23b3b]" },
   neutral: { bg: "bg-canvas", fg: "text-ink-500" },
};

export function PageHeader({ title, subtitle, actions, children }) {
   return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
         <div className="min-w-0">
            {children}
            <h1 className="font-display text-xl font-extrabold text-ink-900 sm:text-2xl">
               {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
         </div>
         {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
   );
}

export function Hero({ eyebrow, title, subtitle, actions, children }) {
   return (
      <section className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 shadow-[0_24px_60px_-30px_rgba(42,123,155,0.9)] sm:p-8">
         <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
               backgroundImage:
                  "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.5) 0, transparent 42%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.35) 0, transparent 38%)",
            }}
         />
         <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/25" />
         <div className="pointer-events-none absolute -bottom-20 right-16 h-40 w-40 rounded-full border border-white/20" />
         <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 max-w-2xl">
               {eyebrow && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#0d222b]/15 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#0d222b]">
                     {eyebrow}
                  </span>
               )}
               <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight text-[#0d222b] sm:text-[1.9rem]">
                  {title}
               </h1>
               {subtitle && (
                  <p className="mt-2 max-w-xl text-sm font-medium text-[#12303a]/80">
                     {subtitle}
                  </p>
               )}
               {actions && <div className="mt-5 flex flex-wrap gap-2.5">{actions}</div>}
            </div>
            {children}
         </div>
      </section>
   );
}

export function KpiCard({
   label,
   value,
   icon: Icon,
   tone = "brand",
   hint,
   delta,
   deltaTone = "success",
   spark,
   sparkColor = "#2A7B9B",
}) {
   const t = TONES[tone] || TONES.brand;
   return (
      <div className="surface-card card-hover flex flex-col gap-3 p-4">
         <div className="flex items-start justify-between gap-2">
            <span className={`grid h-11 w-11 place-items-center rounded-2xl ${t.bg} ${t.fg}`}>
               {Icon && <Icon size={19} />}
            </span>
            {delta != null && (
               <span
                  className={`badge ${
                     deltaTone === "danger"
                        ? "badge-danger"
                        : deltaTone === "warning"
                          ? "badge-warning"
                          : "badge-success"
                  }`}
               >
                  {delta}
               </span>
            )}
         </div>
         <div>
            <p className="font-display text-[1.6rem] font-extrabold leading-none text-ink-900">
               {value}
            </p>
            <p className="mt-1.5 text-[0.78rem] font-medium text-ink-500">{label}</p>
         </div>
         <div className="flex items-end justify-between gap-2">
            {hint && <span className="text-[0.7rem] text-ink-400">{hint}</span>}
            {spark && <Sparkline data={spark} color={sparkColor} width={84} height={28} />}
         </div>
      </div>
   );
}

export function ChartCard({
   title,
   subtitle,
   icon: Icon,
   action,
   children,
   className = "",
   bodyClassName = "",
}) {
   return (
      <div className={`surface-card flex flex-col p-5 ${className}`}>
         <div className="flex items-start justify-between gap-3">
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
         <div className={`mt-4 flex-1 ${bodyClassName}`}>{children}</div>
      </div>
   );
}

export function ViewAllLink({ to, label = "View all" }) {
   return (
      <Link
         to={to}
         className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-500 transition hover:bg-brand-50"
      >
         {label}
         <FiArrowUpRight size={13} />
      </Link>
   );
}

export function ListRow({ leading, title, meta, trailing, to, onClick }) {
   const className =
      "flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-canvas";
   const inner = (
      <>
         {leading}
         <div className="min-w-0 flex-1">
            <p className="truncate text-[0.82rem] font-semibold text-ink-900">{title}</p>
            {meta && <p className="truncate text-[0.72rem] text-ink-500">{meta}</p>}
         </div>
         {trailing}
      </>
   );

   if (to) {
      return (
         <Link to={to} className={className}>
            {inner}
         </Link>
      );
   }
   return (
      <div role={onClick ? "button" : undefined} onClick={onClick} className={className}>
         {inner}
      </div>
   );
}

export default { PageHeader, Hero, KpiCard, ChartCard, ListRow, ViewAllLink };
