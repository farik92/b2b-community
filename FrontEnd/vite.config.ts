import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import singlePlugin from "vite-plugin-css-injected-by-js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    singlePlugin({ useStrictCSP: true, relativeCSSInjection: false }),
  ],
  build: {
    rollupOptions: {
      // external: ["react", "react-dom"],
      output: {
        // globals: { react: "React", "react-dom": "ReactDOM" },
        format: "umd",
        entryFileNames: "index.js",
        manualChunks: undefined,
      },
    },
  },
});
