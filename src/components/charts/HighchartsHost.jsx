import { useEffect, useRef } from "react";
import Highcharts from "highcharts";
import "highcharts/modules/variable-pie";

/**
 * Imperative Highcharts host — avoids @highcharts/react + Vite prebundle
 * "Class extends value undefined is not a constructor or null" crashes on series modules.
 */
export default function HighchartsHost({ options, style }) {
   const containerRef = useRef(null);
   const chartRef = useRef(null);

   useEffect(() => {
      if (!containerRef.current || !options) return;

      if (chartRef.current) {
         chartRef.current.update(options, true, true);
      } else {
         chartRef.current = Highcharts.chart(containerRef.current, options);
      }
   }, [options]);

   useEffect(() => {
      return () => {
         if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
         }
      };
   }, []);

   return <div ref={containerRef} style={{ width: "100%", ...style }} />;
}
