import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userPrivacySettings = defineTable({
  userId: v.id("users"),
  isVisible: v.boolean(),
  allowDirectMessages: v.boolean(),
  allowFriendRequests: v.boolean(),
  visibilityMode: v.union(
    v.literal("everyone"),
    v.literal("workspaces_only"),
    v.literal("custom"),
  ),
  hiddenFromUsers: v.array(v.id("users")),
  hiddenFromWorkspaces: v.array(v.id("workspaces")),
  visibleToUsers: v.array(v.id("users")),
  visibleToWorkspaces: v.array(v.id("workspaces")),
}).index("by_user", ["userId"]);

export const organizations = defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  logo: v.optional(v.string()),
  website: v.optional(v.string()),
  isPublic: v.boolean(),
  settings: v.optional(
    v.object({
      allowPublicWorkspaces: v.boolean(),
      requireApproval: v.boolean(),
      defaultRole: v.string(),
    }),
  ),
  createdBy: v.id("users"),
})
  .index("by_slug", ["slug"])
  .index("by_creator", ["createdBy"]);

export const organizationMemberships = defineTable({
  organizationId: v.id("organizations"),
  userId: v.id("users"),
  role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  status: v.union(
    v.literal("active"),
    v.literal("inactive"),
    v.literal("pending"),
  ),
  joinedAt: v.number(),
  invitedBy: v.optional(v.id("users")),
})
  .index("by_organization", ["organizationId"])
  .index("by_user", ["userId"])
  .index("by_user_organization", ["userId", "organizationId"]);

export const workspaces = defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  type: v.union(
    v.literal("organization"),
    v.literal("institution"),
    v.literal("group"),
    v.literal("family"),
    v.literal("personal"),
  ),
  organizationId: v.optional(v.id("organizations")),
  logo: v.optional(v.string()),
  isPublic: v.boolean(),
  
  // === Nested Workspace Hierarchy Fields ===
  // Parent workspace for hierarchy (null = root level)
  parentWorkspaceId: v.optional(v.id("workspaces")),
  // True if this is the user's main/hub workspace (one per user)
  isMainWorkspace: v.optional(v.boolean()),
  // Display color for sidebar menu differentiation (hex color)
  color: v.optional(v.string()),
  // Hierarchy depth (0 = root/main, 1 = first child, etc.)
  depth: v.optional(v.number()),
  // Materialized path for efficient ancestor/descendant queries
  path: v.optional(v.array(v.id("workspaces"))),
  // Whether this workspace shares data (knowledge, activity) to parent workspace
  shareDataToParent: v.optional(v.boolean()),
  
  settings: v.optional(
    v.object({
      allowInvites: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      defaultRoleId: v.optional(v.id("roles")),
      allowPublicDocuments: v.optional(v.boolean()),
      theme: v.optional(v.string()),
      // Bundle configuration
      bundleId: v.optional(v.string()),
      enabledFeatures: v.optional(v.array(v.string())),
      // Main workspace specific: restrict invitations
      allowGuestOnly: v.optional(v.boolean()),
      // Guest access duration in milliseconds (for time-limited access)
      guestAccessDuration: v.optional(v.number()),
    }),
  ),
  createdBy: v.id("users"),
})
  .index("by_slug", ["slug"])
  .index("by_organization", ["organizationId"])
  .index("by_creator", ["createdBy"])
  .index("by_type", ["type"])
  // New indexes for hierarchy
  .index("by_parent", ["parentWorkspaceId"])
  .index("by_main", ["isMainWorkspace"])
  .index("by_creator_main", ["createdBy", "isMainWorkspace"])
  .index("by_depth", ["depth"]);

export const roles = defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  workspaceId: v.id("workspaces"),
  permissions: v.array(v.string()),
  color: v.optional(v.string()),
  isDefault: v.boolean(),
  isSystemRole: v.optional(v.boolean()),
  level: v.optional(v.number()),
  icon: v.optional(v.string()),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_slug", ["workspaceId", "slug"])
  .index("by_level", ["workspaceId", "level"]);

export const workspaceMemberships = defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.id("users"),
  roleId: v.id("roles"),
  status: v.union(
    v.literal("active"),
    v.literal("inactive"),
    v.literal("pending"),
  ),
  roleLevel: v.optional(v.number()),
  additionalPermissions: v.array(v.string()),
  joinedAt: v.number(),
  invitedBy: v.optional(v.id("users")),
  lastActiveAt: v.optional(v.number()),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_user", ["userId"])
  .index("by_user_workspace", ["userId", "workspaceId"])
  .index("by_role", ["roleId"]);

export const invitations = defineTable({
  type: v.union(v.literal("workspace"), v.literal("personal")),
  workspaceId: v.optional(v.id("workspaces")),
  inviterId: v.id("users"),
  inviteeEmail: v.string(),
  inviteeId: v.optional(v.id("users")),
  roleId: v.optional(v.id("roles")),
  status: v.union(
    v.literal("pending"),
    v.literal("accepted"),
    v.literal("declined"),
    v.literal("expired"),
  ),
  message: v.optional(v.string()),
  expiresAt: v.number(),
  acceptedAt: v.optional(v.number()),
  token: v.string(),
})
  .index("by_inviter", ["inviterId"])
  .index("by_invitee_email", ["inviteeEmail"])
  .index("by_invitee_id", ["inviteeId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_token", ["token"])
  .index("by_status", ["status"]);

/**
 * Workspace Links - Junction table for linking workspaces as children
 * This allows a workspace to appear in multiple users' hierarchies
 * without duplicating the workspace itself.
 * 
 * Example: Company A workspace can be linked as a child of:
 * - User 1's "Works" workspace
 * - User 2's "Freelance" workspace
 */
export const workspaceLinks = defineTable({
  // The parent workspace that contains the link
  parentWorkspaceId: v.id("workspaces"),
  // The child workspace being linked
  childWorkspaceId: v.id("workspaces"),
  // User who created this link
  linkedBy: v.id("users"),
  // Display order within parent
  sortOrder: v.optional(v.number()),
  // Optional custom display name for this link
  displayName: v.optional(v.string()),
  // Optional custom color override for this link
  colorOverride: v.optional(v.string()),
  // When the link was created
  linkedAt: v.number(),
})
  .index("by_parent", ["parentWorkspaceId"])
  .index("by_child", ["childWorkspaceId"])
  .index("by_parent_child", ["parentWorkspaceId", "childWorkspaceId"])
  .index("by_linked_by", ["linkedBy"]);

export const coreTables = {
  userPrivacySettings,
  organizations,
  organizationMemberships,
  workspaces,
  workspaceLinks,
  roles,
  workspaceMemberships,
  invitations,
};
