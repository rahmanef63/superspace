import { describe, test } from "vitest";

describe("Debug Workspace Module Loading", () => {
  test("should list all loaded modules", () => {
    const modules = {
      ...import.meta.glob("../convex/**/*.ts", { eager: true }),
      ...import.meta.glob("../convex/_generated/**/*.js", { eager: true }),
    };


    for (const [path, mod] of Object.entries(modules)) {
      const exports = Object.keys(mod as any);
      const isFunction = typeof mod === "function";
      const isObject = typeof mod === "object";
      const hasDefault = "default" in (mod as any);


    }

  });
});
