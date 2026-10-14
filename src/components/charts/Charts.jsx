import { useEffect, useMemo, useRef } from "react";
import { Chart, XAxis, YAxis, Tooltip, Legend } from "@highcharts/react";
import { ColumnSeries } from "@highcharts/react/series/Column";
import { LineSeries } from "@highcharts/react/series/Line";
import { AreaSeries } from "@highcharts/react/series/Area";
import { VariablePieSeries } from "@highcharts/react/series/VariablePie";
import { SERIES_COLORS, formatCompact, formatCurrency } from "../../utils/format";

/* Prefer `utils/format` for new code; re-exports keep existing chart import paths working. */
/* eslint-disable react-refresh/only-export-components */
export { SERIES_COLORS, formatCompact, formatCurrency };
/* eslint-enable react-refresh/only-export-components */

const FONT = {
   chart: "Inter, ui-sans-serif, system-ui, sans-serif",
   title: "Manrope, Inter, ui-sans-serif, system-ui, sans-serif",
};

/** First-mount animation only — later polls/re-renders skip replay. */
function useOnceAnimation(duration = 2500) {
   const first = useRef(true);
   const anim = useRef({ duration, easing: "easeOutQuart" });
   const animation = first.current ? anim.current : false;
   useEffect(() => {
      first.current = false;
   }, []);
   return animation;
}

function baseChartOptions({ height, animation }) {
   return {
      chart: {
         backgroundColor: "transparent",
         height,
         style: { fontFamily: FONT.chart },
         animation,
         spacing: [12, 8, 8, 8],
      },
      title: { text: undefined },
      credits: { enabled: false },
      accessibility: { enabled: false },
      colors: SERIES_COLORS,
      tooltip: {
         backgroundColor: "rgba(255,255,255,0.97)",
         borderColor: "#d9e6e2",
         borderRadius: 12,
         shadow: {
            color: "rgba(16,42,54,0.12)",
            offsetX: 0,
            offsetY: 6,
            opacity: 0.15,
            width: 8,
         },
         style: { color: "#17252b", fontSize: "12px", fontFamily: FONT.chart },
      },
      legend: {
         itemStyle: {
            color: "#34474e",
            fontWeight: "500",
            fontSize: "12px",
            fontFamily: FONT.chart,
         },
         itemHoverStyle: { color: "#2a7b9b" },
      },
      xAxis: {
         lineColor: "#d9e6e2",
         tickColor: "#d9e6e2",
         labels: {
            style: { color: "#8b9ca1", fontSize: "11px", fontFamily: FONT.chart },
         },
      },
      yAxis: {
         gridLineColor: "#e7efec",
         title: { text: undefined },
         labels: {
            style: { color: "#8b9ca1", fontSize: "11px", fontFamily: FONT.chart },
         },
      },
      plotOptions: {
         series: { animation },
         column: {
            borderRadius: 6,
            borderWidth: 0,
            groupPadding: 0.18,
            pointPadding: 0.08,
         },
         variablepie: {
            borderWidth: 0,
            dataLabels: {
               enabled: true,
               style: {
                  fontSize: "11px",
                  fontWeight: "600",
                  fontFamily: FONT.chart,
                  color: "#34474e",
                  textOutline: "none",
               },
            },
         },
         area: {
            fillOpacity: 0.18,
            marker: { enabled: false, radius: 3 },
         },
         line: {
            marker: { enabled: false, radius: 3 },
            lineWidth: 2.5,
         },
      },
   };
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
   const animation = useOnceAnimation(2500);
   const options = useMemo(() => {
      const base = baseChartOptions({ height, animation });
      const seriesType = area ? "areaspline" : curved ? "spline" : "line";
      return {
         ...base,
         chart: { ...base.chart, type: seriesType },
         xAxis: { ...base.xAxis, categories: labels, crosshair: true },
         yAxis: {
            ...base.yAxis,
            gridLineWidth: showGrid ? 1 : 0,
            labels: {
               ...base.yAxis.labels,
               formatter() {
                  return valueFormat(this.value);
               },
            },
         },
         tooltip: {
            ...base.tooltip,
            shared: true,
            formatter() {
               const pts = this.points || [this];
               const head = labels[this.x] ?? this.x;
               const rows = pts
                  .map(
                     (p) =>
                        `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${valueFormat(p.y)}</b>`,
                  )
                  .join("<br/>");
               return `<span style="font-weight:600">${head}</span><br/>${rows}`;
            },
         },
      };
   }, [height, animation, labels, showGrid, valueFormat, area, curved]);

   const SeriesComp = area ? AreaSeries : LineSeries;
   const seriesType = area ? "areaspline" : curved ? "spline" : "line";

   return (
      <div className="w-full">
         <Chart options={options} containerProps={{ style: { width: "100%" } }}>
            <XAxis />
            <YAxis />
            <Tooltip />
            <Legend />
            {series.map((s, i) => (
               <SeriesComp
                  key={s.name || i}
                  name={s.name}
                  color={s.color || SERIES_COLORS[i % SERIES_COLORS.length]}
                  data={s.data || []}
                  options={{
                     type: seriesType,
                     fillOpacity: area ? 0.18 : undefined,
                  }}
               />
            ))}
         </Chart>
      </div>
   );
}

