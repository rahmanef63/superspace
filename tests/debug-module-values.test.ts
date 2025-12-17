import { describe, test } from "vitest";

describe("Debug Module Values", () => {
  test("check module structure", () => {
    const modules = {
      ...import.meta.glob("../convex/workspace/workspaces.ts", { eager: true }),
    };


    for (const [path, value] of Object.entries(modules)) {


      // Check if it has expected exports
      if (typeof value === "object") {
        const exports = Object.keys(value);


        // Check each export
        for (const exp of exports) {
          const exportedValue = (value as any)[exp];

        }
      }
    }

  });
});
