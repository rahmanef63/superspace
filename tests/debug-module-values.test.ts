import { describe, test } from "vitest";

describe("Debug Module Values", () => {
  test("check module structure", () => {
    const modules = {
      ...import.meta.glob("../convex/workspace/workspaces.ts", { eager: true }),
    };

    console.log("\n=== CHECKING MODULE STRUCTURE ===");
    for (const [path, value] of Object.entries(modules)) {
      console.log(`Path: ${path}`);
      console.log(`Value type: ${typeof value}`);
      console.log(`Value is function: ${typeof value === "function"}`);
      console.log(`Value:`, value);

      // Check if it has expected exports
      if (typeof value === "object") {
        const exports = Object.keys(value);
        console.log(`Exports: ${exports.join(", ")}`);

        // Check each export
        for (const exp of exports) {
          const exportedValue = (value as any)[exp];
          console.log(`  - ${exp}: ${typeof exportedValue}`);
        }
      }
    }
    console.log("=== END ===\n");
  });
});
