/**
 * User & Identity Schema
 *
 * Provides tables for comprehensive user identity management including:
 * - User Preferences: Theme, language, timezone, UI settings
 * - Notification Preferences: Email, push, in-app notification settings
 * - Workspace Profiles: Per-workspace display name, title, bio
 * - Login History: Track login attempts for security auditing
 * - User Devices: Registered devices for security
 * - User Sessions: Active session tracking
 * - Access Tokens: API keys for integrations
 * - Impersonation Logs: Admin impersonation audit trail
 * - Account Deletion Requests: GDPR-compliant deletion workflow
 *
 * @module convex/user/schema
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

// ============================================================================
// USER PREFERENCES
// ============================================================================

/**
 * User Preferences - Global user settings
 * Theme, language, timezone, and UI preferences
 */
export const userPreferences = defineTable({
  userId: v.id("users"),
  // Appearance
  theme: v.optional(
    v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
  ),
  // Localization
  language: v.optional(v.string()),
  timezone: v.optional(v.string()),
  dateFormat: v.optional(v.string()),
  timeFormat: v.optional(v.union(v.literal("12h"), v.literal("24h"))),
  startOfWeek: v.optional(
    v.union(v.literal("sunday"), v.literal("monday"), v.literal("saturday"))
  ),
  // UI Settings
  compactMode: v.optional(v.boolean()),
  sidebarCollapsed: v.optional(v.boolean()),
  keyboardShortcuts: v.optional(v.boolean()),
  reducedMotion: v.optional(v.boolean()),
  // Metadata
  updatedAt: v.optional(v.number()),
})
  .index("by_user", ["userId"]);

/**
 * Notification Preferences - Per-user notification settings
 */
