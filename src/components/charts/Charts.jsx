import { useEffect, useMemo, useRef, useState } from "react";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/
export const SERIES_COLORS = [
   "#2A7B9B",
   "#57C785",
   "#EDDD53",
   "#7DBCCD",
   "#D9A441",
   "#23657F",
   "#E05252",
   "#4DAF8A",
];

export function formatCompact(value) {
   if (value === null || value === undefined || Number.isNaN(Number(value))) return "0";
   const n = Number(value);
   const abs = Math.abs(n);
   const sign = n < 0 ? "-" : "";
   if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
   if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
   if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
   return `${sign}${abs.toLocaleString()}`;
}

export function formatCurrency(value) {
   return `PKR ${formatCompact(value)}`;
}

function niceMax(value) {
   if (value <= 0) return 10;
   const exp = Math.floor(Math.log10(value));
   const base = Math.pow(10, exp);
   const scaled = value / base;
   const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10;
   return step * base;
}

function useSize() {
   const ref = useRef(null);
   const [width, setWidth] = useState(0);

   useEffect(() => {
      if (!ref.current) return;
      const el = ref.current;
      const update = () => setWidth(el.clientWidth);
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
   }, []);

   return [ref, width];
}

function AnimatedPath({ d, stroke, width, fill = "none" }) {
   const ref = useRef(null);
   useEffect(() => {
      const el = ref.current;
      if (!el || !el.getTotalLength || !d) return;
      let len = 0;
      try {
         len = el.getTotalLength();
      } catch {
         return;
      }
      if (!len) return;
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      // force reflow then animate
      el.getBoundingClientRect();
      el.style.transition = "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)";
      const raf = requestAnimationFrame(() => {
         el.style.strokeDashoffset = "0";
      });
      return () => cancelAnimationFrame(raf);
   }, [d]);

   return (
      <path
         ref={ref}
         d={d}
         fill={fill}
         stroke={stroke}
         strokeWidth={width}
         strokeLinecap="round"
         strokeLinejoin="round"
      />
   );
}

function Tooltip({ x, y, containerWidth, children }) {
   const flip = x > containerWidth - 150;
   return (
      <div
         className="pointer-events-none absolute z-20 min-w-[9rem] -translate-y-full rounded-xl border border-line bg-white/97 px-3 py-2 text-xs shadow-[0_18px_40px_-20px_rgba(16,42,54,0.55)] backdrop-blur"
         style={{
            left: x,
            top: y - 10,
            transform: `translate(${flip ? "-100%" : "-50%"}, -100%)`,
         }}
      >
         {children}
      </div>
   );
}

