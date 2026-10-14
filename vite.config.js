import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
   plugins: [react(), tailwindcss()],
   optimizeDeps: {
      include: ["highcharts", "highcharts/modules/variable-pie", "@highcharts/react"],
   },
   build: {
      rollupOptions: {
         output: {
            manualChunks(id) {
               if (id.includes("node_modules/highcharts") || id.includes("node_modules/@highcharts")) {
                  return "highcharts";
               }
            },
         },
      },
   },
});
