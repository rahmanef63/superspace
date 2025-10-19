import { describe, it, expect, beforeEach } from "vitest"
import { convexTest } from "convex-test"
import schema from "@/convex/schema"
import { api } from "@/convex/_generated/api"

/**
 * Calendar Integration Tests
 */

describe("calendar Integration", () => {
  let t: any

  beforeEach(async () => {
    // NOTE: Do NOT use { eager: true } - convex-test expects lazy-loaded modules
    t = convexTest(schema, import.meta.glob([
      "../../../convex/auth/auth.ts",
      "../../../convex/components/**/*.ts",
      "../../../convex/features/**/*.ts",
      "../../../convex/menu/**/!(utils|*[Tt]ypes|helpers).ts",
      "../../../convex/payment/**/!(utils|*[Tt]ypes|helpers).ts",
      "../../../convex/user/**/*.ts",
      "../../../convex/workspace/**/*.ts",
      "../../../convex/_generated/**/*.js",
    ]))
  })

  it("should create a new item", async () => {
    // TODO: Implement integration test
    expect(true).toBe(true)
  })

  // TODO: Add more integration tests
})