function Legend({ items, active, onHover, compact }) {
   return (
      <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${compact ? "text-[0.7rem]" : "text-xs"}`}>
         {items.map((item, i) => (
            <button
               key={item.name}
               type="button"
               onMouseEnter={() => onHover?.(i)}
               onMouseLeave={() => onHover?.(null)}
               className={`flex items-center gap-1.5 font-medium transition ${
                  active === null || active === i ? "text-ink-700" : "text-ink-400"
               }`}
            >
               <span
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{ background: item.color || SERIES_COLORS[i % SERIES_COLORS.length] }}
               />
               {item.name}
            </button>
         ))}
      </div>
   );
}

/*
|--------------------------------------------------------------------------
| Line / Area chart
|--------------------------------------------------------------------------
*/
export function LineChart({
   labels = [],
   series = [],
   height = 260,
   area = true,
   curved = true,
   showGrid = true,
   valueFormat = formatCompact,
}) {
   const [ref, width] = useSize();
   const [hover, setHover] = useState(null);
   const [activeSeries, setActiveSeries] = useState(null);

   const pad = { top: 18, right: 18, bottom: 30, left: 46 };
   const w = Math.max(width, 260);
   const innerW = w - pad.left - pad.right;
   const innerH = height - pad.top - pad.bottom;

   const max = useMemo(() => {
      const all = series.flatMap((s) => s.data || []);
      return niceMax(Math.max(...all, 0));
   }, [series]);

   const n = labels.length || series[0]?.data?.length || 0;

   const xAt = (i) => (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
   const yAt = (v) => innerH - (v / (max || 1)) * innerH;

   const buildPath = (data) => {
      if (!data.length) return "";
      return data
         .map((v, i) => {
            const x = xAt(i);
            const y = yAt(v);
            if (i === 0) return `M ${x} ${y}`;
            if (!curved) return `L ${x} ${y}`;
            const px = xAt(i - 1);
            const py = yAt(data[i - 1]);
            const cx = (px + x) / 2;
            return `C ${cx} ${py} ${cx} ${y} ${x} ${y}`;
         })
         .join(" ");
   };

   const ticks = Array.from({ length: 5 }, (_, i) => (max / 4) * i);

   const onMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const rel = x - pad.left;
      const idx = Math.round((rel / innerW) * (n - 1));
      const clamped = Math.max(0, Math.min(n - 1, idx));
      setHover(clamped);
   };

   return (
      <div ref={ref} className="relative w-full">
         {width > 0 && (
            <svg
               width={w}
               height={height}
               onMouseMove={onMove}
               onMouseLeave={() => setHover(null)}
               className="overflow-visible"
            >
               <defs>
                  {series.map((s, i) => {
                     const color = s.color || SERIES_COLORS[i % SERIES_COLORS.length];
                     return (
                        <linearGradient key={i} id={`lnarea-${i}-${w}`} x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor={color} stopOpacity="0.26" />
                           <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                     );
                  })}
               </defs>

               <g transform={`translate(${pad.left}, ${pad.top})`}>
                  {showGrid &&
                     ticks.map((t, i) => (
                        <g key={i}>
                           <line
                              x1={0}
                              x2={innerW}
                              y1={yAt(t)}
                              y2={yAt(t)}
                              stroke="#E7EFEC"
                              strokeWidth={1}
                              strokeDasharray={i === 0 ? "0" : "3 5"}
                           />
                           <text
                              x={-10}
                              y={yAt(t)}
                              textAnchor="end"
                              dominantBaseline="middle"
                              className="fill-ink-400"
                              fontSize={10.5}
                           >
                              {valueFormat(t)}
                           </text>
                        </g>
                     ))}

                  {labels.map((label, i) => (
                     <text
                        key={i}
                        x={xAt(i)}
                        y={innerH + 18}
                        textAnchor="middle"
                        className="fill-ink-400"
                        fontSize={10.5}
                     >
                        {label}
                     </text>
                  ))}

                  {hover !== null && (
                     <line
                        x1={xAt(hover)}
                        x2={xAt(hover)}
                        y1={0}
                        y2={innerH}
                        stroke="#9FBCB4"
                        strokeWidth={1}
                        strokeDasharray="3 4"
                     />
                  )}

                  {series.map((s, i) => {
                     const color = s.color || SERIES_COLORS[i % SERIES_COLORS.length];
                     const path = buildPath(s.data || []);
                     const dim = activeSeries !== null && activeSeries !== i;
                     const areaPath = `${path} L ${xAt(n - 1)} ${innerH} L ${xAt(0)} ${innerH} Z`;
                     return (
                        <g key={i} style={{ opacity: dim ? 0.28 : 1, transition: "opacity .2s" }}>
                           {area && n > 1 && (
                              <path d={areaPath} fill={`url(#lnarea-${i}-${w})`} />
                           )}
                           <AnimatedPath
                              d={path}
                              stroke={color}
                              width={i === 0 ? 2.6 : 2.2}
                           />
                           {hover !== null && s.data?.[hover] !== undefined && (
                              <circle
                                 cx={xAt(hover)}
                                 cy={yAt(s.data[hover])}
                                 r={4.5}
                                 fill="#fff"
                                 stroke={color}
                                 strokeWidth={2.6}
                              />
                           )}
                        </g>
                     );
                  })}
               </g>
            </svg>
         )}

         {hover !== null && (
            <Tooltip x={pad.left + xAt(hover)} y={pad.top + 6} containerWidth={w}>
               <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-ink-400">
                  {labels[hover]}
               </p>
               {series.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                     <span className="flex items-center gap-1.5 text-ink-500">
                        <span
                           className="h-2 w-2 rounded-full"
                           style={{ background: s.color || SERIES_COLORS[i % SERIES_COLORS.length] }}
                        />
                        {s.name}
                     </span>
                     <span className="font-semibold text-ink-900">
                        {valueFormat(s.data?.[hover] ?? 0)}
                     </span>
                  </div>
               ))}
            </Tooltip>
         )}

         {series.length > 1 && (
            <div className="mt-1 flex justify-center">
               <Legend items={series} active={activeSeries} onHover={setActiveSeries} />
            </div>
         )}
      </div>
   );
}

