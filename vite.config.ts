import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages 部署在 /<repo>/ 子路径下；本地开发用根路径。
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/vcc2026-dossier/" : "/",
  plugins: [react()],
});
