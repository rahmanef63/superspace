/**
 * Vitest Configuration for JSDOM Environment
 * 
 * This configuration is specifically for tests that require jsdom environment
 * instead of happy-dom. This is needed for:
 * 
 * - Radix UI components (DropdownMenu, Dialog, AlertDialog, Popover)
 * - Components using React Portals
 * - Tests that need more complete DOM API support
 * 
 * Usage:
 *   npx vitest run --config vitest.config.jsdom.ts
 *   npx vitest run --config vitest.config.jsdom.ts --testNamePattern "PropertyMenu"
 */

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // Use jsdom for better Radix UI compatibility
    setupFiles: ["./tests/setup.ts", "./tests/setup-react.ts"],
    include: [
      // Specifically include tests that need jsdom
      "frontend/**/PropertyMenu/**/*.test.{ts,tsx}",
      "frontend/**/dialogs/**/*.test.{ts,tsx}",
      // Can add more patterns as needed
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "scripts/",
        ".next/",
        "convex/_generated/",
      ],
    },
    server: {
      deps: {
        inline: ["convex-test"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/convex": path.resolve(__dirname, "./convex"),
      "@convex": path.resolve(__dirname, "./convex"),
      "@convex/_generated": path.resolve(__dirname, "./convex/_generated"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
});