/*
|--------------------------------------------------------------------------
| Bar chart (grouped)
|--------------------------------------------------------------------------
*/
export function BarChart({
   labels = [],
   series = [],
   height = 260,
   stacked = false,
   valueFormat = formatCompact,
   horizontal = false,
}) {
   const [ref, width] = useSize();
   const [hover, setHover] = useState(null);
   const [activeSeries, setActiveSeries] = useState(null);

   const pad = { top: 18, right: 18, bottom: 30, left: 46 };
   const w = Math.max(width, 260);
   const innerW = w - pad.left - pad.right;
   const innerH = height - pad.top - pad.bottom;

   const n = labels.length;
   const groups = series.length || 1;

   const max = useMemo(() => {
      if (stacked) {
         const totals = labels.map((_, i) =>
            series.reduce((sum, s) => sum + (s.data?.[i] || 0), 0),
         );
         return niceMax(Math.max(...totals, 0));
      }
      const all = series.flatMap((s) => s.data || []);
      return niceMax(Math.max(...all, 0));
   }, [series, labels, stacked]);

   const groupW = innerW / Math.max(n, 1);
   const barGap = 4;
   const barW = stacked
      ? groupW * 0.5
      : (groupW * 0.62 - barGap * (groups - 1)) / groups;

   const yAt = (v) => innerH - (v / (max || 1)) * innerH;
   const ticks = Array.from({ length: 5 }, (_, i) => (max / 4) * i);

   return (
      <div ref={ref} className="relative w-full">
         {width > 0 && (
            <svg width={w} height={height} className="overflow-visible">
               <defs>
                  {series.map((s, i) => {
                     const color = s.color || SERIES_COLORS[i % SERIES_COLORS.length];
                     return (
                        <linearGradient key={i} id={`bar-${i}-${w}`} x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor={color} stopOpacity="1" />
                           <stop offset="100%" stopColor={color} stopOpacity="0.62" />
                        </linearGradient>
                     );
                  })}
               </defs>

               <g transform={`translate(${pad.left}, ${pad.top})`}>
                  {ticks.map((t, i) => (
                     <g key={i}>
                        <line
                           x1={0}
                           x2={innerW}
                           y1={yAt(t)}
                           y2={yAt(t)}
                           stroke="#E7EFEC"
                           strokeDasharray={i === 0 ? "0" : "3 5"}
                        />
                        <text
                           x={-10}
                           y={yAt(t)}
                           textAnchor="end"
                           dominantBaseline="middle"
                           className="fill-ink-400"
                           fontSize={10.5}
                        >
                           {valueFormat(t)}
                        </text>
                     </g>
                  ))}

                  {labels.map((label, gi) => {
                     const gx = gi * groupW;
                     return (
                        <g key={gi}>
                           <rect
                              x={gx}
                              y={0}
                              width={groupW}
                              height={innerH}
                              fill={hover === gi ? "rgba(42,123,155,0.05)" : "transparent"}
                              onMouseEnter={() => setHover(gi)}
                              onMouseLeave={() => setHover(null)}
                           />
                           <text
                              x={gx + groupW / 2}
                              y={innerH + 18}
                              textAnchor="middle"
                              className="fill-ink-400"
                              fontSize={10.5}
                           >
                              {label}
                           </text>

                           {(() => {
                              let stackTop = innerH;
                              if (stacked) {
                                 const x = gx + (groupW - barW) / 2;
                                 return series.map((s, si) => {
                                    const v = s.data?.[gi] || 0;
                                    const h = (v / (max || 1)) * innerH;
                                    stackTop -= h;
                                    return (
                                       <rect
                                          key={si}
                                          x={x}
                                          y={stackTop}
                                          width={barW}
                                          height={Math.max(h, 0)}
                                          rx={4}
                                          fill={`url(#bar-${si}-${w})`}
                                          style={{ opacity: activeSeries !== null && activeSeries !== si ? 0.3 : 1, transition: "opacity .2s" }}
                                       />
                                    );
                                 });
                              }
                              return series.map((s, si) => {
                                 const v = s.data?.[gi] || 0;
                                 const h = (v / (max || 1)) * innerH;
                                 const x = gx + (groupW * 0.62 - barW * groups - barGap * (groups - 1)) / 2 + si * (barW + barGap);
                                 return (
                                    <rect
                                       key={si}
                                       className="chart-bar"
                                       x={x}
                                       y={innerH - h}
                                       width={barW}
                                       height={Math.max(h, 0)}
                                       rx={4}
                                       fill={`url(#bar-${si}-${w})`}
                                       style={{
                                          opacity: activeSeries !== null && activeSeries !== si ? 0.28 : 1,
                                          transition: "opacity .2s",
                                          animationDelay: `${gi * 45}ms`,
                                       }}
                                    />
                                 );
                              });
                           })()}
                        </g>
                     );
                  })}
               </g>
            </svg>
         )}

         {hover !== null && (
            <Tooltip x={pad.left + hover * groupW + groupW / 2} y={pad.top + 6} containerWidth={w}>
               <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-ink-400">
                  {labels[hover]}
               </p>
               {series.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                     <span className="flex items-center gap-1.5 text-ink-500">
                        <span
                           className="h-2 w-2 rounded-full"
                           style={{ background: s.color || SERIES_COLORS[i % SERIES_COLORS.length] }}
                        />
                        {s.name}
                     </span>
                     <span className="font-semibold text-ink-900">
                        {valueFormat(s.data?.[hover] ?? 0)}
                     </span>
                  </div>
               ))}
            </Tooltip>
         )}

         {series.length > 1 && (
            <div className="mt-1 flex justify-center">
               <Legend items={series} active={activeSeries} onHover={setActiveSeries} />
            </div>
         )}
      </div>
   );
}

