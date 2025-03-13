import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
//@ts-ignore
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "src/prompts/*.txt",
          dest: "prompts", // Copies to dist/prompts/
        },
      ],
    }),
  ],
  base: "./", // 👈 This ensures assets are referenced relatively for Chrome Extensions
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      //@ts-ignore
      input: path.resolve(__dirname, "index.html"),
    },
  },
});
