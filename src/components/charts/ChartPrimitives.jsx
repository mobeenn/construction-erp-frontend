export function ProgressRing({
   value = 0,
   size = 120,
   thickness = 11,
   label,
   sublabel,
   gradientId = "ring-grad",
}) {
   const radius = (size - thickness) / 2;
   const circumference = 2 * Math.PI * radius;
   const pct = Math.max(0, Math.min(100, value));
   const dash = (pct / 100) * circumference;
   const center = size / 2;
   const gid = `${gradientId}-${Math.round(size)}-${Math.round(pct)}`;

   return (
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
         <svg width={size} height={size} className="-rotate-90">
            <defs>
               <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2A7B9B" />
                  <stop offset="55%" stopColor="#57C785" />
                  <stop offset="100%" stopColor="#EDDD53" />
               </linearGradient>
            </defs>
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#E9F1EE" strokeWidth={thickness} />
            <circle
               cx={center}
               cy={center}
               r={radius}
               fill="none"
               stroke={`url(#${gid})`}
               strokeWidth={thickness}
               strokeLinecap="round"
               strokeDasharray={`${dash} ${circumference - dash}`}
               style={{ transition: "stroke-dasharray .9s cubic-bezier(.22,1,.36,1)" }}
            />
         </svg>
         <div className="absolute flex flex-col items-center">
            <span className="font-display text-lg font-extrabold text-ink-900">
               {label ?? `${Math.round(pct)}%`}
            </span>
            {sublabel && (
               <span className="text-[0.65rem] font-medium uppercase tracking-wide text-ink-400">
                  {sublabel}
               </span>
            )}
         </div>
      </div>
   );
}

export function ProgressBar({ value = 0, color = "#2A7B9B", gradient = false, height = 8, label }) {
   const pct = Math.max(0, Math.min(100, value));
   return (
      <div className="w-full">
         {label && (
            <div className="mb-1.5 flex items-center justify-between text-[0.7rem] font-medium text-ink-500">
               <span>{label}</span>
               <span className="font-semibold text-ink-700">{Math.round(pct)}%</span>
            </div>
         )}
         <div className="w-full overflow-hidden rounded-full bg-[#E9F1EE]" style={{ height }}>
            <div
               className={gradient ? "bg-brand-gradient h-full rounded-full" : "h-full rounded-full"}
               style={{
                  width: `${pct}%`,
                  background: gradient ? undefined : color,
                  transition: "width .9s cubic-bezier(.22,1,.36,1)",
               }}
            />
         </div>
      </div>
   );
}

export function Sparkline({ data = [], color = "#2A7B9B", width = 96, height = 32 }) {
   const max = Math.max(...data, 1);
   const min = Math.min(...data, 0);
   const range = max - min || 1;
   const pts = data.map((v, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return [x, y];
   });
   const line = pts.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(" ");
   const area = `${line} L ${width} ${height} L 0 ${height} Z`;
   const id = `spark-${color.replace("#", "")}-${data.length}`;

   return (
      <svg width={width} height={height} className="overflow-visible">
         <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor={color} stopOpacity="0.28" />
               <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
         </defs>
         <path d={area} fill={`url(#${id})`} />
         <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   );
}
