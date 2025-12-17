// @ts-nocheck - Bypass type checking due to Convex generated API type instantiation depth limits
import { v } from "convex/values"
import { query, mutation } from "../_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"
import { api, internal } from "../_generated/api"
import { resolveCandidateUserIds, hasPermission, ensureUser, requirePermission } from "../auth/helpers"
import type { Id } from "../_generated/dataModel"
import { PERMS } from "./permissions"
import { ensureSystemRoles } from "./roles"
import { normalizeSlug } from "../lib/utils"

// Get user's workspaces
export const getUserWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    // Get memberships
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    const workspaceIds = memberships.map((m) => m.workspaceId)

    // Get workspacs
    const workspaces = await Promise.all(
      workspaceIds.map((id) => ctx.db.get(id))
    )

    // Filter nulls (in case of dangling references) and return
    return workspaces.filter((w): w is NonNullable<typeof w> => w !== null)
  },
})

// Get a specific workspace by ID
export const getWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    // Check membership
    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", args.workspaceId)
      )
      .first()

    if (!membership || membership.status !== "active") {
      return null
    }

    return await ctx.db.get(args.workspaceId)
  },
})

// Get workspace members
export const getWorkspaceMembers = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    // Check existence of workspace and user's membership
    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", args.workspaceId)
      )
      .first()

    if (!membership || membership.status !== "active") {
      return []
    }

    // Get all memberships
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    return memberships
  },
})

export const deleteWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Unauthenticated")

    // Check permissions
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)

    // 1. Delete memberships
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    for (const membership of memberships) {
      await ctx.db.delete(membership._id)
    }

    // 2. Delete workspace
    await ctx.db.delete(args.workspaceId)

    // TODO: Cascade delete other resources (projects, docs, etc.)
    // This requires a more comprehensive cleanup strategy
  },
})

export const resetWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    mode: v.union(v.literal("replaceMenus"), v.literal("clean")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Unauthenticated")

    // Check permissions
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)

    if (args.mode === "clean") {
      // TODO: Implement clean reset
      // This would involve deleting all data but keeping the workspace doc
      console.log("Clean reset requested for workspace", args.workspaceId)
    } else if (args.mode === "replaceMenus") {
      // TODO: Implement menu reset
      // This would involve resetting menus to default
      console.log("Menu reset requested for workspace", args.workspaceId)
    }
  },
})
