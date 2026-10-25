import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { boneyardPlugin } from "boneyard-js/vite";
import { buildBootPalette } from "./src/lib/bootPalette";
import { blogPlugin } from "./vite-plugins/blog";
import { projectsPlugin } from "./vite-plugins/projects";
import { cspPlugin } from "./vite-plugins/csp";

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
    blogPlugin(),
    projectsPlugin(),
    cspPlugin(),
    mode === "development" && boneyardPlugin(),
  ].filter(Boolean),
  // three.js is only reached through the 3D laptop's dynamic import; pre-bundling it keeps the dev server from
  // discovering it mid-session and reloading the page (which broke the axe run on the home page)
  optimizeDeps: {
    // only the site's own page: other .html files in the repo (the 3D laptop's QA viewer) are not app entries
    entries: ["index.html"],
    include: [
      "three",
      "three/examples/jsm/loaders/GLTFLoader.js",
      "three/examples/jsm/libs/meshopt_decoder.module.js",
      "three/examples/jsm/controls/OrbitControls.js",
      "three/examples/jsm/environments/RoomEnvironment.js",
      "three/examples/jsm/renderers/CSS3DRenderer.js",
      "three/examples/jsm/postprocessing/EffectComposer.js",
      "three/examples/jsm/postprocessing/RenderPass.js",
      "three/examples/jsm/postprocessing/UnrealBloomPass.js",
      "three/examples/jsm/postprocessing/OutputPass.js",
      "three/examples/jsm/postprocessing/ShaderPass.js",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
