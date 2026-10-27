import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

declare const process: { env: { PAGES_BASE?: string } };

const dafYomiProxy = {
  "/api/daf-yomi": {
    target: "https://www.shas.org",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/daf-yomi/, "/daf-yomi-api/"),
  },
};

export default defineConfig(({ command }) => ({
  // GitHub Pages serves the site from /<repo>/. Local dev and preview stay at /.
  base: command === "build" && process.env.PAGES_BASE ? process.env.PAGES_BASE : "/",
  plugins: [react(), tailwindcss()],
  server: { proxy: dafYomiProxy },
  preview: { proxy: dafYomiProxy },
}));
