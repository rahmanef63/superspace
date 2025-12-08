import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requireActiveMembership, resolveCandidateUserIds } from "../../auth/helpers"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for marketing feature
 */

export const createCampaign = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("email"),
      v.literal("social"),
      v.literal("ads"),
      v.literal("content"),
      v.literal("event"),
      v.literal("other")
    )),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("marketingCampaigns", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      type: args.type ?? "email",
      status: "draft",
      sent: 0,
      opens: 0,
      clicks: 0,
      conversions: 0,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return { id, success: true }
  },
})

export const updateCampaign = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    campaignId: v.id("marketingCampaigns"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const campaign = await ctx.db.get(args.campaignId)
    if (!campaign || campaign.workspaceId !== args.workspaceId) {
      throw new Error("Campaign not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    if (args.name !== undefined) updates.name = args.name
    if (args.description !== undefined) updates.description = args.description
    if (args.status !== undefined) updates.status = args.status

    await ctx.db.patch(args.campaignId, updates)

    return { success: true }
  },
})