export const notificationPreferences = defineTable({
  userId: v.id("users"),
  // Global toggles
  emailNotifications: v.optional(v.boolean()),
  pushNotifications: v.optional(v.boolean()),
  inAppNotifications: v.optional(v.boolean()),
  // Digest settings
  digestFrequency: v.optional(
    v.union(
      v.literal("instant"),
      v.literal("hourly"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("never")
    )
  ),
  // Channel-specific settings
  channels: v.optional(
    v.object({
      mentions: v.optional(v.boolean()),
      comments: v.optional(v.boolean()),
      assignments: v.optional(v.boolean()),
      statusChanges: v.optional(v.boolean()),
      deadlines: v.optional(v.boolean()),
      announcements: v.optional(v.boolean()),
      directMessages: v.optional(v.boolean()),
      teamUpdates: v.optional(v.boolean()),
    })
  ),
  // Quiet hours (Do Not Disturb)
  quietHours: v.optional(
    v.object({
      enabled: v.optional(v.boolean()),
      start: v.optional(v.string()), // "22:00"
      end: v.optional(v.string()), // "08:00"
      timezone: v.optional(v.string()),
    })
  ),
  // Metadata
  updatedAt: v.optional(v.number()),
})
  .index("by_user", ["userId"]);

// ============================================================================
// WORKSPACE PROFILES
// ============================================================================

/**
 * Workspace Profiles - Per-workspace user profiles
 * Allows different display names, titles, etc. per workspace
 */
export const workspaceProfiles = defineTable({
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  displayName: v.optional(v.string()),
  title: v.optional(v.string()),
  department: v.optional(v.string()),
  avatarOverride: v.optional(v.string()),
  bio: v.optional(v.string()),
  isPublic: v.optional(v.boolean()),
  // Metadata
  updatedAt: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_user_workspace", ["userId", "workspaceId"]);

// ============================================================================
// SECURITY & SESSION TRACKING
// ============================================================================

/**
 * Login History - Track login attempts for security
 */
export const loginHistory = defineTable({
  userId: v.id("users"),
  timestamp: v.number(),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  location: v.optional(
    v.object({
      city: v.optional(v.string()),
      country: v.optional(v.string()),
      countryCode: v.optional(v.string()),
    })
  ),
  method: v.union(
    v.literal("password"),
    v.literal("oauth"),
    v.literal("magic_link"),
    v.literal("passkey"),
    v.literal("sso")
  ),
  provider: v.optional(v.string()), // "google", "github", etc.
  success: v.boolean(),
  failureReason: v.optional(v.string()),
})
  .index("by_user", ["userId"])
  .index("by_user_timestamp", ["userId", "timestamp"])
  .index("by_timestamp", ["timestamp"]);

/**
 * User Devices - Registered/known devices
 */
export const userDevices = defineTable({
  userId: v.id("users"),
  deviceId: v.string(),
  deviceName: v.optional(v.string()),
  deviceType: v.union(
    v.literal("desktop"),
    v.literal("mobile"),
    v.literal("tablet"),
    v.literal("unknown")
  ),
  browser: v.optional(v.string()),
  os: v.optional(v.string()),
  lastSeenAt: v.number(),
  firstSeenAt: v.number(),
  isTrusted: v.optional(v.boolean()),
  ipAddress: v.optional(v.string()),
})
  .index("by_user", ["userId"])
  .index("by_device_id", ["deviceId"])
  .index("by_user_device", ["userId", "deviceId"]);

// ============================================================================
// ACCESS TOKENS
// ============================================================================

/**
 * Access Tokens - API keys for integrations
 */
export const accessTokens = defineTable({
  userId: v.id("users"),
  workspaceId: v.optional(v.id("workspaces")),
  name: v.string(),
  tokenHash: v.string(), // Hashed token (never store plain)
  tokenPrefix: v.string(), // First 8 chars for identification
  scopes: v.array(v.string()), // ["read:users", "write:projects"]
  expiresAt: v.optional(v.number()),
  lastUsedAt: v.optional(v.number()),
  createdAt: v.number(),
  revokedAt: v.optional(v.number()),
  isActive: v.boolean(),
})
  .index("by_user", ["userId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_token_prefix", ["tokenPrefix"])
  .index("by_active", ["isActive"]);

// ============================================================================
// ADMIN FEATURES
// ============================================================================

/**
 * Impersonation Logs - Admin impersonation audit trail
 */
export const impersonationLogs = defineTable({
  adminId: v.id("users"),
  targetUserId: v.id("users"),
  workspaceId: v.optional(v.id("workspaces")),
  startedAt: v.number(),
  endedAt: v.optional(v.number()),
  reason: v.string(),
  actions: v.optional(
    v.array(
      v.object({
        action: v.string(),
        timestamp: v.number(),
        details: v.optional(v.any()),
      })
    )
  ),
})
  .index("by_admin", ["adminId"])
  .index("by_target", ["targetUserId"])
  .index("by_started_at", ["startedAt"]);

/**
 * User Status History - Track status changes (suspend/reactivate/block)
 */
export const userStatusHistory = defineTable({
  userId: v.id("users"),
  previousStatus: v.string(),
  newStatus: v.string(),
  changedBy: v.id("users"),
  reason: v.optional(v.string()),
  changedAt: v.number(),
  expiresAt: v.optional(v.number()), // For temporary suspensions
})
  .index("by_user", ["userId"])
  .index("by_changed_at", ["changedAt"]);

// ============================================================================
// ACCOUNT LIFECYCLE
// ============================================================================

/**
 * Account Deletion Requests - GDPR-compliant deletion workflow
 */
export const accountDeletionRequests = defineTable({
  userId: v.id("users"),
  status: v.union(
    v.literal("requested"),
    v.literal("confirmed"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("cancelled")
  ),
  requestedAt: v.number(),
  confirmToken: v.optional(v.string()),
  confirmedAt: v.optional(v.number()),
  scheduledDeletionAt: v.optional(v.number()), // 30 days grace period
  completedAt: v.optional(v.number()),
  cancelledAt: v.optional(v.number()),
  exportRequested: v.optional(v.boolean()),
  exportUrl: v.optional(v.string()),
  exportExpiresAt: v.optional(v.number()),
  reason: v.optional(v.string()),
})
  .index("by_user", ["userId"])
  .index("by_status", ["status"])
  .index("by_scheduled_deletion", ["scheduledDeletionAt"]);

/**
 * Account Merge Requests - Merge duplicate accounts
 */
export const accountMergeRequests = defineTable({
  primaryUserId: v.id("users"),
  secondaryUserId: v.id("users"),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("completed"),
    v.literal("cancelled")
  ),
  requestedAt: v.number(),
  requestedBy: v.id("users"),
  reviewedAt: v.optional(v.number()),
  reviewedBy: v.optional(v.id("users")),
  completedAt: v.optional(v.number()),
  reason: v.optional(v.string()),
  mergeOptions: v.optional(
    v.object({
      keepPrimaryProfile: v.optional(v.boolean()),
      mergeWorkspaces: v.optional(v.boolean()),
      transferOwnership: v.optional(v.boolean()),
    })
  ),
})
  .index("by_primary", ["primaryUserId"])
  .index("by_secondary", ["secondaryUserId"])
  .index("by_status", ["status"]);

// ============================================================================
// EXPORT
// ============================================================================

export const userIdentityTables = {
  userPreferences,
  notificationPreferences,
  workspaceProfiles,
  loginHistory,
  userDevices,
  accessTokens,
  impersonationLogs,
  userStatusHistory,
  accountDeletionRequests,
  accountMergeRequests,
} as const;
