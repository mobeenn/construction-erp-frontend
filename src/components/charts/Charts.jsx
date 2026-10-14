import { useEffect, useMemo, useRef } from "react";
import Highcharts from "highcharts";
import "highcharts/modules/variable-pie";
import { Chart, setHighcharts } from "@highcharts/react";
import { SERIES_COLORS, formatCompact, formatCurrency } from "../../utils/format";
import { ProgressBar, ProgressRing, Sparkline } from "./ChartPrimitives";

/* Prefer `utils/format` for new code; re-exports keep existing chart import paths working. */
/* eslint-disable react-refresh/only-export-components */
export { SERIES_COLORS, formatCompact, formatCurrency };
export { ProgressBar, ProgressRing, Sparkline };
/* eslint-enable react-refresh/only-export-components */

// Bind one Highcharts instance for the whole app (avoids production class-extends crashes)
setHighcharts(Highcharts);

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
            borderWidth: 2,
            borderColor: "#ffffff",
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
| Line / Area chart (options-only — no Series class children)
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
   const seriesType = area ? "areaspline" : curved ? "spline" : "line";

   const options = useMemo(() => {
      const base = baseChartOptions({ height, animation });
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
         series: series.map((s, i) => ({
            type: seriesType,
            name: s.name,
            color: s.color || SERIES_COLORS[i % SERIES_COLORS.length],
            data: s.data || [],
            fillOpacity: area ? 0.18 : undefined,
         })),
      };
   }, [height, animation, labels, showGrid, valueFormat, area, seriesType, series]);

   return (
      <div className="w-full">
         <Chart options={options} containerProps={{ style: { width: "100%" } }} />
      </div>
   );
}

/*
|--------------------------------------------------------------------------
| Bar / Column chart
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
         series: series.map((s, i) => ({
            type: "column",
            name: s.name,
            color: s.color || SERIES_COLORS[i % SERIES_COLORS.length],
            data: s.data || [],
            stacking: stacked ? "normal" : undefined,
         })),
      };
   }, [height, animation, labels, valueFormat, stacked, horizontal, series]);

   return (
      <div className="w-full">
         <Chart options={options} containerProps={{ style: { width: "100%" } }} />
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

   const options = useMemo(() => {
      const base = baseChartOptions({ height: Math.max(size + 24, 220), animation });
      return {
         ...base,
         chart: {
            ...base.chart,
            type: "variablepie",
            height: Math.max(size + 24, 220),
         },
         tooltip: {
            ...base.tooltip,
            pointFormatter() {
               const pct = total > 0 ? ((this.y / total) * 100).toFixed(1) : "0";
               return `<span style="color:${this.color}">●</span> ${this.name}: <b>${valueFormat(this.y)}</b> (${pct}%)`;
            },
         },
         legend: {
            ...base.legend,
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
               dataLabels: { enabled: false },
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
         series: [
            {
               type: "variablepie",
               name: centerLabel,
               data: points,
            },
         ],
      };
   }, [animation, size, thickness, total, valueFormat, centerLabel, points]);

   if (!data.length) {
      return (
         <div className="flex h-[12rem] items-center justify-center text-sm text-ink-400">
            No data
         </div>
      );
   }

   return (
      <div className="w-full">
         <Chart options={options} containerProps={{ style: { width: "100%" } }} />
      </div>
   );
}

export default { LineChart, BarChart, DonutChart, ProgressRing, ProgressBar, Sparkline };
