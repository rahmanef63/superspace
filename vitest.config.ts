import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // Node.js environment for Convex backend tests
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      // Skip tests that import UI components (they fail due to Radix UI/react-remove-scroll in Node.js)
      "tests/shared/grouping.test.ts",
      "tests/shared/import-validation.test.ts",
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