/*
|--------------------------------------------------------------------------
| Bar / Column chart (Highcharts ColumnSeries)
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
   const animation = useOnceAnimation(2600);
   const options = useMemo(() => {
      const base = baseChartOptions({ height, animation });
      const grow = animation
         ? { duration: 2600, easing: "easeOutQuart" }
         : false;
      return {
         ...base,
         chart: {
            ...base.chart,
            type: "column",
            inverted: Boolean(horizontal),
         },
         xAxis: { ...base.xAxis, categories: labels },
         yAxis: {
            ...base.yAxis,
            labels: {
               ...base.yAxis.labels,
               formatter() {
                  return valueFormat(this.value);
               },
            },
         },
         plotOptions: {
            ...base.plotOptions,
            series: {
               animation: grow,
               stacking: stacked ? "normal" : undefined,
            },
            column: {
               ...base.plotOptions.column,
               animation: grow,
            },
         },
         tooltip: {
            ...base.tooltip,
            shared: true,
            formatter() {
               const pts = this.points || [this];
               const head = this.x;
               const rows = pts
                  .map(
                     (p) =>
                        `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${valueFormat(p.y)}</b>`,
                  )
                  .join("<br/>");
               return `<span style="font-weight:600">${head}</span><br/>${rows}`;
            },
         },
      };
   }, [height, animation, labels, valueFormat, stacked, horizontal]);

   return (
      <div className="w-full">
         <Chart options={options} containerProps={{ style: { width: "100%" } }}>
            <XAxis />
            <YAxis />
            <Tooltip />
            <Legend />
            {series.map((s, i) => (
               <ColumnSeries
                  key={s.name || i}
                  name={s.name}
                  color={s.color || SERIES_COLORS[i % SERIES_COLORS.length]}
                  data={s.data || []}
                  options={{
                     stacking: stacked ? "normal" : undefined,
                  }}
               />
            ))}
         </Chart>
      </div>
   );
}

/*
|--------------------------------------------------------------------------
| Variable-radius pie (DonutChart API preserved)
|--------------------------------------------------------------------------
*/
export function DonutChart({
   data = [],
   size = 190,
   thickness = 22,
   centerLabel = "Total",
   valueFormat = formatCompact,
}) {
   const animation = useOnceAnimation(2200);
   const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
   const points = useMemo(
      () =>
         data.map((d, i) => {
            const y = Number(d.value) || 0;
            return {
               name: d.name,
               y,
               z: Math.max(y, 1),
               color: d.color || SERIES_COLORS[i % SERIES_COLORS.length],
            };
         }),
      [data],
   );

   const options = useMemo(
      () => ({
         ...baseChartOptions({ height: size + 40, animation }),
         chart: {
            ...baseChartOptions({ height: size + 40, animation }).chart,
            type: "variablepie",
            height: Math.max(size + 24, 220),
         },
         tooltip: {
            ...baseChartOptions({ height: size, animation }).tooltip,
            pointFormatter() {
               const pct = total > 0 ? ((this.y / total) * 100).toFixed(1) : "0";
               return `<span style="color:${this.color}">●</span> ${this.name}: <b>${valueFormat(this.y)}</b> (${pct}%)`;
            },
         },
         legend: {
            ...baseChartOptions({ height: size, animation }).legend,
            align: "right",
            verticalAlign: "middle",
            layout: "vertical",
         },
         plotOptions: {
            variablepie: {
               borderWidth: 2,
               borderColor: "#ffffff",
               animation: animation
                  ? { duration: 2200, easing: "easeOutQuart" }
                  : false,
               dataLabels: {
                  enabled: false,
               },
               showInLegend: true,
               size: "100%",
               innerSize: `${Math.min(70, Math.max(40, thickness + 28))}%`,
            },
         },
         title: {
            text: `<div style="text-align:center"><div style="font-family:${FONT.title};font-weight:800;font-size:1.1rem;color:#17252b">${valueFormat(total)}</div><div style="font-size:0.65rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#8b9ca1">${centerLabel}</div></div>`,
            align: "center",
            verticalAlign: "middle",
            y: 8,
            useHTML: true,
         },
      }),
      [animation, size, thickness, total, valueFormat, centerLabel],
   );

   if (!data.length) {
      return (
         <div className="flex h-[12rem] items-center justify-center text-sm text-ink-400">
            No data
         </div>
      );
   }

   return (
      <div className="w-full">
         <Chart options={options} containerProps={{ style: { width: "100%" } }}>
            <Tooltip />
            <Legend />
            <VariablePieSeries name={centerLabel} data={points} />
         </Chart>
      </div>
   );
}

/*
|--------------------------------------------------------------------------
| Progress ring / bar / sparkline (lightweight custom)
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

export default { LineChart, BarChart, DonutChart, ProgressRing, ProgressBar, Sparkline };
