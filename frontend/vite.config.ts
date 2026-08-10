import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import wails from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  // Wails may serve the embedded frontend from a custom origin. Keeping all
  // generated assets relative also lets lazy PDF workers and Office fixtures
  // resolve beside the bundled entry instead of assuming an HTTP root.
  base: "./",
  server: {
    host: "127.0.0.1",
    allowedHosts: ["terminal.local"],
    port: Number(process.env.WAILS_VITE_PORT) || 9245,
    strictPort: true,
  },
  plugins: [react(), tailwindcss(), wails("./bindings")],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
