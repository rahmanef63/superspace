import { defineTable } from "convex/server";
import { v } from "convex/values";

export const workspacesTable = defineTable({
  description: v.optional(v.string()),
  logo: v.optional(v.string()),
  settings: v.optional(v.object({
    requireApproval: v.optional(v.boolean()),
    allowInvites: v.optional(v.boolean()),
    defaultRoleId: v.optional(v.id("roles")),
    allowPublicDocuments: v.optional(v.boolean()),
    theme: v.optional(v.string()),
  })),
  isPrivate: v.boolean(),
  status: v.union(v.literal("active"), v.literal("inactive"), v.literal("archived")),
})
.index("by_status", ["status"]);

export const workspaceMembershipsTable = defineTable({
  createdBy: v.optional(v.id("users")),
  invitedBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  roleId: v.id("roles"),
  status: v.union(v.literal("active"), v.literal("pending"), v.literal("inactive")),
  acceptedAt: v.optional(v.number()),
  revokedAt: v.optional(v.number()),
  additionalPermissions: v.array(v.string()),
})
.index("by_user", ["userId"])
.index("by_workspace", ["workspaceId"])
.index("by_status", ["status"]);