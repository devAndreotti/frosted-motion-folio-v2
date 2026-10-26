import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import os from "node:os";
import { blogPlugin } from "./vite-plugins/blog";

export default defineConfig({
  plugins: [react(), blogPlugin()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(import.meta.dirname, "./src") },
      // only exists inside workerd; worker/smtp.js is tested with its own fake connection
      { find: "cloudflare:sockets", replacement: path.resolve(import.meta.dirname, "./worker/test-stubs/sockets.js") },
    ],
  },
  test: {
    pool: "forks",
    maxWorkers: Math.max(2, os.availableParallelism?.() ?? 2),
    maxConcurrency: 5,
    testTimeout: 15000,
    hookTimeout: 15000,
    exclude: [...configDefaults.exclude, "tests/**", ".claude/**"],
    projects: [
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["src/data/**", "src/styles/**"],
          testTimeout: 15000,
          hookTimeout: 15000,
        },
      },
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          globals: true,
          include: [
            "src/data/**/*.test.ts",
            "src/styles/**/*.test.ts",
            "worker/**/*.test.{js,mjs,ts}",
            "scripts/**/*.test.{js,mjs,ts}",
            "vite-plugins/**/*.test.ts",
          ],
          testTimeout: 10000,
          hookTimeout: 10000,
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/vite-env.d.ts"],
    },
  },
});
