import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requireActiveMembership, resolveCandidateUserIds } from "../../auth/helpers"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for integrations feature
 */

export const connect = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.string(), // e.g., "slack", "google-calendar"
    name: v.string(),
    config: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    // Check if already connected
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("integrationId"), args.integrationId))
      .first()

    if (existing) {
      throw new Error("Integration already connected")
    }

    const id = await ctx.db.insert("integrations", {
      workspaceId: args.workspaceId,
      integrationId: args.integrationId,
      name: args.name,
      config: args.config,
      status: "active",
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return { id, success: true }
  },
})

export const disconnect = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.id("integrations"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const integration = await ctx.db.get(args.integrationId)
    if (!integration || integration.workspaceId !== args.workspaceId) {
      throw new Error("Integration not found")
    }

    await ctx.db.delete(args.integrationId)

    return { success: true }
  },
})
