import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { boneyardPlugin } from "boneyard-js/vite";

export default defineConfig(({ mode }) => ({
  base: '/frosted-motion-folio-v2/', // <-- ESSA LINHA É FUNDAMENTAL
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'development' && boneyardPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
