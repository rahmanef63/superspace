import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define the admin users table
const adminUsers = defineTable({
  // Clerk user ID
  clerkId: v.string(),
  email: v.string(),
  name: v.string(),
  // Role level (0-Owner, 10-Admin, 30-Manager, 50-Staff, 70-Client, 90-Guest)
  roleLevel: v.number(),
  // Array of permission strings
  permissions: v.array(v.string()),
  // Status (active, inactive, suspended)
  status: v.string(),
  lastLoginAt: v.optional(v.union(v.number(), v.null())),
  // Workspace access
  workspaceIds: v.array(v.string()),
  // Metadata
  createdBy: v.optional(v.union(v.string(), v.null())),
  updatedBy: v.optional(v.union(v.string(), v.null())),
})
  .index("by_clerk_id", ["clerkId"])
  .index("by_email", ["email"])
  .index("by_workspace_ids", ["workspaceIds"]) // Fixed plural form
  .index("by_role_level", ["roleLevel"]);

// Define the roles table
const roles = defineTable({
  name: v.string(),
  // `slug` used to identify system roles (owner/admin/etc). Make optional to
  // tolerate legacy documents that predate this field. System code should
  // normalize or populate missing slugs when creating/updating roles.
  slug: v.optional(v.string()),
  description: v.optional(v.union(v.string(), v.null())),
  workspaceId: v.id("workspaces"),
  // Role level (0-Owner to 90-Guest)
  level: v.optional(v.number()),
  // Base permissions for this role
  permissions: v.array(v.string()),
  color: v.optional(v.string()),
  isDefault: v.boolean(),
  // Whether this is a system-defined role that cannot be modified
  isSystemRole: v.optional(v.boolean()),
  // Legacy field retained for compatibility
  isSystem: v.optional(v.boolean()),
  icon: v.optional(v.string()),
  // Metadata
  createdBy: v.optional(v.union(v.id("users"), v.null())),
  updatedBy: v.optional(v.union(v.id("users"), v.null())),
})
  .index("by_level", ["level"])
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_slug", ["workspaceId", "slug"]);

// Define the workspace memberships table
const workspaceMemberships = defineTable({
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  roleId: v.id("roles"),
  // Role assignment level retained for analytics
  roleLevel: v.optional(v.number()),
  additionalPermissions: v.array(v.string()),
  status: v.string(),
  joinedAt: v.number(),
  invitedBy: v.optional(v.id("users")),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
})
  .index("by_user", ["userId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_user", ["workspaceId", "userId"])
  .index("by_user_workspace", ["userId", "workspaceId"])
  .index("by_status", ["status"])
  .index("by_role", ["roleId"]);

// Export all tables
export const tables = {
  adminUsers,
  roles,
  workspaceMemberships,
} as const;