/*
|--------------------------------------------------------------------------
| Donut chart
|--------------------------------------------------------------------------
*/
export function DonutChart({
   data = [],
   size = 190,
   thickness = 22,
   centerLabel = "Total",
   valueFormat = formatCompact,
}) {
   const [hover, setHover] = useState(null);
   const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
   const radius = (size - thickness) / 2;
   const circumference = 2 * Math.PI * radius;
   const center = size / 2;
   const gap = data.length > 1 ? 3 : 0;

   let offset = 0;
   const segments = data.map((d, i) => {
      const fraction = total > 0 ? d.value / total : 0;
      const length = Math.max(fraction * circumference - gap, 0);
      const seg = {
         ...d,
         color: d.color || SERIES_COLORS[i % SERIES_COLORS.length],
         dash: length,
         offset,
         fraction,
      };
      offset += fraction * circumference;
      return seg;
   });

   const active = hover !== null ? segments[hover] : null;

   return (
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
         <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
               <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#EEF4F2"
                  strokeWidth={thickness}
               />
               {segments.map((seg, i) => (
                  <circle
                     key={i}
                     cx={center}
                     cy={center}
                     r={radius}
                     fill="none"
                     stroke={seg.color}
                     strokeWidth={hover === i ? thickness + 5 : thickness}
                     strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                     strokeDashoffset={-seg.offset}
                     strokeLinecap="round"
                     onMouseEnter={() => setHover(i)}
                     onMouseLeave={() => setHover(null)}
                     className="cursor-pointer transition-all duration-200"
                  />
               ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-[0.68rem] font-semibold uppercase tracking-wide text-ink-400">
                  {active ? active.name : centerLabel}
               </span>
               <span className="font-display text-xl font-extrabold text-ink-900">
                  {valueFormat(active ? active.value : total)}
               </span>
               {active && (
                  <span className="text-[0.7rem] font-medium text-ink-500">
                     {(active.fraction * 100).toFixed(0)}%
                  </span>
               )}
            </div>
         </div>

         <div className="flex w-full flex-col gap-2">
            {segments.map((seg, i) => (
               <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-canvas"
               >
                  <span className="flex min-w-0 items-center gap-2">
                     <span
                        className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                        style={{ background: seg.color }}
                     />
                     <span className="truncate text-xs font-medium text-ink-700">
                        {seg.name}
                     </span>
                  </span>
                  <span className="shrink-0 text-xs font-bold text-ink-900">
                     {valueFormat(seg.value)}
                  </span>
               </button>
            ))}
         </div>
      </div>
   );
}

/*
|--------------------------------------------------------------------------
| Progress ring
|--------------------------------------------------------------------------
*/
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

   return (
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
         <svg width={size} height={size} className="-rotate-90">
            <defs>
               <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
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
               stroke={`url(#${gradientId})`}
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

/*
|--------------------------------------------------------------------------
| Progress bar
|--------------------------------------------------------------------------
*/
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
         <div
            className="w-full overflow-hidden rounded-full bg-[#E9F1EE]"
            style={{ height }}
         >
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

/*
|--------------------------------------------------------------------------
| Sparkline
|--------------------------------------------------------------------------
*/
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

export default { LineChart, BarChart, DonutChart, ProgressRing, ProgressBar, Sparkline };
