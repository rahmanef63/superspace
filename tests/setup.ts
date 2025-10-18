import { vi } from "vitest"

// Mock convex.config.ts to prevent component loading errors in tests
// Components like presence and prosemirrorSync only work in Convex runtime
vi.mock("../convex/convex.config", () => {
  // Return a mock app object that matches the defineApp interface
  const mockApp = {
    use: vi.fn(),
  }
  return {
    default: mockApp,
  }
})
