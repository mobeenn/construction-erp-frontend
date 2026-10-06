export default function AttendanceSummary({ summary = {} }) {
   const cards = [
      {
         label: "Present",
         value: summary.present ?? 0,
         dot: "#22A06B",
         bg: "bg-mint-50",
         fg: "text-mint-600",
      },
      {
         label: "Absent",
         value: summary.absent ?? 0,
         dot: "#E05252",
         bg: "bg-[rgba(224,82,82,0.1)]",
         fg: "text-[#c23b3b]",
      },
      {
         label: "Half Day",
         value: summary.halfDay ?? 0,
         dot: "#D9A441",
         bg: "bg-[rgba(217,164,65,0.12)]",
         fg: "text-[#9a721f]",
      },
      {
         label: "Overtime Hrs",
         value: summary.overtime ?? 0,
         dot: "#2A7B9B",
         bg: "bg-brand-50",
         fg: "text-brand-500",
      },
   ];

   return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
         {cards.map((c) => (
            <div key={c.label} className="surface-card card-hover flex items-center gap-3 p-4">
               <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${c.bg} ${c.fg}`}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.dot }} />
               </span>
               <div className="min-w-0">
                  <p className="font-display text-xl font-extrabold leading-none text-ink-900">
                     {c.value}
                  </p>
                  <p className="mt-1 text-[0.75rem] font-medium text-ink-500">{c.label}</p>
               </div>
            </div>
         ))}
      </div>
   );
}
