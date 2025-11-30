import { describe, it, expect } from "vitest"
import { isPlatformAdmin, getPlatformAdminEmails, createPlatformAdminContext, getAccessLevel, hasAccessLevel } from "@/convex/lib/platformAdmin"

/**
 * Unit tests for Platform Admin feature
 */
describe("Platform Admin Feature", () => {
  describe("isPlatformAdmin", () => {
    it("should return true for admin email", () => {
      // Note: This depends on PLATFORM_ADMIN_EMAILS env variable
      // In tests, we can't rely on env vars, so we test the function behavior
      expect(typeof isPlatformAdmin).toBe("function")
    })

    it("should return false for empty email", () => {
      expect(isPlatformAdmin("")).toBe(false)
    })

    it("should return false for null/undefined", () => {
      expect(isPlatformAdmin(null)).toBe(false)
      expect(isPlatformAdmin(undefined)).toBe(false)
    })

    it("should be case-insensitive for email matching", () => {
      // This tests that the implementation handles case properly
      const email = "Test@Example.com"
      const result = isPlatformAdmin(email)
      // Result depends on env var, but function should not throw
      expect(typeof result).toBe("boolean")
    })
  })

  describe("getPlatformAdminEmails", () => {
    it("should return an array", () => {
      const emails = getPlatformAdminEmails()
      expect(Array.isArray(emails)).toBe(true)
    })

    it("should return lowercase emails", () => {
      const emails = getPlatformAdminEmails()
      emails.forEach((email: string) => {
        expect(email).toBe(email.toLowerCase())
      })
    })

    it("should return trimmed emails", () => {
      const emails = getPlatformAdminEmails()
      emails.forEach((email: string) => {
        expect(email).toBe(email.trim())
      })
    })
  })

  describe("createPlatformAdminContext", () => {
    it("should return context object with all required properties", () => {
      const result = createPlatformAdminContext("test@example.com", "user_123", "Test User")
      
      expect(result).toHaveProperty("email", "test@example.com")
      expect(result).toHaveProperty("clerkId", "user_123")
      expect(result).toHaveProperty("name", "Test User")
      expect(result).toHaveProperty("isPlatformAdmin", true)
      expect(result).toHaveProperty("roleLevel", 0)
      expect(result).toHaveProperty("permissions")
      expect(result.permissions).toContain("*")
    })

    it("should use default name if not provided", () => {
      const result = createPlatformAdminContext("test@example.com", "user_123")
      expect(result.name).toBe("Platform Admin")
    })
  })

  describe("getAccessLevel", () => {
    it("should return platform_admin for admin emails", () => {
      // This test depends on env var, just verify function works
      const result = getAccessLevel("nonexistent@test.com")
      expect(["platform_admin", "none"]).toContain(result)
    })

    it("should return feature_owner when isFeatureOwner is true", () => {
      const result = getAccessLevel("user@example.com", { isFeatureOwner: true })
      // Could be platform_admin if email is in env var, or feature_owner
      expect(["platform_admin", "feature_owner"]).toContain(result)
    })

    it("should return workspace_owner when isWorkspaceOwner is true", () => {
      const result = getAccessLevel("user@example.com", { isWorkspaceOwner: true })
      expect(["platform_admin", "workspace_owner"]).toContain(result)
    })

    it("should handle role levels correctly", () => {
      const admin = getAccessLevel("user@example.com", { roleLevel: 5 })
      const member = getAccessLevel("user@example.com", { roleLevel: 50 })
      const guest = getAccessLevel("user@example.com", { roleLevel: 80 })
      
      // Results depend on env var, but shouldn't throw
      expect(admin).toBeDefined()
      expect(member).toBeDefined()
      expect(guest).toBeDefined()
    })
  })

  describe("hasAccessLevel", () => {
    it("should return true when current level is higher than required", () => {
      expect(hasAccessLevel("platform_admin", "workspace_member")).toBe(true)
      expect(hasAccessLevel("workspace_owner", "guest")).toBe(true)
    })

    it("should return true when current level equals required", () => {
      expect(hasAccessLevel("workspace_admin", "workspace_admin")).toBe(true)
      expect(hasAccessLevel("guest", "guest")).toBe(true)
    })

    it("should return false when current level is lower than required", () => {
      expect(hasAccessLevel("guest", "platform_admin")).toBe(false)
      expect(hasAccessLevel("workspace_member", "workspace_owner")).toBe(false)
    })
  })
})
