import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { boneyardPlugin } from "boneyard-js/vite";
import { buildBootPalette } from "./src/lib/bootPalette";

// Inlines the hue x mode palette into the boot loader script in index.html,
// so the loader paints in the visitor's saved colors before any bundle loads.
const bootPalette = (): Plugin => ({
  name: "boot-palette",
  transformIndexHtml: (html) => html.replace("/*__BOOT_PALETTE__*/ null", JSON.stringify(buildBootPalette())),
});

export default defineConfig(({ mode }) => ({
  base: "/frosted-motion-folio-v2/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    bootPalette(),
    mode === "development" && boneyardPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
