import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        ja: "ja/index.html",
        ko: "ko/index.html",
        "zh-Hant": "zh-Hant/index.html",
      },
    },
  },
});
