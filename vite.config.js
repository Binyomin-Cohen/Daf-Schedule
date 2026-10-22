import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dafYomiProxy = {
  "/api/daf-yomi": {
    target: "https://www.shas.org",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/daf-yomi/, "/daf-yomi-api/"),
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: dafYomiProxy },
  preview: { proxy: dafYomiProxy },
});
