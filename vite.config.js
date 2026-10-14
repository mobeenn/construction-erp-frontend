import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
   plugins: [react(), tailwindcss()],
   optimizeDeps: {
      // Keep Highcharts as a single graph — splitting series modules causes
      // "Class extends value undefined is not a constructor or null" in Vite.
      include: ["highcharts", "highcharts/modules/variable-pie"],
   },
   build: {
      rollupOptions: {
         output: {
            manualChunks(id) {
               if (id.includes("node_modules/highcharts")) {
                  return "highcharts";
               }
            },
         },
      },
   },
});
